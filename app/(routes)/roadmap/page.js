'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowRight,
  DollarSign,
  TrendingUp,
  Users,
  Zap,
  Target,
  Trophy,
  BarChart3,
  Coins
} from 'lucide-react'

export default function RoadmapPage() {
  const phases = [
    {
      phase: "Phase 1",
      title: "Prove It Works",
      timeline: "Today - Week 4",
      status: "in-progress",
      goal: "$10K Pool",
      description: "Simple phone arbitrage. Buy local, flip wholesale, pay LPs 2% weekly.",
      items: [
        {
          title: "Live Deposits",
          description: "Pool is live. Deposit USDC, earn 2% weekly from phone arbitrage profits. First 100 get 1.5x RFT bonus.",
          icon: DollarSign,
          status: "live",
          metric: "104% APY"
        },
        {
          title: "Manual Phone Flipping",
          description: "Buy phones at market rate locally. Sell to wholesale buyers same-day at 10-20% margins. Keep it simple.",
          icon: Target,
          status: "live",
          metric: "$2.3M proven revenue"
        },
        {
          title: "Weekly Distributions",
          description: "Every Monday at noon - 2% returns distributed to all depositors automatically. Transparent, consistent.",
          icon: TrendingUp,
          status: "live",
          metric: "Every Monday"
        },
        {
          title: "Early Bird Bonus",
          description: "First 100 depositors get 1.5x RFT tokens. Lock in founder status while slots remain.",
          icon: Zap,
          status: "live",
          metric: "Limited slots"
        }
      ]
    },
    {
      phase: "Phase 2",
      title: "Scale Capital",
      timeline: "Weeks 5-12",
      status: "upcoming",
      goal: "$100K Pool",
      description: "More capital = better deals = higher margins. Compound the advantage.",
      items: [
        {
          title: "Grow The Pool",
          description: "Reach $100K in deposits. More buying power means I can negotiate better deals and take on larger opportunities.",
          icon: BarChart3,
          status: "upcoming",
          metric: "$100K target"
        },
        {
          title: "Better Sourcing",
          description: "Build relationships with more sellers. Craigslist, OfferUp, Facebook Marketplace. Volume creates consistency.",
          icon: Users,
          status: "upcoming",
          metric: "10+ weekly deals"
        },
        {
          title: "Multiple Buyers",
          description: "3-5 wholesale buyers compete for inventory. Better prices, faster flips, less risk. Market competition works for us.",
          icon: TrendingUp,
          status: "upcoming",
          metric: "Same-day flips"
        },
        {
          title: "Sustainable Income",
          description: "Pool generates $10K+/month for me personally while paying LPs 2% weekly. Sustainable, honest business.",
          icon: DollarSign,
          status: "upcoming",
          metric: "Family supported"
        }
      ]
    },
    {
      phase: "Phase 3",
      title: "Automate & Expand",
      timeline: "Months 3-6",
      status: "upcoming",
      goal: "$500K Pool",
      description: "Keep the model simple, just do it better and faster.",
      items: [
        {
          title: "Hire Help",
          description: "Bring on someone to handle logistics - pickups, testing, shipping. I focus on deals and pool management.",
          icon: Users,
          status: "upcoming",
          metric: "First hire"
        },
        {
          title: "Better Systems",
          description: "Inventory tracking, automatic buyer matching, streamlined workflows. Same model, less friction.",
          icon: Target,
          status: "upcoming",
          metric: "2x efficiency"
        },
        {
          title: "Consistent Volume",
          description: "20-30 phones weekly. Predictable margins. Reliable returns for LPs. The boring path to success.",
          icon: BarChart3,
          status: "upcoming",
          metric: "$50K weekly volume"
        },
        {
          title: "Track Record",
          description: "6 months of consistent 2% weekly returns. Proof the model works. Trust is earned, not claimed.",
          icon: Trophy,
          status: "upcoming",
          metric: "26 distributions"
        }
      ]
    },
    {
      phase: "Phase 4",
      title: "Token Launch",
      timeline: "Month 6+",
      status: "upcoming",
      goal: "RFT Goes Live",
      description: "Reward early believers. Let the community own the upside.",
      items: [
        {
          title: "RFT Token Launch",
          description: "Convert accumulated RFT points to actual tokens. Early depositors have 6 months of accumulation at 1-1.5x rate.",
          icon: Coins,
          status: "upcoming",
          metric: "Airdrop to LPs"
        },
        {
          title: "Liquidity Pool",
          description: "List RFT on Raydium/Jupiter. Let the market decide value. Early LPs have the most tokens.",
          icon: TrendingUp,
          status: "upcoming",
          metric: "Public trading"
        },
        {
          title: "Protocol Governance",
          description: "RFT holders vote on pool parameters, fee structure, expansion plans. You own what you helped build.",
          icon: Users,
          status: "upcoming",
          metric: "Decentralized"
        },
        {
          title: "Revenue Share",
          description: "Platform fees (beyond LP returns) distributed to RFT holders. Real yield + token appreciation.",
          icon: DollarSign,
          status: "upcoming",
          metric: "Hold to earn"
        }
      ]
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'live':
        return 'from-green-500/20 to-green-500/5 border-green-500/30'
      case 'in-progress':
        return 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30'
      default:
        return 'from-gray-500/10 to-gray-500/5 border-gray-700'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'live':
        return 'LIVE NOW'
      case 'in-progress':
        return 'In Progress'
      default:
        return 'Coming Soon'
    }
  }

  const getStatusDot = (status) => {
    switch (status) {
      case 'live':
        return 'bg-green-400'
      case 'in-progress':
        return 'bg-yellow-400 animate-pulse'
      default:
        return 'bg-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-black text-white py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 max-w-4xl mx-auto"
        >
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            <span className="block text-white">Phone Arbitrage</span>
            <span className="block bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
              Meets DeFi
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-4">
            Simple business model. Crazy returns. Real profits.
          </p>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            I buy phones locally at market rate, flip them to wholesale buyers same-day at 10-20% margins.
            You get 2% weekly returns from the profits. That&apos;s it.
          </p>
        </motion.div>

        {/* The Truth Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto mb-16 p-8 bg-gradient-to-br from-purple-900/20 via-black to-green-900/20 border border-gray-800 rounded-2xl"
        >
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl mb-2">📱</div>
              <h3 className="font-bold mb-2">I Buy Phones</h3>
              <p className="text-sm text-gray-400">Local sellers. Fair market prices. Cash or USDC.</p>
            </div>
            <div>
              <div className="text-4xl mb-2">💵</div>
              <h3 className="font-bold mb-2">Flip Same-Day</h3>
              <p className="text-sm text-gray-400">Wholesale buyers pay 10-20% over what I paid. Proven model.</p>
            </div>
            <div>
              <div className="text-4xl mb-2">📈</div>
              <h3 className="font-bold mb-2">You Get 2% Weekly</h3>
              <p className="text-sm text-gray-400">104% APY from real profits. Plus RFT tokens for early believers.</p>
            </div>
          </div>
          <div className="text-center mt-6 pt-6 border-t border-gray-800">
            <p className="text-yellow-400 font-bold text-lg">
              ⚡ LIVE NOW - First 100 depositors get 1.5x RFT bonus
            </p>
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-green-500/50 via-purple-500/50 to-gray-500/20" />

            {phases.map((phase, phaseIndex) => (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: phaseIndex * 0.1 }}
                className="relative mb-20 last:mb-0"
              >
                {/* Phase marker */}
                <div className="absolute left-0 top-0 w-16 h-16 flex items-center justify-center">
                  <div className={`w-4 h-4 rounded-full ${
                    phase.status === 'in-progress'
                      ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/50'
                      : 'bg-gradient-to-br from-gray-600 to-gray-700'
                  }`} />
                </div>

                {/* Content */}
                <div className="ml-24">
                  <div className="mb-8">
                    <div className="flex items-center gap-4 mb-2 flex-wrap">
                      <h2 className="text-3xl font-bold">{phase.phase}</h2>
                      <span className="px-3 py-1 bg-gradient-to-r from-purple-600/20 to-green-600/20 border border-purple-500/50 rounded-full text-sm font-bold text-purple-400">
                        {phase.timeline}
                      </span>
                      <span className="px-3 py-1 bg-green-900/30 border border-green-500/50 rounded-full text-sm font-bold text-green-400">
                        Goal: {phase.goal}
                      </span>
                    </div>
                    <h3 className="text-xl text-gray-300 mb-2">{phase.title}</h3>
                    <p className="text-gray-500">{phase.description}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {phase.items.map((item, itemIndex) => {
                      const Icon = item.icon
                      return (
                        <motion.div
                          key={item.title}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: phaseIndex * 0.1 + itemIndex * 0.05 }}
                          className={`
                            relative group p-6 rounded-xl
                            bg-gradient-to-br ${getStatusColor(item.status)}
                            border backdrop-blur-sm
                            hover:scale-[1.02] transition-all duration-300
                          `}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`
                              p-3 rounded-lg flex-shrink-0
                              ${item.status === 'live'
                                ? 'bg-green-500/20'
                                : 'bg-gray-700/50'
                              }
                            `}>
                              <Icon className={`
                                w-6 h-6
                                ${item.status === 'live'
                                  ? 'text-green-400'
                                  : 'text-gray-400'
                                }
                              `} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold mb-1">{item.title}</h4>
                              <p className="text-sm text-gray-400 mb-3">{item.description}</p>
                              {item.metric && (
                                <div className="text-xs font-bold text-green-400 mb-2">
                                  → {item.metric}
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${getStatusDot(item.status)}`} />
                                <span className="text-xs text-gray-500 font-semibold">
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

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-20 text-center"
        >
          <div className="max-w-3xl mx-auto p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-green-500/10 border border-gray-700">
            <h3 className="text-2xl font-bold mb-4">The Math Is Dead Simple</h3>
            <div className="bg-black/50 rounded-lg p-6 mb-6 font-mono text-sm text-left max-w-xl mx-auto">
              <div className="text-gray-400 mb-2">You deposit: <span className="text-white font-bold">$5,000 USDC</span></div>
              <div className="text-gray-400 mb-2">Weekly return: <span className="text-green-400 font-bold">$100 (2%)</span></div>
              <div className="text-gray-400 mb-2">Annual return: <span className="text-green-400 font-bold">$5,200 (104% APY)</span></div>
              <div className="text-gray-400 mb-4">RFT tokens: <span className="text-purple-400 font-bold">5,000-7,500 RFT (accumulating weekly)</span></div>
              <div className="border-t border-gray-700 pt-3 mt-3">
                <div className="text-yellow-400 font-bold">Real profits from phone arbitrage. Not promises.</div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-4 text-gray-300">Why I Can Offer This</h4>
              <div className="grid md:grid-cols-3 gap-4 text-left">
                <div className="p-4 bg-black/50 rounded-lg border border-gray-800">
                  <div className="text-2xl font-bold text-purple-400 mb-1">$2.3M</div>
                  <p className="text-sm text-gray-400">
                    Revenue already generated. This isn&apos;t theoretical.
                  </p>
                </div>
                <div className="p-4 bg-black/50 rounded-lg border border-gray-800">
                  <div className="text-2xl font-bold text-green-400 mb-1">10-20%</div>
                  <p className="text-sm text-gray-400">
                    Margins on every phone. I take 20%, LPs get 80% as 2% weekly.
                  </p>
                </div>
                <div className="p-4 bg-black/50 rounded-lg border border-gray-800">
                  <div className="text-2xl font-bold text-pink-400 mb-1">Same-Day</div>
                  <p className="text-sm text-gray-400">
                    Flips to wholesale. No inventory risk. Fast capital rotation.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mb-6">
              <p className="text-lg font-bold text-white mb-2">
                No complicated DeFi. No validators. No BS.
              </p>
              <p className="text-sm text-gray-400">
                Just phone arbitrage that actually works + a liquidity pool that pays you weekly.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/stake"
                className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-600 to-green-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 group"
              >
                Start Earning 2% Weekly
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/stats"
                className="inline-flex items-center justify-center px-8 py-3 bg-gray-800 border border-gray-700 rounded-lg font-semibold hover:bg-gray-700 transition-all duration-300"
              >
                View Live Stats
              </Link>
            </div>

            <div className="mt-6 text-xs text-gray-500">
              First 100 depositors get 1.5x RFT bonus. Early supporters get rewarded.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
