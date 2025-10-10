import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Minimum deposit amount
const MIN_DEPOSIT = 1000

export async function POST(request) {
  try {
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

    // TODO: Verify transaction on Solana (for production)
    // This would check:
    // 1. Transaction exists
    // 2. Amount matches
    // 3. Sent to correct vault address
    // 4. Is USDC transfer

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
        console.log(`✅ Early bird bonus claimed! Slots remaining: ${bonusResult.slots_remaining}`)
      }
    } catch (bonusErr) {
      console.log('Bonus not claimed (might be out of slots):', bonusErr.message)
      // Continue without bonus
    }

    // Create deposit record
    console.log('Creating deposit record:', {
      wallet: walletAddress.slice(0, 8) + '...',
      amount,
      tx: txSignature.slice(0, 8) + '...',
      rftRate,
      hasEarlyBonus
    })

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
      console.error('Deposit insert error:', {
        code: depositError.code,
        message: depositError.message,
        details: depositError.details,
        hint: depositError.hint
      })

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
      console.error('Pool update error:', poolError)
    }

    // Log admin action
    await supabase
      .from('admin_actions')
      .insert({
        action_type: 'deposit',
        description: `New deposit from ${walletAddress.slice(0, 8)}...`,
        amount: amount
      })

    console.log(`✅ New deposit: ${walletAddress.slice(0, 8)}... deposited $${amount}`)

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
  } catch (error) {
    console.error('Deposit API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to check deposit status
export async function GET(request) {
  try {
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
  } catch (error) {
    console.error('Get deposits error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch deposits' },
      { status: 500 }
    )
  }
}