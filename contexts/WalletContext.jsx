'use client'

import React, { useMemo } from 'react'
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { 
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  CoinbaseWalletAdapter,
  TrustWalletAdapter,
  LedgerWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack'
import { clusterApiUrl } from '@solana/web3.js'

// Import wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css'

export const WalletProvider = ({ children }) => {
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet'
  const endpoint = useMemo(() => {
    const customRpc = process.env.NEXT_PUBLIC_SOLANA_RPC_HOST
    if (customRpc) {
      console.log('Using custom RPC:', customRpc)
      return customRpc
    }
    const url = clusterApiUrl(network)
    console.log('Using cluster RPC:', url)
    return url
  }, [network])

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BackpackWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new TrustWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    []
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider
        wallets={wallets}
        autoConnect={true}
        onError={(error) => {
          console.log('Wallet error occurred:', error.name, error.message);
          
          // Handle specific wallet errors gracefully
          if (error.name === 'WalletNotReadyError') {
            console.warn('Wallet not ready. Please ensure your wallet extension is installed and unlocked.');
            return;
          }
          
          if (error.name === 'WalletConnectionError') {
            console.warn('Failed to connect to wallet. Please try again.');
            return;
          }
          
          if (error.name === 'WalletNotConnectedError') {
            console.warn('Wallet not connected.');
            return;
          }
          
          if (error.name === 'WalletTimeoutError') {
            console.warn('Wallet connection timed out. Please try again.');
            return;
          }
          
          // Log all errors for debugging
          console.error('Wallet error:', error.name, error.message);
        }}
      >
        <WalletModalProvider>{children}</WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  )
}
