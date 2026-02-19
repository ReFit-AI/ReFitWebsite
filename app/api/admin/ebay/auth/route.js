import { NextResponse } from 'next/server'
import { sanitizeError } from '@/lib/validation'
import { getAuthUrl } from '@/lib/ebay-client'

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

    const authUrl = getAuthUrl()

    return NextResponse.json({ success: true, authUrl })
  } catch (error) {
    console.error('Error generating eBay auth URL:', error)
    return NextResponse.json(
      { success: false, error: sanitizeError(error, 'Failed to generate eBay auth URL') },
      { status: 500 }
    )
  }
}
