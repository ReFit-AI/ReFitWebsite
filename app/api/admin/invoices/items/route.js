import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET;

// Use service role for admin operations (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// PATCH - Update invoice item price
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { walletAddress, itemId, price } = body;

    // Verify admin
    if (walletAddress !== ADMIN_WALLET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update the item price
    const { data: item, error: itemError } = await supabase
      .from('invoice_items')
      .update({ price })
      .eq('id', itemId)
      .select('invoice_id')
      .single();

    if (itemError) throw itemError;

    // Recalculate invoice totals
    const { data: items, error: itemsError } = await supabase
      .from('invoice_items')
      .select('price')
      .eq('invoice_id', item.invoice_id);

    if (itemsError) throw itemsError;

    const subtotal = items.reduce((sum, i) => sum + parseFloat(i.price || 0), 0);

    // Get shipping cost to calculate total
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('shipping_cost')
      .eq('id', item.invoice_id)
      .single();

    if (invoiceError) throw invoiceError;

    const total = subtotal + parseFloat(invoice.shipping_cost || 0);

    // Update invoice totals
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        subtotal,
        total,
        total_amount: total // Keep for backwards compatibility
      })
      .eq('id', item.invoice_id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
