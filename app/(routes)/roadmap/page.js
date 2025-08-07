'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Shield, 
  Globe, 
  ArrowRight,
  CheckCircle,
  Code,
  DollarSign,
  Cpu,
  RefreshCw,
  TrendingUp,
  CircleDollarSign,
  Sparkles,
  Rocket,
  Users,
  Building,
  Camera,
  Brain
} from 'lucide-react'
import SmartContractDemo from '@/components/SmartContractDemo'

export default function RoadmapPage() {
  const [showDemo, setShowDemo] = useState(false)
  const quarters = [
    {
      quarter: "Day 1-7",
      title: "Prove It Works",
      status: "completed",
      milestone: "10 Seekers Bought",
      items: [
        { 
          title: "Manual Excellence", 
          description: "Buying every Seeker offered. Personal service. Building trust.",
          icon: Sparkles,
          status: "completed",
          metric: "First 3 trades complete"
        },
        { 
          title: "Instant Payments", 
          description: "USDC in your wallet within minutes. No waiting.",
          icon: DollarSign,
          status: "completed",
          metric: "$3,000 paid out"
        },
        { 
          title: "Airdrop Promise", 
          description: "Every seller gets RFT tokens. Be a founding member.",
          icon: CircleDollarSign,
          status: "completed",
          metric: "100 RFT per dollar traded"
        },
        { 
          title: "Community First", 
          description: "150 Telegram members ready. You're not alone.",
          icon: Users,
          status: "completed",
          metric: "24/7 founder support"
        }
      ]
    },
    {
      quarter: "Week 2-4",
      title: "Build The Engine",
      status: "in-progress",
      milestone: "$50K Staked",
      items: [
        { 
          title: "Deploy Validator", 
          description: "Every trade contributes to a Solana validator. Real yield, not promises.",
          icon: Cpu,
          status: "in-progress",
          metric: "7% APY live"
        },
        { 
          title: "Staking Goes Live", 
          description: "Choose: Take cash now or stake for ongoing yield.",
          icon: TrendingUp,
          status: "in-progress",
          metric: "First 100 stakers"
        },
        { 
          title: "The Math Works", 
          description: "$600 phone → $42/year SOL + RFT tokens → Pays phone bill or anything else",
          icon: CircleDollarSign,
          status: "in-progress",
          metric: "Real yield + token upside"
        },
        { 
          title: "Founding Members", 
          description: "First 100 users get 10x RFT multiplier. Never offered again.",
          icon: Rocket,
          status: "in-progress",
          metric: "Be part of history"
        }
      ]
    },
    {
      quarter: "Month 2-3",
      title: "Smart Contracts Change Everything",
      status: "upcoming",
      milestone: "1,000 Devices",
      items: [
        { 
          title: "Repair & Swap Magic", 
          description: "Break phone → Order replacement → Pay to contract → Ship broken → Get refund. Never be without a phone.",
          icon: RefreshCw,
          status: "upcoming",
          metric: "Zero downtime"
        },
        { 
          title: "P2P Marketplace", 
          description: "eBay on Solana. Trade devices directly. Smart contracts handle trust.",
          icon: Code,
          status: "upcoming",
          metric: "2.5% fees vs 13% eBay"
        },
        { 
          title: "AI Grading", 
          description: "Photo → Quote in seconds. 90% accurate. Getting better daily.",
          icon: Brain,
          status: "upcoming",
          hasDemo: true,
          metric: "10-second quotes"
        },
        { 
          title: "Family Stacking", 
          description: "5 old phones = $2,500 staked = $175/year + RFT. Covers phone bills, Netflix, whatever.",
          icon: Users,
          status: "upcoming",
          metric: "Stack junk, earn yield"
        },
        { 
          title: "$100K TVL", 
          description: "Enough staked to qualify for Solana Foundation delegation. 10x our power.",
          icon: Shield,
          status: "upcoming",
          metric: "Network effect begins"
        }
      ]
    },
    {
      quarter: "Month 6",
      title: "Become Infrastructure",
      status: "upcoming",
      milestone: "10,000 Devices",
      items: [
        { 
          title: "Wholesale Markets", 
          description: "Buyers place orders: '100 iPhone 14s at $400'. Protocol matches. Like an order book for phones.",
          icon: Building,
          status: "upcoming",
          metric: "$1M monthly volume"
        },
        { 
          title: "Physical Nodes", 
          description: "100 repair shops as nodes. Same-day pickup. Local liquidity.",
          icon: Globe,
          status: "upcoming",
          metric: "Every major city"
        },
        { 
          title: "Corporate Fleets", 
          description: "Companies stake old devices. Use yield for anything - upgrades, services, OpEx reduction.",
          icon: Users,
          status: "upcoming",
          metric: "First Fortune 500"
        },
        { 
          title: "Beyond Phones", 
          description: "Laptops, tablets, watches. If it has value, it can stake.",
          icon: Cpu,
          status: "upcoming",
          metric: "$10M staked"
        }
      ]
    },
    {
      quarter: "The Endgame",
      title: "Junk Becomes Income",
      status: "upcoming",
      milestone: "1M Devices = $1B TVL",
      items: [
        { 
          title: "The $10K Stack", 
          description: "Stack $10K in old devices. Earn $700/year + RFT appreciation while staked.",
          icon: DollarSign,
          status: "upcoming",
          metric: "Junk becomes income"
        },
        { 
          title: "Largest Device Validator", 
          description: "$1B staked. Securing Solana. Funded by phones that would be in drawers.",
          icon: Globe,
          status: "upcoming",
          metric: "Top 10 validator"
        },
        { 
          title: "Physical Asset DEX", 
          description: "Every device on Earth tradeable. Cars, watches, anything. We started with phones.",
          icon: RefreshCw,
          status: "upcoming",
          metric: "$100M monthly volume"
        },
        { 
          title: "You Own It", 
          description: "RFT holders govern the protocol. The users become the platform.",
          icon: CheckCircle,
          status: "upcoming",
          metric: "True decentralization"
        }
      ]
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'from-green-500/20 to-green-500/5 border-green-500/30'
      case 'in-progress':
        return 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30'
      default:
        return 'from-gray-500/10 to-gray-500/5 border-gray-700'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Live'
      case 'in-progress':
        return 'In Development'
      default:
        return 'Planned'
    }
  }

  return (
    <div className="min-h-screen bg-black text-white py-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl sm:text-6xl font-bold mb-6">
              <span className="block text-white">Your Junk Drawer</span>
              <span className="block bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
                Is A Yield Farm
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-4">
              Turn dead electronics into income streams.
            </p>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Trade devices → Stake value → Earn 7% APY + RFT tokens → Spend on anything.
              Your old phones could pay your phone bill. Or buy groceries. Or yes, fund upgrades.
            </p>
          </motion.div>

          {/* The Big Idea Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto mb-16 p-8 bg-gradient-to-br from-purple-900/20 via-black to-green-900/20 border border-gray-800 rounded-2xl"
          >
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl mb-2">📱</div>
                <h3 className="font-bold mb-2">You Have</h3>
                <p className="text-sm text-gray-400">Old phones worth $1000s doing nothing</p>
              </div>
              <div>
                <div className="text-4xl mb-2">💰</div>
                <h3 className="font-bold mb-2">We Make Them</h3>
                <p className="text-sm text-gray-400">Earn 7% APY + token rewards forever</p>
              </div>
              <div>
                <div className="text-4xl mb-2">♾️</div>
                <h3 className="font-bold mb-2">You Get</h3>
                <p className="text-sm text-gray-400">Passive income + RFT tokens that grow with usage</p>
              </div>
            </div>
            <div className="text-center mt-6 pt-6 border-t border-gray-800">
              <p className="text-yellow-400 font-bold">
                ⚡ LIVE NOW - Solo founder processing every trade personally
              </p>
            </div>
          </motion.div>

          {/* Timeline */}
          <div className="max-w-6xl mx-auto">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500/50 via-green-500/50 to-transparent" />
              
              {quarters.map((quarter, quarterIndex) => (
                <motion.div
                  key={quarter.quarter}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: quarterIndex * 0.1 }}
                  className="relative mb-20 last:mb-0"
                >
                  {/* Quarter marker */}
                  <div className="absolute left-0 top-0 w-16 h-16 flex items-center justify-center">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${
                      quarter.status === 'in-progress' 
                        ? 'from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/50' 
                        : quarter.status === 'completed'
                        ? 'from-green-400 to-green-600'
                        : 'from-gray-600 to-gray-700'
                    }`} />
                  </div>

                  {/* Content */}
                  <div className="ml-24">
                    <div className="mb-8">
                      <div className="flex items-center gap-4 mb-2">
                        <h2 className="text-3xl font-bold">{quarter.quarter}</h2>
                        {quarter.milestone && (
                          <span className="px-3 py-1 bg-gradient-to-r from-purple-600/20 to-green-600/20 border border-purple-500/50 rounded-full text-sm font-bold text-purple-400">
                            Goal: {quarter.milestone}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl text-gray-400">{quarter.title}</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {quarter.items.map((item, itemIndex) => {
                        const Icon = item.icon
                        return (
                          <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: quarterIndex * 0.1 + itemIndex * 0.05 }}
                            className={`
                              relative group p-6 rounded-xl
                              bg-gradient-to-br ${getStatusColor(item.status)}
                              border backdrop-blur-sm
                              hover:scale-[1.02] transition-all duration-300
                            `}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`
                                p-3 rounded-lg
                                ${item.status === 'completed' 
                                  ? 'bg-green-500/20' 
                                  : item.status === 'in-progress'
                                  ? 'bg-yellow-500/20'
                                  : 'bg-gray-700/50'
                                }
                              `}>
                                <Icon className={`
                                  w-6 h-6
                                  ${item.status === 'completed' 
                                    ? 'text-green-400' 
                                    : item.status === 'in-progress'
                                    ? 'text-yellow-400'
                                    : 'text-gray-400'
                                  }
                                `} />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold mb-1">{item.title}</h4>
                                <p className="text-sm text-gray-400 mb-2">{item.description}</p>
                                {item.metric && (
                                  <div className="text-xs font-bold text-green-400 mb-2">
                                    → {item.metric}
                                  </div>
                                )}
                                <div className="mt-3 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className={`
                                      w-2 h-2 rounded-full
                                      ${item.status === 'completed' 
                                        ? 'bg-green-400' 
                                        : item.status === 'in-progress'
                                        ? 'bg-yellow-400 animate-pulse'
                                        : 'bg-gray-600'
                                      }
                                    `} />
                                    <span className="text-xs text-gray-500">
                                      {getStatusText(item.status)}
                                    </span>
                                  </div>
                                  {item.hasDemo && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setShowDemo(true)
                                      }}
                                      className="text-xs px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 rounded-lg transition-all inline-flex items-center gap-1 relative z-10"
                                    >
                                      <Camera className="w-3 h-3" />
                                      Try Demo
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Hover effect */}
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Partnership & Support Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-20 text-center"
          >
            <div className="max-w-3xl mx-auto p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-green-500/10 border border-gray-700">
              <h3 className="text-2xl font-bold mb-4">The Math Is Simple</h3>
              <div className="bg-black/50 rounded-lg p-4 mb-6 font-mono text-sm">
                <div className="text-green-400">Your drawer: 3 old iPhones worth $1,500</div>
                <div className="text-gray-400">Staked at 7% APY: $105/year in SOL</div>
                <div className="text-purple-400">+ RFT tokens (10x for first 100 users)</div>
                <div className="text-yellow-400 font-bold mt-2">= Phone bill paid. Or groceries. Or save for upgrade. Your choice.</div>
              </div>
              <p className="text-gray-400 mb-6">
                We&apos;re live. Processing trades manually. First 100 users become founding members.
              </p>
              
              {/* Why Now */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold mb-4 text-gray-300">Why This Works</h4>
                <div className="grid md:grid-cols-3 gap-4 mb-6 text-left">
                  <div className="p-4 bg-black/50 rounded-lg border border-gray-800">
                    <div className="text-2xl font-bold text-purple-400 mb-1">$500B</div>
                    <p className="text-sm text-gray-400">
                      Annual device trade market. We need 0.1% to hit $500M.
                    </p>
                  </div>
                  <div className="p-4 bg-black/50 rounded-lg border border-gray-800">
                    <div className="text-2xl font-bold text-green-400 mb-1">150K</div>
                    <p className="text-sm text-gray-400">
                      Seeker phones shipping. All need liquidity. We&apos;re ready.
                    </p>
                  </div>
                  <div className="p-4 bg-black/50 rounded-lg border border-gray-800">
                    <div className="text-2xl font-bold text-pink-400 mb-1">7% APY</div>
                    <p className="text-sm text-gray-400">
                      Validator rewards are real. Not tokens. Actual SOL yield.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center mb-6">
                <p className="text-lg font-bold text-white">
                  &quot;Every dead device is losing you money. We fix that.&quot;
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Turn junk into yield. Use it for anything. Plus own the network with RFT.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/sell"
                  className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-600 to-green-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 group"
                >
                  Trade Your First Device
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="https://t.me/refittrade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-8 py-3 bg-gray-800 border border-gray-700 rounded-lg font-semibold hover:bg-gray-700 transition-all duration-300"
                >
                  Join 150+ Members
                </a>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Demo Modal */}
        {showDemo && (
          <SmartContractDemo onClose={() => setShowDemo(false)} />
        )}
      </div>
  )
}