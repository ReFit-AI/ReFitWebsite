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
  Coins,
  Package,
  Layers,
  ShoppingCart
} from 'lucide-react'

export default function RoadmapPage() {
  const phases = [
    {
      phase: "Phase 1",
      title: "Build The Infrastructure",
      timeline: "Q1 2025 - COMPLETE",
      status: "live",
      goal: "Operating System Live",
      description: "Built end-to-end inventory management, invoicing, and shipping infrastructure. Processed real transactions to validate the model.",
      items: [
        {
          title: "Inventory Management System",
          description: "Full CRUD system for tracking phones from purchase to sale. Real-time status updates, margin calculations, and performance analytics.",
          icon: Package,
          status: "live",
          metric: "29 units tracked"
        },
        {
          title: "Invoice & Shipping System",
          description: "Generate professional invoices with QR codes, create shipping labels, track shipments. Full integration with real buyers.",
          icon: ShoppingCart,
          status: "live",
          metric: "Automated workflows"
        },
        {
          title: "Business Analytics Dashboard",
          description: "Real-time metrics on revenue, profit, margins, inventory turnover. Apple-inspired design with glassmorphic UI.",
          icon: BarChart3,
          status: "live",
          metric: "$12K+ tracked"
        },
        {
          title: "Admin Authentication",
          description: "Wallet-based admin access with proper security. Only authorized wallet can access backend operations.",
          icon: Zap,
          status: "live",
          metric: "Solana secured"
        }
      ]
    },
    {
      phase: "Phase 2",
      title: "Launch The Pool",
      timeline: "Q2 2025",
      status: "in-progress",
      goal: "$50K Initial Pool",
      description: "Open capital pool for LPs. Use proven infrastructure to deploy capital at scale. Start weekly distributions from real profits.",
      items: [
        {
          title: "Pool Smart Contract",
          description: "Solana program for USDC deposits, withdrawal queue, and weekly distribution logic. Audited, secure, transparent.",
          icon: Layers,
          status: "upcoming",
          metric: "Solana native"
        },
        {
          title: "LP Deposits Live",
          description: "Public pool goes live. Deposit USDC, earn 2% weekly from phone arbitrage profits. First 100 depositors get 1.5x RFT bonus.",
          icon: DollarSign,
          status: "upcoming",
          metric: "104% APY target"
        },
        {
          title: "Weekly Distributions",
          description: "Every Monday - automated 2% returns to all LPs. Using existing systems to buy phones, flip to wholesale, distribute profits.",
          icon: TrendingUp,
          status: "upcoming",
          metric: "Automated payouts"
        },
        {
          title: "RFT Accumulation",
          description: "LPs earn RFT tokens for every dollar deposited. Early supporters get 1.5x rate. Tokens accumulate until Phase 4 launch.",
          icon: Coins,
          status: "upcoming",
          metric: "1-1.5x multiplier"
        }
      ]
    },
    {
      phase: "Phase 3",
      title: "Scale The Operations",
      timeline: "Q3 2025",
      status: "upcoming",
      goal: "$250K Pool",
      description: "More capital = better deals = higher margins. Build team, improve systems, increase volume. Prove the model at scale.",
      items: [
        {
          title: "Grow Pool to $250K",
          description: "More buying power means better wholesale relationships, bulk deals, and negotiating leverage. Capital compounds the advantage.",
          icon: BarChart3,
          status: "upcoming",
          metric: "$250K target"
        },
        {
          title: "Hire Operations Team",
          description: "Bring on help for pickups, testing, shipping. Focus founder time on deal sourcing and pool management.",
          icon: Users,
          status: "upcoming",
          metric: "2-3 team members"
        },
        {
          title: "Multiple Buyer Network",
          description: "3-5 wholesale buyers competing for inventory. Better prices, faster flips, reduced risk. Market competition works for LPs.",
          icon: Target,
          status: "upcoming",
          metric: "Same-day liquidity"
        },
        {
          title: "Consistent Track Record",
          description: "26+ weeks of 2% returns. Proof the model works at scale. Build trust through performance, not promises.",
          icon: Trophy,
          status: "upcoming",
          metric: "6+ months live"
        }
      ]
    },
    {
      phase: "Phase 4",
      title: "Launch The Marketplace",
      timeline: "Q4 2025",
      status: "upcoming",
      goal: "Orderbook Goes Live",
      description: "Transform from pool-only model to full marketplace. Let anyone trade phones wholesale with on-chain settlement. This is where it gets interesting.",
      items: [
        {
          title: "Public Orderbook",
          description: "DEX-style interface for wholesale phone trading. Buyers and sellers post orders, Solana handles settlement. Real-time price discovery.",
          icon: ShoppingCart,
          status: "upcoming",
          metric: "Live marketplace"
        },
        {
          title: "Pool Becomes Liquidity Provider",
          description: "LP capital automatically deployed to capture arbitrage on the orderbook. Pool acts as market maker, earns from spreads + margins.",
          icon: Layers,
          status: "upcoming",
          metric: "Automated capital"
        },
        {
          title: "Transaction Fee Model",
          description: "Marketplace takes 2-3% per trade. Fees distributed to RFT holders. Volume creates sustainable revenue beyond arbitrage profits.",
          icon: DollarSign,
          status: "upcoming",
          metric: "Protocol revenue"
        },
        {
          title: "RFT Token Launch",
          description: "Convert accumulated points to actual tokens. List on Raydium/Jupiter. Early LPs have 6-12 months of accumulation at 1.5x rate.",
          icon: Coins,
          status: "upcoming",
          metric: "Airdrop to LPs"
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
            <span className="block text-white">Building The First</span>
            <span className="block bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
              On-Chain RWA Marketplace
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-4">
            Capital layer + Trading layer. DeFi meets real-world arbitrage.
          </p>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            We built the infrastructure. Now we&apos;re launching the pool. Then we open the marketplace.
            Every phase builds on the last.
          </p>
        </motion.div>

        {/* The Vision Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto mb-16 p-8 bg-gradient-to-br from-purple-900/20 via-black to-green-900/20 border border-gray-800 rounded-2xl"
        >
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl mb-2">💰</div>
              <h3 className="font-bold mb-2">Pool Provides Capital</h3>
              <p className="text-sm text-gray-400">LPs deposit USDC. We deploy it into proven phone arbitrage. 2% weekly returns from real profits.</p>
            </div>
            <div>
              <div className="text-4xl mb-2">📊</div>
              <h3 className="font-bold mb-2">Marketplace Scales Volume</h3>
              <p className="text-sm text-gray-400">DEX-style orderbook for wholesale trading. Anyone can buy/sell. Solana handles settlement. Pool acts as liquidity provider.</p>
            </div>
            <div>
              <div className="text-4xl mb-2">🔄</div>
              <h3 className="font-bold mb-2">Flywheel Effect</h3>
              <p className="text-sm text-gray-400">More capital → better deals → more volume → higher fees → bigger returns → attracts more capital.</p>
            </div>
          </div>
          <div className="text-center mt-6 pt-6 border-t border-gray-800">
            <p className="text-green-400 font-bold text-lg mb-2">
              ✅ Phase 1 Complete - Infrastructure is live
            </p>
            <p className="text-sm text-gray-400">
              29 phones processed • $12K revenue • 13.6% margins • Full inventory/invoicing system operational
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
                    phase.status === 'live'
                      ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/50'
                      : phase.status === 'in-progress'
                      ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/50'
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
                      <span className={`px-3 py-1 border rounded-full text-sm font-bold ${
                        phase.status === 'live'
                          ? 'bg-green-900/30 border-green-500/50 text-green-400'
                          : phase.status === 'in-progress'
                          ? 'bg-yellow-900/30 border-yellow-500/50 text-yellow-400'
                          : 'bg-gray-900/30 border-gray-500/50 text-gray-400'
                      }`}>
                        {phase.goal}
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

        {/* Why This Works Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-20"
        >
          <div className="max-w-4xl mx-auto p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-green-500/10 border border-gray-700">
            <h3 className="text-2xl font-bold mb-6 text-center">Why This Model Works</h3>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-black/50 rounded-lg p-6 border border-gray-800">
                <h4 className="text-lg font-semibold mb-3 text-purple-400">Traditional Arbitrage Problem</h4>
                <p className="text-sm text-gray-400 mb-3">
                  Individual traders are capital-constrained. You can only buy what you can afford. Miss deals when cash is tied up.
                </p>
                <div className="text-xs text-gray-500">
                  • Limited buying power<br/>
                  • Can&apos;t scale operations<br/>
                  • Miss time-sensitive deals
                </div>
              </div>

              <div className="bg-black/50 rounded-lg p-6 border border-gray-800">
                <h4 className="text-lg font-semibold mb-3 text-green-400">Pool + Marketplace Solution</h4>
                <p className="text-sm text-gray-400 mb-3">
                  Aggregate capital from LPs. Deploy at scale. Eventually open marketplace for anyone to trade. Pool becomes liquidity provider.
                </p>
                <div className="text-xs text-gray-500">
                  • Unlimited buying power<br/>
                  • Capture every deal<br/>
                  • Marketplace fees create moat
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/30 to-green-900/30 rounded-lg p-6 border border-purple-500/30 mb-6">
              <h4 className="text-lg font-semibold mb-3 text-center">The Flywheel</h4>
              <div className="flex items-center justify-center gap-3 flex-wrap text-sm">
                <span className="px-3 py-1 bg-purple-500/20 rounded-lg border border-purple-500/30">More Capital</span>
                <span className="text-gray-500">→</span>
                <span className="px-3 py-1 bg-blue-500/20 rounded-lg border border-blue-500/30">Better Deals</span>
                <span className="text-gray-500">→</span>
                <span className="px-3 py-1 bg-green-500/20 rounded-lg border border-green-500/30">Higher Volume</span>
                <span className="text-gray-500">→</span>
                <span className="px-3 py-1 bg-yellow-500/20 rounded-lg border border-yellow-500/30">More Fees</span>
                <span className="text-gray-500">→</span>
                <span className="px-3 py-1 bg-pink-500/20 rounded-lg border border-pink-500/30">Bigger Returns</span>
                <span className="text-gray-500">→</span>
                <span className="px-3 py-1 bg-purple-500/20 rounded-lg border border-purple-500/30">Attracts More Capital</span>
              </div>
            </div>

            <div className="bg-black/50 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-semibold mb-4">What Makes This Defensible</h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-2xl font-bold text-purple-400 mb-1">Infrastructure</div>
                  <p className="text-gray-400">
                    Built real inventory/invoicing system. Not vaporware. Actual proven technology.
                  </p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400 mb-1">Network Effects</div>
                  <p className="text-gray-400">
                    More buyers/sellers → better prices → more participants. Marketplace compounds.
                  </p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-pink-400 mb-1">Capital Moat</div>
                  <p className="text-gray-400">
                    Pool LPs get first access to deals. Marketplace fees create sustainable revenue.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-lg font-bold text-white mb-4">
                This isn&apos;t just a pool. It&apos;s not just a marketplace.
              </p>
              <p className="text-base text-gray-300 mb-6">
                It&apos;s the first liquidity layer for real-world arbitrage, with on-chain settlement and transparent price discovery.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/stake"
                  className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-600 to-green-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 group"
                >
                  Join The Pool (Coming Soon)
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/admin/analytics"
                  className="inline-flex items-center justify-center px-8 py-3 bg-gray-800 border border-gray-700 rounded-lg font-semibold hover:bg-gray-700 transition-all duration-300"
                >
                  View Phase 1 Results
                </Link>
              </div>

              <div className="mt-6 text-xs text-gray-500">
                Pool launching Q2 2025 • First 100 depositors get 1.5x RFT bonus
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
