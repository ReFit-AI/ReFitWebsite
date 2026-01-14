import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/admin-auth';

/**
 * GET /api/admin/orders
 * Get all orders with optional filtering by status
 *
 * Security:
 * - Admin authentication required
 * - CORS restricted to app domain
 */
export async function GET(request) {
  try {
    // SECURITY: CORS protection
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL,
      'http://localhost:3000',
      'http://localhost:3001'
    ].filter(Boolean);

    if (origin && !allowedOrigins.includes(origin)) {
      return NextResponse.json(
        { error: 'CORS: Origin not allowed' },
        { status: 403 }
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // optional filter
    const limit = parseInt(searchParams.get('limit') || '100');

    // Build query
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    // Apply status filter if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Failed to fetch orders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    // Calculate summary stats
    const stats = {
      total: orders.length,
      pending_shipment: orders.filter(o => o.status === 'pending_shipment').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      received: orders.filter(o => o.status === 'received').length,
      inspected: orders.filter(o => o.status === 'inspected').length,
      completed: orders.filter(o => o.status === 'completed').length,
      total_value: orders.reduce((sum, o) => sum + (o.quote_usd || 0), 0),
    };

    return NextResponse.json({
      success: true,
      orders,
      stats,
    });

  } catch (error) {
    console.error('Admin orders API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/orders
 * Update order status (mark as received, inspected, etc.)
 */
export async function PATCH(request) {
  try {
    // Require admin authentication
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.authorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId, action, data } = body;

    if (!orderId || !action) {
      return NextResponse.json(
        { error: 'Missing orderId or action' },
        { status: 400 }
      );
    }

    // Get current order
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

    let updates = {
      updated_at: new Date().toISOString(),
    };

    // Add to status history
    const statusHistory = order.status_history || [];

    // Handle different actions
    switch (action) {
      case 'mark_received':
        updates.status = 'received';
        updates.received_at = new Date().toISOString();
        statusHistory.push({
          status: 'received',
          timestamp: new Date().toISOString(),
          notes: 'Device received at warehouse',
          by: adminCheck.wallet,
        });
        break;

      case 'mark_inspected':
        if (!data?.inspectionCondition) {
          return NextResponse.json(
            { error: 'Missing inspection data' },
            { status: 400 }
          );
        }

        updates.status = 'inspected';
        updates.inspected_at = new Date().toISOString();
        updates.inspected_by = adminCheck.wallet;
        updates.inspection_condition = data.inspectionCondition;
        updates.inspection_notes = data.inspectionNotes || '';

        // Check if condition matches quoted condition
        const conditionMatches = data.inspectionCondition === order.device_condition;
        updates.inspection_approved = conditionMatches;

        statusHistory.push({
          status: 'inspected',
          timestamp: new Date().toISOString(),
          notes: data.inspectionNotes || 'Device inspected',
          condition: data.inspectionCondition,
          approved: conditionMatches,
          by: adminCheck.wallet,
        });
        break;

      case 'approve_payment':
        // Mark as ready for payment
        updates.inspection_approved = true;
        statusHistory.push({
          status: 'payment_approved',
          timestamp: new Date().toISOString(),
          notes: 'Payment approved by admin',
          by: adminCheck.wallet,
        });
        break;

      case 'reject':
        updates.status = 'rejected';
        updates.inspection_approved = false;
        statusHistory.push({
          status: 'rejected',
          timestamp: new Date().toISOString(),
          notes: data?.reason || 'Device condition does not match quote',
          by: adminCheck.wallet,
        });
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    updates.status_history = statusHistory;

    // Update order
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update order:', updateError);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    console.log(`✅ Order ${orderId} updated: ${action}`);

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });

  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
