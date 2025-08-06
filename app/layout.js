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
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: '#000000',
  manifest: '/manifest.json',
  openGraph: {
    title: 'ReFit - Trade Your Phone on Solana',
    description: 'Trade in your old phone for instant SOL payments.',
    url: 'https://www.shoprefit.com',
    siteName: 'ReFit',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ReFit - Trade Your Phone on Solana',
    description: 'Trade in your old phone for instant SOL payments.',
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
