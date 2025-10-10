import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET;

// GET - List all buyers
export async function GET(request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: buyers, error } = await supabase
      .from('buyers')
      .select('*')
      .order('last_order_at', { ascending: false, nullsFirst: false })
      .order('name', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, buyers });
  } catch (error) {
    console.error('Error fetching buyers:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new buyer
export async function POST(request) {
  try {
    const body = await request.json();
    const { walletAddress, buyer } = body;

    // Verify admin
    if (walletAddress !== ADMIN_WALLET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase
      .from('buyers')
      .insert([buyer])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, buyer: data });
  } catch (error) {
    console.error('Error creating buyer:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update buyer
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

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase
      .from('buyers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, buyer: data });
  } catch (error) {
    console.error('Error updating buyer:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
