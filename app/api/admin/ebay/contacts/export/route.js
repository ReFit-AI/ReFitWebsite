import { NextResponse } from 'next/server'
import { sanitizeError } from '@/lib/validation'
import { supabaseAdmin } from '@/lib/supabase-server'

const ADMIN_WALLET = process.env.ADMIN_WALLET

export async function POST(request) {
  try {
    const body = await request.json()
    const { walletAddress, filters = {} } = body

    if (walletAddress !== ADMIN_WALLET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    let query = supabaseAdmin
      .from('ebay_contacts')
      .select('*')
      .order('total_spent', { ascending: false })

    if (filters.mailing_list) {
      query = query.eq('mailing_list', true)
    }
    if (filters.relationship && filters.relationship !== 'all') {
      query = query.eq('relationship', filters.relationship)
    }
    if (filters.contact_type) {
      query = query.eq('contact_type', filters.contact_type)
    }

    const { data, error } = await query

    if (error) throw error

    // Build CSV
    const headers = [
      'eBay Username', 'Display Name', 'Email', 'Phone',
      'Address', 'City', 'State', 'Zip', 'Country',
      'Type', 'Relationship', 'Tags',
      'Total Purchases', 'Total Spent', 'Avg Deal Size',
      'Last Purchase', 'Mailing List', 'Notes'
    ]

    const rows = (data || []).map(c => [
      c.ebay_username,
      c.display_name || '',
      c.email || '',
      c.phone || '',
      [c.address_line1, c.address_line2].filter(Boolean).join(' '),
      c.city || '',
      c.state || '',
      c.zip || '',
      c.country || 'US',
      c.contact_type,
      c.relationship,
      (c.tags || []).join('; '),
      c.total_purchases,
      c.total_spent,
      c.avg_deal_size,
      c.last_purchase_at ? new Date(c.last_purchase_at).toLocaleDateString() : '',
      c.mailing_list ? 'Yes' : 'No',
      (c.notes || '').replace(/,/g, ';').replace(/\n/g, ' ')
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val}"`).join(','))
    ].join('\n')

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="ebay-contacts-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error('Error exporting eBay contacts:', error)
    return NextResponse.json(
      { success: false, error: sanitizeError(error, 'Failed to export contacts') },
      { status: 500 }
    )
  }
}
