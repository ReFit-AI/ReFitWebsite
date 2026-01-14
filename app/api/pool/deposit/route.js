import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyTransaction } from '@/lib/verify-transaction'
import { rateLimitEndpoint } from '@/lib/rate-limit-upstash'

// Deposit limits for beta
const MIN_DEPOSIT = 10 // $10 minimum to prevent spam
const MAX_DEPOSIT = 100 // $100 max during beta for risk management
const IS_BETA = true

export async function POST(request) {
  // TEMPORARILY DISABLED - Coming Soon
  return NextResponse.json(
    {
      success: false,
      error: 'Pool deposits are coming soon! Expected launch: December 2025',
      comingSoon: true
    },
    { status: 503 }
  );

  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    // SECURITY: Rate limiting - distributed across serverless instances
    const rateLimitResult = await rateLimitEndpoint.api(request)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: rateLimitResult.message || 'Too many requests',
          retryAfter: rateLimitResult.retryAfter
        },
        {
          status: 429,
          headers: rateLimitResult.headers
        }
      )
    }

    const body = await request.json()
    const { walletAddress, amount, txSignature } = body

    // Validation
    if (!walletAddress || !amount || !txSignature) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (amount < MIN_DEPOSIT) {
      return NextResponse.json(
        { success: false, error: `Minimum deposit is $${MIN_DEPOSIT}` },
        { status: 400 }
      )
    }

    if (IS_BETA && amount > MAX_DEPOSIT) {
      return NextResponse.json(
        {
          success: false,
          error: `Maximum deposit during beta is $${MAX_DEPOSIT}`,
          details: 'We are limiting deposits during beta testing for security. This limit will be increased after our security audit.'
        },
        { status: 400 }
      )
    }

    // Check if transaction signature already used (prevent double deposits)
    const { data: existingDeposit } = await supabase
      .from('deposits')
      .select('id')
      .eq('deposit_tx', txSignature)
      .single()

    if (existingDeposit) {
      return NextResponse.json(
        { success: false, error: 'Transaction already processed' },
        { status: 400 }
      )
    }

    // SECURITY: Verify transaction on Solana blockchain
    try {
      await verifyTransaction(txSignature, amount, walletAddress)
    } catch (verifyError) {
      return NextResponse.json(
        {
          success: false,
          error: `Transaction verification failed: ${verifyError.message}`,
          details: 'The transaction could not be verified on the Solana blockchain. Please ensure you sent USDC to the correct vault address.'
        },
        { status: 400 }
      )
    }

    // Check if user already has deposits (for metrics)
    const { data: existingDeposits } = await supabase
      .from('deposits')
      .select('id')
      .eq('wallet_address', walletAddress)
      .limit(1)

    const isNewDepositor = !existingDeposits || existingDeposits.length === 0

    // Use atomic RPC function to handle bonus slot allocation with race condition protection
    let hasEarlyBonus = false
    let rftRate = 1.0

    try {
      const { data: bonusResult, error: bonusError } = await supabase
        .rpc('claim_early_bonus_slot')

      if (!bonusError && bonusResult?.success) {
        hasEarlyBonus = true
        rftRate = 1.5 // 50% bonus for early birds
      }
    } catch {
      // Continue without bonus if not available
    }

    // Create deposit record
    const { data: deposit, error: depositError } = await supabase
      .from('deposits')
      .insert({
        wallet_address: walletAddress,
        amount: amount,
        deposit_tx: txSignature,
        current_value: amount, // Starts at deposit amount
        rft_rate: rftRate,
        has_early_bonus: hasEarlyBonus,
        status: 'active'
      })
      .select()
      .single()

    if (depositError) {
      // Check if it's a duplicate transaction
      if (depositError.code === '23505' || depositError.message?.includes('duplicate')) {
        return NextResponse.json(
          { success: false, error: 'This transaction has already been processed' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { success: false, error: `Database error: ${depositError.message}` },
        { status: 500 }
      )
    }

    // Update pool stats
    const { error: poolError } = await supabase.rpc('update_pool_on_deposit', {
      deposit_amount: amount,
      is_new_depositor: isNewDepositor
    })

    if (poolError) {
      // Pool stats update failed, but deposit was successful
    }

    // Log admin action
    await supabase
      .from('admin_actions')
      .insert({
        action_type: 'deposit',
        description: `New deposit from ${walletAddress.slice(0, 8)}...`,
        amount: amount
      })

    return NextResponse.json({
      success: true,
      deposit: {
        id: deposit.id,
        amount: deposit.amount,
        rftRate: deposit.rft_rate,
        hasEarlyBonus: deposit.has_early_bonus,
        weeklyReturn: amount * 0.02,
        estimatedRftPerWeek: amount * rftRate
      }
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to check deposit status
export async function GET(request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet')

    if (!walletAddress) {
      // Return pool stats if no wallet specified
      const { data: poolStats } = await supabase.rpc('get_pool_stats')

      return NextResponse.json({
        success: true,
        pool: poolStats
      })
    }

    // Get user's deposits
    const { data: deposits, error } = await supabase
      .from('deposits')
      .select('*')
      .eq('wallet_address', walletAddress)
      .eq('status', 'active')

    if (error) {
      throw error
    }

    // Calculate totals
    const totalDeposited = deposits?.reduce((sum, d) => sum + parseFloat(d.amount), 0) || 0
    const totalEarned = deposits?.reduce((sum, d) => sum + parseFloat(d.total_earned_usdc), 0) || 0
    const totalRft = deposits?.reduce((sum, d) => sum + parseFloat(d.rft_earned), 0) || 0

    return NextResponse.json({
      success: true,
      deposits: deposits || [],
      summary: {
        totalDeposited,
        totalEarned,
        totalRft,
        weeklyEarnings: totalDeposited * 0.02,
        weeklyRft: totalDeposited * (deposits?.[0]?.rft_rate || 1)
      }
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch deposits' },
      { status: 500 }
    )
  }
}