'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Smartphone, 
  Package, 
  ArrowRight, 
  CheckCircle,
  TrendingUp,
  Shield,
  Zap,
  Play,
  ChevronRight
} from 'lucide-react'
import FAQ from '@/components/FAQ'
import EmailCapture from '@/components/EmailCapture'

export default function HomePage() {
  const popularDevices = [
    { name: 'iPhone 15 Pro', price: 960, trend: 'up' },
    { name: 'Solana Phone', price: 240, trend: 'up' },
    { name: 'iPhone 14 Pro', price: 720, trend: 'up' },
    { name: 'Samsung Galaxy S24', price: 680, trend: 'up' },
    { name: 'iPhone 13 Pro', price: 560, trend: 'up' },
    { name: 'Pixel 8 Pro', price: 520, trend: 'up' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section - Apple Style (Smaller) */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
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
              AI-powered instant valuation. Trade in your device for immediate Solana.
            </p>
            
            {/* Tagline */}
            <p className="text-sm text-gray-500 mb-8 font-medium">
              Powered by V3RA AI verification
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link 
                href="/sell" 
                className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex items-center justify-center"
              >
                Get Your Quote
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/shop" 
                className="px-8 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-full text-white font-semibold text-lg hover:bg-gray-800 transition-all duration-300 flex items-center justify-center"
              >
                <Smartphone className="mr-2 h-5 w-5" />
                Shop Phones
              </Link>
            </div>
            
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
                <span>Instant SOL payments</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>15+ years experience</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Popular Devices Section */}
      <section className="py-16 bg-gray-950/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Popular Devices</h2>
            <p className="text-xl text-gray-400">See what your device is worth today</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
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

          {/* See All Devices Button */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link 
              href="/sell" 
              className="inline-flex items-center px-6 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white font-semibold hover:bg-gray-800 transition-all duration-300"
            >
              See All Devices
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
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
                <h3 className="text-xl font-bold mb-2">Snap a photo</h3>
                <p className="text-gray-400">V3RA AI instantly analyzes condition</p>
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
                <p className="text-gray-400">See your SOL value immediately</p>
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
                <p className="text-gray-400">Receive SOL in your wallet</p>
              </div>
            </motion.div>
          </div>

          {/* Demo CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link 
              href="/sell" 
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 group"
            >
              Try Demo Now
              <Play className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Value Proposition - Split Screen */}
      <section className="py-20 bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Left side - Sell */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-3xl sm:text-4xl font-bold mb-4">
                  Turn your old phone into
                  <span className="block text-purple-400">instant crypto</span>
                </h3>
                <p className="text-lg text-gray-400">
                  Get competitive prices for your devices. We accept all major brands and models, 
                  even with cracked screens or battery issues.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-purple-500/20 rounded-lg mt-1">
                    <Zap className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Instant quotes</h4>
                    <p className="text-sm text-gray-400">Get your price in seconds, no account needed</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-green-500/20 rounded-lg mt-1">
                    <Shield className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Data protection</h4>
                    <p className="text-sm text-gray-400">Military-grade data wiping included free</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-blue-500/20 rounded-lg mt-1">
                    <TrendingUp className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Best prices</h4>
                    <p className="text-sm text-gray-400">Market-based pricing ensures fair value</p>
                  </div>
                </div>
              </div>
              
              <Link 
                href="/sell" 
                className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
              >
                Check Your Phone&apos;s Value
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
            
            {/* Right side - Visual */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square max-w-md mx-auto">
                {/* Phone mockup with gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-green-600/20 rounded-3xl blur-2xl" />
                <div className="relative h-full bg-gray-900/50 backdrop-blur-sm rounded-3xl border border-gray-800 p-8 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-8xl mx-auto mb-6 opacity-20">📱</div>
                    <div className="space-y-2">
                      <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
                        $450
                      </div>
                      <div className="text-gray-400">Average payout</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Smart Contract Commerce Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="text-sm text-purple-400 font-semibold mb-2 block">COMING SOON</span>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Smart Contract Phone Purchases
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Revolutionary way to upgrade: Buy new Seeker → Money in smart contract → Old phone funds the difference
              </p>
            </motion.div>

            {/* Visual Process */}
            <div className="bg-gray-900/30 rounded-2xl border border-gray-800 p-8 max-w-4xl mx-auto mb-16">
              <div className="grid md:grid-cols-4 gap-4 text-center">
                <div className="space-y-2">
                  <div className="text-4xl">🛒</div>
                  <h4 className="font-semibold">Order Seeker</h4>
                  <p className="text-sm text-gray-400">Pay full price</p>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl">🔒</div>
                  <h4 className="font-semibold">Smart Contract</h4>
                  <p className="text-sm text-gray-400">Funds locked</p>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl">📱</div>
                  <h4 className="font-semibold">Ship Old Phone</h4>
                  <p className="text-sm text-gray-400">AI valuation</p>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl">💸</div>
                  <h4 className="font-semibold">Get Refund</h4>
                  <p className="text-sm text-gray-400">Instant SOL back</p>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Upgrade to Web3 phones
              </h2>
              <p className="text-xl text-gray-400">
                Get 20% extra credit when you trade in
              </p>
            </motion.div>

            {/* Product cards */}
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group relative bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 hover:border-purple-500/50 transition-all duration-300"
              >
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-purple-500/20 rounded-full text-xs font-semibold text-purple-400">
                    NEW
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-2">Solana Seeker</h3>
                <p className="text-gray-400 mb-6">
                  Next-gen Web3 phone with built-in Seed Vault and dApp store
                </p>
                <div className="text-3xl font-bold mb-6">
                  <span className="text-gray-500 line-through text-xl">$450</span>
                  <span className="ml-2">$360</span>
                  <span className="text-sm text-gray-400 ml-2">with trade-in</span>
                </div>
                <Link 
                  href="/shop" 
                  className="inline-flex items-center text-purple-400 font-semibold group-hover:text-purple-300 transition-colors"
                >
                  Learn more
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="group relative bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 hover:border-purple-500/50 transition-all duration-300"
              >
                <h3 className="text-2xl font-bold mb-2">Solana Saga</h3>
                <p className="text-gray-400 mb-6">
                  The original Web3 phone, now at an incredible price
                </p>
                <div className="text-3xl font-bold mb-6">
                  <span className="text-gray-500 line-through text-xl">$599</span>
                  <span className="ml-2">$479</span>
                  <span className="text-sm text-gray-400 ml-2">with trade-in</span>
                </div>
                <Link 
                  href="/shop" 
                  className="inline-flex items-center text-green-400 font-semibold group-hover:text-green-300 transition-colors"
                >
                  Learn more
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Email Capture Section */}
      <section className="py-20 bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <EmailCapture />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
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
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">
        {/* Gradient backgrounds */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-gray-950 to-black" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

        <div className="container mx-auto px-4 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Ready to make the switch?
            </h2>
            <p className="text-xl text-gray-400 mb-10">
              Join thousands who&apos;ve already traded their old phones for SOL
            </p>
            <Link 
              href="/sell" 
              className="inline-flex items-center px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 group"
            >
              Start Now
              <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center group"
            >
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-purple-500/20 to-green-500/20 rounded-lg flex items-center justify-center group-hover:from-purple-500/30 group-hover:to-green-500/30 transition-all">
                <Shield className="h-6 w-6 text-purple-400" />
              </div>
              <h4 className="font-semibold mb-1 text-gray-200">Secure Smart Contract</h4>
              <p className="text-sm text-gray-500">Protected by Solana blockchain</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center group"
            >
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-purple-500/20 to-green-500/20 rounded-lg flex items-center justify-center group-hover:from-purple-500/30 group-hover:to-green-500/30 transition-all">
                <Zap className="h-6 w-6 text-green-400" />
              </div>
              <h4 className="font-semibold mb-1 text-gray-200">Instant Payments</h4>
              <p className="text-sm text-gray-500">Get SOL in 24 hours</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center group"
            >
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-purple-500/20 to-green-500/20 rounded-lg flex items-center justify-center group-hover:from-purple-500/30 group-hover:to-green-500/30 transition-all">
                <Package className="h-6 w-6 text-pink-400" />
              </div>
              <h4 className="font-semibold mb-1 text-gray-200">Free Shipping</h4>
              <p className="text-sm text-gray-500">Prepaid label included</p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-20 pt-12 border-t border-gray-800"
          >
            <div className="flex flex-col items-center gap-6">
              <div className="inline-flex items-center gap-3 text-gray-500 hover:text-gray-400 transition-colors group">
                <span className="text-sm font-medium">Powered by</span>
                <div className="flex items-center gap-2 group-hover:scale-105 transition-transform duration-300">
                  <img 
                    src="/solana-logo.svg" 
                    alt="Solana" 
                    className="h-6 w-6"
                  />
                  <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
                    Solana
                  </span>
                </div>
              </div>
              
              {/* Solana Mobile Badge */}
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full border border-purple-500/30">
                <Smartphone className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-400">Solana Mobile App Coming Soon</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
