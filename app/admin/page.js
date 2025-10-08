'use client'

import React, { useState, useEffect } from 'react'
import { DollarSign, Users, TrendingUp, Clock, ArrowUpRight, ArrowDownRight, Package } from 'lucide-react'

// Simple admin dashboard - password protect this in production!
export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [deposits, setDeposits] = useState([])
  const [weeklyProfit, setWeeklyProfit] = useState('')
  const [phonesSold, setPhonesSold] = useState('')
  const [loading, setLoading] = useState(true)

  // Fetch pool stats
  useEffect(() => {
    fetchStats()
    fetchDeposits()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/pool/deposit')
      const data = await res.json()
      if (data.success) {
        setStats(data.pool)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const fetchDeposits = async () => {
    try {
      // In production, this would need admin auth
      const res = await fetch('/api/pool/deposits/all') // You'd create this endpoint
      const data = await res.json()
      if (data.success) {
        setDeposits(data.deposits || [])
      }
    } catch (error) {
      console.error('Failed to fetch deposits:', error)
    } finally {
      setLoading(false)
    }
  }

  const processDistribution = async () => {
    if (!weeklyProfit || weeklyProfit <= 0) {
      alert('Enter valid profit amount')
      return
    }

    // Calculate required profit for 2% to all LPs
    const requiredProfit = totalDeposited * 0.02 / 0.8 // Need to account for 80/20 split
    if (weeklyProfit < requiredProfit) {
      if (!confirm(`Warning: Profit ($${weeklyProfit}) is less than required ($${requiredProfit.toFixed(0)}) for 2% returns. LPs will receive ${((weeklyProfit * 0.8 / totalDeposited) * 100).toFixed(2)}% instead. Continue?`)) {
        return
      }
    }

    if (!confirm(`Process distribution of $${weeklyProfit} profit?`)) {
      return
    }

    try {
      const res = await fetch('/api/pool/distribute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // Auth handled by server-side session
        },
        body: JSON.stringify({ weeklyProfit: parseFloat(weeklyProfit), phonesSold: parseInt(phonesSold) || 0 })
      })

      const data = await res.json()
      if (data.success) {
        alert(`Distribution complete! Distributed $${data.distribution.lpDistribution} to ${data.distribution.depositorCount} users`)
        setWeeklyProfit('')
        fetchStats()
      } else {
        alert('Distribution failed: ' + data.error)
      }
    } catch (error) {
      console.error('Distribution error:', error)
      alert('Failed to process distribution')
    }
  }

  // Calculate key metrics
  const totalDeposited = stats?.total_deposits || 0
  const currentBalance = stats?.current_balance || 0
  const totalDistributed = stats?.total_distributed || 0
  const platformFees = stats?.platform_fees || 0
  const activeDepositors = stats?.active_depositors || 0

  // Calculate weekly requirement
  const weeklyRequired = totalDeposited * 0.02 // 2% weekly
  const yourShare = weeklyRequired * 0.2 // 20% platform fee
  const lpShare = weeklyRequired * 0.8 // 80% to LPs

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">ReFit Admin Dashboard</h1>
          <p className="text-gray-400">Manage liquidity pool and distributions</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Total Deposited</span>
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold">${totalDeposited.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-1">All time deposits</div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Active Depositors</span>
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold">{activeDepositors}</div>
            <div className="text-sm text-gray-500 mt-1">Currently active</div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Weekly Required</span>
              <TrendingUp className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold">${weeklyRequired.toFixed(0)}</div>
            <div className="text-sm text-gray-500 mt-1">2% of deposits</div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Your Earnings</span>
              <ArrowUpRight className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold">${platformFees.toFixed(0)}</div>
            <div className="text-sm text-gray-500 mt-1">Total platform fees</div>
          </div>
        </div>

        {/* Weekly Distribution Calculator */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Process Weekly Distribution</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Input Section */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Phones Sold This Week</label>
              <input
                type="number"
                value={phonesSold}
                onChange={(e) => setPhonesSold(e.target.value)}
                placeholder="50"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Total Week Profit ($)</label>
              <input
                type="number"
                value={weeklyProfit}
                onChange={(e) => setWeeklyProfit(e.target.value)}
                placeholder="5000"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">&nbsp;</label>
              <button
                onClick={processDistribution}
                disabled={!weeklyProfit || weeklyProfit <= 0}
                className="w-full px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Process Distribution
              </button>
            </div>
          </div>

          {/* Distribution Preview */}
          {weeklyProfit > 0 && (
            <div className="mt-6 p-4 bg-gray-900 rounded-lg">
              <h3 className="font-semibold mb-2">Distribution Preview:</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">LPs Get (80%):</span>
                  <div className="text-xl font-bold text-green-400">
                    ${(weeklyProfit * 0.8).toFixed(0)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">You Get (20%):</span>
                  <div className="text-xl font-bold text-purple-400">
                    ${(weeklyProfit * 0.2).toFixed(0)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Each $1k Gets:</span>
                  <div className="text-xl font-bold text-blue-400">
                    $20 (2% return)
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Deposits Table */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Active Deposits</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3">Wallet</th>
                  <th className="text-right py-3">Amount</th>
                  <th className="text-right py-3">Total Earned</th>
                  <th className="text-right py-3">RFT Earned</th>
                  <th className="text-right py-3">Weekly Return</th>
                  <th className="text-right py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">
                      Loading deposits...
                    </td>
                  </tr>
                ) : deposits.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">
                      No deposits yet
                    </td>
                  </tr>
                ) : (
                  deposits.map((deposit) => (
                    <tr key={deposit.id} className="border-b border-gray-700">
                      <td className="py-3">
                        <span className="font-mono text-sm">
                          {deposit.wallet_address.slice(0, 6)}...{deposit.wallet_address.slice(-4)}
                        </span>
                      </td>
                      <td className="text-right py-3">
                        ${parseFloat(deposit.amount).toLocaleString()}
                      </td>
                      <td className="text-right py-3 text-green-400">
                        ${parseFloat(deposit.total_earned_usdc || 0).toFixed(2)}
                      </td>
                      <td className="text-right py-3 text-purple-400">
                        {parseFloat(deposit.rft_earned || 0).toLocaleString()}
                      </td>
                      <td className="text-right py-3">
                        ${(parseFloat(deposit.amount) * 0.02).toFixed(0)}
                      </td>
                      <td className="text-right py-3 text-gray-400">
                        {new Date(deposit.deposited_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          {deposits.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Active:</span>
                <span className="font-bold">
                  ${deposits.reduce((sum, d) => sum + parseFloat(d.amount), 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-gray-400">Weekly Obligation:</span>
                <span className="font-bold text-yellow-400">
                  ${(deposits.reduce((sum, d) => sum + parseFloat(d.amount), 0) * 0.02).toFixed(0)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
            <Package className="w-5 h-5 mb-2" />
            <div className="font-semibold">View Inventory</div>
            <div className="text-sm text-gray-400">Manage phone inventory</div>
          </button>

          <button className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
            <ArrowDownRight className="w-5 h-5 mb-2" />
            <div className="font-semibold">Process Withdrawals</div>
            <div className="text-sm text-gray-400">0 pending</div>
          </button>

          <button className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
            <Clock className="w-5 h-5 mb-2" />
            <div className="font-semibold">View History</div>
            <div className="text-sm text-gray-400">Past distributions</div>
          </button>
        </div>
      </div>
    </div>
  )
}