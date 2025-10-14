import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET all deposits for admin dashboard
export async function GET(request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Check admin auth (simple bearer token for now)
    const authHeader = request.headers.get('authorization')
    const adminSecret = process.env.ADMIN_SECRET || 'development-secret'

    // For development, allow access without auth
    // In production, enforce authentication
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${adminSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all active deposits
    const { data: deposits, error } = await supabase
      .from('deposits')
      .select('*')
      .eq('status', 'active')
      .order('deposited_at', { ascending: false })

    if (error) {
      console.error('Error fetching deposits:', error)
      throw error
    }

    // Get pool stats
    const { data: poolStats } = await supabase
      .from('liquidity_pool')
      .select('*')
      .single()

    return NextResponse.json({
      success: true,
      deposits: deposits || [],
      poolStats: poolStats || {},
      summary: {
        totalDeposits: deposits?.reduce((sum, d) => sum + parseFloat(d.amount), 0) || 0,
        activeDepositors: deposits?.length || 0,
        weeklyRequired: (deposits?.reduce((sum, d) => sum + parseFloat(d.amount), 0) || 0) * 0.02,
        totalEarned: deposits?.reduce((sum, d) => sum + parseFloat(d.total_earned_usdc || 0), 0) || 0
      }
    })
  } catch (error) {
    console.error('Get all deposits error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch deposits' },
      { status: 500 }
    )
  }
}