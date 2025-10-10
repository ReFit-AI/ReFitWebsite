import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET;

// GET - Fetch all inventory
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('purchased_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      inventory: data || []
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Add new inventory item
export async function POST(request) {
  try {
    const body = await request.json();
    const { walletAddress, item } = body;

    // Verify admin
    if (walletAddress !== ADMIN_WALLET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Use service role client for admin operations
    const supabaseAdmin = supabase;

    const { data, error } = await supabaseAdmin
      .from('inventory')
      .insert({
        ...item,
        purchased_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      item: data
    });
  } catch (error) {
    console.error('Error adding inventory item:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update inventory item
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

    // If marking as sold and sold_at not set, set it
    if (updates.status === 'sold' && !updates.sold_at) {
      updates.sold_at = new Date().toISOString();
    }

    // If marking as in_stock, clear sold_at and price_sold
    if (updates.status === 'in_stock') {
      updates.sold_at = null;
      updates.price_sold = null;
    }

    const { data, error } = await supabaseAdmin
      .from('inventory')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      item: data
    });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete inventory item
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

    const { error } = await supabaseAdmin
      .from('inventory')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
