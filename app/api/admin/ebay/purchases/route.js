import { NextResponse } from 'next/server'
import { sanitizeError } from '@/lib/validation'
import { supabaseAdmin } from '@/lib/supabase-server'

const ADMIN_WALLET = process.env.ADMIN_WALLET

// GET - Paginated list with filters
export async function GET(request) {
  try {
    const authHeader = request.headers.get('x-admin-wallet')
    if (!authHeader || authHeader !== ADMIN_WALLET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('perPage') || '50')
    const status = searchParams.get('status')
    const seller = searchParams.get('seller')
    const search = searchParams.get('search')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    let query = supabaseAdmin
      .from('ebay_purchases')
      .select('*', { count: 'exact' })
      .order('order_date', { ascending: false })

    if (status && status !== 'All') {
      query = query.eq('order_status', status)
    }
    if (seller) {
      query = query.eq('seller_username', seller)
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,ebay_order_id.ilike.%${search}%,tracking_number.ilike.%${search}%,seller_username.ilike.%${search}%`)
    }
    if (dateFrom) {
      query = query.gte('order_date', dateFrom)
    }
    if (dateTo) {
      query = query.lte('order_date', dateTo)
    }

    const from = (page - 1) * perPage
    const to = from + perPage - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) throw error

    // Also get aggregate stats
    const { data: allPurchases } = await supabaseAdmin
      .from('ebay_purchases')
      .select('total_cost, order_status, seller_username')

    const stats = {
      totalPurchases: allPurchases?.length || 0,
      totalSpent: allPurchases?.reduce((sum, p) => sum + parseFloat(p.total_cost || 0), 0) || 0,
      awaitingDelivery: allPurchases?.filter(p => ['Active', 'Shipped'].includes(p.order_status)).length || 0,
      uniqueSellers: new Set(allPurchases?.map(p => p.seller_username).filter(Boolean)).size
    }

    return NextResponse.json({
      success: true,
      purchases: data || [],
      total: count || 0,
      page,
      perPage,
      stats
    })
  } catch (error) {
    console.error('Error fetching eBay purchases:', error)
    return NextResponse.json(
      { success: false, error: sanitizeError(error, 'Failed to fetch purchases') },
      { status: 500 }
    )
  }
}

// PATCH - Update purchase (notes, status, link to inventory_id)
export async function PATCH(request) {
  try {
    const body = await request.json()
    const { walletAddress, id, updates } = body

    if (walletAddress !== ADMIN_WALLET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Only allow specific fields to be updated
    const allowedFields = ['notes', 'order_status', 'inventory_id', 'tracking_number', 'shipping_carrier', 'tracking_url']
    const sanitized = {}
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        sanitized[key] = updates[key]
      }
    }

    const { data, error } = await supabaseAdmin
      .from('ebay_purchases')
      .update(sanitized)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, purchase: data })
  } catch (error) {
    console.error('Error updating eBay purchase:', error)
    return NextResponse.json(
      { success: false, error: sanitizeError(error, 'Failed to update purchase') },
      { status: 500 }
    )
  }
}
