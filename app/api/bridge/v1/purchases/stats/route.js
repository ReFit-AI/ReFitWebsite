import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

const BRIDGE_API_KEY = process.env.BRIDGE_API_KEY

function checkAuth(request) {
  if (!BRIDGE_API_KEY) return false
  const authHeader = request.headers.get('authorization')
  if (authHeader === `Bearer ${BRIDGE_API_KEY}`) return true
  const { searchParams } = new URL(request.url)
  return searchParams.get('api_key') === BRIDGE_API_KEY
}

// GET /api/bridge/v1/purchases/stats?since=
export async function GET(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const since = searchParams.get('since')

    // Fetch all purchases with optional date filter
    let purchaseQuery = supabaseAdmin
      .from('ebay_purchases')
      .select('*')

    if (since) {
      purchaseQuery = purchaseQuery.gte('order_date', since)
    }

    const { data: purchases, error: purchaseError } = await purchaseQuery
    if (purchaseError) throw purchaseError

    // Fetch contacts with feedback data
    const { data: contacts } = await supabaseAdmin
      .from('ebay_contacts')
      .select('ebay_username, feedback_percent')

    // Build feedback lookup
    const feedbackMap = {}
    for (const c of contacts || []) {
      if (c.feedback_percent !== null && c.feedback_percent !== undefined) {
        feedbackMap[c.ebay_username] = parseFloat(c.feedback_percent)
      }
    }

    // Aggregate stats
    const all = purchases || []
    const totalSpent = all.reduce((s, p) => s + parseFloat(p.total_cost || 0), 0)
    const totalSold = all.reduce((s, p) => s + parseFloat(p.sale_price || 0), 0)
    const soldCount = all.filter(p => p.sale_price).length

    // By status
    const byStatus = {}
    for (const p of all) {
      const st = (p.order_status || 'Unknown').toLowerCase()
      byStatus[st] = (byStatus[st] || 0) + 1
    }

    // By model
    const byModel = {}
    for (const p of all) {
      const m = p.model || 'Unknown'
      if (!byModel[m]) byModel[m] = { count: 0, total_spent: 0, total_sold: 0 }
      byModel[m].count++
      byModel[m].total_spent += parseFloat(p.total_cost || 0)
      byModel[m].total_sold += parseFloat(p.sale_price || 0)
    }

    // By seller feedback tier
    // zero: 0% or no feedback, low: <95%, mid: 95-98%, high: >98%
    const tiers = {
      zero: { count: 0, cancelled: 0, total_spent: 0, total_sold: 0, profits: [] },
      low: { count: 0, cancelled: 0, total_spent: 0, total_sold: 0, profits: [] },
      mid: { count: 0, cancelled: 0, total_spent: 0, total_sold: 0, profits: [] },
      high: { count: 0, cancelled: 0, total_spent: 0, total_sold: 0, profits: [] },
      unknown: { count: 0, cancelled: 0, total_spent: 0, total_sold: 0, profits: [] }
    }

    for (const p of all) {
      const fb = feedbackMap[p.seller_username]
      let tier = 'unknown'
      if (fb !== undefined) {
        if (fb === 0) tier = 'zero'
        else if (fb < 95) tier = 'low'
        else if (fb <= 98) tier = 'mid'
        else tier = 'high'
      }

      tiers[tier].count++
      tiers[tier].total_spent += parseFloat(p.total_cost || 0)
      tiers[tier].total_sold += parseFloat(p.sale_price || 0)
      if (/cancel/i.test(p.order_status)) tiers[tier].cancelled++
      if (p.sale_price) {
        tiers[tier].profits.push(parseFloat(p.sale_price) - parseFloat(p.total_cost || 0))
      }
    }

    // Compute averages for tiers
    const bySellerFeedbackTier = {}
    for (const [name, tier] of Object.entries(tiers)) {
      if (tier.count === 0) continue
      bySellerFeedbackTier[name] = {
        count: tier.count,
        cancelled_rate: Math.round((tier.cancelled / tier.count) * 100) / 100,
        avg_profit: tier.profits.length > 0
          ? Math.round(tier.profits.reduce((a, b) => a + b, 0) / tier.profits.length * 100) / 100
          : null,
        total_spent: Math.round(tier.total_spent * 100) / 100,
        total_sold: Math.round(tier.total_sold * 100) / 100
      }
    }

    return NextResponse.json({
      total_purchases: all.length,
      total_spent: Math.round(totalSpent * 100) / 100,
      total_sold: Math.round(totalSold * 100) / 100,
      total_profit: Math.round((totalSold - totalSpent) * 100) / 100,
      sold_count: soldCount,
      by_status: byStatus,
      by_model: byModel,
      by_seller_feedback_tier: bySellerFeedbackTier
    })
  } catch (err) {
    console.error('Bridge purchases stats error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
