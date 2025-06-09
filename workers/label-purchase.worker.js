// Worker to process label purchase jobs
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { createClient } from '@supabase/supabase-js';
import Shippo from 'shippo';

// Initialize connections
const connection = new IORedis(process.env.UPSTASH_REDIS_REST_URL, {
  maxRetriesPerRequest: null,
  tls: {}
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const shippo = Shippo(process.env.SHIPPO_API_KEY);

// Process label purchase jobs
const worker = new Worker('label-purchase', async (job) => {
  const { orderId, rateId, userId } = job.data;

  try {
    console.log(`Processing label purchase for order ${orderId}`);

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, shipping_addresses(*)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    // Purchase label from Shippo
    const transaction = await shippo.transaction.create({
      rate: rateId,
      label_file_type: 'PDF',
      async: false
    });

    if (transaction.status !== 'SUCCESS') {
      throw new Error(transaction.messages?.join(', ') || 'Label purchase failed');
    }

    // Update order with shipping info
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'awaiting_shipment',
        tracking_number: transaction.tracking_number,
        label_url: transaction.label_url,
        shipping_carrier: transaction.carrier_account,
        shipped_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (updateError) throw updateError;

    // Add to status history
    await supabase
      .from('order_status_history')
      .insert({
        order_id: orderId,
        status: 'awaiting_shipment',
        notes: `Shipping label created. Tracking: ${transaction.tracking_number}`,
        metadata: {
          carrier: transaction.carrier_account,
          tracking_number: transaction.tracking_number,
          label_url: transaction.label_url
        }
      });

    // Send email notification
    await sendShippingLabelEmail(order, transaction);

    console.log(`Label purchase completed for order ${orderId}`);
    
    return {
      success: true,
      trackingNumber: transaction.tracking_number,
      labelUrl: transaction.label_url
    };
  } catch (error) {
    console.error(`Label purchase failed for order ${orderId}:`, error);
    
    // Update order status to failed
    await supabase
      .from('order_status_history')
      .insert({
        order_id: orderId,
        status: 'pending',
        notes: `Label purchase failed: ${error.message}`,
        metadata: { error: error.message }
      });

    throw error;
  }
}, { connection });

// Email notification function
async function sendShippingLabelEmail(order, transaction) {
  // Get user email
  const { data: user } = await supabase
    .from('users')
    .select('email')
    .eq('id', order.user_id)
    .single();

  if (!user?.email) {
    console.log('No email address for user');
    return;
  }

  // TODO: Implement email sending with your preferred provider
  // Example with SendGrid, Postmark, or similar
  console.log(`Would send email to ${user.email} with label ${transaction.label_url}`);
  
  // const email = {
  //   to: user.email,
  //   from: process.env.EMAIL_FROM,
  //   subject: `Your ReFit Shipping Label - Order ${order.order_number}`,
  //   html: `
  //     <h2>Your shipping label is ready!</h2>
  //     <p>Thank you for choosing ReFit. Your shipping label for order ${order.order_number} has been created.</p>
  //     <p><strong>Tracking Number:</strong> ${transaction.tracking_number}</p>
  //     <p><a href="${transaction.label_url}">Download Shipping Label</a></p>
  //     <h3>Next Steps:</h3>
  //     <ol>
  //       <li>Print the shipping label</li>
  //       <li>Securely pack your ${order.device_brand} ${order.device_model}</li>
  //       <li>Attach the label to your package</li>
  //       <li>Drop off at any ${transaction.carrier_account} location</li>
  //     </ol>
  //     <p>You can track your package at any time from your ReFit dashboard.</p>
  //   `
  // };
  
  // await emailClient.send(email);
}

// Error handling
worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});

worker.on('completed', (job, returnvalue) => {
  console.log(`Job ${job.id} completed`);
});

console.log('Label purchase worker started');

export default worker;
