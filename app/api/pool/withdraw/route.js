import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST - Request withdrawal
export async function POST(request) {
  try {
    const body = await request.json()
    const { walletAddress, depositId, amount } = body

    // Validation
    if (!walletAddress || !depositId || !amount) {
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

    // Get deposit details
    const { data: deposit, error: depositError } = await supabase
      .from('deposits')
      .select('*')
      .eq('id', depositId)
      .eq('wallet_address', walletAddress)
      .eq('status', 'active')
      .single()

    if (depositError || !deposit) {
      return NextResponse.json(
        { success: false, error: 'Deposit not found or not active' },
        { status: 404 }
      )
    }

    // Check if sufficient balance
    if (parseFloat(deposit.current_value) < amount) {
      return NextResponse.json(
        { success: false, error: 'Insufficient balance' },
        { status: 400 }
      )
    }

    // Check for existing pending withdrawal
    const { data: existingRequest } = await supabase
      .from('withdrawal_requests')
      .select('id')
      .eq('deposit_id', depositId)
      .in('status', ['pending', 'approved', 'processing'])
      .single()

    if (existingRequest) {
      return NextResponse.json(
        { success: false, error: 'You already have a pending withdrawal request' },
        { status: 400 }
      )
    }

    // Create withdrawal request
    const { data: withdrawalRequest, error: requestError } = await supabase
      .from('withdrawal_requests')
      .insert({
        deposit_id: depositId,
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
      requests: requests || []
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
    const body = await request.json()
    const { requestId, action, txSignature } = body // action: 'approve', 'reject', 'complete'

    // TODO: Add admin authentication

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