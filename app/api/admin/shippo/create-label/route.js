import { NextResponse } from 'next/server';

const ADMIN_WALLET = process.env.ADMIN_WALLET;
const SHIPPO_API_KEY = process.env.SHIPPO_API_KEY;

// POST - Create shipping label via Shippo and auto-update inventory
export async function POST(request) {
  try {
    const body = await request.json();
    const { walletAddress, inventoryId, toAddress, fromAddress, parcel } = body;

    // Verify admin
    if (walletAddress !== ADMIN_WALLET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (!SHIPPO_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Shippo API key not configured' },
        { status: 500 }
      );
    }

    // Create shipment in Shippo
    const shipmentResponse = await fetch('https://api.goshippo.com/shipments/', {
      method: 'POST',
      headers: {
        'Authorization': `ShippoToken ${SHIPPO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        address_from: fromAddress,
        address_to: toAddress,
        parcels: [parcel],
        async: false
      })
    });

    if (!shipmentResponse.ok) {
      const error = await shipmentResponse.json();
      throw new Error(error.detail || 'Failed to create shipment');
    }

    const shipment = await shipmentResponse.json();

    // Get the cheapest rate
    const rates = shipment.rates || [];
    if (rates.length === 0) {
      throw new Error('No shipping rates available');
    }

    const cheapestRate = rates.reduce((prev, curr) =>
      parseFloat(curr.amount) < parseFloat(prev.amount) ? curr : prev
    );

    // Purchase the label
    const transactionResponse = await fetch('https://api.goshippo.com/transactions/', {
      method: 'POST',
      headers: {
        'Authorization': `ShippoToken ${SHIPPO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        rate: cheapestRate.object_id,
        label_file_type: 'PDF',
        async: false
      })
    });

    if (!transactionResponse.ok) {
      const error = await transactionResponse.json();
      throw new Error(error.detail || 'Failed to purchase label');
    }

    const transaction = await transactionResponse.json();

    if (transaction.status !== 'SUCCESS') {
      throw new Error(transaction.messages?.[0] || 'Label purchase failed');
    }

    // Update inventory with shipping info
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { error: updateError } = await supabase
      .from('inventory')
      .update({
        shipping_cost_out: parseFloat(transaction.rate.amount),
        shipping_label_id: transaction.object_id,
        tracking_number: transaction.tracking_number,
        shipping_carrier: transaction.rate.provider,
        shipped_date: new Date().toISOString()
      })
      .eq('id', inventoryId);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      label: {
        label_url: transaction.label_url,
        tracking_number: transaction.tracking_number,
        tracking_url: transaction.tracking_url_provider,
        carrier: transaction.rate.provider,
        cost: parseFloat(transaction.rate.amount),
        object_id: transaction.object_id
      }
    });

  } catch (error) {
    console.error('Shippo label creation error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
