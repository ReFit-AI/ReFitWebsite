import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

const BRIDGE_API_KEY = process.env.BRIDGE_API_KEY

function checkAuth(request) {
  if (!BRIDGE_API_KEY) return false
  const authHeader = request.headers.get('authorization')
  if (authHeader === `Bearer ${BRIDGE_API_KEY}`) return true
  // Also accept as query param for simple curl testing
  const { searchParams } = new URL(request.url)
  return searchParams.get('api_key') === BRIDGE_API_KEY
}

// GET /api/bridge/v1/purchases?since=&status=&seller=&model=&limit=&offset=
export async function GET(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const since = searchParams.get('since')
    const status = searchParams.get('status')
    const seller = searchParams.get('seller')
    const model = searchParams.get('model')
    const limit = Math.min(parseInt(searchParams.get('limit') || '500'), 1000)
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabaseAdmin
      .from('ebay_purchases')
      .select('*', { count: 'exact' })
      .order('order_date', { ascending: false })

    if (since) {
      query = query.gte('order_date', since)
    }
    if (status && status !== 'all') {
      query = query.eq('order_status', status)
    }
    if (seller) {
      query = query.eq('seller_username', seller)
    }
    if (model) {
      query = query.ilike('model', `%${model}%`)
    }

    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query
    if (error) throw error

    // Strip raw_api_data to keep responses lightweight
    const purchases = (data || []).map(({ raw_api_data, ...rest }) => rest)

    return NextResponse.json({
      purchases,
      total: count || 0,
      has_more: (offset + limit) < (count || 0)
    })
  } catch (err) {
    console.error('Bridge purchases error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
