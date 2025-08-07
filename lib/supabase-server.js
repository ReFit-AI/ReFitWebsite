/**
 * Server-only Supabase client with service role key
 * DO NOT import this in client-side code
 */

import { createClient } from '@supabase/supabase-js'

// Only validate at runtime when actually used, not during build
const getSupabaseAdmin = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // In development, warn but don't crash
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Missing SUPABASE_SERVICE_ROLE_KEY - API routes will fail')
      // Return a dummy client that will fail when used
      return null
    }
    // In production, throw error
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    }
  )
}

// Lazy initialization - only create when first used
let _supabaseAdmin = null

export const supabaseAdmin = new Proxy({}, {
  get(target, prop) {
    if (!_supabaseAdmin) {
      _supabaseAdmin = getSupabaseAdmin()
      if (!_supabaseAdmin) {
        throw new Error('Supabase admin client not available - check environment variables')
      }
    }
    return _supabaseAdmin[prop]
  }
})

// Helper to create a client for a specific user (with their JWT)
export function createServerClient(supabaseAccessToken) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${supabaseAccessToken}`
        }
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    }
  )
}