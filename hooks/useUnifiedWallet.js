/**
 * Unified Wallet Hook
 *
 * Works with both:
 * - Privy embedded/external Solana wallets
 * - Legacy Solana Wallet Adapter wallets
 *
 * Provides consistent interface for wallet state across the app
 */

import { useEffect, useMemo } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useWallet as useLegacyWallet } from '@solana/wallet-adapter-react'
import { setSupabaseWalletContext, clearSupabaseWalletContext } from '@/lib/supabase'

export function useUnifiedWallet() {
  // Privy
  const { ready: authReady, authenticated: privyAuthenticated, user } = usePrivy()
  const { ready: walletsReady, wallets: privyWallets } = useWallets()

  // Legacy wallet adapter
  const { connected: legacyConnected, publicKey: legacyPublicKey } = useLegacyWallet()

  // Get Solana wallet from Privy (prefer embedded)
  const privySolanaWallet =
    privyWallets.find(w => w.chainType === 'solana' && w.walletClientType === 'privy') ||
    privyWallets.find(w => w.chainType === 'solana')

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

  const solanaAddress = privySolanaWallet?.address || linkedSolanaAccount?.address || null
  const hasPrivyWallet = Boolean(solanaAddress)

  // Privy readiness: either wallets hook is ready or we already know about a linked wallet
  const privyReady = authReady && (walletsReady || hasPrivyWallet)

  // Determine which wallet to use (Privy first, then legacy)
  const connectedPrivy = privyAuthenticated && privyReady && hasPrivyWallet
  const connected = connectedPrivy || legacyConnected
  const address = solanaAddress || legacyPublicKey?.toString() || null

  // Create publicKey-like object for backward compatibility (stable identity)
  const publicKey = useMemo(() => {
    return address ? ({
      toString: () => address,
      toBase58: () => address
    }) : null
  }, [address])

  useEffect(() => {
    if (address) {
      setSupabaseWalletContext(address)
    } else {
      clearSupabaseWalletContext()
    }
  }, [address])

  return {
    connected,
    publicKey,
    address,
    isPrivy: connectedPrivy,
    isLegacy: legacyConnected && !connectedPrivy,
    privyReady,
    hasPrivyWallet,
    authReady,
    walletsReady
  }
}
