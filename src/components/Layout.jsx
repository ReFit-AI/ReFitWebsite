import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useWallet } from '@solana/wallet-adapter-react'
import { motion } from 'framer-motion'
import { Home, Package, Info, ShoppingCart, User } from 'lucide-react'
import { initializeServices, cleanupServices } from '../services'
import { WalletButton } from './WalletButton'

const Layout = ({ children }) => {
  const location = useLocation()
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
    { path: '/shop', label: 'Shop', icon: ShoppingCart },
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
            <Link to="/" className="flex items-center space-x-3 group">
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
              <span className="font-bold text-2xl tracking-tight relative">
                ReFit
                <span className="absolute -inset-1 bg-gradient-to-r from-solana-purple/0 via-solana-purple/50 to-solana-purple/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="relative group"
                  >
                    <div className={`
                      flex items-center space-x-2 px-4 py-2 rounded-lg
                      text-base font-semibold transition-all duration-300
                      ${isActive 
                        ? 'text-white bg-gradient-to-r from-solana-purple/30 to-solana-green/30 shadow-lg shadow-solana-purple/20' 
                        : 'text-gray-400 hover:text-white'
                      }
                    `}>
                      <Icon size={18} />
                      <span className="relative">
                        {item.label}
                        {/* Cyberpunk underline effect */}
                        <span className={`
                          absolute -bottom-1 left-0 w-full h-0.5 
                          bg-gradient-to-r from-solana-purple via-solana-green to-solana-purple
                          transform origin-left transition-transform duration-300
                          ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}
                        `} />
                      </span>
                    </div>
                    
                    {/* Cyberpunk glow box on hover */}
                    <div className={`
                      absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100
                      transition-all duration-300 pointer-events-none
                      ${!isActive && 'group-hover:animate-pulse'}
                    `}>
                      {/* Gradient border */}
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-solana-purple via-cyan-500 to-solana-green p-[1px]">
                        <div className="w-full h-full rounded-lg bg-black/80" />
                      </div>
                      
                      {/* Glow effect */}
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-solana-purple/20 via-cyan-500/20 to-solana-green/20 blur-xl" />
                    </div>
                  </Link>
                )
              })}
            </nav>

            {/* Wallet Button */}
            <div className="wallet-adapter-button-trigger">
              <WalletButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-gray-500">
              2024 ReFit. Built on Solana.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-xs text-gray-600">Powered by</span>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-gradient-to-br from-solana-purple to-solana-green rounded" />
                <span className="text-sm font-medium">Solana</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <style>{`
        @keyframes cyberpunk-flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .cyberpunk-border {
          background: linear-gradient(270deg, #7c3aed, #5b21b6, #7c3aed);
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
        .wallet-adapter-dropdown-list {
          background: linear-gradient(to bottom, #1a1a2e, #0f0f1e) !important;
          border: 1px solid rgba(147, 51, 234, 0.3) !important;
        }
        .wallet-adapter-dropdown-list-item {
          color: #e5e5e5 !important;
        }
        .wallet-adapter-dropdown-list-item:hover {
          background: rgba(147, 51, 234, 0.2) !important;
        }
        .wallet-adapter-button {
          background: linear-gradient(135deg, #7c3aed, #5b21b6) !important;
        }
        .wallet-adapter-button:hover {
          background: linear-gradient(135deg, #8b5cf6, #6d28d9) !important;
        }
      `}</style>
    </div>
  )
}

export default Layout
