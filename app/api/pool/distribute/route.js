import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// This endpoint processes weekly distributions
// Should be called by a cron job every Monday

export async function POST(request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    // TODO: Add proper auth (NextAuth, Clerk, etc.)
    // For now, require admin secret from server environment
    // This will be handled by middleware/auth in production

    const body = await request.json()
    const { weeklyProfit, adminSecret } = body // Total profit this week from phone flips

    // Verify admin secret (server-side only, never exposed to client)
    if (process.env.NODE_ENV === 'production') {
      // In production, this should be replaced with proper session-based auth
      if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    if (!weeklyProfit || weeklyProfit <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid profit amount' },
        { status: 400 }
      )
    }

    // Platform fee (20% to start, will decrease as we scale)
    const platformFeeRate = 0.20
    const platformFee = weeklyProfit * platformFeeRate
    const lpDistribution = weeklyProfit * (1 - platformFeeRate)

    // Get all active deposits
    const { data: deposits, error: depositsError } = await supabase
      .from('deposits')
      .select('*')
      .eq('status', 'active')

    if (depositsError) {
      throw depositsError
    }

    if (!deposits || deposits.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active deposits to distribute to'
      })
    }

    // Create distribution record
    const { data: distribution, error: distError } = await supabase
      .rpc('process_weekly_distribution', {
        week_profit: weeklyProfit,
        platform_fee_rate: platformFeeRate
      })

    if (distError) {
      throw distError
    }

    // Calculate distribution records for batch insert
    const distributionRecords = deposits.map(deposit => {
      const depositAmount = parseFloat(deposit.amount)
      const usdcEarned = depositAmount * 0.02 // 2% weekly
      const rftEarned = depositAmount * deposit.rft_rate // RFT based on their rate

      return {
        distribution_id: distribution,
        deposit_id: deposit.id,
        wallet_address: deposit.wallet_address,
        usdc_earned: usdcEarned,
        rft_earned: rftEarned,
        deposit_balance: depositAmount,
        _usdcEarned: usdcEarned, // For response
        _rftEarned: rftEarned
      }
    })

    // Batch update all deposits at once using SQL
    // This is much faster and prevents race conditions
    const now = new Date().toISOString()
    const { error: updateError } = await supabase.rpc('batch_update_deposits_for_distribution', {
      p_distribution_id: distribution,
      p_timestamp: now
    })

    if (updateError) {
      console.error('Batch update error:', updateError)
      // If batch function doesn't exist, fall back to individual updates
      for (const record of distributionRecords) {
        await supabase
          .from('deposits')
          .update({
            current_value: supabase.sql`current_value + ${record.usdc_earned}`,
            total_earned_usdc: supabase.sql`total_earned_usdc + ${record.usdc_earned}`,
            rft_earned: supabase.sql`rft_earned + ${record.rft_earned}`,
            last_distribution_at: now
          })
          .eq('id', record.deposit_id)
      }
    }

    // Batch insert distribution records
    const { error: recordsError } = await supabase
      .from('distribution_records')
      .insert(distributionRecords.map(r => ({
        distribution_id: r.distribution_id,
        deposit_id: r.deposit_id,
        wallet_address: r.wallet_address,
        usdc_earned: r.usdc_earned,
        rft_earned: r.rft_earned,
        deposit_balance: r.deposit_balance
      })))

    if (recordsError) {
      console.error('Insert records error:', recordsError)
    }

    // Update pool stats - use parameterized increment
    const { error: poolUpdateError } = await supabase
      .from('liquidity_pool')
      .update({
        total_distributed: supabase.sql`total_distributed + ${lpDistribution}`,
        platform_fees_collected: supabase.sql`platform_fees_collected + ${platformFee}`,
        total_profits: supabase.sql`total_profits + ${weeklyProfit}`,
        updated_at: now
      })
      .eq('id', 1)

    if (poolUpdateError) {
      console.error('Pool update error:', poolUpdateError)
    }

    // Build response
    const distributions = distributionRecords.map(r => ({
      wallet: r.wallet_address,
      usdcEarned: r._usdcEarned,
      rftEarned: r._rftEarned
    }))

    // Mark distribution as completed
    await supabase
      .from('distributions')
      .update({
        status: 'completed',
        processed_at: new Date().toISOString()
      })
      .eq('id', distribution)

    // Log admin action
    await supabase
      .from('admin_actions')
      .insert({
        action_type: 'distribution',
        description: `Weekly distribution processed. Profit: $${weeklyProfit}, Distributed: $${lpDistribution}`,
        amount: weeklyProfit
      })

    console.log(`✅ Distribution complete: $${lpDistribution} to ${deposits.length} depositors`)

    return NextResponse.json({
      success: true,
      distribution: {
        id: distribution,
        weeklyProfit,
        platformFee,
        lpDistribution,
        depositorCount: deposits.length,
        distributions
      }
    })
  } catch (error) {
    console.error('Distribution error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process distribution' },
      { status: 500 }
    )
  }
}

// GET endpoint to view distribution history
export async function GET(request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get('wallet')

    if (wallet) {
      // Get user's distribution history
      const { data: records, error } = await supabase
        .from('distribution_records')
        .select(`
          *,
          distributions(
            week_number,
            week_start,
            week_end,
            distribution_rate
          )
        `)
        .eq('wallet_address', wallet)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      return NextResponse.json({
        success: true,
        records: records || []
      })
    } else {
      // Get all distributions (public transparency)
      const { data: distributions, error } = await supabase
        .from('distributions')
        .select('*')
        .order('week_number', { ascending: false })
        .limit(10)

      if (error) throw error

      return NextResponse.json({
        success: true,
        distributions: distributions || []
      })
    }
  } catch (error) {
    console.error('Get distributions error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch distributions' },
      { status: 500 }
    )
  }
}