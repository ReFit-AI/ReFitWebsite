'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Target, 
  Zap, 
  Shield, 
  Globe, 
  ArrowRight,
  CheckCircle,
  Code,
  Smartphone,
  DollarSign,
  Cpu,
  RefreshCw,
  TrendingUp,
  CircleDollarSign,
  Brain,
  Recycle,
  Sparkles
} from 'lucide-react'
export default function RoadmapPage() {
  const quarters = [
    {
      quarter: "Today",
      title: "Upgrade Forever Launch",
      status: "in-progress",
      items: [
        { 
          title: "Your Old Phone Pays for Your New One", 
          description: "Trade in, stake value, earn ~6.5% APY toward future upgrades forever",
          icon: CircleDollarSign,
          status: "in-progress"
        },
        { 
          title: "First 100 Users Get Bonus APY", 
          description: "+0.5% bonus for early adopters. Be part of history.",
          icon: TrendingUp,
          status: "in-progress"
        },
        { 
          title: "Family Stacking Power", 
          description: "Stack multiple devices = free phone every year",
          icon: Shield,
          status: "in-progress"
        },
        { 
          title: "Manual Processing Excellence", 
          description: "White glove service for our first users",
          icon: Sparkles,
          status: "in-progress"
        }
      ]
    },
    {
      quarter: "Week 2",
      title: "Validator Goes Live",
      status: "upcoming",
      items: [
        { 
          title: "Deploy Solana Validator", 
          description: "Real staking begins. Your trades secure the network.",
          icon: Cpu,
          status: "upcoming"
        },
        { 
          title: "Break Today, Replace Tomorrow", 
          description: "Instant replacement service powered by our refurbished inventory",
          icon: RefreshCw,
          status: "upcoming"
        },
        { 
          title: "Trade-In Credit as Currency", 
          description: "Use your phone's value as collateral for purchases",
          icon: CircleDollarSign,
          status: "upcoming"
        },
        { 
          title: "Official Solana Mobile Partner", 
          description: "Seamless integration with the Solana Mobile ecosystem",
          icon: Shield,
          status: "upcoming"
        }
      ]
    },
    {
      quarter: "Month 2",
      title: "Smart Contract Automation",
      status: "upcoming",
      items: [
        { 
          title: "Repair Shop Network", 
          description: "Local repair shops join the circular economy",
          icon: Globe,
          status: "upcoming"
        },
        { 
          title: "Business-to-Business Markets", 
          description: "Wholesale trading infrastructure on-chain",
          icon: TrendingUp,
          status: "upcoming"
        },
        { 
          title: "Beyond Smartphones", 
          description: "Expanding to tablets, laptops, and more",
          icon: Cpu,
          status: "upcoming"
        },
        { 
          title: "Developer Ecosystem", 
          description: "Build on our liquidity infrastructure",
          icon: Code,
          status: "upcoming"
        }
      ]
    },
    {
      quarter: "The Vision",
      title: "Infinite Upgrades",
      status: "upcoming",
      items: [
        { 
          title: "The Infinity Phone Achievement", 
          description: "Stack $10k in trades = free phone every year forever",
          icon: DollarSign,
          status: "upcoming"
        },
        { 
          title: "1 Million Devices Staked", 
          description: "Largest device-backed validator on Solana",
          icon: Globe,
          status: "upcoming"
        },
        { 
          title: "Corporate Fleet Programs", 
          description: "Companies stake old devices, fund employee upgrades",
          icon: Target,
          status: "upcoming"
        },
        { 
          title: "Never Pay Full Price Again", 
          description: "The future where upgrades fund themselves",
          icon: CheckCircle,
          status: "upcoming"
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
        return 'Completed'
      case 'in-progress':
        return 'In Progress'
      default:
        return 'Upcoming'
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
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
              Upgrade Forever Roadmap
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Your old phone pays for your new one. Trade in once, stake the value, upgrade forever.
              We&apos;re building the future where devices fund themselves.
            </p>
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
                      <h2 className="text-3xl font-bold mb-2">{quarter.quarter}</h2>
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
                                <p className="text-sm text-gray-400">{item.description}</p>
                                <div className="mt-3 flex items-center gap-2">
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

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-20 text-center"
          >
            <div className="max-w-3xl mx-auto p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-green-500/10 border border-gray-700">
              <h3 className="text-2xl font-bold mb-4">Join the Upgrade Forever Revolution</h3>
              <p className="text-gray-400 mb-6">
                Launching TODAY. First 100 users get bonus APY. Turn your old phone into perpetual upgrade funds.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mb-6 text-left">
                <div className="p-4 bg-black/50 rounded-lg">
                  <h4 className="font-semibold mb-2 text-purple-400">Venture Capital</h4>
                  <p className="text-sm text-gray-400">Quick round to scale smart contract infrastructure and operations</p>
                </div>
                <div className="p-4 bg-black/50 rounded-lg">
                  <h4 className="font-semibold mb-2 text-green-400">Solana Foundation</h4>
                  <p className="text-sm text-gray-400">Developer support for our revolutionary trade-in smart contracts</p>
                </div>
                <div className="p-4 bg-black/50 rounded-lg">
                  <h4 className="font-semibold mb-2 text-pink-400">Solana Mobile</h4>
                  <p className="text-sm text-gray-400">Official trade-in partner for Saga and Seeker devices</p>
                </div>
              </div>
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500">
                  Your old phones are worth more than cash. They&apos;re your ticket to free upgrades forever.
                </p>
              </div>
              <div className="flex justify-center">
                <Link
                  href="/sell"
                  className="btn-primary"
                >
                  Start Your Upgrade Fund
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
  )
}
