import { createClient } from '@supabase/supabase-js'

// These should be in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not set. Using localStorage fallback.')
}

// Create a single supabase client for interacting with your database
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // Disable session for liquidity pool
        autoRefreshToken: false,
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          // This will be set dynamically when we have a wallet address
          'X-Wallet-Address': typeof window !== 'undefined'
            ? localStorage.getItem('wallet_address') || ''
            : ''
        }
      }
    })
  : null

// Helper to set the current wallet context for RLS
export function setSupabaseWalletContext(walletAddress) {
  if (!supabase) return
  
  // Store in localStorage for persistence
  if (typeof window !== 'undefined') {
    localStorage.setItem('wallet_address', walletAddress)
  }
  
  // This would normally be done server-side, but for client-side we use headers
  supabase.rest.headers['X-Wallet-Address'] = walletAddress
}

// Helper to clear wallet context
export function clearSupabaseWalletContext() {
  if (!supabase) return

  if (typeof window !== 'undefined') {
    localStorage.removeItem('wallet_address')
  }

  delete supabase.rest.headers['X-Wallet-Address']
}

// Link wallet to user (for liquidity pool - simple version)
export async function linkWalletToUser(walletAddress) {
  if (!supabase) {
    return {
      user: null,
      isNew: false,
      error: 'Supabase not configured'
    }
  }

  try {
    // For the liquidity pool, we just track by wallet address
    // No need for separate user accounts - wallet IS the identity
    setSupabaseWalletContext(walletAddress)

    return {
      user: {
        id: walletAddress,
        wallet_address: walletAddress
      },
      isNew: false, // We'll determine this when they make their first deposit
      success: true
    }
  } catch (error) {
    console.error('Error linking wallet:', error)
    return {
      user: null,
      isNew: false,
      error: error.message
    }
  }
}