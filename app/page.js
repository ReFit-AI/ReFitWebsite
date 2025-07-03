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
              Trade in your device for Solana. Get instant quotes and fast payments.
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
                <span className="font-medium">Get paid in 24 hours</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Free shipping included</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Best prices guaranteed</span>
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
                <div className="text-5xl mb-4">📱</div>
                <h3 className="text-xl font-bold mb-2">Select your device</h3>
                <p className="text-gray-400">Choose model and condition</p>
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
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
