import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET;

// GET - Fetch all invoices
export async function GET(request) {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        invoice_items (
          id,
          model,
          imei,
          price,
          inventory_id
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      invoices: data || []
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new invoice
export async function POST(request) {
  try {
    const body = await request.json();
    const { walletAddress, invoice } = body;

    // Verify admin
    if (walletAddress !== ADMIN_WALLET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const supabaseAdmin = supabase;

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}`;

    // Calculate total
    const totalAmount = invoice.items.reduce((sum, item) => sum + parseFloat(item.price), 0);

    // Create invoice with structured address
    const { data: invoiceData, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        buyer_name: invoice.buyer_name,
        buyer_email: invoice.buyer_email,
        buyer_phone: invoice.buyer_phone,
        buyer_address_line1: invoice.buyer_address_line1,
        buyer_address_line2: invoice.buyer_address_line2,
        buyer_city: invoice.buyer_city,
        buyer_state: invoice.buyer_state,
        buyer_zip: invoice.buyer_zip,
        buyer_country: invoice.buyer_country || 'US',
        total_amount: totalAmount,
        notes: invoice.notes,
        status: invoice.status || 'draft',
        due_date: invoice.due_date || null
      })
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // Create invoice items
    const itemsData = invoice.items.map(item => ({
      invoice_id: invoiceData.id,
      inventory_id: item.inventory_id,
      model: item.model,
      imei: item.imei,
      price: item.price
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('invoice_items')
      .insert(itemsData);

    if (itemsError) throw itemsError;

    // Update inventory items to sold status
    for (const item of invoice.items) {
      if (item.inventory_id) {
        await supabaseAdmin
          .from('inventory')
          .update({
            status: 'sold',
            price_sold: item.price,
            sold_at: new Date().toISOString()
          })
          .eq('id', item.inventory_id);
      }
    }

    return NextResponse.json({
      success: true,
      invoice: {
        ...invoiceData,
        invoice_items: itemsData
      }
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update invoice
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { walletAddress, id, updates } = body;

    // Verify admin
    if (walletAddress !== ADMIN_WALLET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const supabaseAdmin = supabase;

    // If marking as paid, set paid_at
    if (updates.status === 'paid' && !updates.paid_at) {
      updates.paid_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      invoice: data
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete invoice
export async function DELETE(request) {
  try {
    const body = await request.json();
    const { walletAddress, id } = body;

    // Verify admin
    if (walletAddress !== ADMIN_WALLET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const supabaseAdmin = supabase;

    // Delete invoice (cascade will delete items)
    const { error } = await supabaseAdmin
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
