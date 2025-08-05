import { NextResponse } from 'next/server'
import UpgradeForeverService from '@/services/upgradeForever'

/**
 * POST /api/upgrade-fund
 * Create a new upgrade fund for a user
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { walletAddress, tradeData } = body

    if (!walletAddress || !tradeData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await UpgradeForeverService.createUpgradeFund(
      walletAddress,
      tradeData
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      fundId: result.fundId,
      calculations: result.calculations
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to create upgrade fund' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/upgrade-fund?wallet=...
 * Get user's upgrade funds
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet')

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      )
    }

    const funds = await UpgradeForeverService.getUserFunds(walletAddress)
    const stats = await UpgradeForeverService.getValidatorStats()
    const qualifiesForBonus = await UpgradeForeverService.qualifiesForBonus(walletAddress)

    return NextResponse.json({
      funds,
      stats,
      qualifiesForBonus
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch upgrade funds' },
      { status: 500 }
    )
  }
}