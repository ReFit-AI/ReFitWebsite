'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUnifiedWallet } from '@/hooks/useUnifiedWallet'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  Menu,
  X,
  Coins,
  Package,
  Info,
  Target,
  User,
  ClipboardList,
  Activity,
  LayoutDashboard,
} from 'lucide-react'
import { initializeServices, cleanupServices } from '@/services'
import PrivyWalletButton from './PrivyWalletButton'

const Layout = ({ children }) => {
  const pathname = usePathname()
  const { connected, address } = useUnifiedWallet()
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Initialize services when wallet connects
  React.useEffect(() => {
    if (connected && address) {
      initializeServices(address)
    } else {
      cleanupServices()
    }
  }, [connected, address])

  // Primary actions
  const primaryNav = [
    {
      path: '/sell',
      label: 'Trade In',
      icon: Package,
    },
    {
      path: '/stake',
      label: 'Stake',
      icon: Coins,
      badge: 'Soon'
    },
  ]

  // Secondary
  const secondaryNav = [
    {
      path: '/stats',
      label: 'Stats',
      icon: Activity,
    },
  ]

  // More menu items
  const moreNav = [
    ...(connected ? [{ path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] : []),
    { path: '/tokenomics', label: 'Tokenomics', icon: Coins },
    { path: '/orders', label: 'My Orders', icon: ClipboardList },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/roadmap', label: 'Roadmap', icon: Target },
    { path: '/about', label: 'About', icon: Info },
  ]

  return (
    <div className="min-h-screen bg-surface-primary text-label-primary">
      {/* Header - iOS style glass */}
      <header className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo - Clean and minimal */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <span className="text-black font-bold text-lg">R</span>
              </div>
              <span className="text-lg font-semibold tracking-tight">
                ReFit
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {/* Primary Nav */}
              {primaryNav.map((item) => {
                const isActive = pathname === item.path
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-ios
                      text-subhead font-medium
                      transition-all duration-200 ease-ios
                      ${isActive
                        ? 'bg-surface-elevated text-white'
                        : 'text-label-secondary hover:bg-surface-elevated hover:text-white'}
                    `}
                  >
                    <Icon size={18} strokeWidth={1.5} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-caption-2 bg-surface-tertiary rounded text-label-tertiary">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}

              {/* Divider */}
              <div className="w-px h-5 bg-surface-quaternary/50 mx-2" />

              {/* Secondary Nav */}
              {secondaryNav.map((item) => {
                const isActive = pathname === item.path
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-ios
                      text-subhead
                      transition-all duration-200 ease-ios
                      ${isActive
                        ? 'text-white'
                        : 'text-label-tertiary hover:text-label-secondary'}
                    `}
                  >
                    <Icon size={16} strokeWidth={1.5} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}

              {/* More Menu */}
              <div className="relative">
                <button
                  onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                  className="flex items-center gap-1 px-3 py-2 rounded-ios text-subhead text-label-tertiary hover:text-label-secondary transition-colors"
                >
                  <span>More</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${moreMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {moreMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute top-full right-0 mt-2 w-48 glass-thick rounded-ios-lg overflow-hidden shadow-2xl"
                    >
                      {moreNav.map((item, index) => {
                        const Icon = item.icon
                        const isActive = pathname === item.path
                        return (
                          <Link
                            key={item.path}
                            href={item.path}
                            onClick={() => setMoreMenuOpen(false)}
                            className={`
                              flex items-center gap-3 px-4 py-3
                              text-subhead transition-colors
                              ${index > 0 ? 'border-t border-surface-quaternary/20' : ''}
                              ${isActive
                                ? 'bg-surface-secondary text-white'
                                : 'text-label-secondary hover:bg-surface-secondary hover:text-white'}
                            `}
                          >
                            <Icon size={16} strokeWidth={1.5} />
                            <span>{item.label}</span>
                          </Link>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* CTA - only show when not connected */}
              {!connected && (
                <Link
                  href="/sell"
                  className="hidden sm:flex btn-primary text-sm px-4 py-2"
                >
                  Get Started
                </Link>
              )}

              {/* Wallet Button */}
              <PrivyWalletButton />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-label-secondary hover:text-white transition-colors rounded-ios hover:bg-surface-elevated"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 top-14 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-14 left-0 right-0 bg-surface-elevated md:hidden z-[70] border-b border-surface-quaternary/30"
            >
              <div className="p-4 space-y-1 max-h-[70vh] overflow-y-auto">
                {/* All nav items in iOS grouped list style */}
                <div className="card-group">
                  {[...primaryNav, ...secondaryNav, ...moreNav].map((item, index) => {
                    const Icon = item.icon
                    const isActive = pathname === item.path
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`
                          card-group-item
                          ${isActive ? 'bg-surface-secondary' : ''}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            size={20}
                            strokeWidth={1.5}
                            className={isActive ? 'text-accent-blue' : 'text-label-tertiary'}
                          />
                          <span className={isActive ? 'text-white font-medium' : 'text-label-primary'}>
                            {item.label}
                          </span>
                        </div>
                        {item.badge && (
                          <span className="text-caption-1 text-label-tertiary">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>

                {/* CTA */}
                {!connected && (
                  <Link
                    href="/sell"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-primary w-full mt-4"
                  >
                    Get Started
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-14">
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer - Minimal */}
      <footer className="mt-20 border-t border-surface-quaternary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="heading-3 mb-4">About ReFit</h3>
              <p className="text-secondary">
                Trade your electronics for SOL instantly. Built on Solana.
              </p>
            </div>
            <div>
              <h3 className="heading-3 mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/sell" className="text-label-secondary hover:text-white transition-colors">
                    Trade Your Device
                  </Link>
                </li>
                <li>
                  <Link href="/stake" className="text-label-secondary hover:text-white transition-colors">
                    Stake & Earn
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-label-secondary hover:text-white transition-colors">
                    How It Works
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="heading-3 mb-4">Connect</h3>
              <p className="text-secondary">
                Powered by Solana
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-surface-quaternary/30 text-center">
            <p className="text-label-tertiary text-footnote">&copy; 2024 ReFit. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
