'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  Zap,
  Activity,
  ArrowUpRight,
  Award,
  Shield,
  BarChart3,
  Package,
  ShoppingCart
} from 'lucide-react'

export default function StatsPage() {
  const [stats, setStats] = useState(null)
  const [recentDeposits, setRecentDeposits] = useState([])
  const [distributions, setDistributions] = useState([])
  const [inventoryStats, setInventoryStats] = useState(null)
  const [timeToDistribution, setTimeToDistribution] = useState('')
  const [loading, setLoading] = useState(true)

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get pool stats
        const poolRes = await fetch('/api/pool/deposit')
        const poolData = await poolRes.json()

        // Get recent deposits
        const depositsRes = await fetch('/api/pool/deposits/all')
        const depositsData = await depositsRes.json()

        // Get distribution history
        const distRes = await fetch('/api/pool/distribute')
        const distData = await distRes.json()

        // Get inventory stats
        const invRes = await fetch('/api/admin/inventory')
        const invData = await invRes.json()

        if (poolData.success) {
          setStats(poolData.pool)
        }

        if (depositsData.success) {
          setRecentDeposits(depositsData.deposits || [])
        }

        if (distData.success) {
          setDistributions(distData.distributions || [])
        }

        if (invData.success) {
          // Calculate inventory stats with shipping costs
          const inventory = invData.inventory || []
          const inStock = inventory.filter(i => i.status === 'in_stock')
          const sold = inventory.filter(i => i.status === 'sold')
          const capitalDeployed = inStock.reduce((sum, i) => sum + parseFloat(i.price_paid || 0), 0)
          const totalRevenue = sold.reduce((sum, i) => sum + parseFloat(i.price_sold || 0), 0)
          const totalCost = sold.reduce((sum, i) => sum + parseFloat(i.price_paid || 0), 0)

          // Calculate shipping costs
          const totalShippingCosts = sold.reduce((sum, i) =>
            sum + parseFloat(i.shipping_cost_in || 0) + parseFloat(i.shipping_cost_out || 0), 0
          )

          // Gross profit (without shipping)
          const grossProfit = totalRevenue - totalCost

          // Net profit (with shipping)
          const netProfit = totalRevenue - totalCost - totalShippingCosts

          // Calculate margins
          const grossMargin = totalCost > 0 ? (grossProfit / totalCost * 100) : 0
          const netMargin = (totalCost + totalShippingCosts) > 0
            ? (netProfit / (totalCost + totalShippingCosts) * 100)
            : 0

          setInventoryStats({
            activeCount: inStock.length,
            soldCount: sold.length,
            capitalDeployed,
            totalRevenue,
            grossProfit,
            netProfit,
            totalShippingCosts,
            grossMargin,
            netMargin
          })
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [])

  // Calculate time to next Monday noon
  useEffect(() => {
    const calculateTimeToMonday = () => {
      const now = new Date()
      const monday = new Date()

      // Set to next Monday
      const daysUntilMonday = (8 - now.getDay()) % 7 || 7
      monday.setDate(now.getDate() + daysUntilMonday)
      monday.setHours(12, 0, 0, 0) // Noon

      // If it's already past Monday noon this week, go to next week
      if (monday <= now) {
        monday.setDate(monday.getDate() + 7)
      }

      const diff = monday - now
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      setTimeToDistribution(`${days}d ${hours}h ${minutes}m`)
    }

    calculateTimeToMonday()
    const timer = setInterval(calculateTimeToMonday, 60000) // Update every minute
    return () => clearInterval(timer)
  }, [])

  // Format wallet address
  const formatAddress = (address) => {
    if (!address) return '...'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Format time ago
  const timeAgo = (timestamp) => {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const tvl = stats?.total_deposits || 0
  const depositorCount = stats?.active_depositors || 0
  const bonusSlots = stats?.rft_bonus_remaining || 0
  const totalDistributed = stats?.total_distributed || 0

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Activity className="w-8 h-8 text-green-400" />
                ReFit Protocol Stats
              </h1>
              <p className="text-gray-400 mt-1">Real-time liquidity pool analytics</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-900/20 border border-green-500/50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-green-400">Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* TVL */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-green-400" />
              <span className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded">LIVE</span>
            </div>
            <div className="text-3xl font-bold mb-1">
              ${tvl.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Total Value Locked</div>
            <div className="mt-2 text-xs text-green-400">
              +2% weekly returns
            </div>
          </motion.div>

          {/* Depositors */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-400" />
              <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-1 rounded">GROWING</span>
            </div>
            <div className="text-3xl font-bold mb-1">
              {depositorCount}
            </div>
            <div className="text-sm text-gray-400">Active Depositors</div>
            <div className="mt-2 text-xs text-blue-400">
              {bonusSlots > 0 ? `${bonusSlots} bonus slots left` : 'Bonus filled!'}
            </div>
          </motion.div>

          {/* Weekly Yield */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-purple-400" />
              <span className="text-xs text-purple-400 bg-purple-900/30 px-2 py-1 rounded">FIXED</span>
            </div>
            <div className="text-3xl font-bold mb-1">
              2.00%
            </div>
            <div className="text-sm text-gray-400">Weekly Returns</div>
            <div className="mt-2 text-xs text-purple-400">
              104% APY
            </div>
          </motion.div>

          {/* Next Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-yellow-400" />
              <span className="text-xs text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded">COUNTDOWN</span>
            </div>
            <div className="text-2xl font-bold mb-1">
              {timeToDistribution}
            </div>
            <div className="text-sm text-gray-400">Next Distribution</div>
            <div className="mt-2 text-xs text-yellow-400">
              Every Monday
            </div>
          </motion.div>
        </div>

        {/* Live Activity Feed */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Deposits */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  Live Deposit Feed
                </h2>
              </div>

              <div className="divide-y divide-gray-800">
                {loading ? (
                  <div className="px-6 py-8 text-center text-gray-500">
                    Loading deposits...
                  </div>
                ) : recentDeposits.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500">
                    No deposits yet. Be the first!
                  </div>
                ) : (
                  <AnimatePresence>
                    {recentDeposits.slice(0, 10).map((deposit, index) => (
                      <motion.div
                        key={deposit.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <div>
                            <div className="font-mono text-sm">
                              {formatAddress(deposit.wallet_address)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {timeAgo(deposit.deposited_at)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-400">
                            +${parseFloat(deposit.amount).toLocaleString()}
                          </div>
                          {deposit.has_early_bonus && (
                            <div className="text-xs text-yellow-400">
                              🎁 1.5x RFT
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {recentDeposits.length > 0 && (
                <div className="px-6 py-3 border-t border-gray-800 bg-gray-800/30">
                  <div className="text-sm text-gray-400 text-center">
                    Total: ${recentDeposits.reduce((sum, d) => sum + parseFloat(d.amount), 0).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Performance & Info */}
          <div className="space-y-6">
            {/* Performance History */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                Performance History
              </h2>

              <div className="space-y-3">
                {distributions.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    First distribution coming Monday!
                  </div>
                ) : (
                  distributions.slice(0, 5).map((dist, index) => (
                    <div key={dist.id} className="flex items-center justify-between">
                      <div className="text-sm">
                        Week {dist.week_number}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-green-400">
                          2.00%
                        </span>
                        <span className="text-xs px-2 py-1 bg-green-900/30 text-green-400 rounded">
                          ✓
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-800">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Distributed</span>
                  <span className="font-bold text-green-400">
                    ${totalDistributed.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-blue-400" />
                Security
              </h2>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm">Squads Multisig Vault</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm">On-chain Verification</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm">Weekly Distributions</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm">7-day Withdrawals</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <a
                href="/stake"
                className="block w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-center font-bold hover:shadow-xl hover:shadow-purple-500/20 transition-all"
              >
                <div className="flex items-center justify-center gap-2">
                  Start Earning 2% Weekly
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                {bonusSlots > 0 && (
                  <div className="text-sm mt-1 text-purple-200">
                    {bonusSlots} early bird slots remaining
                  </div>
                )}
              </a>
            </motion.div>
          </div>
        </div>

        {/* Inventory Stats Section */}
        {inventoryStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-400" />
                    Live Inventory - Where Capital is Deployed
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Real phones. Real margins. Real profits.
                  </p>
                </div>
                <a
                  href="/inventory"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  View Full Inventory
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingCart className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-gray-400 uppercase">Active Stock</span>
                  </div>
                  <div className="text-2xl font-bold">{inventoryStats.activeCount}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    ${inventoryStats.capitalDeployed.toFixed(0)} deployed
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-gray-400 uppercase">Total Sales</span>
                  </div>
                  <div className="text-2xl font-bold">{inventoryStats.soldCount}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    ${inventoryStats.totalRevenue.toFixed(0)} revenue
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-gray-400 uppercase">Net Profit</span>
                  </div>
                  <div className="text-2xl font-bold text-green-400">
                    ${inventoryStats.netProfit.toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    ${inventoryStats.grossProfit.toFixed(0)} gross - ${inventoryStats.totalShippingCosts.toFixed(0)} shipping
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-gray-400 uppercase">Net Margin</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-400">
                    {inventoryStats.netMargin.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Per sale
                  </div>
                </div>
              </div>

              <div className="px-6 py-3 bg-blue-900/10 border-t border-gray-800">
                <div className="text-sm text-gray-400 text-center">
                  <span className="text-blue-400 font-medium">100% transparent</span> - Every phone tracked with IMEI, purchase price, and sale price
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bottom Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Early Bird Bonus Active
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                First 100 depositors earn 1.5x RFT tokens
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-yellow-400">
                {100 - bonusSlots}/100
              </div>
              <div className="text-sm text-gray-400">Claimed</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}