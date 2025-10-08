'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  Menu,
  X,
  Coins,
  Package,
  Info,
  Target,
  // ShoppingCart, // Archived until inventory ready
  User,
  Sparkles,
  ClipboardList,
  Activity,
  LayoutDashboard
} from 'lucide-react'
import { initializeServices, cleanupServices } from '@/services'
import { WalletButton } from './WalletButton'

const Layout = ({ children }) => {
  const pathname = usePathname()
  const { publicKey, connected } = useWallet()
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Initialize services when wallet connects
  React.useEffect(() => {
    if (connected && publicKey) {
      initializeServices(publicKey.toBase58())
    } else {
      cleanupServices()
    }
  }, [connected, publicKey])

  // Primary actions - what users come to do
  const primaryNav = [
    {
      path: '/sell',
      label: 'Trade',
      icon: Package,
      description: 'Sell your device'
    },
    {
      path: '/stake',
      label: 'Stake',
      icon: Coins,
      description: 'Earn 2% weekly',
      highlight: true // New feature highlight
    },
  ]

  // Secondary - important but not primary flow
  const secondaryNav = [
    {
      path: '/stats',
      label: 'Stats',
      icon: Activity,
      description: 'Live pool stats'
    },
    // { path: '/shop', label: 'Shop', icon: ShoppingCart }, // Archived until inventory ready
  ]

  // Tertiary - profile/info pages (only show dashboard if connected)
  const moreNav = [
    ...(connected ? [{ path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] : []),
    { path: '/tokenomics', label: 'Tokenomics', icon: Coins },
    { path: '/orders', label: 'My Orders', icon: ClipboardList },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/roadmap', label: 'Roadmap', icon: Target },
    { path: '/about', label: 'About ReFit', icon: Info },
  ]

  return (
    <div className="min-h-screen bg-black text-white font-sf-pro">
      {/* Header - Premium but Organized */}
      <header className="fixed top-0 w-full z-50 glass-premium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                {/* ReFit Logo SVG */}
                <svg
                  width="40"
                  height="40"
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
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-green-600 rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
              </div>
              <span className="text-xl font-bold tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-green-600 transition-all duration-300">
                ReFit
              </span>
            </Link>

            {/* Desktop Navigation - Organized and Intuitive */}
            <nav className="hidden md:flex items-center">
              {/* Primary Actions - Prominent */}
              <div className="flex items-center space-x-2 mr-6">
                {primaryNav.map((item) => {
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
                        transition-all duration-200 relative
                        ${isActive 
                          ? 'bg-gradient-to-r from-purple-600/20 to-green-600/20 shadow-lg' 
                          : 'hover:bg-white/5'}
                      `}>
                        <Icon size={18} className={isActive ? 'text-purple-400' : 'text-gray-400'} />
                        <span className={`font-semibold ${isActive ? 'text-white' : 'text-gray-300'}`}>
                          {item.label}
                        </span>
                        {item.highlight && (
                          <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-purple-600 to-pink-600 text-xs rounded-full font-bold">
                            NEW
                          </span>
                        )}
                      </div>
                      {isActive && (
                        <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-green-600" />
                      )}
                    </Link>
                  )
                })}
              </div>

              {/* Secondary Actions */}
              {secondaryNav.length > 0 && (
                <>
                  {/* Divider */}
                  <div className="h-6 w-px bg-gray-800 mr-6" />
                  <div className="flex items-center space-x-1 mr-6">
                    {secondaryNav.map((item) => {
                      const isActive = pathname === item.path
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.path}
                          href={item.path}
                          className={`
                            flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm
                            transition-all duration-200
                            ${isActive
                              ? 'text-white bg-white/10'
                              : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}
                          `}
                        >
                          <Icon size={16} />
                          <span>{item.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                </>
              )}
                
              {/* More Menu */}
              <div className="relative mr-6">
                  <button
                    onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all duration-200"
                  >
                    <span>More</span>
                    <ChevronDown size={14} className={`transform transition-transform ${moreMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {moreMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full right-0 mt-2 w-48 rounded-lg bg-gray-900/95 backdrop-blur-xl border border-gray-800 shadow-xl overflow-hidden"
                      >
                        {moreNav.map((item) => {
                          const Icon = item.icon
                          const isActive = pathname === item.path
                          return (
                            <Link
                              key={item.path}
                              href={item.path}
                              onClick={() => setMoreMenuOpen(false)}
                              className={`
                                flex items-center space-x-3 px-4 py-3
                                transition-all duration-200
                                ${isActive 
                                  ? 'bg-white/10 text-white' 
                                  : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                              `}
                            >
                              <Icon size={16} />
                              <span className="text-sm">{item.label}</span>
                            </Link>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              {/* CTA Button */}
              {!connected && (
                <Link
                  href="/sell"
                  className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-purple-600 to-green-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-600/30 transition-all duration-200"
                >
                  <Sparkles size={16} />
                  <span>Get Started</span>
                </Link>
              )}
            </nav>

            {/* Right Side - Wallet and Mobile Menu */}
            <div className="flex items-center space-x-4">
              {/* Wallet Button */}
              <WalletButton />
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>


      </header>

      {/* Mobile Menu Overlay & Panel (rendered outside header to avoid iOS stacking context issues) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 top-16 bg-black/50 backdrop-blur-sm z-[60] md:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed top-16 left-0 right-0 bottom-0 w-screen bg-gray-900/98 backdrop-blur-xl md:hidden overflow-y-auto z-[70] shadow-2xl"
            >
              <div className="p-6 space-y-6">
                {/* Primary Actions */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Main</h3>
                  <div className="space-y-2">
                    {primaryNav.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.path
                      return (
                        <Link
                          key={item.path}
                          href={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`
                            flex items-center space-x-3 px-4 py-3 rounded-lg
                            transition-all duration-200
                            ${isActive
                              ? 'bg-gradient-to-r from-purple-600/20 to-green-600/20 text-white'
                              : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                          `}
                        >
                          <Icon size={20} />
                          <div>
                            <div className="font-semibold">{item.label}</div>
                            <div className="text-xs text-gray-500">{item.description}</div>
                          </div>
                          {item.highlight && (
                            <span className="ml-auto px-2 py-0.5 bg-gradient-to-r from-purple-600 to-pink-600 text-xs rounded-full font-bold">
                              NEW
                            </span>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </div>

                {/* Secondary Actions */}
                {secondaryNav.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Pool Info</h3>
                    <div className="space-y-2">
                      {secondaryNav.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.path
                        return (
                          <Link
                            key={item.path}
                            href={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`
                              flex items-center space-x-3 px-4 py-3 rounded-lg
                              transition-all duration-200
                              ${isActive
                                ? 'bg-white/10 text-white'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                            `}
                          >
                            <Icon size={20} />
                            <div>
                              <div className="font-semibold">{item.label}</div>
                              <div className="text-xs text-gray-500">{item.description}</div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* More Items */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Account</h3>
                  <div className="space-y-2">
                    {moreNav.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.path
                      return (
                        <Link
                          key={item.path}
                          href={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`
                            flex items-center space-x-3 px-4 py-3 rounded-lg
                            transition-all duration-200
                            ${isActive
                              ? 'bg-white/10 text-white'
                              : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                          `}
                        >
                          <Icon size={20} />
                          <span>{item.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>

                {/* CTA Button for Mobile */}
                {!connected && (
                  <Link
                    href="/sell"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center space-x-2 w-full px-5 py-3 bg-gradient-to-r from-purple-600 to-green-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-600/30 transition-all duration-200"
                  >
                    <Sparkles size={16} />
                    <span>Get Started</span>
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
                    Trade Your Device
                  </Link>
                </li>
                <li>
                  <Link href="/stake" className="text-gray-400 hover:text-white transition-colors">
                    Stake & Earn
                  </Link>
                </li>
                {/* Shop link archived until inventory ready
                <li>
                  <Link href="/shop" className="text-gray-400 hover:text-white transition-colors">
                    Shop Phones
                  </Link>
                </li>
                */}
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
        
        .glass-premium {
          backdrop-filter: blur(20px);
          background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.8) 0%,
            rgba(0, 0, 0, 0.4) 100%
          );
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
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

/* 
Improvements Made (Jobs-inspired but keeping your style):

1. HIERARCHY
   - Primary actions (Trade/Stake) are prominent with icons
   - Secondary actions (Shop/Roadmap) are subdued
   - Tertiary items hidden in "More" dropdown

2. VISUAL CLARITY
   - Keep your gradients (they do look premium!)
   - Better spacing and grouping
   - Clear active states
   - "NEW" badge for staking

3. REDUCED COGNITIVE LOAD
   - 4 visible items instead of 8
   - Logical grouping with divider
   - Progressive disclosure with "More"

4. MOBILE EXPERIENCE
   - Sliding panel with sections
   - Descriptions for primary actions
   - Touch-friendly spacing

5. CALL TO ACTION
   - Clear "Get Started" button
   - Sparkles icon adds delight
   - Gradient matches brand

This keeps your premium aesthetic while making it much easier to scan and use!
*/