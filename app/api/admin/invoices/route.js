import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateInvoiceData, sanitizeInvoiceData } from '@/lib/invoiceValidation';

const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET;

// Use service role for admin operations (bypasses RLS)
const getSupabase = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
};

// GET - Fetch all invoices or single invoice
export async function GET(request) {
  const supabase = getSupabase();

  if (!supabase) {
    return NextResponse.json({
      success: false,
      error: 'Database not configured'
    }, { status: 500 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Fetch single invoice with buyer details
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          buyers (*),
          invoice_items (
            id,
            model,
            imei,
            price,
            cost,
            inventory_id
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        invoice: data
      });
    } else {
      // Fetch all invoices
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          buyers (name, email, company),
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
    }
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
  const supabase = getSupabase();

  if (!supabase) {
    return NextResponse.json({
      success: false,
      error: 'Database not configured'
    }, { status: 500 });
  }

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

    // Validate invoice data
    const validationErrors = validateInvoiceData(invoice);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, error: validationErrors.join('; ') },
        { status: 400 }
      );
    }

    // Sanitize and structure the invoice data
    const sanitizedInvoice = sanitizeInvoiceData(invoice);

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}`;

    // Create invoice payload with all required fields
    const invoicePayload = {
      invoice_number: invoiceNumber,
      buyer_id: sanitizedInvoice.buyer_id,
      subtotal: sanitizedInvoice.subtotal,
      total: sanitizedInvoice.total,
      total_amount: sanitizedInvoice.total_amount, // Keep for backwards compatibility
      notes: sanitizedInvoice.notes,
      payment_terms: sanitizedInvoice.payment_terms,
      shipping_method: sanitizedInvoice.shipping_method,
      status: sanitizedInvoice.status,
      due_date: sanitizedInvoice.due_date
    };

    // Add buyer details if no buyer_id (for backwards compatibility)
    if (!sanitizedInvoice.buyer_id) {
      invoicePayload.buyer_name = sanitizedInvoice.buyer_name;
      invoicePayload.buyer_email = sanitizedInvoice.buyer_email;
      invoicePayload.buyer_phone = sanitizedInvoice.buyer_phone;
      invoicePayload.buyer_address = sanitizedInvoice.buyer_address;
      invoicePayload.buyer_city = sanitizedInvoice.buyer_city;
      invoicePayload.buyer_state = sanitizedInvoice.buyer_state;
      invoicePayload.buyer_zip = sanitizedInvoice.buyer_zip;
      invoicePayload.buyer_country = sanitizedInvoice.buyer_country;
    }

    // Create invoice
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .insert(invoicePayload)
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // Create invoice items with sanitized data
    const itemsData = sanitizedInvoice.items.map(item => ({
      invoice_id: invoiceData.id,
      inventory_id: item.inventory_id,
      model: item.model,
      imei: item.imei,
      price: item.price,
      cost: item.cost
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsData);

    if (itemsError) throw itemsError;

    // Update inventory items to sold status
    for (const item of sanitizedInvoice.items) {
      if (item.inventory_id) {
        await supabase
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

// DELETE - Delete invoice
export async function DELETE(request) {
  const supabase = getSupabase();

  if (!supabase) {
    return NextResponse.json({
      success: false,
      error: 'Database not configured'
    }, { status: 500 });
  }

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

    // First, restore inventory items to in_stock status
    const { data: invoiceItems } = await supabase
      .from('invoice_items')
      .select('inventory_id')
      .eq('invoice_id', id);

    if (invoiceItems && invoiceItems.length > 0) {
      for (const item of invoiceItems) {
        if (item.inventory_id) {
          await supabase
            .from('inventory')
            .update({
              status: 'in_stock',
              price_sold: null,
              sold_at: null
            })
            .eq('id', item.inventory_id);
        }
      }
    }

    // Delete invoice items first (due to foreign key)
    await supabase
      .from('invoice_items')
      .delete()
      .eq('invoice_id', id);

    // Delete the invoice
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update invoice
export async function PATCH(request) {
  const supabase = getSupabase();

  if (!supabase) {
    return NextResponse.json({
      success: false,
      error: 'Database not configured'
    }, { status: 500 });
  }

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

    // If marking as paid, set paid_at
    if (updates.status === 'paid' && !updates.paid_at) {
      updates.paid_at = new Date().toISOString();
    }

    const { data, error } = await supabase
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

