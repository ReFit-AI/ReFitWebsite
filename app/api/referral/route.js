import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Generate a unique referral code
function generateReferralCode(walletAddress) {
  const hash = walletAddress.slice(0, 6) + walletAddress.slice(-4)
  return `REF${hash}`.toUpperCase()
}

// POST /api/referral - Create or get referral code
export async function POST(request) {
  try {
    const { walletAddress } = await request.json()

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
    }

    // Check if user already has a referral code
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('referral_code, referral_stats')
      .eq('wallet_address', walletAddress)
      .single()

    if (existingUser?.referral_code) {
      return NextResponse.json({
        referralCode: existingUser.referral_code,
        stats: existingUser.referral_stats || { referrals: 0, earnings: 0 }
      })
    }

    // Generate new referral code
    const referralCode = generateReferralCode(walletAddress)

    // Update user with referral code
    const { error: updateError } = await supabase
      .from('users')
      .update({
        referral_code: referralCode,
        referral_stats: { referrals: 0, earnings: 0 }
      })
      .eq('wallet_address', walletAddress)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      referralCode,
      stats: { referrals: 0, earnings: 0 }
    })
  } catch (error) {
    console.error('Referral API error:', error)
    return NextResponse.json(
      { error: 'Failed to process referral' },
      { status: 500 }
    )
  }
}

// GET /api/referral?code=REFABC123 - Track referral click
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json({ error: 'Referral code required' }, { status: 400 })
    }

    // Find referrer
    const { data: referrer, error } = await supabase
      .from('users')
      .select('wallet_address')
      .eq('referral_code', code)
      .single()

    if (error || !referrer) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 })
    }

    // Set cookie to track referral
    const response = NextResponse.json({ success: true })
    response.cookies.set('referral_code', code, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    })

    return response
  } catch (error) {
    console.error('Referral tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track referral' },
      { status: 500 }
    )
  }
}