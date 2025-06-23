'use client'

import { WalletProvider } from '@/contexts/WalletContext'
import { Toaster } from 'react-hot-toast'

export default function Providers({ children }) {
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
