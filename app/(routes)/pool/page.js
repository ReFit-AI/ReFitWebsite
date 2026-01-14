'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  TrendingUp,
  Shield,
  Clock,
  ArrowRight,
  Lock,
  Bell,
  CheckCircle,
  Sparkles
} from 'lucide-react'

export default function PoolComingSoon() {
  const [email, setEmail] = React.useState('')
  const [subscribed, setSubscribed] = React.useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    // Store email for notifications when pools launch
    if (email) {
      localStorage.setItem('pool-waitlist', email)
      setSubscribed(true)
    }
  }

  const features = [
    {
      icon: TrendingUp,
      title: '8-12% Monthly Returns',
      description: 'Earn competitive yields from device arbitrage'
    },
    {
      icon: Shield,
      title: 'Principal Protected',
      description: 'Your deposits are backed by real inventory value'
    },
    {
      icon: Clock,
      title: 'No Lock-up Period',
      description: 'Withdraw anytime with flexible terms'
    }
  ]

  const roadmap = [
    { phase: 'Phase 1', item: 'Trade-in Flow', status: 'live', date: 'Now' },
    { phase: 'Phase 2', item: 'Security Audit', status: 'in-progress', date: 'Nov 2025' },
    { phase: 'Phase 3', item: 'Pool Beta Launch', status: 'upcoming', date: 'Dec 2025' },
    { phase: 'Phase 4', item: 'Public Launch', status: 'upcoming', date: 'Q1 2026' }
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-green-600/20 rounded-full text-sm font-semibold text-purple-400 mb-6">
            <Clock className="w-4 h-4" />
            COMING SOON
          </div>

          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
            Liquidity Pools
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Earn passive income by providing liquidity for device arbitrage.
            Our pools will enable instant phone purchases and competitive yields.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 bg-gray-900/50 rounded-xl border border-gray-800 hover:border-purple-600/50 transition-colors"
            >
              <feature.icon className="w-10 h-10 text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Roadmap */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-center mb-8">Launch Roadmap</h2>

          <div className="max-w-3xl mx-auto">
            {roadmap.map((item, index) => (
              <div key={item.phase} className="flex items-center mb-6">
                <div className="flex-shrink-0 w-24 text-sm text-gray-500">
                  {item.date}
                </div>
                <div className="flex-shrink-0 mr-4">
                  {item.status === 'live' ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : item.status === 'in-progress' ? (
                    <div className="w-6 h-6 rounded-full border-2 border-yellow-400 animate-pulse" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-600" />
                  )}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{item.phase}</span>
                    <span className="font-medium">{item.item}</span>
                    {item.status === 'live' && (
                      <span className="text-xs px-2 py-1 bg-green-900/50 text-green-400 rounded">
                        LIVE
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Waitlist Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto text-center"
        >
          <div className="p-8 bg-gradient-to-r from-purple-900/20 to-green-900/20 rounded-xl border border-purple-600/30">
            <Bell className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Get Early Access</h3>
            <p className="text-gray-400 text-sm mb-6">
              Join the waitlist to be notified when pools launch and get exclusive early access benefits.
            </p>

            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-grow px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-purple-600 focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-green-600 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Join
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span>You're on the list!</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-16"
        >
          <p className="text-gray-400 mb-6">
            While you wait for pools to launch, you can still:
          </p>
          <Link
            href="/sell"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-green-600 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Trade In Your Phone
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </div>
  )
}