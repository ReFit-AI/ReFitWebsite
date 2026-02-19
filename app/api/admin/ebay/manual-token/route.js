import { NextResponse } from 'next/server'
import { storeManualToken } from '@/lib/ebay-client'

const ADMIN_WALLET = process.env.ADMIN_WALLET

export async function POST(request) {
  try {
    const body = await request.json()
    const { walletAddress, accessToken, refreshToken } = body

    if (!walletAddress || walletAddress !== ADMIN_WALLET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Access token is required' },
        { status: 400 }
      )
    }

    const account = await storeManualToken(accessToken, refreshToken)

    return NextResponse.json({
      success: true,
      data: {
        id: account.id,
        ebay_username: account.ebay_username,
        is_active: account.is_active,
        token_expires_at: account.token_expires_at,
      }
    })
  } catch (err) {
    console.error('Manual token storage error:', err)
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to store token' },
      { status: 500 }
    )
  }
}
