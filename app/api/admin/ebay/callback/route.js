import { NextResponse } from 'next/server'
import { exchangeCodeForTokens } from '@/lib/ebay-client'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      console.error('eBay OAuth error:', error)
      return NextResponse.redirect(new URL('/admin/ebay?error=oauth_denied', request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL('/admin/ebay?error=no_code', request.url))
    }

    await exchangeCodeForTokens(code)

    return NextResponse.redirect(new URL('/admin/ebay?connected=true', request.url))
  } catch (err) {
    console.error('eBay OAuth callback error:', err)
    return NextResponse.redirect(new URL('/admin/ebay?error=token_exchange_failed', request.url))
  }
}
