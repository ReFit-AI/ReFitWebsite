import { NextResponse } from 'next/server';
import { rateLimitEndpoint } from '@/lib/rate-limit-upstash';
import { shippingRatesSchema, validateInput, sanitizeError, redactSensitive } from '@/lib/validation';

// Simple in-memory cache to avoid rate limits
const rateCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(fromAddress, toAddress, parcel) {
  return JSON.stringify({ fromAddress, toAddress, parcel });
}

export async function POST(request) {
  // Apply rate limiting
  const rateLimitResult = await rateLimitEndpoint.shipping(request);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: rateLimitResult.message },
      { 
        status: 429,
        headers: rateLimitResult.headers
      }
    );
  }
  
  try {
    const body = await request.json();
    
    // Validate input
    const validation = validateInput(body, shippingRatesSchema);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error, errors: validation.errors },
        { status: 400 }
      );
    }
    
    const { fromAddress, toAddress, parcel } = validation.data;

    // Check cache first
    const cacheKey = getCacheKey(fromAddress, toAddress, parcel);
    const cachedData = rateCache.get(cacheKey);
    
    if (cachedData && (Date.now() - cachedData.timestamp < CACHE_TTL)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Returning cached shipping rates');
      }
      return NextResponse.json(cachedData.data);
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Getting shipping rates with Shippo API...');
      console.log('From Address:', redactSensitive(fromAddress));
      console.log('To Address:', redactSensitive(toAddress));
      console.log('Shippo API Key exists:', !!process.env.SHIPPO_API_KEY);
    }

    // Check if API key exists
    if (!process.env.SHIPPO_API_KEY) {
      throw new Error('SHIPPO_API_KEY not configured');
    }

    // Initialize Shippo
    const shippoModule = await import('shippo');
    const Shippo = shippoModule.Shippo || shippoModule.default?.Shippo;
    
    if (!Shippo) {
      throw new Error('Shippo SDK not properly imported');
    }
    
    const shippo = new Shippo({
      apiKeyHeader: process.env.SHIPPO_API_KEY
    });

    // Default warehouse address if fromAddress not provided
    const defaultWarehouse = {
      name: 'Shop Refit, LLC',
      street1: '4931 Anclote Dr',
      city: 'Johns Creek',
      state: 'GA',
      zip: '30022',
      country: 'US',
      phone: '470-555-0100'
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('Creating shipment for rate calculation...');
    }

    // Transform parcel to match Shippo SDK format
    const transformedParcel = parcel ? {
      length: parcel.length,
      width: parcel.width,
      height: parcel.height,
      distanceUnit: parcel.distance_unit || parcel.distanceUnit || 'in',
      weight: parcel.weight,
      massUnit: parcel.mass_unit || parcel.massUnit || 'lb'
    } : {
      length: '7',
      width: '4',
      height: '2',
      distanceUnit: 'in',
      weight: '20',  // 1 lb 4 oz = 20 ounces
      massUnit: 'oz'
    };

    const shipmentPayload = {
      addressFrom: fromAddress || defaultWarehouse,
      addressTo: toAddress,
      parcels: [transformedParcel],
      async: false
    };

    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Shipment payload:', JSON.stringify(shipmentPayload, null, 2));
    }

    // Add a small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));

    const shipment = await shippo.shipments.create(shipmentPayload);

    if (process.env.NODE_ENV === 'development') {
      console.log('Shipment created successfully');
      console.log('Shipment object status:', shipment.status);
      console.log('Available rates:', shipment.rates?.length || 0);
    }
    
    if (shipment.status === 'ERROR') {
      throw new Error(`Shipment creation failed: ${shipment.messages?.map(m => m.text).join(', ')}`);
    }

    // Filter for UPS options only
    const filteredRates = shipment.rates
      .filter(rate => {
        if (!rate.amount || !rate.servicelevel || !rate.servicelevel.name) return false;

        // Only accept UPS carriers
        if (rate.provider !== 'UPS') return false;

        const serviceName = rate.servicelevel.name.toLowerCase();

        // Accept these UPS services (exclude expensive Next Day options)
        const allowedServices = [
          'ground',
          'ground saver',
          '3 day select',
          '2nd day air'  // Include 2-day option for urgent shipments
        ];

        return allowedServices.some(service => serviceName.includes(service));
      })
      .map(rate => ({
        carrier: rate.provider,
        service: rate.servicelevel.name,
        price: 0.00, // Show as free since we're covering shipping costs
        currency: rate.currency,
        estimatedDays: rate.estimatedDays || rate.days || 5, // Default to 5 days for UPS Ground
        rateId: rate.objectId, // Use real Shippo rate ID
        attributes: ['prepaid', 'insured', 'tracking'],
        actualCost: parseFloat(rate.amount) // Store actual cost for our records
      }));

    // Sort by: 1) Actual cost (cheapest first), 2) Speed (faster first if same cost)
    const rates = filteredRates
      .sort((a, b) => {
        // First sort by actual cost
        if (a.actualCost !== b.actualCost) {
          return a.actualCost - b.actualCost;
        }
        // If same cost, prefer faster delivery
        return a.estimatedDays - b.estimatedDays;
      })
      .slice(0, 3); // Show top 3 UPS options

    if (process.env.NODE_ENV === 'development') {
      console.log(`Found ${rates.length} UPS shipping rates`);
      rates.forEach(rate => {
        console.log(`  - ${rate.carrier} ${rate.service}: $${rate.actualCost} (${rate.estimatedDays} days)`);
      });
    }

    // If no rates found, use fallback
    if (rates.length === 0) {
      return NextResponse.json({
        success: true,
        rates: [
          {
            carrier: 'UPS',
            service: 'Ground',
            price: 0.00,
            currency: 'USD',
            estimatedDays: 5,
            rateId: 'fallback-ups-ground',
            attributes: ['prepaid', 'insured', 'tracking'],
            actualCost: 0.00
          }
        ]
      });
    }

    const response = {
      success: true,
      rates
    };

    // Cache the successful response
    rateCache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    });

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: sanitizeError(error, 'Failed to get shipping rates'),
      rates: []
    }, { status: 500 });
  }
}