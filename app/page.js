'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Package, 
  ArrowRight, 
  CheckCircle,
  TrendingUp,
  Shield,
  Zap,
  ChevronRight,
  Coins
} from 'lucide-react'
import dynamic from 'next/dynamic'

const FAQ = dynamic(() => import('@/components/FAQ'), {
  loading: () => <div className="h-96 animate-pulse bg-gray-900/50 rounded-lg" />,
})

export default function HomePage() {
  const popularDevices = [
    { name: 'iPhone 16 Pro Max', price: 760, trend: 'up' },
    { name: 'iPhone 15 Pro', price: 513, trend: 'up' },
    { name: 'iPhone 14 Pro', price: 390, trend: 'up' },
    { name: 'iPhone 13 Pro', price: 309, trend: 'up' },
    { name: 'iPhone 12 Pro', price: 200, trend: 'up' },
    { name: 'Samsung Galaxy S24', price: 181, trend: 'up' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section - Simplified & Focused */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-950 to-black" />
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/10 via-transparent to-green-900/10" />
        
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
        </div>
        
        <div className="relative container mx-auto px-4 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-5xl mx-auto"
          >
            {/* Main headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
                Your old phone
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-green-400 bg-clip-text text-transparent">
                is worth SOL
              </span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto font-light">
              Instant valuation. Get paid in USDC or SOL instantly.
            </p>
            
            {/* Single CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                href="/sell" 
                className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex items-center justify-center"
              >
                Get Instant Quote
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/stake" 
                className="px-8 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-full text-white font-semibold text-lg hover:bg-gray-800 transition-all duration-300 flex items-center justify-center"
              >
                <Coins className="mr-2 h-5 w-5" />
                Learn About Staking
              </Link>
            </div>
            
            {/* Social buttons */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex justify-center gap-4 mb-8"
            >
              <a
                href="https://x.com/ReFit_SOL"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-full text-white font-medium hover:bg-gray-800 transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Follow on X
              </a>
              <a
                href="https://t.me/v3ra_ai"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-full text-white font-medium hover:bg-gray-800 transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.717-1.698 6.486-2.39 8.622-.293.908-.867 1.206-1.422.982-1.077-.437-4.02-2.637-4.955-3.252-.457-.3-.967-.62-.135-1.473.918-.938 2.025-2.102 2.653-2.758.288-.302.577-.639-.098-.363-1.89 1.545-3.757 3.004-4.32 3.415-.533.389-1.045.281-1.635.105-.778-.233-1.51-.485-1.766-.574-.425-.147-.385-.44.085-.665.493-.235 5.813-2.386 6.11-2.502.287-.112 1.368-.496 1.548-.16.135.25.095 1.44.03 1.623z"/>
                </svg>
                Join Telegram
              </a>
            </motion.div>
            
            {/* Trust indicators */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-wrap justify-center gap-6 text-sm text-gray-500"
            >
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">Launching Week 1</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Instant USDC/SOL payments</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <span>15+ years experience</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works - Visual 3-Step Process */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">How it works</h2>
            <p className="text-xl text-gray-400">Get SOL in 3 simple steps</p>
          </motion.div>

          {/* Visual 3-Step Process */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative text-center group"
            >
              {/* Step number */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center font-bold text-lg">
                1
              </div>
              
              {/* Card */}
              <div className="pt-12 pb-8 px-6 bg-gray-900/50 rounded-2xl border border-gray-800 group-hover:border-purple-500/50 transition-all duration-300">
                <div className="text-5xl mb-4">📸</div>
                <h3 className="text-xl font-bold mb-2">Submit details</h3>
                <p className="text-gray-400">Tell us about your device condition</p>
              </div>
              
              {/* Connection line */}
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-purple-500 to-transparent" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative text-center group"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center font-bold text-lg">
                2
              </div>
              
              <div className="pt-12 pb-8 px-6 bg-gray-900/50 rounded-2xl border border-gray-800 group-hover:border-purple-500/50 transition-all duration-300">
                <div className="text-5xl mb-4">⚡</div>
                <h3 className="text-xl font-bold mb-2">Get instant quote</h3>
                <p className="text-gray-400">See your USD value instantly</p>
              </div>
              
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-purple-500 to-transparent" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative text-center group"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-green-600 to-green-400 rounded-full flex items-center justify-center font-bold text-lg">
                3
              </div>
              
              <div className="pt-12 pb-8 px-6 bg-gray-900/50 rounded-2xl border border-gray-800 group-hover:border-green-500/50 transition-all duration-300">
                <div className="text-5xl mb-4">💰</div>
                <h3 className="text-xl font-bold mb-2">Ship & get paid</h3>
                <p className="text-gray-400">Choose USDC or SOL payment</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Popular Devices Section - Streamlined */}
      <section className="py-16 bg-gray-950/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Current Device Values</h2>
            <p className="text-xl text-gray-400">Live market prices updated daily</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {popularDevices.map((device, index) => (
              <motion.div
                key={device.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
              >
                {/* Gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-green-600/0 group-hover:from-purple-600/5 group-hover:to-green-600/5 rounded-2xl transition-all duration-300" />
                
                <div className="relative">
                  {/* Phone icon */}
                  <div className="text-6xl text-center mb-4">📱</div>
                  
                  {/* Device name */}
                  <h3 className="text-lg font-semibold mb-2 text-center text-gray-200 group-hover:text-white transition-colors">
                    {device.name}
                  </h3>
                  
                  {/* Price */}
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl font-bold text-green-400">
                      ${device.price}
                    </span>
                    <TrendingUp className="h-5 w-5 text-green-400" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition - Why ReFit */}
      <section className="py-20 bg-gray-950">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Why choose ReFit?</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              We make selling your phone simple, secure, and profitable
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center">
                <Zap className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Instant Quotes</h3>
              <p className="text-gray-400">
                Get a fair market price for your device. Simple, transparent pricing.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl flex items-center justify-center">
                <Shield className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure Process</h3>
              <p className="text-gray-400">
                Military-grade data wiping included free. Your personal information is always protected.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-500/20 to-pink-600/20 rounded-2xl flex items-center justify-center">
                <Package className="h-8 w-8 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Free Shipping</h3>
              <p className="text-gray-400">
                We provide prepaid shipping labels. Just pack your phone and drop it off.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* NEW: Staking Teaser Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-purple-900/20 to-green-900/20 rounded-3xl border border-purple-500/30 p-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-full text-sm font-semibold text-purple-400 mb-6">
                <Coins className="h-4 w-4" />
                NEW FEATURE
              </span>
              
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Stake Your Trade-In Value
              </h2>
              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                Don&apos;t just sell your phone – stake its value and earn up to 500% APR through ReFit&apos;s innovative staking program.
              </p>
              
              <Link 
                href="/stake" 
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-green-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 group"
              >
                Explore Staking Options
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section with Email Capture */}
      <section className="py-20 bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-400">
                Everything you need to know about ReFit
              </p>
            </motion.div>
            
            <FAQ />

            {/* Integrated Email Capture */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-16 text-center bg-gray-900/50 rounded-2xl p-8 border border-gray-800"
            >
              <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
              <p className="text-gray-400 mb-6">
                Get notified when we launch and receive exclusive early access benefits
              </p>
              <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                >
                  Notify Me
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Simplified CTA */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-4">
          <Link 
            href="/sell" 
            className="inline-flex items-center px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 group"
          >
            Get Your Instant Quote
            <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <div className="mt-8 text-sm text-gray-500">
            Powered by Solana • Built for the future
          </div>
        </div>
      </section>
    </div>
  )
}