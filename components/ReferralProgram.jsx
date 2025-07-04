'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Copy, Users, DollarSign, TrendingUp, Gift, Check } from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { toast } from 'react-hot-toast'

export default function ReferralProgram() {
  const { publicKey } = useWallet()
  const [referralCode, setReferralCode] = useState('')
  const [stats, setStats] = useState({ referrals: 0, earnings: 0 })
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (publicKey) {
      fetchReferralData()
    }
  }, [publicKey])

  const fetchReferralData = async () => {
    try {
      const response = await fetch('/api/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: publicKey.toBase58() })
      })

      if (response.ok) {
        const data = await response.json()
        setReferralCode(data.referralCode)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching referral data:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyReferralLink = () => {
    const link = `${window.location.origin}?ref=${referralCode}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    toast.success('Referral link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const benefits = [
    {
      icon: Gift,
      title: 'Earn $10 per referral',
      description: 'Get paid when friends sell their first device'
    },
    {
      icon: TrendingUp,
      title: 'Bonus multipliers',
      description: '5+ referrals = 2x rewards, 10+ = 3x rewards'
    },
    {
      icon: Users,
      title: 'Build your network',
      description: 'Track your impact and grow with ReFit'
    }
  ]

  if (!publicKey) {
    return (
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 text-center">
        <p className="text-gray-400">Connect your wallet to access the referral program</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 text-center">
        <p className="text-gray-400">Loading referral data...</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Referral Program</h2>
        <p className="text-gray-400">Earn SOL for every friend who sells their devices</p>
      </div>

      {/* Referral Stats */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <Users className="h-5 w-5 text-purple-400" />
            <span className="text-2xl font-bold">{stats.referrals}</span>
          </div>
          <p className="text-sm text-gray-400">Total Referrals</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-5 w-5 text-green-400" />
            <span className="text-2xl font-bold">${stats.earnings}</span>
          </div>
          <p className="text-sm text-gray-400">Total Earned</p>
        </motion.div>
      </div>

      {/* Referral Link */}
      <div className="bg-gray-800/30 rounded-lg p-6 mb-8">
        <p className="text-sm text-gray-400 mb-2">Your referral link</p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={`${typeof window !== 'undefined' ? window.location.origin : ''}?ref=${referralCode}`}
            className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-sm"
          />
          <button
            onClick={copyReferralLink}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Share this link with friends to earn rewards
        </p>
      </div>

      {/* Benefits */}
      <div className="space-y-4">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon
          return (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-4"
            >
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">{benefit.title}</h4>
                <p className="text-sm text-gray-400">{benefit.description}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Coming Soon: Token Rewards */}
      <div className="mt-8 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
        <p className="text-sm text-purple-300">
          <span className="font-semibold">Coming Soon:</span> Earn RFT tokens for referrals and gain ownership in ReFit!
        </p>
      </div>
    </div>
  )
}