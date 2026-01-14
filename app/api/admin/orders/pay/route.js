import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/admin-auth';
import { sendUSDCPayout } from '@/lib/usdc-payout';
import { rateLimitEndpoint } from '@/lib/rate-limit-upstash';
import { verifyOrigin } from '@/lib/csrf-protection';

/**
 * POST /api/admin/orders/pay
 * Execute USDC payment to user for completed trade-in
 *
 * Security:
 * - Rate limited: 5 payments per minute per IP
 * - Admin authentication required
 * - Transaction verification on-chain
 */
export async function POST(request) {
  try {
    // SECURITY: CSRF protection - verify origin for state-changing operations
    const csrfCheck = verifyOrigin(request, {
      allowedOrigins: [
        process.env.NEXT_PUBLIC_APP_URL,
        'http://localhost:3000',
        'http://localhost:3001'
      ]
    });

    if (!csrfCheck.valid) {
      return NextResponse.json(
        { error: csrfCheck.error || 'Invalid request origin' },
        { status: 403 }
      );
    }

    // SECURITY: Rate limiting - distributed across serverless instances
    const rateLimitResult = await rateLimitEndpoint.api(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: rateLimitResult.message || 'Too many payment attempts. Please wait before trying again.',
          retryAfter: rateLimitResult.retryAfter
        },
        {
          status: 429,
          headers: rateLimitResult.headers || {}
        }
      );
    }

    // Require admin authentication
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.authorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing orderId' },
        { status: 400 }
      );
    }

    // 1. Get order details
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // 2. Validate order state
    if (!order.inspection_approved) {
      return NextResponse.json(
        { error: 'Order must be inspected and approved before payment' },
        { status: 400 }
      );
    }

    if (order.payment_status === 'completed') {
      return NextResponse.json(
        { error: 'Order already paid' },
        { status: 400 }
      );
    }

    if (!order.wallet_address) {
      return NextResponse.json(
        { error: 'No wallet address for payment' },
        { status: 400 }
      );
    }

    // 3. Execute USDC payment
    const paymentResult = await sendUSDCPayout({
      toWallet: order.wallet_address,
      amountUSD: order.quote_usd,
      orderId: order.id,
    });

    if (!paymentResult.success) {
      // Log failed payment attempt
      const statusHistory = order.status_history || [];
      statusHistory.push({
        status: 'payment_failed',
        timestamp: new Date().toISOString(),
        notes: `Payment failed: ${paymentResult.error}`,
        by: adminCheck.wallet,
      });

      await supabase
        .from('orders')
        .update({ status_history: statusHistory })
        .eq('id', orderId);

      return NextResponse.json(
        { error: `Payment failed: ${paymentResult.error}` },
        { status: 500 }
      );
    }

    // 4. Update order with payment details
    const statusHistory = order.status_history || [];
    statusHistory.push({
      status: 'payment_completed',
      timestamp: new Date().toISOString(),
      notes: `USDC payment sent: ${paymentResult.signature}`,
      by: adminCheck.wallet,
    });

    const orderUpdates = {
      status: 'completed',
      payment_status: 'completed',
      payment_tx_hash: paymentResult.signature,
      payment_amount: order.quote_usd,
      payment_date: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      status_history: statusHistory,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(orderUpdates)
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      // Payment went through but DB update failed - this needs manual review
      return NextResponse.json(
        {
          success: true,
          warning: 'Payment sent but failed to update order',
          signature: paymentResult.signature,
          explorerUrl: paymentResult.explorerUrl,
        },
        { status: 200 }
      );
    }

    // 5. Add device to inventory
    try {
      const inventoryItem = {
        device_model: `${order.device_brand} ${order.device_model}`,
        device_brand: order.device_brand,
        storage: order.device_storage,
        condition: order.inspection_condition || order.device_condition,
        imei: order.device_imei,
        source_order_id: order.id,
        price_purchased: order.quote_usd,
        purchased_at: new Date().toISOString(),
        status: 'in_stock',
        carrier: order.device_carrier,
        notes: `Acquired from trade-in order ${order.id}`,
      };

      const { data: inventoryRecord, error: invError } = await supabase
        .from('inventory')
        .insert([inventoryItem])
        .select()
        .single();

      if (!invError && inventoryRecord) {
        // Link inventory item to order
        await supabase
          .from('orders')
          .update({ inventory_id: inventoryRecord.id })
          .eq('id', orderId);
      }
    } catch {
      // Continue - inventory can be added manually
    }

    // 6. Return success
    return NextResponse.json({
      success: true,
      order: updatedOrder,
      payment: {
        signature: paymentResult.signature,
        amount: order.quote_usd,
        explorerUrl: paymentResult.explorerUrl,
      },
    });

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
