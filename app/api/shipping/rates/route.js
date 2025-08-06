import { NextResponse } from 'next/server';
import { rateLimiters } from '@/lib/rate-limit';

// Simple in-memory cache to avoid rate limits
const rateCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(fromAddress, toAddress, parcel) {
  return JSON.stringify({ fromAddress, toAddress, parcel });
}

export async function POST(request) {
  // Apply rate limiting
  const { success, message, retryAfter } = await rateLimiters.standard(request);
  if (!success) {
    return NextResponse.json(
      { error: message },
      { 
        status: 429,
        headers: { 'Retry-After': String(retryAfter) }
      }
    );
  }
  
  try {
    const { fromAddress, toAddress, parcel } = await request.json();

    // Check cache first
    const cacheKey = getCacheKey(fromAddress, toAddress, parcel);
    const cachedData = rateCache.get(cacheKey);
    
    if (cachedData && (Date.now() - cachedData.timestamp < CACHE_TTL)) {
      console.log('Returning cached shipping rates');
      return NextResponse.json(cachedData.data);
    }

    console.log('Getting shipping rates with Shippo API...');
    console.log('From Address:', fromAddress);
    console.log('To Address:', toAddress);
    console.log('Shippo API Key exists:', !!process.env.SHIPPO_API_KEY);

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

    console.log('Creating shipment for rate calculation...');

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

    console.log('Shipment payload:', JSON.stringify(shipmentPayload, null, 2));

    // Add a small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));

    const shipment = await shippo.shipments.create(shipmentPayload);

    console.log('Shipment created successfully');
    console.log('Shipment object status:', shipment.status);
    console.log('Available rates:', shipment.rates?.length || 0);
    
    if (shipment.status === 'ERROR') {
      console.error('Shipment creation failed:', shipment.messages);
      throw new Error(`Shipment creation failed: ${shipment.messages?.map(m => m.text).join(', ')}`);
    }

    // Filter for USPS Priority Mail only
    const rates = shipment.rates
      .filter(rate => 
        rate.provider === 'USPS' && 
        rate.amount && 
        rate.servicelevel &&
        rate.servicelevel.name && 
        rate.servicelevel.name.toLowerCase().includes('priority mail') &&
        !rate.servicelevel.name.toLowerCase().includes('express')
      )
      .map(rate => ({
        carrier: rate.provider,
        service: 'Priority Mail',
        price: 0.00, // Show as free since we're covering shipping costs
        currency: rate.currency,
        estimatedDays: rate.estimatedDays || rate.days || 3, // Priority Mail is typically 1-3 days
        rateId: rate.objectId, // Use real Shippo rate ID
        attributes: ['prepaid', 'insured', 'tracking'],
        actualCost: parseFloat(rate.amount) // Store actual cost for our records
      }))
      .slice(0, 1); // Only take the first Priority Mail option

    console.log(`Found ${rates.length} USPS rates`);

    // If no USPS Priority Mail rates found, use fallback
    if (rates.length === 0) {
      console.warn('No USPS Priority Mail rates found, using fallback');
      return NextResponse.json({
        success: true,
        rates: [
          {
            carrier: 'USPS',
            service: 'Priority Mail',
            price: 0.00,
            currency: 'USD',
            estimatedDays: 3,
            rateId: 'fallback-priority',
            attributes: ['prepaid', 'insured', 'tracking']
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
    console.error('Shipping rates error:', error);
    console.error('Error stack:', error.stack);
    
    // Return more specific error information
    const errorMessage = error.message || 'Unknown shipping API error';
    const isShippoError = error.name === 'ShippoError' || error.code;
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        errorType: isShippoError ? 'shippo_api_error' : 'server_error',
        rates: []
      },
      { status: 500 }
    );
  }
}