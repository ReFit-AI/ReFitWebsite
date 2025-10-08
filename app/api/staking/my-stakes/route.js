import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address required' },
        { status: 400 }
      );
    }

    // Get user's stakes
    const { data: stakes, error: stakesError } = await supabase
      .from('stakes')
      .select('*')
      .eq('wallet_address', walletAddress)
      .order('created_at', { ascending: false });

    if (stakesError) {
      console.error('Get stakes error:', stakesError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch stakes' },
        { status: 500 }
      );
    }

    // For each stake, calculate claimable yield
    const stakesWithYields = await Promise.all(
      stakes.map(async (stake) => {
        const { data: yieldData } = await supabase
          .rpc('get_claimable_yield', { stake_uuid: stake.id });

        const { data: totalYields } = await supabase
          .from('stake_yields')
          .select('amount')
          .eq('stake_id', stake.id);

        const totalEarned = totalYields?.reduce((sum, y) => sum + parseFloat(y.amount), 0) || 0;
        const claimable = parseFloat(yieldData || 0);

        return {
          ...stake,
          totalEarned,
          claimableYield: claimable,
          isUnlocked: new Date(stake.unlock_date) <= new Date(),
          daysUntilUnlock: Math.max(
            0,
            Math.ceil((new Date(stake.unlock_date) - new Date()) / (1000 * 60 * 60 * 24))
          )
        };
      })
    );

    // Calculate summary stats
    const summary = {
      totalStaked: stakes
        .filter(s => s.status === 'active')
        .reduce((sum, s) => sum + parseFloat(s.amount), 0),
      totalEarned: stakesWithYields.reduce((sum, s) => sum + s.totalEarned, 0),
      claimableYield: stakesWithYields.reduce((sum, s) => sum + s.claimableYield, 0),
      activeStakes: stakes.filter(s => s.status === 'active').length,
      totalStakes: stakes.length
    };

    return NextResponse.json({
      success: true,
      stakes: stakesWithYields,
      summary
    });
  } catch (error) {
    console.error('Get my stakes error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
