import { NextResponse } from 'next/server';

export async function GET() {
  // Test server-side environment variables
  const serverEnvVars = {
    // Public vars (should be available on both client and server)
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET (hidden)' : 'NOT SET',
    NEXT_PUBLIC_ADMIN_WALLET: process.env.NEXT_PUBLIC_ADMIN_WALLET || 'NOT SET',
    NEXT_PUBLIC_SOLANA_NETWORK: process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'NOT SET',
    NEXT_PUBLIC_SQUADS_VAULT: process.env.NEXT_PUBLIC_SQUADS_VAULT || 'NOT SET',

    // Server-only vars
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET (hidden)' : 'NOT SET',

    // Node environment
    NODE_ENV: process.env.NODE_ENV || 'NOT SET',
    VERCEL_ENV: process.env.VERCEL_ENV || 'NOT SET',
    VERCEL_URL: process.env.VERCEL_URL || 'NOT SET',
  };

  // Test Supabase connection from server
  let supabaseTest = null;

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (url && serviceKey) {
      const response = await fetch(`${url}/rest/v1/`, {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`
        }
      });

      const data = await response.json();

      supabaseTest = {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        hasSwagger: data.swagger === '2.0',
        error: !response.ok ? data.message || 'API call failed' : null
      };
    } else {
      supabaseTest = {
        error: 'Missing server environment variables',
        hasUrl: !!url,
        hasServiceKey: !!serviceKey
      };
    }
  } catch (error) {
    supabaseTest = {
      error: error.message,
      type: 'server-exception'
    };
  }

  return NextResponse.json({
    serverEnvVars,
    supabaseTest,
    timestamp: new Date().toISOString()
  });
}