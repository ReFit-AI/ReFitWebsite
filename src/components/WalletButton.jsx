import React from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { X, Wallet } from 'lucide-react'

export const WalletButton = () => {
  const { connected, publicKey, disconnect } = useWallet()

  const handleDisconnect = async () => {
    try {
      await disconnect()
    } catch (error) {
      console.error('Disconnect error:', error)
    }
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
