import { Inter } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import Layout from '@/components/Layout'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ReFit - Trade Your Phone on Solana',
  description: 'Trade in your old phone for instant SOL payments. Buy Solana-native phones with extra credit.',
  icons: {
    icon: '/solana-logo.svg',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          <Layout>
            {children}
          </Layout>
        </Providers>
      </body>
    </html>
  )
}
