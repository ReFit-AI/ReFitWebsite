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
        persistSession: true,
        autoRefreshToken: true,
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