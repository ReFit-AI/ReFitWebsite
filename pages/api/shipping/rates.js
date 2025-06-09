// API endpoint to get shipping rates
import { createClient } from '@supabase/supabase-js';
import Shippo from 'shippo';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const shippo = Shippo(process.env.SHIPPO_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify auth
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { toAddressId } = req.body;

    // Get shipping address
    const { data: toAddress, error: addressError } = await supabase
      .from('shipping_addresses')
      .select('*')
      .eq('id', toAddressId)
      .eq('user_id', user.id)
      .single();

    if (addressError || !toAddress) {
      return res.status(400).json({ error: 'Invalid shipping address' });
    }

    // Get warehouse address
    const fromAddress = {
      name: 'ReFit Warehouse',
      street1: '100 California St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94111',
      country: 'US',
      phone: '415-555-0100'
    };

    // Create shipment
    const shipment = await shippo.shipment.create({
      address_from: fromAddress,
      address_to: {
        name: toAddress.name,
        street1: toAddress.street1,
        street2: toAddress.street2 || '',
        city: toAddress.city,
        state: toAddress.state,
        zip: toAddress.zip,
        country: toAddress.country || 'US',
        phone: toAddress.phone || ''
      },
      parcels: [{
        length: '7',
        width: '4',
        height: '2',
        distance_unit: 'in',
        weight: '1',
        mass_unit: 'lb'
      }],
      async: false
    });

    // Format rates
    const rates = shipment.rates
      .filter(rate => rate.amount && rate.servicelevel)
      .map(rate => ({
        carrier: rate.provider,
        service: rate.servicelevel.name,
        price: parseFloat(rate.amount),
        currency: rate.currency,
        estimatedDays: rate.estimated_days || rate.days || 5,
        rateId: rate.object_id,
        attributes: rate.attributes || [],
        shipmentId: shipment.object_id
      }))
      .sort((a, b) => a.price - b.price);

    res.status(200).json({
      success: true,
      rates,
      shipmentId: shipment.object_id
    });
  } catch (error) {
    console.error('Get rates error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get shipping rates',
      message: error.message 
    });
  }
}
