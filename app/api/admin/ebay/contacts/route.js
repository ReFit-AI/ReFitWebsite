import { NextResponse } from 'next/server'
import { sanitizeError } from '@/lib/validation'
import { supabaseAdmin } from '@/lib/supabase-server'

const ADMIN_WALLET = process.env.ADMIN_WALLET

// GET - Paginated contact list with filters
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
    const relationship = searchParams.get('relationship')
    const mailingList = searchParams.get('mailing_list')
    const search = searchParams.get('search')
    const contactType = searchParams.get('contact_type')

    let query = supabaseAdmin
      .from('ebay_contacts')
      .select('*', { count: 'exact' })
      .order('total_spent', { ascending: false })

    if (relationship && relationship !== 'all') {
      query = query.eq('relationship', relationship)
    }
    if (mailingList === 'true') {
      query = query.eq('mailing_list', true)
    }
    if (contactType) {
      query = query.eq('contact_type', contactType)
    }
    if (search) {
      query = query.or(`ebay_username.ilike.%${search}%,display_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const from = (page - 1) * perPage
    const to = from + perPage - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) throw error

    // Aggregate stats
    const { data: allContacts } = await supabaseAdmin
      .from('ebay_contacts')
      .select('mailing_list, relationship')

    const stats = {
      totalContacts: allContacts?.length || 0,
      onMailingList: allContacts?.filter(c => c.mailing_list).length || 0,
      vipSellers: allContacts?.filter(c => c.relationship === 'vip').length || 0
    }

    return NextResponse.json({
      success: true,
      contacts: data || [],
      total: count || 0,
      page,
      perPage,
      stats
    })
  } catch (error) {
    console.error('Error fetching eBay contacts:', error)
    return NextResponse.json(
      { success: false, error: sanitizeError(error, 'Failed to fetch contacts') },
      { status: 500 }
    )
  }
}

// PATCH - Update contact details
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

    const allowedFields = [
      'display_name', 'email', 'phone',
      'address_line1', 'address_line2', 'city', 'state', 'zip', 'country',
      'tags', 'relationship', 'mailing_list', 'notes', 'contact_type'
    ]
    const sanitized = {}
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        sanitized[key] = updates[key]
      }
    }

    const { data, error } = await supabaseAdmin
      .from('ebay_contacts')
      .update(sanitized)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, contact: data })
  } catch (error) {
    console.error('Error updating eBay contact:', error)
    return NextResponse.json(
      { success: false, error: sanitizeError(error, 'Failed to update contact') },
      { status: 500 }
    )
  }
}
