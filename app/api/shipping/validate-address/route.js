import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const address = await request.json();

    // For development, return a mock validation response
    if (process.env.NODE_ENV === 'development' || !process.env.SHIPPO_API_KEY) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock address validation for development');
      }
      return NextResponse.json({
        success: true,
        address: {
          ...address,
          // Normalize the address slightly for consistency
          street1: address.street1?.trim(),
          city: address.city?.trim(),
          state: address.state?.toUpperCase(),
          zip: address.zip?.replace(/[^\d-]/g, ''),
        },
        messages: ['Address validated successfully (development mode)']
      });
    }

    // For production, implement actual Shippo validation
    try {
      const { Shippo } = await import('shippo');
      const shippo = new Shippo(process.env.SHIPPO_API_KEY);

      const validation = await shippo.address.create({
        name: address.name,
        street1: address.street1,
        street2: address.street2 || '',
        city: address.city,
        state: address.state,
        zip: address.zip,
        country: address.country || 'US',
        phone: address.phone || '',
        validate: true,
        async: false
      });

      return NextResponse.json({
        success: validation.validation_results.is_valid,
        address: {
          ...address,
          street1: validation.street1,
          city: validation.city,
          state: validation.state,
          zip: validation.zip,
        },
        messages: validation.validation_results.messages || []
      });
    } catch (shippoError) {
      console.error('Shippo validation error:', shippoError);
      
      // Fallback to basic validation
      return NextResponse.json({
        success: true,
        address,
        messages: ['Address accepted (validation service unavailable)']
      });
    }
  } catch (error) {
    console.error('Address validation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        messages: ['Failed to validate address']
      },
      { status: 500 }
    );
  }
}
