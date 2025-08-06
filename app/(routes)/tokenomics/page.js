'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Coins, 
  TrendingUp, 
  Shield, 
  Zap, 
  Users, 
  Lock, 
  Flame,
  ArrowRight,
  ChevronDown,
  Sparkles,
  BarChart3,
  Award,
  Wallet,
  Building,
  Target,
  RefreshCw,
  Info
} from 'lucide-react'

export default function TokenomicsPage() {
  const [activeTab, setActiveTab] = useState('overview')

  const tokenMetrics = {
    totalSupply: '1,000,000,000',
    initialPrice: '$0.001',
    marketCap: '$1,000,000',
    stakingAPR: '50-500%',
    validatorAPY: '6-7.5%',
    platformFee: '2.5%'
  }

  const distribution = [
    { category: 'Community Rewards', percentage: 40, amount: '400M', color: 'from-purple-600 to-pink-600' },
    { category: 'Ecosystem Fund', percentage: 20, amount: '200M', color: 'from-green-600 to-emerald-600' },
    { category: 'Team & Advisors', percentage: 15, amount: '150M', color: 'from-blue-600 to-cyan-600', vesting: '4-year vesting' },
    { category: 'Early Investors', percentage: 10, amount: '100M', color: 'from-orange-600 to-yellow-600', vesting: '2-year vesting' },
    { category: 'Public Sale', percentage: 10, amount: '100M', color: 'from-red-600 to-pink-600' },
    { category: 'Liquidity', percentage: 5, amount: '50M', color: 'from-gray-600 to-gray-400' },
  ]

  const utilityFeatures = [
    {
      icon: Coins,
      title: 'Staking Rewards',
      description: 'Stake RFT to earn multiplied rewards on device trade-ins',
      benefit: 'Up to 10x multiplier'
    },
    {
      icon: Shield,
      title: 'Governance Rights',
      description: 'Vote on platform decisions, fee structures, and new features',
      benefit: 'True decentralization'
    },
    {
      icon: Zap,
      title: 'Fee Discounts',
      description: 'Reduced platform fees when paying with RFT',
      benefit: '50% discount'
    },
    {
      icon: Award,
      title: 'Priority Access',
      description: 'Early access to new features and premium device listings',
      benefit: 'VIP treatment'
    },
    {
      icon: Wallet,
      title: 'Validator Rewards',
      description: 'Earn SOL + RFT for running a validator node',
      benefit: '6-7.5% APY'
    },
    {
      icon: Target,
      title: 'Referral Bonuses',
      description: 'Earn RFT for bringing new users to the platform',
      benefit: '5% commission'
    }
  ]

  const burnMechanics = [
    { trigger: 'Platform Fees', rate: '25% of fees', impact: 'Deflationary pressure' },
    { trigger: 'Stake Unlocking', rate: '1% penalty', impact: 'Encourages long-term holding' },
    { trigger: 'Governance Proposals', rate: '100 RFT', impact: 'Prevents spam' },
    { trigger: 'Premium Features', rate: 'Variable', impact: 'Creates scarcity' }
  ]

  const roadmapPhases = [
    {
      phase: 'Launch',
      timeline: 'Q1 2025',
      milestones: ['Token Generation Event', 'Initial DEX Offering', 'Staking Launch']
    },
    {
      phase: 'Growth',
      timeline: 'Q2 2025',
      milestones: ['CEX Listings', 'Validator Network', 'Governance DAO']
    },
    {
      phase: 'Expansion',
      timeline: 'Q3 2025',
      milestones: ['Cross-chain Bridge', 'Institutional Partnerships', 'Mobile App']
    },
    {
      phase: 'Maturity',
      timeline: 'Q4 2025',
      milestones: ['Full Decentralization', 'Global Expansion', 'ReFit Card Launch']
    }
  ]

  return (
    <div className="min-h-screen py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full border border-purple-500/30 mb-6">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-semibold text-purple-400">RFT TOKEN</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-green-400 bg-clip-text text-transparent">
              ReFit Tokenomics
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            The RFT token powers the ReFit ecosystem, creating a sustainable economy 
            for device trading, staking rewards, and community governance.
          </p>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16"
        >
          {Object.entries(tokenMetrics).map(([key, value]) => (
            <div
              key={key}
              className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800 hover:border-purple-500/50 transition-all duration-300"
            >
              <p className="text-xs text-gray-500 mb-1">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </p>
              <p className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {value}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {['overview', 'distribution', 'utility', 'staking', 'governance'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-semibold capitalize transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-gray-900/50 text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-12">
              {/* Token Purpose */}
              <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-3xl p-8 border border-purple-500/30">
                <h2 className="text-3xl font-bold mb-6 text-center">The RFT Token Economy</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center">
                      <RefreshCw className="h-8 w-8 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Circular Economy</h3>
                    <p className="text-gray-400">
                      Trade devices → Earn RFT → Stake for multipliers → Increase earnings
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl flex items-center justify-center">
                      <TrendingUp className="h-8 w-8 text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Value Accrual</h3>
                    <p className="text-gray-400">
                      Platform growth directly increases token value through burns and utility
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-500/20 to-pink-600/20 rounded-2xl flex items-center justify-center">
                      <Users className="h-8 w-8 text-pink-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Community Owned</h3>
                    <p className="text-gray-400">
                      40% of supply dedicated to community rewards and governance
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Flame className="h-6 w-6 text-orange-400" />
                    Deflationary Mechanics
                  </h3>
                  <ul className="space-y-3">
                    {burnMechanics.map((mechanic, index) => (
                      <li key={index} className="flex justify-between items-center">
                        <span className="text-gray-400">{mechanic.trigger}</span>
                        <span className="text-orange-400 font-semibold">{mechanic.rate}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <BarChart3 className="h-6 w-6 text-green-400" />
                    Yield Sources
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex justify-between items-center">
                      <span className="text-gray-400">Staking APR</span>
                      <span className="text-green-400 font-semibold">50-500%</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-gray-400">Validator APY</span>
                      <span className="text-green-400 font-semibold">6-7.5%</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-gray-400">LP Rewards</span>
                      <span className="text-green-400 font-semibold">100-200%</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-gray-400">Referral Bonus</span>
                      <span className="text-green-400 font-semibold">5% commission</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'distribution' && (
            <div className="space-y-12">
              {/* Distribution Chart */}
              <div className="bg-gray-900/50 rounded-3xl p-8 border border-gray-800">
                <h2 className="text-3xl font-bold mb-8 text-center">Token Distribution</h2>
                
                {/* Visual Pie Chart Representation */}
                <div className="max-w-2xl mx-auto mb-8">
                  <div className="relative h-64">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-4xl font-bold">1B</p>
                        <p className="text-gray-400">Total Supply</p>
                      </div>
                    </div>
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 256 256">
                      {(() => {
                        let currentAngle = 0;
                        const centerX = 128;
                        const centerY = 128;
                        const radius = 100;
                        
                        return distribution.map((item, index) => {
                          const startAngle = currentAngle;
                          const endAngle = currentAngle + (item.percentage * 3.6);
                          const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
                          const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
                          const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
                          const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
                          const largeArc = item.percentage > 50 ? 1 : 0;
                          
                          currentAngle = endAngle;
                          
                          return (
                            <path
                              key={index}
                              d={`M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                              className={`fill-current ${
                                index === 0 ? 'text-purple-600' :
                                index === 1 ? 'text-green-600' :
                                index === 2 ? 'text-blue-600' :
                                index === 3 ? 'text-orange-600' :
                                index === 4 ? 'text-red-600' :
                                'text-gray-600'
                              } opacity-80 hover:opacity-100 transition-opacity`}
                            />
                          );
                        });
                      })()}
                    </svg>
                  </div>
                </div>

                {/* Distribution Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  {distribution.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${item.color}`} />
                        <div>
                          <p className="font-semibold">{item.category}</p>
                          {item.vesting && (
                            <p className="text-xs text-gray-500">{item.vesting}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{item.percentage}%</p>
                        <p className="text-sm text-gray-400">{item.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vesting Schedule */}
              <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Lock className="h-6 w-6 text-purple-400" />
                  Vesting Schedule
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-lg">
                    <span>Team & Advisors</span>
                    <span className="text-purple-400">6-month cliff, 4-year linear</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-lg">
                    <span>Early Investors</span>
                    <span className="text-purple-400">3-month cliff, 2-year linear</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-lg">
                    <span>Ecosystem Fund</span>
                    <span className="text-purple-400">Unlocked, DAO controlled</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'utility' && (
            <div className="space-y-12">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {utilityFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800 hover:border-purple-500/50 transition-all duration-300 group"
                    >
                      <div className="w-12 h-12 mb-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="h-6 w-6 text-purple-400" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                      <p className="text-gray-400 mb-3">{feature.description}</p>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 rounded-full">
                        <Sparkles className="h-3 w-3 text-purple-400" />
                        <span className="text-sm font-semibold text-purple-400">{feature.benefit}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Token Flow Diagram */}
              <div className="bg-gradient-to-br from-purple-900/20 to-green-900/20 rounded-3xl p-8 border border-purple-500/30">
                <h3 className="text-2xl font-bold mb-6 text-center">Token Flow</h3>
                <div className="max-w-4xl mx-auto">
                  <div className="grid md:grid-cols-3 gap-4 items-center">
                    <div className="text-center">
                      <div className="bg-gray-900 rounded-xl p-4 mb-2">
                        <p className="font-semibold">Users</p>
                      </div>
                      <ArrowRight className="h-6 w-6 mx-auto text-purple-400 rotate-90 md:rotate-0" />
                    </div>
                    <div className="text-center">
                      <div className="bg-purple-900/50 rounded-xl p-6 border-2 border-purple-500">
                        <p className="font-bold text-xl">ReFit Platform</p>
                        <p className="text-sm text-gray-400 mt-2">Trade • Stake • Govern</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <ArrowRight className="h-6 w-6 mx-auto text-green-400 rotate-90 md:rotate-0 mb-2" />
                      <div className="bg-gray-900 rounded-xl p-4">
                        <p className="font-semibold">Rewards</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'staking' && (
            <div className="space-y-12">
              {/* Staking Tiers */}
              <div className="bg-gray-900/50 rounded-3xl p-8 border border-gray-800">
                <h2 className="text-3xl font-bold mb-8 text-center">Staking Tiers & Rewards</h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-4">Tier</th>
                        <th className="text-center py-4">Lock Period</th>
                        <th className="text-center py-4">RFT Multiplier</th>
                        <th className="text-center py-4">Estimated APR</th>
                        <th className="text-center py-4">Benefits</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-800">
                        <td className="py-4 font-semibold text-gray-400">Flexible</td>
                        <td className="text-center">None</td>
                        <td className="text-center">1x</td>
                        <td className="text-center text-green-400">50%</td>
                        <td className="text-center">Base rewards</td>
                      </tr>
                      <tr className="border-b border-gray-800">
                        <td className="py-4 font-semibold text-bronze">Bronze</td>
                        <td className="text-center">30 days</td>
                        <td className="text-center">1.5x</td>
                        <td className="text-center text-green-400">75%</td>
                        <td className="text-center">+ Priority support</td>
                      </tr>
                      <tr className="border-b border-gray-800">
                        <td className="py-4 font-semibold text-gray-300">Silver</td>
                        <td className="text-center">90 days</td>
                        <td className="text-center">2x</td>
                        <td className="text-center text-green-400">100%</td>
                        <td className="text-center">+ Fee discounts</td>
                      </tr>
                      <tr className="border-b border-gray-800">
                        <td className="py-4 font-semibold text-yellow-400">Gold</td>
                        <td className="text-center">180 days</td>
                        <td className="text-center">3x</td>
                        <td className="text-center text-green-400">150%</td>
                        <td className="text-center">+ Governance power</td>
                      </tr>
                      <tr className="border-b border-gray-800">
                        <td className="py-4 font-semibold text-purple-400">Platinum</td>
                        <td className="text-center">1 year</td>
                        <td className="text-center">5x</td>
                        <td className="text-center text-green-400">250%</td>
                        <td className="text-center">+ Validator eligibility</td>
                      </tr>
                      <tr>
                        <td className="py-4 font-semibold text-cyan-400">Diamond</td>
                        <td className="text-center">2 years</td>
                        <td className="text-center">10x</td>
                        <td className="text-center text-green-400">500%</td>
                        <td className="text-center">+ Founding member status</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Validator Economics */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl p-6 border border-purple-500/30">
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Building className="h-6 w-6 text-purple-400" />
                    Validator Requirements
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <ChevronDown className="h-4 w-4 text-purple-400 mt-1" />
                      <span>Minimum stake: 100,000 RFT</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronDown className="h-4 w-4 text-purple-400 mt-1" />
                      <span>Lock period: 6 months minimum</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronDown className="h-4 w-4 text-purple-400 mt-1" />
                      <span>Technical requirements: VPS with 99.9% uptime</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronDown className="h-4 w-4 text-purple-400 mt-1" />
                      <span>Slashing: 10% for malicious behavior</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-2xl p-6 border border-green-500/30">
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Coins className="h-6 w-6 text-green-400" />
                    Validator Rewards
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <ChevronDown className="h-4 w-4 text-green-400 mt-1" />
                      <span>Base APY: 6-7.5% in SOL</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronDown className="h-4 w-4 text-green-400 mt-1" />
                      <span>RFT rewards: Additional 20-30% APY</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronDown className="h-4 w-4 text-green-400 mt-1" />
                      <span>Commission: 5% of delegator rewards</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronDown className="h-4 w-4 text-green-400 mt-1" />
                      <span>MEV capture: Additional yield potential</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'governance' && (
            <div className="space-y-12">
              {/* DAO Structure */}
              <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-3xl p-8 border border-purple-500/30">
                <h2 className="text-3xl font-bold mb-8 text-center">ReFit DAO</h2>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <Users className="h-8 w-8 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Community Proposals</h3>
                    <p className="text-gray-400">
                      Any holder with 10,000+ RFT can submit proposals
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Shield className="h-8 w-8 text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Voting Power</h3>
                    <p className="text-gray-400">
                      1 RFT = 1 vote, with multipliers for locked tokens
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-pink-500/20 rounded-full flex items-center justify-center">
                      <Target className="h-8 w-8 text-pink-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Execution</h3>
                    <p className="text-gray-400">
                      Approved proposals execute automatically via smart contracts
                    </p>
                  </div>
                </div>
              </div>

              {/* Governance Parameters */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
                  <h3 className="text-2xl font-bold mb-4">Proposal Requirements</h3>
                  <ul className="space-y-3">
                    <li className="flex justify-between">
                      <span className="text-gray-400">Minimum RFT to propose</span>
                      <span className="font-semibold">10,000 RFT</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-400">Proposal fee (burned)</span>
                      <span className="font-semibold">100 RFT</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-400">Voting period</span>
                      <span className="font-semibold">7 days</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-400">Quorum required</span>
                      <span className="font-semibold">4% of supply</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-400">Pass threshold</span>
                      <span className="font-semibold">66% approval</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
                  <h3 className="text-2xl font-bold mb-4">Governable Parameters</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-blue-400" />
                      <span>Platform fee percentages</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-blue-400" />
                      <span>Staking reward rates</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-blue-400" />
                      <span>Burn mechanisms and rates</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-blue-400" />
                      <span>Treasury allocation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-blue-400" />
                      <span>New feature implementation</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Treasury */}
              <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Wallet className="h-6 w-6 text-purple-400" />
                  DAO Treasury
                </h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-800/50 rounded-xl">
                    <p className="text-2xl font-bold text-purple-400">200M</p>
                    <p className="text-sm text-gray-400">RFT Ecosystem Fund</p>
                  </div>
                  <div className="text-center p-4 bg-gray-800/50 rounded-xl">
                    <p className="text-2xl font-bold text-green-400">$500K</p>
                    <p className="text-sm text-gray-400">Initial USDC</p>
                  </div>
                  <div className="text-center p-4 bg-gray-800/50 rounded-xl">
                    <p className="text-2xl font-bold text-blue-400">25%</p>
                    <p className="text-sm text-gray-400">Platform fees to treasury</p>
                  </div>
                  <div className="text-center p-4 bg-gray-800/50 rounded-xl">
                    <p className="text-2xl font-bold text-yellow-400">DAO</p>
                    <p className="text-sm text-gray-400">Controlled allocation</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Token Roadmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <h2 className="text-3xl font-bold mb-8 text-center">Token Roadmap</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {roadmapPhases.map((phase, index) => (
              <div
                key={index}
                className="relative bg-gray-900/50 rounded-2xl p-6 border border-gray-800 hover:border-purple-500/50 transition-all duration-300"
              >
                <div className="absolute -top-3 left-6">
                  <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-xs font-bold">
                    {phase.timeline}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-4 mt-2">{phase.phase}</h3>
                <ul className="space-y-2">
                  {phase.milestones.map((milestone, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <ChevronDown className="h-4 w-4 text-purple-400 mt-0.5" />
                      <span className="text-sm text-gray-400">{milestone}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="bg-gradient-to-br from-purple-900/20 to-green-900/20 rounded-3xl p-12 border border-purple-500/30">
            <h2 className="text-3xl font-bold mb-4">Join the ReFit Revolution</h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Be part of the first decentralized device trading ecosystem. 
              Earn RFT tokens by trading your devices or staking for massive rewards.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/sell"
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 group"
              >
                Start Trading
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="/stake"
                className="inline-flex items-center px-8 py-3 bg-gray-800 border border-gray-700 rounded-lg font-semibold hover:bg-gray-700 transition-all duration-300"
              >
                Explore Staking
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}