import { NextResponse } from 'next/server'
import { sanitizeError } from '@/lib/validation'
import { getConnectionStatus } from '@/lib/ebay-client'

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

    const status = await getConnectionStatus()

    return NextResponse.json({ success: true, ...status })
  } catch (error) {
    console.error('Error fetching eBay status:', error)
    return NextResponse.json(
      { success: false, error: sanitizeError(error, 'Failed to fetch eBay status') },
      { status: 500 }
    )
  }
}
