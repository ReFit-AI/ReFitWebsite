'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  ArrowLeft,
  Lock,
  Unlock,
  TrendingUp,
  Award,
  Info,
  Calculator,
  Users,
  Coins,
  ChevronRight,
  Star,
  Zap,
  Shield,
  Clock,
  DollarSign,
  ChevronDown,
  AlertCircle,
  BarChart3,
  Sparkles
} from 'lucide-react'

// RFT TOKENOMICS
const RFT_TOKENOMICS = {
  totalSupply: 1_000_000_000,
  stakingRewards: 350_000_000,
  yearlyEmissions: {
    1: 100_000_000,
    2: 80_000_000,
    3: 60_000_000,
    4: 50_000_000,
    5: 40_000_000,
    6: 20_000_000,
  },
  initialPrice: 0.001,
  targetPrice: {
    conservative: 0.005,
    expected: 0.01,
    optimistic: 0.05,
  }
}

const STAKING_TIERS = {
  flex: {
    name: "Flex",
    lockPeriod: "No lock",
    lockDays: 0,
    solAPY: 5.0,
    rftMultiplier: 1,
    color: "gray",
    icon: Unlock,
    description: "Full flexibility, withdraw anytime",
    targetAudience: "For cautious stakers"
  },
  bronze: {
    name: "Bronze",
    lockPeriod: "6 months",
    lockDays: 180,
    solAPY: 5.5,
    rftMultiplier: 1.5,
    color: "orange",
    icon: Shield,
    description: "Short commitment, decent rewards",
    targetAudience: "Testing the waters"
  },
  silver: {
    name: "Silver", 
    lockPeriod: "1 year",
    lockDays: 365,
    solAPY: 6.0,
    rftMultiplier: 2.5,
    color: "slate",
    icon: Clock,
    description: "Balanced risk and reward",
    targetAudience: "Smart middle ground"
  },
  gold: {
    name: "Gold",
    lockPeriod: "2 years",
    lockDays: 730,
    solAPY: 6.5,
    rftMultiplier: 4,
    color: "yellow",
    icon: Star,
    description: "Premium rewards for commitment",
    targetAudience: "Recommended for most",
    popular: true
  },
  platinum: {
    name: "Platinum",
    lockPeriod: "3 years",
    lockDays: 1095,
    solAPY: 7.0,
    rftMultiplier: 6,
    color: "purple",
    icon: Award,
    description: "Elite tier for believers",
    targetAudience: "Long-term thinkers"
  },
  diamond: {
    name: "Diamond",
    lockPeriod: "4 years",
    lockDays: 1460,
    solAPY: 7.5,
    rftMultiplier: 10,
    color: "blue",
    icon: Zap,
    description: "Maximum rewards, founding member status",
    targetAudience: "True believers",
    founding: true
  }
}

export default function StakePage() {
  const [selectedTier, setSelectedTier] = useState('gold')
  const [tradeValue, setTradeValue] = useState(600)
  const [showTokenomics, setShowTokenomics] = useState(false)
  const [rftPriceScenario, setRftPriceScenario] = useState('expected')
  const [totalStakedPlatform] = useState(100000)
  
  // Calculate user's share of RFT emissions
  const calculateRFTRewards = (stakedAmount, tier, year = 1) => {
    const userShareOfPlatform = stakedAmount / totalStakedPlatform
    const yearlyEmissions = RFT_TOKENOMICS.yearlyEmissions[year] || 20_000_000
    const baseRFT = yearlyEmissions * userShareOfPlatform
    const tierMultiplier = STAKING_TIERS[tier].rftMultiplier
    const adjustedRFT = baseRFT * tierMultiplier
    const maxRFT = yearlyEmissions * 0.01
    return Math.min(adjustedRFT, maxRFT)
  }
  
  // Calculate all rewards for selected tier
  const calculateRewards = () => {
    const tier = STAKING_TIERS[selectedTier]
    const solYearly = tradeValue * (tier.solAPY / 100)
    const rftYearly = calculateRFTRewards(tradeValue, selectedTier)
    const rftPrice = RFT_TOKENOMICS.targetPrice[rftPriceScenario]
    const rftValueYearly = rftYearly * rftPrice
    const totalYearlyValue = solYearly + rftValueYearly
    const effectiveAPR = (totalYearlyValue / tradeValue) * 100
    
    return {
      solYearly,
      rftYearly,
      rftPrice,
      rftValueYearly,
      totalYearlyValue,
      effectiveAPR,
      timeToSaga: 450 / totalYearlyValue,
      timeToSeeker: 350 / totalYearlyValue,
      timeToiPhone: 1000 / totalYearlyValue
    }
  }
  
  const rewards = calculateRewards()
  
  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500 rounded-full">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-bold text-yellow-400">1 BILLION RFT TOKENS</span>
              <span className="text-sm text-yellow-300">First 100 users get bonus APY</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold">
              <span className="bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
                Staking Tiers & Rewards
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Turn your device trade-in into perpetual rewards. Lock longer for higher returns 
              or stay flexible with instant access. Earn up to 1000% APR as an early staker.
            </p>
          </div>
        </motion.div>

        {/* Trade Value Input */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900 rounded-xl p-6 max-w-2xl mx-auto mb-8"
        >
          <label className="block text-sm text-gray-400 mb-2">Your Device Trade-In Value</label>
          <select 
            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3"
            value={tradeValue}
            onChange={(e) => setTradeValue(Number(e.target.value))}
          >
            <option value="200">Solana Saga - $200</option>
            <option value="350">Samsung S23 - $350</option>
            <option value="450">iPhone 13 Pro - $450</option>
            <option value="600">iPhone 14 Pro - $600</option>
            <option value="900">iPhone 15 Pro - $900</option>
            <option value="1500">Multiple Devices - $1,500</option>
            <option value="3000">Family Bundle - $3,000</option>
          </select>
        </motion.div>

        {/* Tier Selection Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
        >
          {Object.entries(STAKING_TIERS).map(([key, tier]) => {
            const isSelected = key === selectedTier
            const Icon = tier.icon
            const tierRewards = {
              sol: tradeValue * (tier.solAPY / 100),
              rft: calculateRFTRewards(tradeValue, key),
            }
            const rftValue = tierRewards.rft * RFT_TOKENOMICS.targetPrice[rftPriceScenario]
            const totalValue = tierRewards.sol + rftValue
            
            return (
              <div
                key={key}
                onClick={() => setSelectedTier(key)}
                className={`
                  relative p-6 rounded-xl border-2 cursor-pointer transition-all
                  ${isSelected 
                    ? 'border-purple-500 bg-purple-900/30 scale-105' 
                    : 'border-gray-700 hover:border-gray-600 bg-gray-900/50'
                  }
                `}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                
                {tier.founding && (
                  <div className="absolute -top-3 right-4">
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold rounded-full">
                      FOUNDING MEMBER
                    </span>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-purple-400" />
                        <h3 className="text-xl font-bold">{tier.name}</h3>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{tier.lockPeriod}</p>
                    </div>
                    
                    {tier.lockDays === 0 ? (
                      <Unlock className="w-4 h-4 text-green-400" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">SOL APY:</span>
                      <span className="font-semibold">{tier.solAPY}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">RFT Multiplier:</span>
                      <span className="font-semibold text-purple-400">{tier.rftMultiplier}x</span>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-700">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        ${totalValue.toFixed(0)}/year
                      </div>
                      <div className="text-xs text-gray-500">
                        Combined rewards
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-400 italic">{tier.targetAudience}</p>
                </div>
              </div>
            )
          })}
        </motion.div>

        {/* Detailed Rewards Breakdown */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-purple-900/30 to-green-900/30 rounded-2xl p-8 border border-gray-700 mb-8"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            Your {STAKING_TIERS[selectedTier].name} Tier Rewards
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-300">Annual Earnings</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
                  <span className="text-gray-400">SOL Staking ({STAKING_TIERS[selectedTier].solAPY}% APY)</span>
                  <span className="font-bold text-white">${rewards.solYearly.toFixed(0)}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
                  <span className="text-gray-400">RFT Tokens</span>
                  <span className="font-bold text-purple-400">{rewards.rftYearly.toLocaleString()} RFT</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">RFT Value</span>
                    <select 
                      className="bg-black border border-gray-700 rounded px-2 py-1 text-xs"
                      value={rftPriceScenario}
                      onChange={(e) => setRftPriceScenario(e.target.value)}
                    >
                      <option value="conservative">@$0.005</option>
                      <option value="expected">@$0.01</option>
                      <option value="optimistic">@$0.05</option>
                    </select>
                  </div>
                  <span className="font-bold text-purple-400">${rewards.rftValueYearly.toFixed(0)}</span>
                </div>
                
                <div className="border-t border-gray-700 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Annual Value</span>
                    <span className="text-2xl font-bold text-green-400">${rewards.totalYearlyValue.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-500">Effective APR</span>
                    <span className="text-lg font-bold text-green-400">{rewards.effectiveAPR.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-300">Time to Free Upgrade</h3>
              
              <div className="space-y-3">
                <div className="p-4 bg-black/30 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-400">Solana Seeker ($350)</div>
                      <div className="text-xs text-gray-500">Entry Web3 phone</div>
                    </div>
                    <div className="text-xl font-bold text-green-400">
                      {rewards.timeToSeeker < 10 ? `${rewards.timeToSeeker.toFixed(1)} years` : 'Too long'}
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-gray-800 rounded-full h-2">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-green-500 rounded-full"
                      style={{ width: `${Math.min(100, (100 / rewards.timeToSeeker))}%` }}
                    />
                  </div>
                </div>
                
                <div className="p-4 bg-black/30 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-400">Solana Saga ($450)</div>
                      <div className="text-xs text-gray-500">Premium Web3 phone</div>
                    </div>
                    <div className="text-xl font-bold text-yellow-400">
                      {rewards.timeToSaga < 10 ? `${rewards.timeToSaga.toFixed(1)} years` : 'Too long'}
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-gray-800 rounded-full h-2">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-yellow-500 rounded-full"
                      style={{ width: `${Math.min(100, (100 / rewards.timeToSaga))}%` }}
                    />
                  </div>
                </div>
                
                <div className="p-4 bg-black/30 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-400">iPhone 16 Pro ($1000)</div>
                      <div className="text-xs text-gray-500">Latest flagship</div>
                    </div>
                    <div className="text-xl font-bold text-blue-400">
                      {rewards.timeToiPhone < 15 ? `${rewards.timeToiPhone.toFixed(1)} years` : 'Too long'}
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-gray-800 rounded-full h-2">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                      style={{ width: `${Math.min(100, (100 / rewards.timeToiPhone))}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Early Adopter Bonus Notice */}
          <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <h4 className="font-bold text-yellow-400 mb-1">Early Adopter Advantage</h4>
                <p className="text-sm text-gray-300">
                  Year 1 stakers share 100M RFT tokens (28% of total rewards). 
                  As more users join, individual rewards decrease. 
                  Lock in your tier now for maximum returns.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tokenomics Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-900 rounded-xl p-6 mb-8"
        >
          <button
            onClick={() => setShowTokenomics(!showTokenomics)}
            className="w-full flex items-center justify-between text-left"
          >
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Info className="w-5 h-5" />
              RFT Tokenomics & Sustainability
            </h3>
            <ChevronDown className={`w-5 h-5 transition-transform ${showTokenomics ? 'rotate-180' : ''}`} />
          </button>
          
          {showTokenomics && (
            <div className="mt-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-purple-400">Token Distribution (1B RFT)</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Staking Rewards</span>
                      <span>350M (35%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Team (4yr vest)</span>
                      <span>150M (15%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Treasury</span>
                      <span>200M (20%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Liquidity</span>
                      <span>100M (10%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Community</span>
                      <span>100M (10%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Investors</span>
                      <span>100M (10%)</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 text-green-400">Emission Schedule</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Year 1</span>
                      <span className="text-green-400 font-bold">100M RFT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Year 2</span>
                      <span>80M RFT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Year 3</span>
                      <span>60M RFT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Year 4</span>
                      <span>50M RFT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Year 5</span>
                      <span>40M RFT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Year 6+</span>
                      <span>20M RFT/year</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <h4 className="font-semibold mb-2 text-blue-400">Long-Term Sustainability</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Decreasing emissions prevent inflation - early stakers benefit most</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Revenue sharing: 20% of platform fees buy back and burn RFT</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Utility growth: RFT for governance, fee discounts, and device purchases</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Network effect: More devices traded = higher validator yield = more value</span>
                  </li>
                </ul>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">$0.001</div>
                  <div className="text-xs text-gray-500">Launch Price</div>
                </div>
                <div className="p-4 bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">$0.01</div>
                  <div className="text-xs text-gray-500">Target Year 1</div>
                </div>
                <div className="p-4 bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">$0.05+</div>
                  <div className="text-xs text-gray-500">Potential Year 2</div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Risk Disclosure */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 mb-8"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <h3 className="font-bold mb-2">Important Information</h3>
              <ul className="space-y-1 text-sm text-gray-400">
                <li>• Staking yields are variable and depend on network conditions</li>
                <li>• RFT token value may fluctuate significantly</li>
                <li>• Past performance does not guarantee future returns</li>
                <li>• Lock periods cannot be broken without penalties</li>
                <li>• This is not financial advice - do your own research</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center space-y-4 py-8 mb-16"
        >
          <h2 className="text-3xl font-bold">
            Ready to lock in your tier?
          </h2>
          <p className="text-gray-400">
            {selectedTier === 'flex' 
              ? "Start with flexibility. Upgrade your tier anytime."
              : selectedTier === 'diamond'
              ? "Maximum commitment, maximum rewards. Become a founding member."
              : "Lock for " + STAKING_TIERS[selectedTier].lockPeriod + " and earn " + rewards.effectiveAPR.toFixed(0) + "% APR"
            }
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/sell"
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold hover:from-purple-500 hover:to-pink-500 transition-all"
            >
              Start {STAKING_TIERS[selectedTier].name} Staking
            </Link>
            <button className="px-8 py-3 bg-gray-800 border border-gray-700 rounded-lg font-bold hover:bg-gray-700 transition-all">
              Download Whitepaper
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}