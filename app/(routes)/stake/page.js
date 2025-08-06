'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  ArrowLeft,
  Unlock,
  Award,
  Star,
  Zap,
  TrendingUp,
  Gift,
  Sparkles,
  Coins,
  Info,
  ChevronRight
} from 'lucide-react'

// RFT Token Emissions & Pricing
const RFT_TOKENOMICS = {
  communityRewards: 400_000_000, // 40% of 1B supply for staking
  yearlyEmissions: [
    100_000_000, // Year 1
    80_000_000,  // Year 2
    60_000_000,  // Year 3
    50_000_000,  // Year 4
    40_000_000,  // Year 5
    70_000_000,  // Remaining years
  ],
  currentPrice: 0.001,
  projectedPrices: {
    conservative: 0.005,
    expected: 0.01,
    optimistic: 0.05
  }
}

// Simplified staking options with RFT rewards
const STAKING_TIERS = {
  flex: {
    name: "Flexible",
    lockPeriod: "No lock",
    lockDays: 0,
    baseAPY: 15, // SOL/USDC returns
    rftAPR: 50,  // RFT token rewards APR
    rftMultiplier: 1,
    color: "green",
    icon: Unlock,
    description: "Withdraw anytime, earn while you wait",
    benefits: [
      "15% base APY + RFT tokens",
      "Instant withdrawals",
      "No commitment required",
      "~50% total APR with RFT"
    ]
  },
  smart: {
    name: "Smart Lock",
    lockPeriod: "6 months",
    lockDays: 180,
    baseAPY: 25,
    rftAPR: 150,
    rftMultiplier: 3,
    color: "purple",
    icon: Star,
    description: "Lock for 6 months, earn premium rewards",
    benefits: [
      "25% base APY + 3x RFT tokens",
      "Early adopter bonus",
      "Priority support",
      "~150% total APR with RFT"
    ],
    popular: true
  },
  diamond: {
    name: "Diamond Hands",
    lockPeriod: "12 months",
    lockDays: 365,
    baseAPY: 35,
    rftAPR: 250,
    rftMultiplier: 5,
    color: "yellow",
    icon: Zap,
    description: "Maximum rewards for true believers",
    benefits: [
      "35% base APY + 5x RFT tokens",
      "Founding member status",
      "Governance rights",
      "~250% total APR with RFT"
    ]
  }
}

export default function StakePage() {
  const [selectedTier, setSelectedTier] = useState('smart')
  const [tradeValue, setTradeValue] = useState(600)
  const [customValue, setCustomValue] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const [rftPriceScenario, setRftPriceScenario] = useState('expected')
  const [showRftDetails, setShowRftDetails] = useState(false)
  
  const actualValue = useCustom && customValue ? Number(customValue) : tradeValue
  
  // Enhanced calculations with RFT rewards
  const calculateRewards = () => {
    const tier = STAKING_TIERS[selectedTier]
    
    // Base rewards (SOL/USDC)
    const baseYearly = actualValue * (tier.baseAPY / 100)
    const baseMonthly = baseYearly / 12
    const baseDaily = baseYearly / 365
    
    // RFT token rewards calculation
    // Simplified: User gets a share of yearly emissions based on their stake
    const totalPlatformStake = 10_000_000 // Estimated $10M TVL
    const userShareOfPool = actualValue / totalPlatformStake
    const yearlyEmissions = RFT_TOKENOMICS.yearlyEmissions[0] // First year
    const baseRftTokens = yearlyEmissions * userShareOfPool
    const rftTokensEarned = baseRftTokens * tier.rftMultiplier
    
    // RFT value calculations
    const rftPrice = RFT_TOKENOMICS.projectedPrices[rftPriceScenario]
    const rftValueYearly = rftTokensEarned * rftPrice
    const rftValueMonthly = rftValueYearly / 12
    const rftValueDaily = rftValueYearly / 365
    
    // Combined totals
    const totalYearly = baseYearly + rftValueYearly
    const totalMonthly = totalYearly / 12
    const totalDaily = totalYearly / 365
    
    // Effective APR
    const effectiveAPR = (totalYearly / actualValue) * 100
    
    // Time to upgrade calculations
    const timeToUpgrade = {
      budget: Math.ceil(200 / totalMonthly),
      mid: Math.ceil(500 / totalMonthly),
      premium: Math.ceil(1000 / totalMonthly)
    }
    
    return {
      base: {
        daily: baseDaily,
        monthly: baseMonthly,
        yearly: baseYearly
      },
      rft: {
        tokens: rftTokensEarned,
        price: rftPrice,
        daily: rftValueDaily,
        monthly: rftValueMonthly,
        yearly: rftValueYearly
      },
      total: {
        daily: totalDaily,
        monthly: totalMonthly,
        yearly: totalYearly
      },
      timeToUpgrade,
      effectiveAPR: effectiveAPR.toFixed(1)
    }
  }
  
  const rewards = calculateRewards()
  
  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-green-500/20 border border-yellow-500/50 rounded-full">
              <Gift className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-bold text-yellow-400">400M RFT REWARDS POOL</span>
              <span className="text-sm text-yellow-300">First 100 stakers get bonus</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold">
              <span className="bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
                Earn Up to {rewards.effectiveAPR}% APR
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Stake your phone&apos;s value and earn both stable returns PLUS RFT tokens from our 
              400M community rewards pool. Double or triple your earnings!
            </p>
            
            <button
              onClick={() => setShowRftDetails(!showRftDetails)}
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
            >
              <Info className="w-4 h-4" />
              <span className="text-sm">Learn about RFT rewards</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${showRftDetails ? 'rotate-90' : ''}`} />
            </button>
          </div>
        </motion.div>

        {/* RFT Info Box (Collapsible) */}
        {showRftDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-2xl p-6 mb-8 border border-purple-500/30"
          >
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Coins className="w-5 h-5 text-purple-400" />
              RFT Token Rewards Explained
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-400 mb-1">Community Pool</p>
                <p className="font-semibold">400M RFT tokens</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Year 1 Emissions</p>
                <p className="font-semibold">100M RFT</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Current Price</p>
                <p className="font-semibold">$0.001 (launch price)</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-4">
              RFT tokens are distributed proportionally to stakers. Lock longer for multiplied rewards!
              Token price projections: $0.005 (conservative) to $0.05 (optimistic) within 12 months.
            </p>
          </motion.div>
        )}

        {/* Value Input */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-2xl p-6 max-w-xl mx-auto mb-12 border border-purple-500/30"
        >
          <label className="block text-lg font-semibold mb-4">
            How much is your device worth?
          </label>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => { setTradeValue(350); setUseCustom(false) }}
              className={`p-3 rounded-lg border transition-all ${
                !useCustom && tradeValue === 350 
                  ? 'bg-purple-600 border-purple-500' 
                  : 'bg-gray-900 border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="font-semibold">$350</div>
              <div className="text-xs text-gray-400">Older iPhone</div>
            </button>
            
            <button
              onClick={() => { setTradeValue(600); setUseCustom(false) }}
              className={`p-3 rounded-lg border transition-all ${
                !useCustom && tradeValue === 600 
                  ? 'bg-purple-600 border-purple-500' 
                  : 'bg-gray-900 border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="font-semibold">$600</div>
              <div className="text-xs text-gray-400">iPhone 14 Pro</div>
            </button>
            
            <button
              onClick={() => { setTradeValue(900); setUseCustom(false) }}
              className={`p-3 rounded-lg border transition-all ${
                !useCustom && tradeValue === 900 
                  ? 'bg-purple-600 border-purple-500' 
                  : 'bg-gray-900 border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="font-semibold">$900</div>
              <div className="text-xs text-gray-400">iPhone 15 Pro</div>
            </button>
            
            <button
              onClick={() => { setUseCustom(true) }}
              className={`p-3 rounded-lg border transition-all ${
                useCustom 
                  ? 'bg-purple-600 border-purple-500' 
                  : 'bg-gray-900 border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="font-semibold">Custom</div>
              <div className="text-xs text-gray-400">Enter amount</div>
            </button>
          </div>
          
          {useCustom && (
            <input
              type="number"
              placeholder="Enter value in USD"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-lg"
            />
          )}
          
          <div className="mt-4 text-center">
            <div className="text-3xl font-bold text-white">
              ${actualValue}
            </div>
            <div className="text-sm text-gray-400">Staking Value</div>
          </div>
        </motion.div>

        {/* Tier Selection with RFT Rewards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          {Object.entries(STAKING_TIERS).map(([key, tier]) => {
            const isSelected = key === selectedTier
            const Icon = tier.icon
            
            return (
              <div
                key={key}
                onClick={() => setSelectedTier(key)}
                className={`
                  relative p-6 rounded-2xl cursor-pointer transition-all transform
                  ${isSelected 
                    ? 'border-2 border-purple-500 bg-gradient-to-b from-purple-900/40 to-purple-900/20 scale-105 shadow-2xl' 
                    : 'border border-gray-700 hover:border-gray-600 bg-gray-900/50 hover:scale-102'
                  }
                `}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-xs font-bold rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-purple-400" />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold">{tier.name}</h3>
                    <p className="text-sm text-gray-400">{tier.lockPeriod}</p>
                  </div>
                  
                  {/* Two-part APY display */}
                  <div className="space-y-3">
                    <div>
                      <div className="text-3xl font-bold text-white">
                        {tier.baseAPY}%
                      </div>
                      <div className="text-xs text-gray-400">Base APY</div>
                    </div>
                    
                    <div className="text-2xl font-bold">
                      <span className="text-purple-400">+</span>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-3 border border-purple-500/30">
                      <div className="flex items-center justify-center gap-1">
                        <Coins className="w-4 h-4 text-purple-400" />
                        <span className="text-lg font-bold text-purple-400">
                          {tier.rftMultiplier}x RFT
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        ~{tier.rftAPR}% APR value
                      </div>
                    </div>
                  </div>
                  
                  {/* Total earnings preview */}
                  <div className="bg-black/50 rounded-xl p-4">
                    <div className="text-sm text-gray-400 mb-1">Total yearly earnings</div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                      ${key === selectedTier ? rewards.total.yearly.toFixed(0) : (actualValue * (tier.baseAPY / 100) + (actualValue * tier.rftAPR / 100)).toFixed(0)}
                    </div>
                    <div className="text-sm text-gray-500">
                      ${key === selectedTier ? rewards.total.monthly.toFixed(0) : ((actualValue * (tier.baseAPY / 100) + (actualValue * tier.rftAPR / 100)) / 12).toFixed(0)}/month
                    </div>
                  </div>
                  
                  <ul className="space-y-2 text-left">
                    {tier.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </motion.div>

        {/* Enhanced Rewards Display with RFT */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-purple-900/30 to-green-900/30 rounded-3xl p-8 border border-purple-500/30 mb-12"
        >
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold">
              Your {STAKING_TIERS[selectedTier].name} Rewards Breakdown
            </h2>
            
            {/* Base Rewards */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-300">Base Staking Rewards</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-black/40 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">Daily</div>
                  <div className="text-2xl font-bold text-white">
                    ${rewards.base.daily.toFixed(2)}
                  </div>
                </div>
                <div className="bg-black/40 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">Monthly</div>
                  <div className="text-2xl font-bold text-white">
                    ${rewards.base.monthly.toFixed(0)}
                  </div>
                </div>
                <div className="bg-black/40 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">Yearly</div>
                  <div className="text-2xl font-bold text-white">
                    ${rewards.base.yearly.toFixed(0)}
                  </div>
                </div>
              </div>
            </div>
            
            {/* RFT Rewards */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-purple-300 flex items-center justify-center gap-2">
                <Coins className="w-5 h-5" />
                RFT Token Rewards
              </h3>
              <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-xl p-4 mb-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">RFT Earned/Year</div>
                    <div className="text-2xl font-bold text-purple-400">
                      {rewards.rft.tokens.toLocaleString()} RFT
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">RFT Price Scenario</div>
                    <select 
                      className="bg-black border border-gray-700 rounded px-3 py-1 text-sm"
                      value={rftPriceScenario}
                      onChange={(e) => setRftPriceScenario(e.target.value)}
                    >
                      <option value="conservative">Conservative ($0.005)</option>
                      <option value="expected">Expected ($0.01)</option>
                      <option value="optimistic">Optimistic ($0.05)</option>
                    </select>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">RFT Value/Year</div>
                    <div className="text-2xl font-bold text-purple-400">
                      ${rewards.rft.yearly.toFixed(0)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Combined Total */}
            <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-6 border border-green-500/30">
              <h3 className="text-lg font-semibold mb-3">Total Combined Earnings</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Daily Total</div>
                  <div className="text-3xl font-bold text-green-400">
                    ${rewards.total.daily.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Monthly Total</div>
                  <div className="text-3xl font-bold text-green-400">
                    ${rewards.total.monthly.toFixed(0)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Yearly Total</div>
                  <div className="text-3xl font-bold text-green-400">
                    ${rewards.total.yearly.toFixed(0)}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500 rounded-full">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-lg font-bold text-green-400">
                    {rewards.effectiveAPR}% Effective APR
                  </span>
                </div>
              </div>
            </div>
            
            {/* Time to Upgrade */}
            <div className="bg-gradient-to-r from-yellow-500/10 to-green-500/10 rounded-xl p-6 border border-yellow-500/30">
              <div className="flex items-center justify-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-semibold">Time to Next Upgrade</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {rewards.timeToUpgrade.budget} months
                  </div>
                  <div className="text-xs text-gray-400">Budget Phone ($200)</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {rewards.timeToUpgrade.mid} months
                  </div>
                  <div className="text-xs text-gray-400">Mid-Range ($500)</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {rewards.timeToUpgrade.premium} months
                  </div>
                  <div className="text-xs text-gray-400">Premium ($1000)</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center space-y-6 mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500 rounded-full">
            <Award className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-bold text-purple-400">
              {rewards.effectiveAPR}% APR = {STAKING_TIERS[selectedTier].baseAPY}% Base + {rewards.rft.tokens.toLocaleString()} RFT Tokens
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/sell"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl font-bold text-lg transition-all transform hover:scale-105"
            >
              Start Earning {rewards.effectiveAPR}% APR
            </Link>
            
            <Link 
              href="/tokenomics"
              className="inline-flex items-center px-8 py-4 bg-gray-800 border border-gray-700 hover:bg-gray-700 rounded-xl font-bold text-lg transition-all"
            >
              <Coins className="w-5 h-5 mr-2" />
              Learn About RFT
            </Link>
          </div>
          
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            Join the first 100 stakers to lock in maximum RFT rewards. 
            400M tokens reserved for community staking rewards.
          </p>
        </motion.div>
      </div>
    </div>
  )
}