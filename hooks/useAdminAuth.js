import { useEffect, useState, useRef } from 'react'
import { useUnifiedWallet } from '@/hooks/useUnifiedWallet'

const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET

export function useAdminAuth() {
  const { publicKey, connected, authReady, privyReady } = useUnifiedWallet()
  const [isAdmin, setIsAdmin] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const timeoutRef = useRef(null)

  const connecting = authReady && !privyReady && !connected

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // Still connecting — stay in loading state
    if (connecting || !authReady) {
      setAuthLoading(true)
      return
    }

    // Wallet is connected — check if admin
    if (connected && publicKey) {
      const granted = publicKey.toString() === ADMIN_WALLET
      setIsAdmin(granted)
      setAuthLoading(false)
      return
    }

    // Not connected yet — give wallet time to auto-reconnect
    setAuthLoading(true)
    timeoutRef.current = setTimeout(() => {
      setIsAdmin(false)
      setAuthLoading(false)
    }, 3000)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [connected, connecting, publicKey, authReady])

  return {
    isAdmin,
    authLoading: authLoading || connecting,
    publicKey
  }
}
