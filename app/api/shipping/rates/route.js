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
      name: 'ReFit Warehouse',
      street1: '100 California St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94111',
      country: 'US',
      phone: '415-555-0100'
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

    // Only log redacted payload in production
    const isDev = process.env.NODE_ENV === 'development';
    console.log('Shipment payload:', JSON.stringify(isDev ? shipmentPayload : redactSensitive(shipmentPayload), null, 2));

    // Add a small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));

    const shipment = await shippo.shipments.create(shipmentPayload);

    if (process.env.NODE_ENV === 'development') {
      console.log('Shipment created successfully');
      console.log('Shipment object status:', shipment.status);
      console.log('Available rates:', shipment.rates?.length || 0);
    }
    
    if (shipment.status === 'ERROR') {
      console.error('Shipment creation failed:', shipment.messages);
      throw new Error(`Shipment creation failed: ${shipment.messages?.map(m => m.text).join(', ')}`);
    }

    // Filter for UPS Ground and USPS Priority Mail
    const filteredRates = shipment.rates
      .filter(rate => {
        if (!rate.amount || !rate.servicelevel || !rate.servicelevel.name) return false;

        const serviceName = rate.servicelevel.name.toLowerCase();

        // Accept UPS Ground
        if (rate.provider === 'UPS' && serviceName.includes('ground')) {
          return true;
        }

        // Accept USPS Priority Mail (but not Express)
        if (rate.provider === 'USPS' &&
            serviceName.includes('priority mail') &&
            !serviceName.includes('express')) {
          return true;
        }

        return false;
      })
      .map(rate => ({
        carrier: rate.provider,
        service: rate.servicelevel.name,
        price: 0.00, // Show as free since we're covering shipping costs
        currency: rate.currency,
        estimatedDays: rate.estimatedDays || rate.days ||
                      (rate.provider === 'UPS' ? 5 : 3), // UPS Ground 1-5 days, USPS Priority 1-3 days
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
      .slice(0, 2); // Show top 2 options (usually UPS Ground + USPS Priority)

    if (process.env.NODE_ENV === 'development') {
      console.log(`Found ${rates.length} shipping rates (UPS Ground / USPS Priority)`);
      rates.forEach(rate => {
        console.log(`  - ${rate.carrier} ${rate.service}: $${rate.actualCost} (${rate.estimatedDays} days)`);
      });
    }

    // If no rates found, use fallback
    if (rates.length === 0) {
      console.warn('No UPS Ground or USPS Priority Mail rates found, using fallback');
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
    const isDev = process.env.NODE_ENV === 'development';
    console.error('Shipping rates error:', sanitizeError(error, isDev));
    
    // Return sanitized error in production
    const errorResponse = isDev ? {
      success: false,
      error: error.message || 'Unknown shipping API error',
      errorType: error.name === 'ShippoError' || error.code ? 'shippo_api_error' : 'server_error',
      rates: []
    } : {
      success: false,
      error: 'Failed to get shipping rates',
      rates: []
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}