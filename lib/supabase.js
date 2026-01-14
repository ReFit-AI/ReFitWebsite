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
          // Try localStorage as fallback (mobile apps can't use cookies)
          'X-Wallet-Address': typeof window !== 'undefined'
            ? localStorage.getItem('wallet_address') || ''
            : ''
        }
      }
    })
  : null

// Track last wallet set to avoid redundant calls
let lastWalletAddressSet = null
let isSettingWalletContext = false

// Helper to get wallet address from secure session or localStorage
export async function getWalletAddress() {
  if (typeof window === 'undefined') {
    // Server-side: can't access cookies here, use context
    return null;
  }

  // Try to get from secure cookie first (browser)
  try {
    const response = await fetch('/api/session/wallet', {
      credentials: 'include' // Include cookies
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.walletAddress) {
        return data.walletAddress;
      }
    }
  } catch (error) {
    // Cookie API unavailable - fall through to localStorage
  }

  // Fall back to localStorage (mobile apps)
  return localStorage.getItem('wallet_address');
}

// Helper to set the current wallet context for RLS
export async function setSupabaseWalletContext(walletAddress) {
  if (!supabase) return
  if (!walletAddress) return

  // If the wallet is already set, avoid redundant network calls
  if (supabase.rest?.headers?.['X-Wallet-Address'] === walletAddress && lastWalletAddressSet === walletAddress) {
    return
  }

  // SECURITY: Try to use secure HTTP-only cookies (browser only)
  if (typeof window !== 'undefined') {
    try {
      // Attempt to set secure cookie via API
      const response = await fetch('/api/session/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress })
      });

      if (response.ok) {
        console.log('✅ Wallet stored in secure cookie');
      } else {
        // Fall back to localStorage for mobile apps
        console.warn('⚠️ Cookie API unavailable, using localStorage fallback');
        localStorage.setItem('wallet_address', walletAddress);
      }
    } catch (error) {
      // API call failed - fall back to localStorage (mobile app)
      console.warn('⚠️ Cookie API failed, using localStorage fallback:', error.message);
      localStorage.setItem('wallet_address', walletAddress);
    }
  }

  // Set the PostgreSQL config for RLS policies
  try {
    if (!isSettingWalletContext) {
      isSettingWalletContext = true
      await supabase.rpc('set_wallet_context', { wallet_address: walletAddress });
      isSettingWalletContext = false
    }
    console.log('✅ Wallet context set for RLS');
  } catch (error) {
    console.warn('⚠️ Failed to set wallet context for RLS:', error.message);
  }

  // This would normally be done server-side, but for client-side we use headers
  supabase.rest.headers['X-Wallet-Address'] = walletAddress
  lastWalletAddressSet = walletAddress
}

// Helper to clear wallet context
export async function clearSupabaseWalletContext() {
  if (!supabase) return

  // SECURITY: Clear secure cookie via API
  if (typeof window !== 'undefined') {
    try {
      // Clear cookie via API
      await fetch('/api/session/wallet', {
        method: 'DELETE'
      });
      console.log('✅ Secure wallet session cleared');
    } catch (error) {
      console.warn('⚠️ Cookie clear failed:', error.message);
    }

    // Also clear localStorage (fallback for mobile)
    localStorage.removeItem('wallet_address');
  }

  if (supabase.rest?.headers?.['X-Wallet-Address']) {
    delete supabase.rest.headers['X-Wallet-Address']
  }
  lastWalletAddressSet = null
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