import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET;

// POST - Bulk import inventory items
export async function POST(request) {
  try {
    const body = await request.json();
    const { walletAddress, items } = body;

    // Verify admin
    if (walletAddress !== ADMIN_WALLET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const supabaseAdmin = supabase;

    // Add timestamps
    const itemsWithTimestamps = items.map(item => ({
      ...item,
      purchased_at: new Date().toISOString(),
      sold_at: item.status === 'sold' ? new Date().toISOString() : null
    }));

    // Upsert items (update if IMEI exists, insert if not)
    const { data, error } = await supabaseAdmin
      .from('inventory')
      .upsert(itemsWithTimestamps, {
        onConflict: 'imei',
        ignoreDuplicates: false
      })
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      imported: data?.length || 0,
      items: data
    });
  } catch (error) {
    console.error('Error bulk importing inventory:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
