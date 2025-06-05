// Webhook handler for Shippo tracking updates
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

// Verify webhook signature
function verifyWebhookSignature(payload, signature) {
  const webhookSecret = process.env.SHIPPO_WEBHOOK_SECRET;
  
  const hmac = crypto.createHmac('sha256', webhookSecret);
  hmac.update(payload);
  const calculatedSignature = hmac.digest('hex');
  
  return calculatedSignature === signature;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get raw body for signature verification
    const rawBody = JSON.stringify(req.body);
    const signature = req.headers['x-shippo-signature'];

    // Verify webhook signature
    if (!verifyWebhookSignature(rawBody, signature)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;

    // Handle different event types
    switch (event.event) {
      case 'track.update':
        await handleTrackingUpdate(event.data);
        break;
      case 'transaction.created':
        await handleTransactionCreated(event.data);
        break;
      default:
        console.log('Unhandled event type:', event.event);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Webhook processing failed' 
    });
  }
}

async function handleTrackingUpdate(data) {
  try {
    // Find order by tracking number
    const { data: order } = await supabase
      .from('orders')
      .select('id, status')
      .eq('tracking_number', data.tracking_number)
      .single();

    if (!order) {
      console.warn('Order not found for tracking number:', data.tracking_number);
      return;
    }

    // Store shipping event
    await supabase
      .from('shipping_events')
      .insert({
        order_id: order.id,
        tracking_number: data.tracking_number,
        event_type: mapShippoStatus(data.tracking_status?.status),
        carrier_status: data.tracking_status?.status,
        location: data.location ? 
          `${data.location.city}, ${data.location.state}` : null,
        description: data.tracking_status?.status_details,
        raw_data: data,
        occurred_at: data.tracking_status?.status_date || new Date().toISOString()
      });

    // Update order status based on tracking status
    const statusUpdates = {
      'DELIVERED': { status: 'received', received_at: new Date().toISOString() },
      'RETURNED': { status: 'cancelled', cancelled_at: new Date().toISOString() },
      'FAILURE': { status: 'cancelled', cancelled_at: new Date().toISOString() }
    };

    const update = statusUpdates[data.tracking_status?.status];
    if (update && order.status !== update.status) {
      await supabase
        .from('orders')
        .update(update)
        .eq('id', order.id);

      await supabase
        .from('order_status_history')
        .insert({
          order_id: order.id,
          status: update.status,
          notes: `Package ${data.tracking_status?.status.toLowerCase()}`,
          metadata: { tracking_event: data }
        });

      // TODO: Send email notification to user
    }
  } catch (error) {
    console.error('Tracking update error:', error);
    throw error;
  }
}

async function handleTransactionCreated(data) {
  try {
    // Transaction created means label was successfully purchased
    console.log('Label created:', data.tracking_number);
  } catch (error) {
    console.error('Transaction created error:', error);
    throw error;
  }
}

function mapShippoStatus(status) {
  const statusMap = {
    'PRE_TRANSIT': 'label_created',
    'TRANSIT': 'in_transit',
    'DELIVERED': 'delivered',
    'RETURNED': 'returned',
    'FAILURE': 'failed'
  };
  
  return statusMap[status] || status?.toLowerCase() || 'unknown';
}
