'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Coins,
  Shield,
  Clock,
  ArrowRight,
  TrendingUp,
  Bell,
  CheckCircle,
  Lock,
  Gift
} from 'lucide-react'

export default function StakeComingSoon() {
  const [email, setEmail] = React.useState('')
  const [subscribed, setSubscribed] = React.useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email) {
      localStorage.setItem('stake-waitlist', email)
      setSubscribed(true)
    }
  }

  const benefits = [
    {
      icon: TrendingUp,
      title: '8% Monthly Returns',
      description: 'Earn 104% APY on your USDC deposits'
    },
    {
      icon: Gift,
      title: 'RFT Token Rewards',
      description: 'Earn 4 RFT tokens per dollar staked monthly'
    },
    {
      icon: Shield,
      title: 'Secured by Inventory',
      description: 'Your stake is backed by real device inventory'
    }
  ]

  const comingSoonFeatures = [
    'Instant USDC deposits via Solana',
    'Real-time earnings dashboard',
    'Flexible withdrawal options',
    'Auto-compound functionality',
    'Governance voting rights',
    'Referral bonus program'
  ]

  return (
    <div className="min-h-screen bg-black text-white py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-600/20 to-green-600/20 rounded-full text-sm font-semibold text-yellow-400 mb-6">
            <Clock className="w-4 h-4" />
            LAUNCHING DECEMBER 2025
          </div>

          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-green-400 bg-clip-text text-transparent">
            ReFit Staking
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Stake USDC to power device purchases and earn competitive yields + RFT tokens.
            Be part of the circular economy revolution.
          </p>
        </motion.div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700 hover:border-yellow-600/50 transition-all"
            >
              <benefit.icon className="w-10 h-10 text-yellow-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
              <p className="text-gray-400 text-sm">{benefit.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Coming Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-3xl mx-auto mb-16"
        >
          <div className="p-8 bg-gray-900/50 rounded-xl border border-gray-800">
            <h2 className="text-2xl font-bold mb-6 text-center">What's Coming</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {comingSoonFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto mb-16"
        >
          <div className="p-6 bg-blue-900/20 rounded-xl border border-blue-600/30">
            <div className="flex items-start gap-4">
              <Lock className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-300 mb-2">Security First</h3>
                <p className="text-sm text-gray-400">
                  We're currently undergoing a comprehensive security audit to ensure your funds are
                  protected. Staking will launch once our smart contracts are verified and battle-tested.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Waitlist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto text-center"
        >
          <div className="p-8 bg-gradient-to-r from-yellow-900/20 to-green-900/20 rounded-xl border border-yellow-600/30">
            <Bell className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Reserve Your Spot</h3>
            <p className="text-gray-400 text-sm mb-2">
              Early stakers get bonus RFT tokens!
            </p>
            <p className="text-yellow-400 font-semibold mb-6">
              First 100 stakers: 2x RFT rewards for 3 months
            </p>

            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-grow px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-yellow-600 focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-yellow-600 to-green-600 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Join
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span>You're reserved for early access!</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Trade-in CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-16"
        >
          <p className="text-gray-400 mb-6">
            Start earning today with trade-ins
          </p>
          <Link
            href="/sell"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-green-600 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Trade In Your Phone Now
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            Get instant USDC for your old phone
          </p>
        </motion.div>
      </div>
    </div>
  )
}