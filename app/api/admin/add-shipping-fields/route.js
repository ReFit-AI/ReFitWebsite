import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ADMIN_WALLET = process.env.ADMIN_WALLET;

// POST - Add shipping cost fields to existing inventory table
export async function POST(request) {
  try {
    const body = await request.json();
    const { walletAddress } = body;

    // Verify admin
    if (walletAddress !== ADMIN_WALLET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Create service role client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, error: 'Missing Supabase credentials' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Check if columns already exist
    const { data: existing } = await supabase
      .from('inventory')
      .select('shipping_cost_in')
      .limit(1);

    if (existing && existing.length > 0 && existing[0].hasOwnProperty('shipping_cost_in')) {
      return NextResponse.json({
        success: true,
        message: 'Shipping fields already exist'
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Please run the SQL migration manually in Supabase SQL Editor',
      instructions: [
        '1. Go to Supabase Dashboard > SQL Editor',
        '2. Copy SQL from: supabase/migrations/20250108_add_shipping_costs.sql',
        '3. Paste and run it',
        '4. Refresh this page'
      ]
    }, { status: 400 });

  } catch (error) {
    console.error('Add shipping fields error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
