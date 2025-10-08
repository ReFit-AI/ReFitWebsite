'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'
import {
  DollarSign,
  TrendingUp,
  Clock,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  LogOut,
  LayoutDashboard
} from 'lucide-react'

export default function DashboardPage() {
  const { connected, publicKey, connecting } = useWallet()
  const router = useRouter()
  const [deposits, setDeposits] = useState([])
  const [withdrawalRequests, setWithdrawalRequests] = useState([])
  const [summary, setSummary] = useState({
    totalDeposited: 0,
    currentValue: 0,
    totalEarned: 0,
    totalRft: 0,
    weeklyEarnings: 0,
    weeklyRft: 0
  })
  const [loading, setLoading] = useState(true)
  const [isRequestingWithdrawal, setIsRequestingWithdrawal] = useState(false)
  const [withdrawalAmount, setWithdrawalAmount] = useState('')
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false)
  const [withdrawalStatus, setWithdrawalStatus] = useState(null)
  const [mounted, setMounted] = useState(false)

  // Wait for component to mount before checking wallet
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch user deposits and stats
  useEffect(() => {
    const fetchUserData = async () => {
      if (!publicKey) return

      try {
        // Fetch deposits
        const depositsRes = await fetch(`/api/pool/deposit?wallet=${publicKey.toString()}`)
        const depositsData = await depositsRes.json()

        if (depositsData.success) {
          setDeposits(depositsData.deposits || [])
          setSummary(depositsData.summary || {
            totalDeposited: 0,
            currentValue: 0,
            totalEarned: 0,
            totalRft: 0,
            weeklyEarnings: 0,
            weeklyRft: 0
          })
        }

        // Fetch withdrawal requests
        const withdrawalsRes = await fetch(`/api/pool/withdraw?wallet=${publicKey.toString()}`)
        const withdrawalsData = await withdrawalsRes.json()

        if (withdrawalsData.success) {
          setWithdrawalRequests(withdrawalsData.withdrawalRequests || [])
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (publicKey) {
      fetchUserData()
      const interval = setInterval(fetchUserData, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [publicKey])

  // Handle withdrawal request
  const handleWithdrawalRequest = async () => {
    if (!publicKey || !withdrawalAmount || parseFloat(withdrawalAmount) <= 0) return

    setIsRequestingWithdrawal(true)
    setWithdrawalStatus(null)

    try {
      const response = await fetch('/api/pool/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          amount: parseFloat(withdrawalAmount)
        })
      })

      const data = await response.json()

      if (data.success) {
        setWithdrawalStatus('success')
        setShowWithdrawalModal(false)
        setWithdrawalAmount('')
        // Refresh data
        const withdrawalsRes = await fetch(`/api/pool/withdraw?wallet=${publicKey.toString()}`)
        const withdrawalsData = await withdrawalsRes.json()
        if (withdrawalsData.success) {
          setWithdrawalRequests(withdrawalsData.withdrawalRequests || [])
        }
      } else {
        setWithdrawalStatus('error')
        console.error('Withdrawal request failed:', data.error)
      }
    } catch (error) {
      console.error('Withdrawal request error:', error)
      setWithdrawalStatus('error')
    } finally {
      setIsRequestingWithdrawal(false)
    }
  }

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Calculate days until withdrawal
  const daysUntilWithdrawal = (requestDate) => {
    const request = new Date(requestDate)
    const available = new Date(request)
    available.setDate(available.getDate() + 7)
    const now = new Date()
    const days = Math.ceil((available - now) / (1000 * 60 * 60 * 24))
    return Math.max(0, days)
  }

  // Show loading while mounting or connecting
  if (!mounted || connecting) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">
            {connecting ? 'Connecting wallet...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  // Show connect wallet message if not connected
  if (!connected || !publicKey) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="border-b border-gray-900">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold">Your Dashboard</h1>
            <p className="text-gray-400 mt-1">Track your earnings and manage withdrawals</p>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <LayoutDashboard className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-6">
              Connect your wallet to view your deposits, earnings, and manage withdrawals.
            </p>
            <button
              onClick={() => router.push('/stake')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold hover:shadow-lg hover:shadow-purple-500/20 transition-all"
            >
              Go to Stake Page
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show loading while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const availableToWithdraw = summary.totalDeposited -
    withdrawalRequests
      .filter(r => r.status === 'pending' || r.status === 'approved')
      .reduce((sum, r) => sum + parseFloat(r.amount), 0)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Your Dashboard</h1>
              <p className="text-gray-400 mt-1">Track your earnings and manage withdrawals</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Connected:</span>
              <span className="font-mono text-sm">
                {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Deposited */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-6 h-6 text-blue-400" />
              <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-1 rounded">DEPOSITED</span>
            </div>
            <div className="text-3xl font-bold mb-1">
              ${summary.totalDeposited.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Total Investment</div>
          </motion.div>

          {/* Current Value */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <span className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded">CURRENT</span>
            </div>
            <div className="text-3xl font-bold mb-1">
              ${(summary.totalDeposited + summary.totalEarned).toLocaleString()}
            </div>
            <div className="text-sm text-green-400">
              +${summary.totalEarned.toLocaleString()} earned
            </div>
          </motion.div>

          {/* Weekly Earnings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-6 h-6 text-purple-400" />
              <span className="text-xs text-purple-400 bg-purple-900/30 px-2 py-1 rounded">WEEKLY</span>
            </div>
            <div className="text-3xl font-bold mb-1">
              ${summary.weeklyEarnings.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Expected This Week</div>
          </motion.div>

          {/* RFT Balance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/30"
          >
            <div className="flex items-center justify-between mb-4">
              <Coins className="w-6 h-6 text-yellow-400" />
              <span className="text-xs text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded">TOKENS</span>
            </div>
            <div className="text-3xl font-bold mb-1">
              {summary.totalRft.toLocaleString()}
            </div>
            <div className="text-sm text-yellow-400">
              +{summary.weeklyRft.toLocaleString()} RFT/week
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Deposits List */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800">
                <h2 className="text-xl font-bold">Your Deposits</h2>
              </div>

              <div className="divide-y divide-gray-800">
                {deposits.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500">
                    No deposits yet. Start earning 2% weekly!
                  </div>
                ) : (
                  deposits.map((deposit) => (
                    <div key={deposit.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-lg">
                            ${parseFloat(deposit.amount).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-400">
                            Deposited {formatDate(deposit.deposited_at)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-green-400">
                            +${parseFloat(deposit.total_earned_usdc || 0).toLocaleString()} earned
                          </div>
                          {deposit.has_early_bonus && (
                            <div className="text-xs text-yellow-400">
                              🎁 1.5x RFT Bonus
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Withdrawal Section */}
          <div className="space-y-6">
            {/* Request Withdrawal */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                <LogOut className="w-5 h-5" />
                Withdraw Funds
              </h2>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Available to withdraw</div>
                  <div className="text-2xl font-bold">
                    ${availableToWithdraw.toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={() => setShowWithdrawalModal(true)}
                  disabled={availableToWithdraw <= 0}
                  className="w-full px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg font-bold hover:shadow-lg hover:shadow-orange-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Request Withdrawal
                </button>

                <div className="text-xs text-gray-500">
                  <Clock className="w-3 h-3 inline mr-1" />
                  7-day processing period applies
                </div>
              </div>
            </div>

            {/* Pending Withdrawals */}
            {withdrawalRequests.length > 0 && (
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-bold mb-4">Withdrawal Requests</h3>

                <div className="space-y-3">
                  {withdrawalRequests.map((request) => (
                    <div key={request.id} className="p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold">
                          ${parseFloat(request.amount).toLocaleString()}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          request.status === 'completed'
                            ? 'bg-green-900/30 text-green-400'
                            : request.status === 'approved'
                            ? 'bg-blue-900/30 text-blue-400'
                            : 'bg-yellow-900/30 text-yellow-400'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {request.status === 'pending' && (
                          <>Ready in {daysUntilWithdrawal(request.requested_at)} days</>
                        )}
                        {request.status === 'approved' && (
                          <>Ready to process</>
                        )}
                        {request.status === 'completed' && (
                          <>Completed {formatDate(request.processed_at)}</>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Note */}
            <div className="bg-blue-900/20 rounded-xl p-4 border border-blue-500/30">
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-300 font-bold mb-1">Secure Withdrawals</p>
                  <p className="text-xs text-blue-200">
                    7-day waiting period ensures pool stability and protects all depositors
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Withdrawal Modal */}
        <AnimatePresence>
          {showWithdrawalModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowWithdrawalModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-800"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold mb-4">Request Withdrawal</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Amount to Withdraw</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-500">$</span>
                      <input
                        type="number"
                        value={withdrawalAmount}
                        onChange={(e) => setWithdrawalAmount(e.target.value)}
                        max={availableToWithdraw}
                        className="w-full bg-black border-2 border-gray-800 rounded-lg pl-10 pr-4 py-3 text-xl font-bold focus:outline-none focus:border-purple-500"
                        placeholder="0"
                      />
                      <button
                        onClick={() => setWithdrawalAmount(availableToWithdraw.toString())}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-purple-400 hover:text-purple-300 px-2 py-1 bg-purple-900/30 rounded"
                      >
                        MAX
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Available: ${availableToWithdraw.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-3">
                    <div className="flex gap-2">
                      <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                      <div className="text-sm text-orange-300">
                        <p className="font-bold mb-1">7-Day Waiting Period</p>
                        <p className="text-xs">
                          Your withdrawal will be available for processing 7 days after this request.
                          This protects the pool's stability.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowWithdrawalModal(false)}
                      className="flex-1 px-4 py-3 bg-gray-800 rounded-lg font-bold hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleWithdrawalRequest}
                      disabled={
                        !withdrawalAmount ||
                        parseFloat(withdrawalAmount) <= 0 ||
                        parseFloat(withdrawalAmount) > availableToWithdraw ||
                        isRequestingWithdrawal
                      }
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg font-bold hover:shadow-lg hover:shadow-orange-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isRequestingWithdrawal ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Confirm Request
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Messages */}
        {withdrawalStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 p-4 bg-green-900/90 border border-green-500 rounded-lg flex items-center gap-3 max-w-md"
          >
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div>
              <p className="font-bold text-green-400">Withdrawal Requested</p>
              <p className="text-sm text-green-300">Available for processing in 7 days</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}