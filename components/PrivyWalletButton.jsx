'use client'

import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, Copy, Check } from 'lucide-react'

export default function PrivyWalletButton() {
  const { ready: authReady, authenticated, user, login, logout, createWallet } = usePrivy()
  const { ready: walletsReady, wallets } = useWallets()

  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  const [creating, setCreating] = useState(false)

  // Get Solana wallet (prefer embedded Privy wallet, filter by chainType)
  const solanaWallet =
    wallets.find(w => w.chainType === 'solana' && w.walletClientType === 'privy') ||
    wallets.find(w => w.chainType === 'solana')

  const linkedEmbeddedSolana = user?.linkedAccounts?.find(
    (account) =>
      account.type === 'wallet' &&
      account.chainType === 'solana' &&
      account.walletClientType === 'privy'
  )

  const linkedSolanaAccount = linkedEmbeddedSolana ||
    user?.linkedAccounts?.find(
      (account) => account.type === 'wallet' && account.chainType === 'solana'
    )

  const solanaAddress = solanaWallet?.address || linkedSolanaAccount?.address || null
  const hasSolanaWallet = Boolean(solanaAddress)

  // Create Solana wallet if authenticated but none exists
  const handleCreateSolana = async () => {
    setCreating(true)
    if (hasSolanaWallet) {
      console.info('ℹ️ Solana wallet already exists — skipping creation')
      setCreating(false)
      return
    }
    try {
      await createWallet()
      console.log('✅ Solana wallet created')
    } catch (error) {
      if (
        error instanceof Error &&
        error.message?.toLowerCase().includes('already has an embedded wallet')
      ) {
        console.info('ℹ️ Solana wallet already exists — refreshing state')
      } else {
        console.error('❌ Failed to create Solana wallet:', error)
      }
    } finally {
      setCreating(false)
    }
  }

  // Truncate address
  const short = (addr) => addr ? `${addr.slice(0, 4)}...${addr.slice(-4)}` : ''

  // Copy address
  const copyAddress = () => {
    if (!solanaAddress) return
    navigator.clipboard.writeText(solanaAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Loading - wait for BOTH Privy and wallets to be ready
  if (!authReady || !walletsReady) {
    return (
      <div className="h-10 w-32 bg-white/5 rounded-full animate-pulse" />
    )
  }

  // Authenticated but no Solana wallet - create one
  if (authenticated && !hasSolanaWallet) {
    return (
      <motion.button
        onClick={handleCreateSolana}
        disabled={creating}
        className="px-6 py-2.5 bg-white text-black rounded-full font-medium text-sm hover:bg-white/90 transition-colors disabled:opacity-50"
        whileTap={{ scale: 0.98 }}
      >
        {creating ? 'Creating...' : 'Create Wallet'}
      </motion.button>
    )
  }

  // Not signed in
  if (!authenticated) {
    return (
      <motion.button
        onClick={login}
        className="px-6 py-2.5 bg-white text-black rounded-full font-medium text-sm hover:bg-white/90 transition-colors"
        whileTap={{ scale: 0.98 }}
      >
        Sign In
      </motion.button>
    )
  }

  // Signed in
  const displayName = user?.email?.address || user?.google?.email || short(solanaAddress)

  return (
    <div className="relative">
      <motion.button
        onClick={() => setShowMenu(!showMenu)}
        className="px-5 py-2.5 bg-white/10 hover:bg-white/15 rounded-full font-mono text-sm text-white transition-colors border border-white/10"
        whileTap={{ scale: 0.98 }}
      >
        {short(solanaAddress)}
      </motion.button>

      <AnimatePresence>
        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-80 bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
            >
              {/* User Info */}
              <div className="p-6 border-b border-white/10">
                <div className="text-sm text-white/60 mb-1">Account</div>
                <div className="text-white font-medium">{displayName}</div>
              </div>

              {/* Wallet Address */}
              <div className="p-6 border-b border-white/10">
                <div className="text-sm text-white/60 mb-2">Wallet Address</div>
                <div className="flex items-center justify-between gap-3">
                  <code className="text-xs text-white/90 font-mono break-all">
                    {solanaAddress}
                  </code>
                  <button
                    onClick={copyAddress}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors shrink-0"
                    title="Copy address"
                  >
                    {copied ? (
                      <Check size={16} className="text-green-400" />
                    ) : (
                      <Copy size={16} className="text-white/60" />
                    )}
                  </button>
                </div>
              </div>

              {/* Sign Out */}
              <div className="p-3">
                <button
                  onClick={async () => {
                    await logout()
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-2.5 text-left text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2 text-sm"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
