'use client'

import { useEffect, useState } from 'react'

export default function TestEnvPage() {
  const [envVars, setEnvVars] = useState({})
  const [supabaseTest, setSupabaseTest] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check which env vars are available in the browser
    const vars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET (hidden)' : 'NOT SET',
      NEXT_PUBLIC_ADMIN_WALLET: process.env.NEXT_PUBLIC_ADMIN_WALLET || 'NOT SET',
      NEXT_PUBLIC_SOLANA_NETWORK: process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'NOT SET',
      NEXT_PUBLIC_SQUADS_VAULT: process.env.NEXT_PUBLIC_SQUADS_VAULT || 'NOT SET',
    }
    setEnvVars(vars)

    // Test Supabase connection
    testSupabase()
  }, [])

  async function testSupabase() {
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!url || !key) {
        setSupabaseTest({
          error: 'Missing environment variables',
          url: url || 'NOT SET',
          hasKey: !!key
        })
        setLoading(false)
        return
      }

      // Test direct API call
      const response = await fetch(`${url}/rest/v1/`, {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      })

      const data = await response.json()

      setSupabaseTest({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        hasSwagger: data.swagger === '2.0',
        tables: data.paths ? Object.keys(data.paths).filter(p => p !== '/').map(p => p.replace('/', '')) : [],
        error: !response.ok ? data.message || 'API call failed' : null
      })
    } catch (error) {
      setSupabaseTest({
        error: error.message,
        type: 'exception'
      })
    } finally {
      setLoading(false)
    }
  }

  // Also test via our lib/supabase
  async function testSupabaseLib() {
    try {
      const { supabase } = await import('@/lib/supabase')

      if (!supabase) {
        return { error: 'Supabase client not initialized' }
      }

      const { data, error } = await supabase
        .from('inventory')
        .select('count')
        .limit(1)

      return {
        success: !error,
        error: error?.message,
        hasData: !!data
      }
    } catch (error) {
      return { error: error.message, type: 'lib-exception' }
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Environment Variables Test</h1>

        {/* Environment Variables */}
        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-green-400">Browser Environment Variables</h2>
          <div className="space-y-2 font-mono text-sm">
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="flex">
                <span className="text-gray-400 w-80">{key}:</span>
                <span className={value === 'NOT SET' ? 'text-red-400' : 'text-green-400'}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Supabase Test */}
        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">Supabase Connection Test</h2>
          {loading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
          ) : (
            <div className="space-y-2 font-mono text-sm">
              {supabaseTest && (
                <>
                  <div className="flex">
                    <span className="text-gray-400 w-40">Status:</span>
                    <span className={supabaseTest.success ? 'text-green-400' : 'text-red-400'}>
                      {supabaseTest.success ? 'Connected' : 'Failed'}
                    </span>
                  </div>
                  {supabaseTest.status && (
                    <div className="flex">
                      <span className="text-gray-400 w-40">HTTP Status:</span>
                      <span className={supabaseTest.status === 200 ? 'text-green-400' : 'text-red-400'}>
                        {supabaseTest.status} {supabaseTest.statusText}
                      </span>
                    </div>
                  )}
                  {supabaseTest.error && (
                    <div className="flex">
                      <span className="text-gray-400 w-40">Error:</span>
                      <span className="text-red-400">{supabaseTest.error}</span>
                    </div>
                  )}
                  {supabaseTest.hasSwagger && (
                    <div className="flex">
                      <span className="text-gray-400 w-40">API Valid:</span>
                      <span className="text-green-400">Yes (Swagger 2.0)</span>
                    </div>
                  )}
                  {supabaseTest.tables && supabaseTest.tables.length > 0 && (
                    <div className="flex">
                      <span className="text-gray-400 w-40">Tables Found:</span>
                      <span className="text-green-400">{supabaseTest.tables.length}</span>
                    </div>
                  )}
                  {supabaseTest.tables && supabaseTest.tables.length > 0 && (
                    <div className="flex">
                      <span className="text-gray-400 w-40">Table Names:</span>
                      <span className="text-gray-300 text-xs">
                        {supabaseTest.tables.slice(0, 5).join(', ')}
                        {supabaseTest.tables.length > 5 && '...'}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Test Buttons */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-400">Manual Tests</h2>
          <div className="space-x-4">
            <button
              onClick={async () => {
                const result = await testSupabaseLib()
                alert(JSON.stringify(result, null, 2))
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              Test Supabase Library
            </button>
            <button
              onClick={() => {
                console.log('Full process.env:', process.env)
                alert('Check browser console for full process.env')
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
            >
              Log All Env Vars
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-sm font-semibold mb-2 text-gray-300">Debug Instructions:</h3>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>1. Deploy this test page to Vercel</li>
            <li>2. Visit /test-env on your deployed site</li>
            <li>3. Screenshot the results</li>
            <li>4. If env vars show "NOT SET", they need to be added in Vercel dashboard</li>
            <li>5. If connection fails with 401, the API key format is wrong</li>
          </ul>
        </div>
      </div>
    </div>
  )
}