import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'
import { rateLimitEndpoint } from '@/lib/rate-limit-upstash'
import { verifyOrigin } from '@/lib/csrf-protection'

// POST - Request withdrawal
export async function POST(request) {
  // TEMPORARILY DISABLED - Coming Soon
  return NextResponse.json(
    {
      success: false,
      error: 'Pool withdrawals are coming soon! Expected launch: December 2025',
      comingSoon: true
    },
    { status: 503 }
  );

  try {
    // SECURITY: Rate limiting - distributed across serverless instances
    const rateLimitResult = await rateLimitEndpoint.api(request)
    if (!rateLimitResult.success) {
      console.log(`⚠️ Rate limit exceeded for withdrawal request`)
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
    const { walletAddress, amount } = body

    // Validation
    if (!walletAddress || !amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid withdrawal amount' },
        { status: 400 }
      )
    }

    // Get user's total deposits
    const { data: deposits, error: depositsError } = await supabase
      .from('deposits')
      .select('*')
      .eq('wallet_address', walletAddress)
      .eq('status', 'active')

    if (depositsError) {
      throw depositsError
    }

    const totalDeposited = deposits?.reduce((sum, d) => sum + parseFloat(d.amount), 0) || 0

    // Get existing pending withdrawals
    const { data: pendingWithdrawals } = await supabase
      .from('withdrawal_requests')
      .select('amount')
      .eq('wallet_address', walletAddress)
      .in('status', ['pending', 'approved'])

    const totalPendingWithdrawals = pendingWithdrawals?.reduce(
      (sum, w) => sum + parseFloat(w.amount), 0
    ) || 0

    const availableBalance = totalDeposited - totalPendingWithdrawals

    // Check if sufficient balance
    if (availableBalance < amount) {
      return NextResponse.json(
        { success: false, error: `Insufficient balance. Available: $${availableBalance}` },
        { status: 400 }
      )
    }

    // Create withdrawal request (not tied to specific deposit)
    const { data: withdrawalRequest, error: requestError } = await supabase
      .from('withdrawal_requests')
      .insert({
        wallet_address: walletAddress,
        amount: amount,
        status: 'pending'
      })
      .select()
      .single()

    if (requestError) {
      console.error('Withdrawal request error:', requestError)
      return NextResponse.json(
        { success: false, error: 'Failed to create withdrawal request' },
        { status: 500 }
      )
    }

    // Log admin action
    await supabase
      .from('admin_actions')
      .insert({
        action_type: 'withdrawal_request',
        description: `Withdrawal request from ${walletAddress.slice(0, 8)}... for $${amount}`,
        amount: amount
      })

    return NextResponse.json({
      success: true,
      request: {
        id: withdrawalRequest.id,
        amount: amount,
        status: 'pending',
        estimatedProcessing: '7 days'
      }
    })
  } catch (error) {
    console.error('Withdrawal API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - Check withdrawal status
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet')

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address required' },
        { status: 400 }
      )
    }

    // Get user's withdrawal requests
    const { data: requests, error } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('wallet_address', walletAddress)
      .order('requested_at', { ascending: false })
      .limit(10)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      withdrawalRequests: requests || []
    })
  } catch (error) {
    console.error('Get withdrawals error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch withdrawal requests' },
      { status: 500 }
    )
  }
}

// PATCH - Admin: Process withdrawal (approve/reject)
export async function PATCH(request) {
  try {
    // SECURITY: Require admin authentication
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.authorized) {
      console.error('❌ Unauthorized withdrawal action attempt');
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json()
    const { requestId, action, txSignature } = body // action: 'approve', 'reject', 'complete'

    if (!requestId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get withdrawal request
    const { data: withdrawalRequest, error: fetchError } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (fetchError || !withdrawalRequest) {
      return NextResponse.json(
        { success: false, error: 'Withdrawal request not found' },
        { status: 404 }
      )
    }

    let updateData = {}
    let shouldProcessWithdrawal = false

    if (action === 'approve') {
      updateData = { status: 'approved' }
    } else if (action === 'reject') {
      updateData = { status: 'rejected', processed_at: new Date().toISOString() }
    } else if (action === 'complete') {
      if (!txSignature) {
        return NextResponse.json(
          { success: false, error: 'Transaction signature required' },
          { status: 400 }
        )
      }
      updateData = {
        status: 'completed',
        withdrawal_tx: txSignature,
        processed_at: new Date().toISOString()
      }
      shouldProcessWithdrawal = true
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      )
    }

    // Update withdrawal request
    const { error: updateError } = await supabase
      .from('withdrawal_requests')
      .update(updateData)
      .eq('id', requestId)

    if (updateError) {
      throw updateError
    }

    // If completing withdrawal, update deposit and pool
    if (shouldProcessWithdrawal) {
      const { data: result, error: processError } = await supabase
        .rpc('process_withdrawal', {
          p_deposit_id: withdrawalRequest.deposit_id,
          p_amount: withdrawalRequest.amount
        })

      if (processError || !result?.success) {
        return NextResponse.json(
          { success: false, error: result?.error || 'Failed to process withdrawal' },
          { status: 500 }
        )
      }

      // Log admin action
      await supabase
        .from('admin_actions')
        .insert({
          action_type: 'withdrawal_completed',
          description: `Withdrawal completed for ${withdrawalRequest.wallet_address.slice(0, 8)}...`,
          amount: withdrawalRequest.amount,
          tx_signature: txSignature
        })
    }

    return NextResponse.json({
      success: true,
      status: updateData.status
    })
  } catch (error) {
    console.error('Process withdrawal error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process withdrawal request' },
      { status: 500 }
    )
  }
}