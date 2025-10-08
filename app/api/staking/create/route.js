import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Connection, PublicKey } from '@solana/web3.js';

// Squads multisig vault address (set this in your .env)
const SQUADS_VAULT_ADDRESS = process.env.NEXT_PUBLIC_SQUADS_VAULT_ADDRESS;

// Tier configurations
const TIERS = {
  flexible: { lockDays: 0, apy: 50 },
  smart: { lockDays: 180, apy: 150 },
  diamond: { lockDays: 365, apy: 250 }
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { walletAddress, amount, tier, txSignature, fromOrderId } = body;

    // Validation
    if (!walletAddress || !amount || !tier || !txSignature) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!TIERS[tier]) {
      return NextResponse.json(
        { success: false, error: 'Invalid tier' },
        { status: 400 }
      );
    }

    if (amount < 50) {
      return NextResponse.json(
        { success: false, error: 'Minimum stake is $50' },
        { status: 400 }
      );
    }

    if (amount > 10000) {
      return NextResponse.json(
        { success: false, error: 'Maximum stake is $10,000 (for now)' },
        { status: 400 }
      );
    }

    // Verify transaction on Solana
    if (process.env.NODE_ENV === 'production') {
      const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_HOST || 'https://api.mainnet-beta.solana.com'
      );

      try {
        const tx = await connection.getTransaction(txSignature, {
          commitment: 'confirmed'
        });

        if (!tx) {
          return NextResponse.json(
            { success: false, error: 'Transaction not found' },
            { status: 400 }
          );
        }

        // TODO: Verify transaction actually sent USDC to vault
        // This requires parsing the transaction instructions
        // For MVP, we'll trust the signature exists
      } catch (err) {
        console.error('Transaction verification error:', err);
        return NextResponse.json(
          { success: false, error: 'Failed to verify transaction' },
          { status: 500 }
        );
      }
    }

    // Calculate unlock date
    const unlockDate = new Date();
    unlockDate.setDate(unlockDate.getDate() + TIERS[tier].lockDays);

    // Get or create profile
    let { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single();

    if (!profile) {
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert({ wallet_address: walletAddress })
        .select('id')
        .single();
      profile = newProfile;
    }

    // Create stake record
    const { data: stake, error } = await supabase
      .from('stakes')
      .insert({
        profile_id: profile.id,
        wallet_address: walletAddress,
        amount: amount,
        tier: tier,
        lock_days: TIERS[tier].lockDays,
        unlock_date: unlockDate.toISOString(),
        apy: TIERS[tier].apy,
        tx_signature: txSignature,
        from_order_id: fromOrderId || null,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create stake' },
        { status: 500 }
      );
    }

    // Log event
    if (process.env.NODE_ENV === 'development') {
      console.log('Stake created:', {
        id: stake.id,
        wallet: walletAddress.slice(0, 8),
        amount,
        tier,
        unlockDate
      });
    }

    return NextResponse.json({
      success: true,
      stake: {
        id: stake.id,
        amount: stake.amount,
        tier: stake.tier,
        apy: stake.apy,
        unlockDate: stake.unlock_date,
        status: stake.status
      }
    });
  } catch (error) {
    console.error('Create stake error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
