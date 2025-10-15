'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Shield, Copy, CheckCircle, AlertCircle } from 'lucide-react'

export default function QuickBooksCallback() {
  const searchParams = useSearchParams()
  const [callbackUrl, setCallbackUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [hasParams, setHasParams] = useState(false)

  useEffect(() => {
    // Get the full URL including parameters
    if (typeof window !== 'undefined') {
      const fullUrl = window.location.href
      setCallbackUrl(fullUrl)

      // Check if we have the required parameters
      const code = searchParams.get('code')
      const realmId = searchParams.get('realmId')
      setHasParams(!!(code && realmId))
    }
  }, [searchParams])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(callbackUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const code = searchParams.get('code')
  const realmId = searchParams.get('realmId')
  const state = searchParams.get('state')

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Shield className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">QuickBooks Authorization</h1>
              <p className="text-gray-400 text-sm">OAuth Callback Handler</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {hasParams ? (
          <>
            {/* Success State */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                <div className="flex-1">
                  <h2 className="text-green-400 font-semibold mb-1">Authorization Successful</h2>
                  <p className="text-gray-300 text-sm">
                    QuickBooks has authorized the connection. Copy the URL below to complete setup.
                  </p>
                </div>
              </div>
            </div>

            {/* Parameters Display */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
              <h3 className="text-white font-semibold mb-4">Authorization Parameters</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider">Code</label>
                  <div className="mt-1 font-mono text-sm text-gray-300 bg-black/50 rounded px-3 py-2 break-all">
                    {code || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider">Realm ID</label>
                  <div className="mt-1 font-mono text-sm text-gray-300 bg-black/50 rounded px-3 py-2">
                    {realmId || 'Not provided'}
                  </div>
                </div>
                {state && (
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-wider">State</label>
                    <div className="mt-1 font-mono text-sm text-gray-300 bg-black/50 rounded px-3 py-2 break-all">
                      {state}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Callback URL Section */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="mb-4">
                <h3 className="text-white font-semibold mb-2">Setup Instructions</h3>
                <p className="text-gray-400 text-sm">
                  Copy the URL below and paste it into the QuickBooks MCP setup terminal to complete the connection.
                </p>
              </div>

              <label className="text-gray-400 text-xs uppercase tracking-wider">Callback URL</label>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={callbackUrl}
                  readOnly
                  className="flex-1 bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-300 font-mono focus:outline-none focus:border-green-500"
                  onClick={(e) => e.target.select()}
                />
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy URL
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                This URL contains your authorization code and will expire in 10 minutes.
              </div>
            </div>
          </>
        ) : (
          <>
            {/* No Parameters State */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div className="flex-1">
                  <h2 className="text-yellow-400 font-semibold mb-1">Waiting for Authorization</h2>
                  <p className="text-gray-300 text-sm">
                    No authorization parameters detected. This page is used to handle the OAuth callback from QuickBooks.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-3">How to use this page:</h3>
              <ol className="space-y-2 text-sm text-gray-400">
                <li>1. Initiate QuickBooks OAuth authorization from your application</li>
                <li>2. QuickBooks will redirect you back to this page with authorization parameters</li>
                <li>3. Copy the callback URL and paste it into your QuickBooks MCP setup</li>
              </ol>

              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-400">
                  <strong>Redirect URI:</strong> Set this as your redirect URI in QuickBooks:
                </p>
                <code className="block mt-2 text-xs text-gray-300 bg-black/50 rounded px-3 py-2 font-mono">
                  https://www.shoprefit.com/quickbooks-callback
                </code>
              </div>
            </div>
          </>
        )}

        {/* Footer Info */}
        <div className="mt-8 text-center text-xs text-gray-600">
          <p>This page securely handles QuickBooks OAuth callbacks for ReFit integrations.</p>
          <p className="mt-1">Your data is processed locally and not stored on our servers.</p>
        </div>
      </div>
    </div>
  )
}