import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { sanitizeError, purchaseLabelSchema } from '@/lib/validation';
import { verifyOrigin } from '@/lib/csrf-protection';
import { rateLimitEndpoint } from '@/lib/rate-limit-upstash';

// Helper to generate a mock label when Shippo is not configured or in dev
function generateMockLabel() {
  const trackingNumber = 'MOCK' + randomUUID().replace(/-/g, '').slice(0, 18).toUpperCase();
  return {
    trackingNumber,
    labelUrl: `https://www.shoprefit.com/mock-labels/${trackingNumber}.pdf`,
    trackingUrl: `https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${trackingNumber}`,
    carrier: 'USPS',
    cost: 0.00,
    service: 'USPS Priority Mail',
    estimatedDays: 3
  };
}

export async function POST(request) {
  try {
    // Rate limiting - label purchases cost money
    const rateLimitResult = await rateLimitEndpoint.shipping(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: rateLimitResult.message || 'Too many requests' },
        { status: 429, headers: rateLimitResult.headers }
      );
    }

    const body = await request.json();

    // Validate input with Zod
    const validationResult = purchaseLabelSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          details: validationResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`)
        },
        { status: 400 }
      );
    }

    const { rateId, userAddress, walletAddress } = validationResult.data;

    // SECURITY: CSRF protection for shipping label purchase (costs money)
    const csrfCheck = verifyOrigin(request);
    if (!csrfCheck.valid) {
      console.warn('❌ CSRF check failed for label purchase');
      return NextResponse.json(
        { success: false, error: csrfCheck.error || 'Invalid request origin' },
        { status: 403 }
      );
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Creating shipping label with Shippo API...');
      console.log('Rate ID:', rateId);
      console.log('User Address:', JSON.stringify(userAddress, null, 2));
    }

    // Initialize Shippo only if API key configured
    const SHIPPO_API_KEY = process.env.SHIPPO_API_KEY || process.env.NEXT_PUBLIC_SHIPPO_API_KEY;

    // If no API key, fall back to mock label (useful for CI or preview deploys)
    if (!SHIPPO_API_KEY) {
      console.warn('SHIPPO_API_KEY not set. Returning mock label.');
      return NextResponse.json({ success: true, label: generateMockLabel() });
    }

    const shippoModule = await import('shippo');
    const Shippo = shippoModule.Shippo || shippoModule.default?.Shippo;
    
    if (!Shippo) {
      throw new Error('Shippo SDK not properly imported');
    }
    
    const shippo = new Shippo({
      apiKeyHeader: SHIPPO_API_KEY
    });

    // Check if we have a real Shippo rate ID or need to create a new shipment
    let selectedRate;
    
    if (rateId && rateId.startsWith('rate_') && rateId !== 'fallback-ground' && rateId !== 'prepaid-usps-ground') {
      // We have a real Shippo rate ID, use it directly
      if (process.env.NODE_ENV === 'development') {
        console.log('Using existing rate ID:', rateId);
      }
      selectedRate = { object_id: rateId };
    } else {
      // We need to create a shipment to get a real rate
      if (process.env.NODE_ENV === 'development') {
        console.log('Creating new shipment to get rate...');
      }
      
      // Define warehouse address
      const warehouseAddress = {
      name: 'ReFit Warehouse',
      street1: '100 California St',
      city: 'San Francisco', 
      state: 'CA',
      zip: '94111',
      country: 'US',
      phone: '415-555-0100',
      email: 'warehouse@shoprefit.com'
    };

    // Define parcel (standard phone package)
    const parcel = {
      length: '7',
      width: '4',
      height: '2',
      distanceUnit: 'in',
      weight: '20',  // 1 lb 4 oz = 20 oz
      massUnit: 'oz'
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('Creating shipment...');
      console.log('Parcel data:', JSON.stringify(parcel, null, 2));
    }
    
    // Create shipment to get real rates
    const shipmentPayload = {
      addressFrom: warehouseAddress,
      addressTo: {
        name: userAddress.name || 'Customer',
        street1: userAddress.street1,
        street2: userAddress.street2 || '',
        city: userAddress.city,
        state: userAddress.state,
        zip: userAddress.zip,
        country: userAddress.country || 'US',
        phone: userAddress.phone || '',
        email: userAddress.email || ''
      },
      parcels: [parcel],
      async: false
    };
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Shipment payload:', JSON.stringify(shipmentPayload, null, 2));
    }
    
    const shipment = await shippo.shipments.create(shipmentPayload);

    if (process.env.NODE_ENV === 'development') {
      console.log('Shipment created:', shipment.objectId || shipment.object_id);
      console.log('Available rates:', shipment.rates?.length || 0);
    }

    // Find USPS Priority Mail rate
    const uspsPriorityRate = shipment.rates
      .filter(rate => 
        rate.provider === 'USPS' && 
        rate.servicelevel && 
        rate.servicelevel.name.includes('Priority')
      )
      .sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount))[0];
    
    if (!uspsPriorityRate) {
      throw new Error('No USPS Priority Mail rates available for this address');
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Using USPS Priority Mail rate:', uspsPriorityRate.servicelevel.name);
    }
    selectedRate = uspsPriorityRate;

    if (process.env.NODE_ENV === 'development') {
      console.log('Selected rate ID:', selectedRate.objectId || selectedRate.object_id);
      if (selectedRate.amount) {
        console.log('Rate amount:', selectedRate.amount);
      }
    }
    }

    // Purchase the label
    const transaction = await shippo.transactions.create({
      rate: selectedRate.object_id || selectedRate.objectId,
      labelFileType: 'PDF',
      async: false
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('Transaction status:', transaction.status);
    }

    if (transaction.status !== 'SUCCESS') {
      console.error('Transaction failed:', transaction.messages);
      throw new Error(transaction.messages?.join(', ') || 'Label purchase failed');
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Label created successfully!');
      console.log('Tracking number:', transaction.tracking_number);
    }

    return NextResponse.json({
      success: true,
      label: {
        trackingNumber: transaction.trackingNumber || transaction.tracking_number,
        labelUrl: transaction.labelUrl || transaction.label_url,
        trackingUrl: transaction.trackingUrlProvider || transaction.tracking_url_provider,
        carrier: transaction.carrier || transaction.carrier_account,
        cost: selectedRate.amount ? parseFloat(selectedRate.amount) : 0.00,
        service: 'USPS Priority Mail',
        estimatedDays: selectedRate.estimatedDays || selectedRate.estimated_days || selectedRate.days || 3
      }
    });
  } catch (error) {
    // Handle Zod validation errors
    if (error.name === 'ZodError' && error.issues) {
      const issues = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
      return NextResponse.json(
        { 
          success: false, 
          error: `Validation error: ${issues}`,
          details: error.issues
        },
        { status: 400 }
      );
    }
    
    // Sanitize error message for production
    const errorMessage = sanitizeError(error, 'Failed to purchase shipping label');

    // Determine appropriate status code
    let statusCode = 500;
    if (error.message?.includes('API key')) statusCode = 503;
    if (error.message?.includes('address') || error.message?.includes('rate') || error.message?.includes('Invalid input')) {
      statusCode = 400;
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage
      },
      { status: statusCode }
    );
  }
}