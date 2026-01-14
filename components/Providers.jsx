'use client'

import { PrivyProvider } from '@privy-io/react-auth'
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana'
import { WalletProvider } from '@/contexts/WalletContext'
import { Toaster } from 'react-hot-toast'

// Create Solana wallet connectors for external wallets (Phantom, Backpack, Solflare, etc.)
const solanaConnectors = toSolanaWalletConnectors({
  // Disable auto-connect to prevent extension pop-ups on page load
  shouldAutoConnect: false,
})

// Get Privy App ID - must be set in environment variables
const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID

export default function Providers({ children }) {
  // If Privy App ID is not configured, render children without Privy
  // This allows builds to complete and shows a helpful error in dev
  if (!privyAppId) {
    if (typeof window !== 'undefined') {
      console.error('NEXT_PUBLIC_PRIVY_APP_ID is not set. Authentication will not work.')
    }
    return (
      <WalletProvider>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid #333',
            },
          }}
        />
      </WalletProvider>
    )
  }

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#9945FF',
          logo: '/solana-logo.svg',
          showWalletLoginFirst: false,
          walletChainType: 'solana-only',
        },
        loginMethods: ['email', 'google', 'wallet'],
        embeddedWallets: {
          solana: {
            createOnLogin: 'users-without-wallets', // Auto-create Solana wallets
          },
        },
        externalWallets: {
          solana: {
            connectors: solanaConnectors,
          },
        },
      }}
    >
      <WalletProvider>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid #333',
            },
          }}
        />
      </WalletProvider>
    </PrivyProvider>
  )
}
