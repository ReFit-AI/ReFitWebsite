// API endpoint to create an order
import { createClient } from '@supabase/supabase-js';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize Redis connection for BullMQ
const connection = new IORedis(process.env.UPSTASH_REDIS_REST_URL, {
  maxRetriesPerRequest: null,
  tls: {}
});

const labelQueue = new Queue('label-purchase', { connection });

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

    const {
      device,
      shippingAddressId,
      shippingRateId,
      shippingCarrier,
      shippingService,
      shippingCost,
      quotedPriceUSD,
      quotedPriceSOL,
      solPriceAtQuote
    } = req.body;

    // Validate shipping address belongs to user
    const { data: address, error: addressError } = await supabase
      .from('shipping_addresses')
      .select('id')
      .eq('id', shippingAddressId)
      .eq('user_id', user.id)
      .single();

    if (addressError || !address) {
      return res.status(400).json({ error: 'Invalid shipping address' });
    }

    // Generate order number
    const { data: orderNumber } = await supabase.rpc('generate_order_number');

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: user.id,
        status: 'pending',
        device_brand: device.brand,
        device_model: device.model,
        device_condition: device.condition,
        device_details: device,
        quoted_price_usd: quotedPriceUSD,
        quoted_price_sol: quotedPriceSOL,
        sol_price_at_quote: solPriceAtQuote,
        shipping_address_id: shippingAddressId,
        shipping_rate_id: shippingRateId,
        shipping_carrier: shippingCarrier,
        shipping_service: shippingService,
        shipping_cost: shippingCost
      })
      .select()
      .single();

    if (orderError) {
      throw orderError;
    }

    // Add to status history
    await supabase
      .from('order_status_history')
      .insert({
        order_id: order.id,
        status: 'pending',
        notes: 'Order created',
        created_by: user.id
      });

    // Queue label purchase job
    await labelQueue.add('purchase-label', {
      orderId: order.id,
      rateId: shippingRateId,
      userId: user.id
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });

    res.status(201).json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        device: {
          brand: order.device_brand,
          model: order.device_model,
          condition: order.device_condition
        },
        quotedPrice: {
          usd: order.quoted_price_usd,
          sol: order.quoted_price_sol
        },
        shipping: {
          carrier: order.shipping_carrier,
          service: order.shipping_service,
          cost: order.shipping_cost
        },
        createdAt: order.created_at
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create order',
      message: error.message 
    });
  }
}
