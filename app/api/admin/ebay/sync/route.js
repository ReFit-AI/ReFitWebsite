import { NextResponse } from 'next/server'
import { sanitizeError } from '@/lib/validation'
import { syncPurchases } from '@/lib/ebay-client'

const ADMIN_WALLET = process.env.ADMIN_WALLET

export async function POST(request) {
  try {
    const body = await request.json()
    const { walletAddress, from, to } = body

    if (walletAddress !== ADMIN_WALLET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const result = await syncPurchases(null, { from, to })

    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error) {
    console.error('Error syncing eBay purchases:', error)
    return NextResponse.json(
      { success: false, error: sanitizeError(error, 'Sync failed') },
      { status: 500 }
    )
  }
}
