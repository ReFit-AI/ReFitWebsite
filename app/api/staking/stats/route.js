import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Get platform staking stats using the SQL function
    const { data: stats, error } = await supabase
      .rpc('get_staking_stats');

    if (error) {
      console.error('Get staking stats error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch stats' },
        { status: 500 }
      );
    }

    // Get latest treasury snapshot
    const { data: snapshot } = await supabase
      .from('treasury_snapshots')
      .select('*')
      .order('snapshot_date', { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        treasury: snapshot ? {
          totalStaked: parseFloat(snapshot.total_staked),
          liquidBalance: parseFloat(snapshot.liquid_balance),
          validatorBalance: parseFloat(snapshot.validator_balance),
          lastUpdated: snapshot.snapshot_date
        } : null
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
