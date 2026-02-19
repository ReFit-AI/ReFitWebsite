import { NextResponse } from 'next/server'
import { sanitizeError } from '@/lib/validation'
import { supabaseAdmin } from '@/lib/supabase-server'

const ADMIN_WALLET = process.env.ADMIN_WALLET

export async function GET(request) {
  try {
    const authHeader = request.headers.get('x-admin-wallet')
    if (!authHeader || authHeader !== ADMIN_WALLET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('ebay_sync_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json({ success: true, logs: data || [] })
  } catch (error) {
    console.error('Error fetching sync logs:', error)
    return NextResponse.json(
      { success: false, error: sanitizeError(error, 'Failed to fetch sync logs') },
      { status: 500 }
    )
  }
}
