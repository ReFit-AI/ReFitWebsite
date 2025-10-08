'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import {
  Transaction,
  SystemProgram,
  PublicKey,
  ComputeBudgetProgram,
  TransactionMessage,
  VersionedTransaction
} from '@solana/web3.js'
import { ArrowRight, Zap, Clock, DollarSign, Coins, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { SQUADS_CONFIG, formatVaultAddress } from '@/lib/squads'

export default function StakePage() {
  const [amount, setAmount] = useState('1000')
  const { connected, publicKey, signTransaction } = useWallet()
  const { connection } = useConnection()
  const [bonusSlotsRemaining, setBonusSlotsRemaining] = useState(100)
  const [isDepositing, setIsDepositing] = useState(false)
  const [depositStatus, setDepositStatus] = useState(null) // 'success', 'error', or null
  const [errorMessage, setErrorMessage] = useState('')

  // Fetch real bonus slots remaining
  useEffect(() => {
    const fetchPoolStats = async () => {
      try {
        const res = await fetch('/api/pool/deposit')
        const data = await res.json()
        if (data.success && data.pool) {
          setBonusSlotsRemaining(data.pool.rft_bonus_remaining || 0)
        }
      } catch (error) {
        console.error('Failed to fetch pool stats:', error)
      }
    }

    fetchPoolStats()
    // Refresh every 30 seconds
    const interval = setInterval(fetchPoolStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const value = Math.max(0, parseFloat(amount) || 0)
  const weeklyReturn = value * 0.02 // 2% weekly
  const annualReturn = value * 1.04 // 104% annual
  const rftPerWeek = value // 1 RFT per $1 per week
  const rftAtLaunch = rftPerWeek * 24 // 6 months of accumulation

  // Handle deposit
  const handleDeposit = async () => {
    if (!publicKey || !signTransaction || value < 1000) return

    setIsDepositing(true)
    setDepositStatus(null)
    setErrorMessage('')

    let txid = null

    try {
      console.log('Starting deposit transaction...')

      const vaultPubkey = SQUADS_CONFIG.vaultAddress === 'YOUR_SQUADS_VAULT_ADDRESS'
        ? new PublicKey('11111111111111111111111111111111') // System program for testing
        : new PublicKey(SQUADS_CONFIG.vaultAddress)

      // Get latest blockhash with confirmed commitment
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
      console.log('Got blockhash:', blockhash)

      // Create instructions array
      const instructions = []

      // Add compute budget to make transaction unique and prioritize it
      instructions.push(
        ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: 1000 // Small priority fee
        })
      )

      // Add unique memo with timestamp to ensure uniqueness
      const memoProgram = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr')
      const timestamp = Date.now()
      const uniqueId = Math.random().toString(36).substring(2, 15)
      const memo = `ReFit-${timestamp}-${uniqueId}`

      instructions.push({
        keys: [],
        programId: memoProgram,
        data: Buffer.from(memo, 'utf-8')
      })

      // Add the transfer instruction (simulating USDC)
      instructions.push(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: vaultPubkey,
          lamports: Math.floor(value * 1000000) // 6 decimals like USDC
        })
      )

      // Create transaction
      const transaction = new Transaction()
      transaction.add(...instructions)
      transaction.recentBlockhash = blockhash
      transaction.lastValidBlockHeight = lastValidBlockHeight
      transaction.feePayer = publicKey

      console.log('Transaction created, requesting signature...')

      // Sign transaction
      const signed = await signTransaction(transaction)

      console.log('Transaction signed, sending to network...')

      // Send transaction with proper settings
      txid = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false, // Enable preflight for better error messages
        preflightCommitment: 'confirmed',
        maxRetries: 2
      })

      console.log('Transaction sent:', txid)

      // Wait for confirmation
      console.log('Waiting for confirmation...')
      const confirmation = await connection.confirmTransaction({
        signature: txid,
        blockhash: blockhash,
        lastValidBlockHeight: lastValidBlockHeight
      }, 'confirmed')

      if (confirmation.value.err) {
        console.error('Transaction failed:', confirmation.value.err)
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`)
      }

      console.log('Transaction confirmed successfully!')

      // Verify transaction details before recording deposit
      const txDetails = await connection.getTransaction(txid, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0
      })

      if (!txDetails) {
        throw new Error('Transaction not found')
      }

      // Record deposit in our backend
      const response = await fetch('/api/pool/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          amount: value,
          txSignature: txid
        })
      })

      const data = await response.json()

      if (data.success) {
        setDepositStatus('success')
        // Reset amount after successful deposit
        setTimeout(() => {
          setAmount('1000')
          setDepositStatus(null)
        }, 5000)
      } else {
        throw new Error(data.error || 'Deposit failed')
      }
    } catch (error) {
      console.error('Deposit error:', error)
      setDepositStatus('error')

      // Parse error and provide helpful messages
      let userMessage = 'Failed to process deposit'

      if (error.message?.includes('User rejected') || error.message?.includes('cancelled')) {
        userMessage = 'Transaction cancelled by user'
      } else if (error.message?.includes('insufficient')) {
        userMessage = 'Insufficient SOL balance for transaction fees'
      } else if (error.message?.includes('blockhash not found')) {
        userMessage = 'Network congestion - please try again'
      } else if (error.message?.includes('already been processed')) {
        userMessage = 'Duplicate transaction detected - please wait and try again'
      } else if (error.message?.includes('failed to confirm')) {
        userMessage = 'Transaction timed out - check your wallet or try again'
      } else if (error.message?.includes('0x1')) {
        userMessage = 'Insufficient funds in wallet'
      } else if (error.message) {
        // Show the actual error message if it's informative
        userMessage = error.message.length > 100
          ? error.message.substring(0, 100) + '...'
          : error.message
      }

      setErrorMessage(userMessage)

      // Log detailed error for debugging
      console.error('Full error details:', {
        message: error.message,
        stack: error.stack,
        txid: txid
      })
    } finally {
      setIsDepositing(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-green-900/20" />

        <div className="relative max-w-4xl mx-auto px-4 pt-32 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {/* Early Bird Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-full mb-8"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-bold text-yellow-400">
                EARLY ACCESS BONUS ACTIVE
              </span>
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                2% Weekly Returns
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-2xl md:text-3xl text-gray-400 mb-2">
              From real phone arbitrage profits
            </p>
            <p className="text-lg text-gray-500">
              Plus earn RFT tokens for early supporters
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 pb-20">
        {/* The Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-b from-gray-900 to-black rounded-3xl p-8 md:p-12 border border-gray-800 mb-12"
        >
          {/* Amount Input */}
          <div className="mb-12">
            <label className="block text-sm text-gray-500 mb-4">Investment Amount</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-4xl text-gray-600">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value
                  if (val === '' || (!isNaN(val) && parseFloat(val) >= 0)) {
                    setAmount(val)
                  }
                }}
                min="1000"
                step="500"
                className="w-full bg-black border-2 border-gray-800 rounded-2xl pl-16 pr-6 py-6 text-5xl font-bold focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="1000"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                min $1,000
              </div>
            </div>
          </div>

          {/* Returns Display */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* USDC Returns */}
            <div className="bg-black/50 rounded-2xl p-6 border border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-green-400" />
                <span className="text-sm text-gray-400">USDC RETURNS</span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-3xl font-bold text-white">
                    ${weeklyReturn.toFixed(0)}<span className="text-lg text-gray-500">/week</span>
                  </div>
                  <div className="text-sm text-gray-500">2% weekly yield</div>
                </div>

                <div className="pt-3 border-t border-gray-800">
                  <div className="text-xl font-semibold text-gray-300">
                    ${annualReturn.toFixed(0)}<span className="text-sm text-gray-500">/year</span>
                  </div>
                  <div className="text-sm text-gray-500">104% APY</div>
                </div>
              </div>
            </div>

            {/* RFT Rewards */}
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/30">
              <div className="flex items-center gap-2 mb-4">
                <Coins className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-purple-300">RFT BONUS</span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-3xl font-bold text-purple-300">
                    {rftPerWeek.toLocaleString()}<span className="text-lg text-purple-400"> RFT/week</span>
                  </div>
                  <div className="text-sm text-purple-400">Token rewards</div>
                </div>

                <div className="pt-3 border-t border-purple-800/50">
                  <div className="text-xl font-semibold text-purple-300">
                    {rftAtLaunch.toLocaleString()}<span className="text-sm text-purple-400"> RFT</span>
                  </div>
                  <div className="text-sm text-purple-400">At token launch (6mo)</div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          {connected ? (
            <button
              onClick={handleDeposit}
              disabled={value < 1000 || isDepositing || depositStatus === 'success'}
              className="w-full flex items-center justify-center gap-3 px-8 py-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-xl font-bold hover:shadow-2xl hover:shadow-purple-500/50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDepositing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Deposit ${value.toFixed(0)} USDC
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          ) : (
            <button className="w-full px-8 py-6 bg-gray-800 rounded-2xl text-xl font-bold text-gray-400 cursor-not-allowed">
              Connect Wallet to Continue
            </button>
          )}

          {/* Status Messages */}
          {depositStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-green-900/30 border border-green-500/50 rounded-xl flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <p className="font-bold text-green-400">Deposit Successful!</p>
                <p className="text-sm text-green-300">You'll earn ${weeklyReturn.toFixed(0)}/week + {rftPerWeek} RFT</p>
              </div>
            </motion.div>
          )}

          {depositStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-900/30 border border-red-500/50 rounded-xl flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div>
                <p className="font-bold text-red-400">Deposit Failed</p>
                <p className="text-sm text-red-300">{errorMessage}</p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Trust Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-2xl p-8 border border-blue-500/30">
            <h2 className="text-2xl font-bold mb-6">How It Works</h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="text-4xl font-bold text-blue-400 mb-2">1.</div>
                <h3 className="font-bold mb-2">You Deposit USDC</h3>
                <p className="text-sm text-gray-400">
                  Add liquidity to our phone arbitrage pool
                </p>
              </div>

              <div>
                <div className="text-4xl font-bold text-blue-400 mb-2">2.</div>
                <h3 className="font-bold mb-2">We Buy & Flip Phones</h3>
                <p className="text-sm text-gray-400">
                  10-20% margins, same-day wholesale liquidation
                </p>
              </div>

              <div>
                <div className="text-4xl font-bold text-blue-400 mb-2">3.</div>
                <h3 className="font-bold mb-2">You Earn 2% Weekly</h3>
                <p className="text-sm text-gray-400">
                  Plus RFT tokens for being an early supporter
                </p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-black/30 rounded-xl">
              <p className="text-sm text-gray-300">
                <span className="font-bold text-white">Proven Track Record:</span> $2.3M in phone trading revenue.
                We buy phones from consumers at market rate, sell to wholesale buyers same-day at 10-20% markup.
                You get 2% weekly from these profits. Simple, transparent, profitable.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Early Bird Spots */}
        {bonusSlotsRemaining > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-xl border border-yellow-500/30">
              <Zap className="w-5 h-5 text-yellow-400" />
              <div>
                <span className="text-2xl font-bold text-yellow-400">{bonusSlotsRemaining}</span>
                <span className="text-sm text-yellow-300 ml-2">Early Bird Spots Left</span>
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              First 100 depositors earn 1.5x RFT tokens. {bonusSlotsRemaining} remaining.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}