'use client'

import React, { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import dynamic from 'next/dynamic'
import { X, Wallet } from 'lucide-react'

// Dynamically import WalletMultiButton with no SSR
const WalletMultiButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
)

export const WalletButton = () => {
  const { connected, publicKey, disconnect, wallet, connecting } = useWallet()
  const [mounted, setMounted] = useState(false)

  // Only render after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Wallet state changed:', {
        connected,
        connecting,
        walletName: wallet?.adapter?.name,
        publicKey: publicKey?.toBase58()
      })
    }
  }, [connected, connecting, wallet, publicKey])

  const handleDisconnect = async () => {
    try {
      await disconnect()
      if (process.env.NODE_ENV === 'development') {
        console.log('Wallet disconnected successfully')
      }
    } catch (error) {
      console.error('Disconnect error:', error)
    }
  }

  // Return empty div with same dimensions to prevent layout shift
  if (!mounted) {
    return <div className="h-10 w-[140px]" />
  }

  if (!connected) {
    return <WalletMultiButton />
  }

  // When connected, show styled address with disconnect button
  const shortAddress = publicKey ?
    `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}` :
    ''

  return (
    <div className="flex items-center bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm border border-purple-500/30 rounded-lg px-3 py-2">
      <Wallet size={16} className="text-purple-400 mr-2" />
      <span className="text-sm font-mono text-white mr-3">{shortAddress}</span>
      <button
        onClick={handleDisconnect}
        className="p-1 hover:bg-red-500/20 rounded-full transition-all duration-200 group"
        title="Disconnect wallet"
      >
        <X size={14} className="text-gray-400 group-hover:text-red-400 transition-colors" />
      </button>
    </div>
  )
}
