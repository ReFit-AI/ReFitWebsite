import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET;

// POST - Setup database tables via Supabase SQL
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

    // Use service role key to run raw SQL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, error: 'Missing Supabase credentials' },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('Creating inventory table...');

    // Create inventory table
    const { error: tableError } = await supabaseAdmin.rpc('execute_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS inventory (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          model VARCHAR(100) NOT NULL,
          imei VARCHAR(20) NOT NULL UNIQUE,
          price_paid DECIMAL(10, 2) NOT NULL,
          price_sold DECIMAL(10, 2),
          battery_health INTEGER,
          condition VARCHAR(50),
          notes TEXT,
          seller VARCHAR(100),
          purchased_at TIMESTAMPTZ DEFAULT NOW(),
          sold_at TIMESTAMPTZ,
          status VARCHAR(20) DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'sold', 'returned')),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS invoices (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          invoice_number VARCHAR(50) UNIQUE NOT NULL,
          buyer_name VARCHAR(200),
          buyer_email VARCHAR(200),
          buyer_address TEXT,
          total_amount DECIMAL(10, 2) NOT NULL,
          status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'cancelled')),
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          due_date TIMESTAMPTZ,
          paid_at TIMESTAMPTZ
        );

        CREATE TABLE IF NOT EXISTS invoice_items (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
          inventory_id UUID REFERENCES inventory(id) ON DELETE SET NULL,
          model VARCHAR(100) NOT NULL,
          imei VARCHAR(20) NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
        CREATE INDEX IF NOT EXISTS idx_inventory_sold_at ON inventory(sold_at);
        CREATE INDEX IF NOT EXISTS idx_inventory_model ON inventory(model);
        CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
        CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);

        ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
        ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
        ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
      `
    });

    // If RPC doesn't exist, we need to tell user to run SQL manually
    if (tableError && tableError.message.includes('function')) {
      return NextResponse.json({
        success: false,
        error: 'Cannot create tables via API. Please run the migration SQL directly in Supabase SQL Editor',
        sql_file: 'supabase/migrations/20250108_inventory_system.sql',
        instructions: [
          '1. Go to your Supabase project dashboard',
          '2. Click on "SQL Editor" in the left sidebar',
          '3. Copy the SQL from supabase/migrations/20250108_inventory_system.sql',
          '4. Paste and run it in the SQL editor',
          '5. Then come back and use /api/admin/setup-inventory to import data'
        ]
      }, { status: 400 });
    }

    if (tableError) {
      throw tableError;
    }

    return NextResponse.json({
      success: true,
      message: 'Database tables created successfully'
    });

  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
