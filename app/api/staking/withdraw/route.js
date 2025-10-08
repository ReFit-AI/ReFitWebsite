import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    const { stakeId, walletAddress, amount } = body;

    if (!stakeId || !walletAddress || !amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get stake details
    const { data: stake, error: stakeError } = await supabase
      .from('stakes')
      .select('*')
      .eq('id', stakeId)
      .eq('wallet_address', walletAddress)
      .single();

    if (stakeError || !stake) {
      return NextResponse.json(
        { success: false, error: 'Stake not found' },
        { status: 404 }
      );
    }

    if (stake.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Stake is not active' },
        { status: 400 }
      );
    }

    // Check if unlocked
    const now = new Date();
    const unlockDate = new Date(stake.unlock_date);
    const isUnlocked = now >= unlockDate;

    // Calculate penalty for early withdrawal (10%)
    let penalty = 0;
    if (!isUnlocked) {
      penalty = amount * 0.10;
    }

    const netAmount = amount - penalty;

    // Create withdrawal request
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from('withdrawal_requests')
      .insert({
        stake_id: stakeId,
        wallet_address: walletAddress,
        amount: amount,
        penalty: penalty,
        net_amount: netAmount,
        status: 'pending'
      })
      .select()
      .single();

    if (withdrawalError) {
      console.error('Create withdrawal error:', withdrawalError);
      return NextResponse.json(
        { success: false, error: 'Failed to create withdrawal request' },
        { status: 500 }
      );
    }

    // TODO: In production, this would trigger a notification to admin
    // For MVP, admin will manually process from dashboard

    return NextResponse.json({
      success: true,
      withdrawal: {
        id: withdrawal.id,
        amount: withdrawal.amount,
        penalty: withdrawal.penalty,
        netAmount: withdrawal.net_amount,
        status: withdrawal.status,
        estimatedProcessingTime: isUnlocked ? '1-2 business days' : '3-5 business days'
      }
    });
  } catch (error) {
    console.error('Withdraw error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
