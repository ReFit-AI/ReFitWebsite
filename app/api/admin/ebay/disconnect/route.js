import { NextResponse } from 'next/server'
import { sanitizeError } from '@/lib/validation'
import { supabaseAdmin } from '@/lib/supabase-server'

const ADMIN_WALLET = process.env.ADMIN_WALLET

export async function POST(request) {
  try {
    const body = await request.json()
    const { walletAddress } = body

    if (walletAddress !== ADMIN_WALLET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Soft-delete: set is_active = false
    const { error } = await supabaseAdmin
      .from('ebay_accounts')
      .update({ is_active: false })
      .eq('is_active', true)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error disconnecting eBay:', error)
    return NextResponse.json(
      { success: false, error: sanitizeError(error, 'Failed to disconnect eBay') },
      { status: 500 }
    )
  }
}
