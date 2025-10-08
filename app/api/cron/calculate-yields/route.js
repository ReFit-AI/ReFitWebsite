import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// This endpoint should be called by a cron job daily
// Set up in Vercel: https://vercel.com/docs/cron-jobs
// Or use GitHub Actions / external cron service

export async function GET(request) {
  try {
    // Verify cron secret to prevent unauthorized calls
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Call the database function to calculate yields
    const { data, error } = await supabase.rpc('calculate_daily_yields');

    if (error) {
      console.error('Calculate yields error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to calculate yields' },
        { status: 500 }
      );
    }

    console.log(`Daily yields calculated for ${data} active stakes`);

    return NextResponse.json({
      success: true,
      yieldsCreated: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// For manual testing in development
export async function POST(request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { success: false, error: 'Not available in production' },
      { status: 403 }
    );
  }

  return GET(request);
}
