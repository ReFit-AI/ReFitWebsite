import { NextResponse } from 'next/server';
import { sanitizeError } from '@/lib/validation';
import { createClient } from '@supabase/supabase-js';

const ADMIN_WALLET = process.env.ADMIN_WALLET;

// GET - Fetch setting by key
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    if (key) {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('key', key)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return NextResponse.json({ success: true, setting: data });
    } else {
      const { data, error } = await supabase
        .from('settings')
        .select('*');

      if (error) throw error;

      return NextResponse.json({ success: true, settings: data });
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, error: sanitizeError(error, 'Internal server error') },
      { status: 500 }
    );
  }
}

// POST/PUT - Update setting
export async function POST(request) {
  try {
    const body = await request.json();
    const { walletAddress, key, value } = body;

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

    const { data, error} = await supabase
      .from('settings')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, setting: data });
  } catch (error) {
    console.error('Error updating setting:', error);
    return NextResponse.json(
      { success: false, error: sanitizeError(error, 'Internal server error') },
      { status: 500 }
    );
  }
}
