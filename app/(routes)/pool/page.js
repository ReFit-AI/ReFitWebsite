'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  Shield,
  Zap,
  DollarSign,
  Users,
  Package,
  Lock,
  CheckCircle
} from 'lucide-react'

export default function PoolPage() {
  const [depositAmount, setDepositAmount] = useState('1000')
  const [selectedPool, setSelectedPool] = useState('stable')
  
  // Calculate projected returns
  const calculateReturns = (amount, poolType) => {
    const principal = parseFloat(amount) || 0
    const rates = {
      stable: { monthly: 0.01, annual: 0.12 }, // 12% APY
      aggressive: { monthly: 0.02, annual: 0.25 } // 25% APY
    }
    
    const rate = rates[poolType]
    return {
      monthly: (principal * rate.monthly).toFixed(2),
      annual: (principal * rate.annual).toFixed(2),
      apy: (rate.annual * 100).toFixed(0)
    }
  }

  const returns = calculateReturns(depositAmount, selectedPool)

  const pools = [
    {
      id: 'stable',
      name: 'Stable Arbitrage Pool',
      apy: '8-12%',
      risk: 'Low',
      lockup: 'None',
      description: 'Quick flips on high-confidence arbitrage opportunities',
      color: 'from-blue-600 to-cyan-600',
      features: [
        '7-14 day average hold time',
        'Focus on latest iPhone models',
        'Verified suppliers only',
        'Weekly profit distributions'
      ],
      tvl: '$127,450',
      participants: 47
    },
    {
      id: 'aggressive',
      name: 'Growth Pool',
      apy: '15-25%',
      risk: 'Medium',
      lockup: '30 days',
      description: 'Bulk purchases and seasonal inventory plays',
      color: 'from-purple-600 to-pink-600',
      features: [
        '30-45 day average hold',
        'Bulk lot purchases',
        'Wider device range',
        'Monthly distributions'
      ],
      tvl: '$84,200',
      participants: 23
    }
  ]

  const stats = [
    { label: 'Total Value Locked', value: '$211,650', change: '+12.3%' },
    { label: 'Devices Traded', value: '1,247', change: '+34' },
    { label: 'Average Return', value: '14.7%', change: '+2.1%' },
    { label: 'Active Stakers', value: '70', change: '+8' }
  ]

  const recentTrades = [
    { device: 'iPhone 14 Pro (Bulk x10)', bought: '$4,200', sold: '$5,100', profit: '$900', roi: '21.4%' },
    { device: 'Samsung S23 Ultra x5', bought: '$2,500', sold: '$2,875', profit: '$375', roi: '15.0%' },
    { device: 'iPhone 13 Lot (x20)', bought: '$6,000', sold: '$7,200', profit: '$1,200', roi: '20.0%' },
  ]

  return (
    <div className="min-h-screen bg-black text-white py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-green-600/20 rounded-full text-sm font-semibold text-purple-400 mb-6">
            <Zap className="w-4 h-4" />
            EARLY ACCESS
          </div>
          
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            <span className="block text-white">ReFit Inventory</span>
            <span className="block bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
              Staking Pools
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-4">
            Earn yield by funding device arbitrage. We buy low, sell high, you earn returns.
          </p>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Your USDC powers inventory purchases. Profits from flipping devices get distributed back to stakers.
          </p>
        </motion.div>

        {/* Live Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
              <div className="text-sm text-gray-400 mb-1">{stat.label}</div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-green-400">{stat.change} this week</div>
            </div>
          ))}
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl p-8 border border-gray-700 mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="font-semibold mb-2">1. Deposit USDC</h3>
              <p className="text-sm text-gray-400">Add funds to your chosen pool</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Package className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2">2. We Buy Inventory</h3>
              <p className="text-sm text-gray-400">Source devices below market price</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="font-semibold mb-2">3. Flip for Profit</h3>
              <p className="text-sm text-gray-400">Sell at market rates for gains</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-600/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="font-semibold mb-2">4. Share Returns</h3>
              <p className="text-sm text-gray-400">Profits distributed to stakers</p>
            </div>
          </div>
        </motion.div>

        {/* Pool Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-2 gap-6 mb-12"
        >
          {pools.map((pool) => (
            <div
              key={pool.id}
              onClick={() => setSelectedPool(pool.id)}
              className={`relative rounded-2xl p-6 border-2 cursor-pointer transition-all ${
                selectedPool === pool.id 
                  ? 'border-purple-500 bg-purple-900/20' 
                  : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
              }`}
            >
              {selectedPool === pool.id && (
                <div className="absolute top-4 right-4">
                  <CheckCircle className="w-6 h-6 text-purple-400" />
                </div>
              )}
              
              <div className={`inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r ${pool.color} bg-opacity-20 rounded-full text-sm font-semibold text-white mb-4`}>
                {pool.risk} Risk
              </div>
              
              <h3 className="text-xl font-bold mb-2">{pool.name}</h3>
              <p className="text-gray-400 mb-4">{pool.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-3xl font-bold text-green-400">{pool.apy}</div>
                  <div className="text-sm text-gray-400">Target APY</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{pool.lockup}</div>
                  <div className="text-sm text-gray-400">Lock Period</div>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                {pool.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">TVL: <span className="text-white font-semibold">{pool.tvl}</span></span>
                  <span className="text-gray-400">{pool.participants} stakers</span>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ROI Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-purple-900/20 to-green-900/20 rounded-2xl p-8 border border-purple-500/30 mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Calculate Your Returns</h2>
          
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">Deposit Amount (USDC)</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-xl font-semibold focus:outline-none focus:border-purple-500"
                placeholder="Enter amount"
              />
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-900/50 rounded-xl p-4 text-center">
                <div className="text-sm text-gray-400 mb-1">Monthly Returns</div>
                <div className="text-2xl font-bold text-green-400">${returns.monthly}</div>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-4 text-center">
                <div className="text-sm text-gray-400 mb-1">Annual Returns</div>
                <div className="text-2xl font-bold text-green-400">${returns.annual}</div>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-4 text-center">
                <div className="text-sm text-gray-400 mb-1">APY</div>
                <div className="text-2xl font-bold text-purple-400">{returns.apy}%</div>
              </div>
            </div>
            
            <div className="text-center text-sm text-gray-400">
              * Returns based on historical performance. Not guaranteed.
            </div>
          </div>
        </motion.div>

        {/* Recent Trades */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-900/50 rounded-2xl p-8 border border-gray-700 mb-12"
        >
          <h2 className="text-2xl font-bold mb-6">Recent Profitable Trades</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 text-gray-400">Device</th>
                  <th className="text-right py-3 text-gray-400">Bought</th>
                  <th className="text-right py-3 text-gray-400">Sold</th>
                  <th className="text-right py-3 text-gray-400">Profit</th>
                  <th className="text-right py-3 text-gray-400">ROI</th>
                </tr>
              </thead>
              <tbody>
                {recentTrades.map((trade, index) => (
                  <tr key={index} className="border-b border-gray-800">
                    <td className="py-3">{trade.device}</td>
                    <td className="text-right py-3">{trade.bought}</td>
                    <td className="text-right py-3">{trade.sold}</td>
                    <td className="text-right py-3 text-green-400 font-semibold">{trade.profit}</td>
                    <td className="text-right py-3 text-purple-400 font-semibold">{trade.roi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Risk Disclosure */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-yellow-900/20 border border-yellow-600/30 rounded-2xl p-6 mb-12"
        >
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-400 mb-2">Risk Disclosure</h3>
              <p className="text-sm text-gray-300">
                Device trading involves market risk. Returns are based on historical performance and not guaranteed. 
                Pool funds are used to purchase physical inventory which may fluctuate in value. 
                We maintain an insurance fund and strict buying criteria to minimize risk.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <div className="bg-gradient-to-br from-purple-900/30 to-green-900/30 rounded-2xl p-8 border border-purple-500/30">
            <Lock className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Join the Waitlist</h2>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Staking pools are currently in private beta. Join our waitlist to get early access and exclusive benefits.
            </p>
            
            <div className="max-w-md mx-auto mb-6">
              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                />
                <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-green-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300">
                  Join Waitlist
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>No minimum deposit</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Withdraw anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Weekly updates</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}