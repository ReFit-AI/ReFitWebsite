import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'

const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET

export function useAdminAuth() {
  const router = useRouter()
  const { publicKey, connected, connecting } = useWallet()
  const [isAdmin, setIsAdmin] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const timeoutRef = useRef(null)
  const hasRedirected = useRef(false)

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // If connecting, keep loading
    if (connecting) {
      setAuthLoading(true)
      return
    }

    // Wallet is connected and correct
    if (connected && publicKey && publicKey.toString() === ADMIN_WALLET) {
      console.log('[AdminAuth] Admin access granted')
      setIsAdmin(true)
      setAuthLoading(false)
      hasRedirected.current = false
      return
    }

    // Wallet is connected but wrong wallet
    if (connected && publicKey && publicKey.toString() !== ADMIN_WALLET) {
      console.log('[AdminAuth] Wrong wallet, redirecting')
      if (!hasRedirected.current) {
        hasRedirected.current = true
        router.push('/stake')
      }
      setIsAdmin(false)
      setAuthLoading(false)
      return
    }

    // Not connected - give it time to auto-connect
    if (!connected && !publicKey) {
      console.log('[AdminAuth] No wallet yet, waiting 2s for auto-connect...')

      // Keep loading state while waiting
      setAuthLoading(true)

      // Set timeout to redirect if still not connected
      timeoutRef.current = setTimeout(() => {
        if (!connected && !publicKey && !hasRedirected.current) {
          console.log('[AdminAuth] No wallet after timeout, redirecting')
          hasRedirected.current = true
          router.push('/stake')
          setAuthLoading(false)
        }
      }, 2000)
    }

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [connected, connecting, publicKey, router])

  return {
    isAdmin,
    authLoading: authLoading || connecting,
    publicKey
  }
}