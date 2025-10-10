'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Settings, Database, Package, Check, AlertCircle } from 'lucide-react'

const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET

export default function SetupPage() {
  const { publicKey, connected } = useWallet()
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function runSetup() {
    if (!connected || !publicKey) {
      setError('Please connect your wallet first')
      return
    }

    if (publicKey.toString() !== ADMIN_WALLET) {
      setError('Only admin wallet can run setup')
      return
    }

    setLoading(true)
    setError('')
    setStatus('Importing inventory data...')

    try {
      const response = await fetch('/api/admin/setup-inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toString()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Setup failed')
      }

      setStatus('')
      setSuccess(true)
      console.log('Setup complete:', data)
    } catch (err) {
      setStatus('')
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <Settings className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Database Setup</h1>
          <p className="text-gray-400">
            Import inventory data into the system
          </p>
        </div>

        {/* Status */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-medium text-red-400">Error</div>
              <div className="text-sm text-red-300 mt-1">{error}</div>

              {error.includes('table') && (
                <div className="mt-4 p-3 bg-black/50 rounded text-xs text-gray-400">
                  <div className="font-medium text-white mb-2">Manual Setup Required:</div>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Go to <a href="https://supabase.com/dashboard" target="_blank" className="text-blue-400 hover:underline">Supabase Dashboard</a></li>
                    <li>Click &quot;SQL Editor&quot; in the left sidebar</li>
                    <li>Copy SQL from: <code className="text-green-400">supabase/migrations/20250108_inventory_system.sql</code></li>
                    <li>Paste and run it in the SQL editor</li>
                    <li>Come back here and click &quot;Import Data&quot; again</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-green-400">Setup Complete!</div>
              <div className="text-sm text-green-300 mt-1">
                Inventory data imported successfully
              </div>
              <div className="mt-4 flex gap-3">
                <a
                  href="/inventory"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
                >
                  View Inventory
                </a>
                <a
                  href="/admin/inventory"
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                >
                  Manage Inventory
                </a>
              </div>
            </div>
          </div>
        )}

        {status && (
          <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4 mb-6 flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400" />
            <div className="text-blue-400">{status}</div>
          </div>
        )}

        {/* Setup Button */}
        {!success && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-start gap-4 mb-6">
              <Database className="w-8 h-8 text-purple-400" />
              <div>
                <h2 className="text-lg font-bold mb-2">Import Inventory Data</h2>
                <p className="text-sm text-gray-400">
                  This will import 29 phone records from your CSV into the database.
                  Total invested: $10,060 | Total revenue: $11,625 | Profit: $1,564 (15.5%)
                </p>
              </div>
            </div>

            <button
              onClick={runSetup}
              disabled={loading || !connected}
              className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Importing...
                </>
              ) : connected ? (
                <>
                  <Package className="w-5 h-5" />
                  Import Data
                </>
              ) : (
                'Connect Wallet First'
              )}
            </button>
          </div>
        )}

        {/* Info */}
        <div className="mt-6 p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
          <div className="text-sm text-gray-400">
            <div className="font-medium text-white mb-2">What this does:</div>
            <ul className="list-disc list-inside space-y-1">
              <li>Creates inventory tracking tables in Supabase</li>
              <li>Imports 29 phone records from your CSV</li>
              <li>Sets up invoice system for sales</li>
              <li>Enables public transparency on /inventory page</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
