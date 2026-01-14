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

export default function Providers({ children }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'your_privy_app_id_here'}
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
