'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { motion } from 'framer-motion'
import { Home, Package, Info, User, Target } from 'lucide-react'
import { initializeServices, cleanupServices } from '@/services'
import { WalletButton } from './WalletButton'

const Layout = ({ children }) => {
  const pathname = usePathname()
  const { publicKey, connected } = useWallet()

  // Initialize services when wallet connects
  React.useEffect(() => {
    if (connected && publicKey) {
      initializeServices(publicKey.toBase58())
    } else {
      cleanupServices()
    }
  }, [connected, publicKey])

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/sell', label: 'Sell', icon: Package },
    { path: '/orders', label: 'Orders', icon: Package },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/about', label: 'About', icon: Info },
  ]

  return (
    <div className="min-h-screen bg-black text-white font-sf-pro">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                {/* Custom ReFit Logo SVG - Choose between minimal or screw version */}
                {/* Version 1: Minimal (Current but bigger) */}
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 48 48"
                  className="transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-180"
                >
                  {/* Gradient definitions */}
                  <defs>
                    <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#9945FF" />
                      <stop offset="50%" stopColor="#14F195" />
                      <stop offset="100%" stopColor="#9945FF" />
                    </linearGradient>
                    <linearGradient id="logo-gradient-hover" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#14F195">
                        <animate attributeName="stop-color" values="#14F195;#00D9FF;#9945FF;#14F195" dur="3s" repeatCount="indefinite" />
                      </stop>
                      <stop offset="100%" stopColor="#9945FF">
                        <animate attributeName="stop-color" values="#9945FF;#14F195;#00D9FF;#9945FF" dur="3s" repeatCount="indefinite" />
                      </stop>
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Simple Flathead Screw Design */}
                  <g filter="url(#glow)">
                    {/* Outer circle (screw head) */}
                    <circle
                      cx="24"
                      cy="24"
                      r="18"
                      fill="none"
                      stroke="url(#logo-gradient)"
                      strokeWidth="3"
                      className="group-hover:stroke-[url(#logo-gradient-hover)]"
                    />
                    
                    {/* Inner circle (subtle depth) */}
                    <circle
                      cx="24"
                      cy="24"
                      r="14"
                      fill="none"
                      stroke="url(#logo-gradient)"
                      strokeWidth="1"
                      opacity="0.5"
                      className="group-hover:stroke-[url(#logo-gradient-hover)]"
                    />
                    
                    {/* Diagonal screw slot (bottom-left to top-right) */}
                    <line
                      x1="14"
                      y1="34"
                      x2="34"
                      y2="14"
                      stroke="url(#logo-gradient)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      className="group-hover:stroke-[url(#logo-gradient-hover)]"
                    />
                  </g>
                </svg>
                
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-solana-purple to-cyan-500 rounded-full blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
              </div>
              <span className="text-2xl font-bold tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-secondary transition-all duration-300">
                ReFit
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => {
                const isActive = pathname === item.path
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className="relative group"
                  >
                    <div className={`
                      flex items-center space-x-2 px-4 py-2 rounded-lg
                      text-base font-semibold transition-all duration-300
                      ${isActive 
                        ? 'text-white bg-gradient-to-r from-solana-purple/30 to-solana-green/30 shadow-lg shadow-solana-purple/20' 
                        : 'text-gray-400 hover:text-white'}
                    `}>
                      <Icon size={18} />
                      <span className="relative">
                        {item.label}
                        <span className={`
                          absolute -bottom-1 left-0 w-full h-0.5 
                          bg-gradient-to-r from-solana-purple via-solana-green to-solana-purple
                          transform origin-left transition-transform duration-300
                          ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}
                        `} />
                      </span>
                    </div>
                    <div className={`
                      absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100
                      transition-all duration-300 pointer-events-none
                      ${!isActive && 'group-hover:animate-pulse'}
                    `}>
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-solana-purple via-cyan-500 to-solana-green p-[1px]">
                        <div className="w-full h-full rounded-lg bg-black/80" />
                      </div>
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-solana-purple/20 via-cyan-500/20 to-solana-green/20 blur-xl" />
                    </div>
                  </Link>
                )
              })}
            </nav>

            {/* Wallet */}
            <div className="flex items-center space-x-4">
              <WalletButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="glass mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">About ReFit</h3>
              <p className="text-gray-400">
                The first orderbook DEX for physical goods. Trade your electronics for SOL instantly.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/sell" className="text-gray-400 hover:text-white transition-colors">
                    Sell Your Phone
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                    How It Works
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect</h3>
              <p className="text-gray-400">
                Built on Solana • Powered by OpenBook
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-gray-400">
            <p>&copy; 2024 ReFit. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Style tag with gradient definitions */}
      <style jsx>{`
        .glass {
          backdrop-filter: blur(10px);
          background: rgba(0, 0, 0, 0.5);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .font-sf-pro {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Icons', 
                       'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
        }
      `}</style>
    </div>
  )
}

export default Layout
