'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Target, 
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
      quarter: "Live Now",
      title: "Device Trade-In Platform",
      status: "completed",
      items: [
        { 
          title: "Instant Phone Valuation", 
          description: "Get real-time quotes for your device based on condition and model",
          icon: CircleDollarSign,
          status: "completed"
        },
        { 
          title: "SOL Payments", 
          description: "Receive payment directly to your Solana wallet - fast and secure",
          icon: DollarSign,
          status: "completed"
        },
        { 
          title: "Free Shipping", 
          description: "We cover shipping costs and provide tracking for your device",
          icon: Shield,
          status: "completed"
        },
        { 
          title: "White Glove Service", 
          description: "Personal support throughout your trade-in process",
          icon: Sparkles,
          status: "completed"
        }
      ]
    },
    {
      quarter: "Q1 2025",
      title: "Perpetual Upgrade Program Launch",
      status: "in-progress",
      items: [
        { 
          title: "Staking Mechanism", 
          description: "Choose to stake part of your trade-in value for continuous rewards",
          icon: TrendingUp,
          status: "in-progress"
        },
        { 
          title: "ReFit Validator", 
          description: "Deploy our Solana validator - earn real network rewards",
          icon: Cpu,
          status: "in-progress"
        },
        { 
          title: "RFT Token Launch", 
          description: "Native token rewards for stakers - 400M community allocation",
          icon: CircleDollarSign,
          status: "in-progress"
        },
        { 
          title: "Early Adopter Bonuses", 
          description: "First 100 stakers receive bonus APY and founding member status",
          icon: Rocket,
          status: "in-progress"
        }
      ]
    },
    {
      quarter: "Q2 2025",
      title: "Ecosystem Expansion",
      status: "upcoming",
      items: [
        { 
          title: "V3RA AI Valuation", 
          description: "AI-powered instant device assessment - get your price in seconds",
          icon: Brain,
          status: "upcoming",
          hasDemo: true
        },
        { 
          title: "Smart Contract Automation", 
          description: "Fully automated trade-in and staking through on-chain programs",
          icon: Code,
          status: "upcoming"
        },
        { 
          title: "Device Insurance Options", 
          description: "Protect your future upgrades with optional coverage plans",
          icon: Shield,
          status: "upcoming"
        },
        { 
          title: "Referral Program", 
          description: "Earn RFT tokens for bringing friends to the platform",
          icon: Users,
          status: "upcoming"
        },
        { 
          title: "Mobile App", 
          description: "iOS and Android apps for easy device assessment and tracking",
          icon: RefreshCw,
          status: "upcoming"
        }
      ]
    },
    {
      quarter: "Q3-Q4 2025",
      title: "Scale & Partnerships",
      status: "upcoming",
      items: [
        { 
          title: "Repair Shop Network", 
          description: "Partner with local repair shops for device refurbishment",
          icon: Globe,
          status: "upcoming"
        },
        { 
          title: "Corporate Programs", 
          description: "B2B solutions for company device upgrade cycles",
          icon: Building,
          status: "upcoming"
        },
        { 
          title: "Expanded Device Types", 
          description: "Accept tablets, laptops, wearables, and gaming consoles",
          icon: Cpu,
          status: "upcoming"
        },
        { 
          title: "Global Expansion", 
          description: "Launch in new markets beyond the US",
          icon: Target,
          status: "upcoming"
        }
      ]
    },
    {
      quarter: "Long-Term Vision",
      title: "The Future of Device Ownership",
      status: "upcoming",
      items: [
        { 
          title: "Perpetual Upgrade Achievement", 
          description: "Stack enough value to earn a free phone every upgrade cycle",
          icon: DollarSign,
          status: "upcoming"
        },
        { 
          title: "1 Million Devices Processed", 
          description: "Become the leading blockchain-based trade-in platform",
          icon: Globe,
          status: "upcoming"
        },
        { 
          title: "Zero E-Waste Initiative", 
          description: "100% of devices refurbished or responsibly recycled",
          icon: RefreshCw,
          status: "upcoming"
        },
        { 
          title: "Device-as-a-Service", 
          description: "Never buy a phone again - just continuously upgrade",
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
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
              ReFit Roadmap
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              From simple trade-ins to perpetual upgrades. We&apos;re building a sustainable future 
              where your old devices fund your new ones through staking rewards.
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
              <h3 className="text-2xl font-bold mb-4">Join the Perpetual Upgrade Revolution</h3>
              <p className="text-gray-400 mb-6">
                Trade in your device today and be among the first to access staking rewards when they launch in Q1 2025.
              </p>
              
              {/* Partnership Opportunities */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold mb-4 text-gray-300">Seeking Strategic Partnerships</h4>
                <div className="grid md:grid-cols-3 gap-4 mb-6 text-left">
                  <div className="p-4 bg-black/50 rounded-lg border border-gray-800 hover:border-purple-500/50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-purple-400" />
                      <h5 className="font-semibold text-purple-400">Venture Capital</h5>
                    </div>
                    <p className="text-sm text-gray-400">
                      Seeking funding to accelerate platform development and expand operations
                    </p>
                  </div>
                  <div className="p-4 bg-black/50 rounded-lg border border-gray-800 hover:border-green-500/50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-green-400" />
                      <h5 className="font-semibold text-green-400">Solana Ecosystem</h5>
                    </div>
                    <p className="text-sm text-gray-400">
                      Open to collaboration with Solana Foundation and ecosystem partners
                    </p>
                  </div>
                  <div className="p-4 bg-black/50 rounded-lg border border-gray-800 hover:border-pink-500/50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-pink-400" />
                      <h5 className="font-semibold text-pink-400">Device Partners</h5>
                    </div>
                    <p className="text-sm text-gray-400">
                      Interested in partnerships with manufacturers and retailers
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 italic">
                  Your old phone is worth more than cash – it&apos;s your entry into perpetual upgrades.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/sell"
                  className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-600 to-green-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 group"
                >
                  Start Trading Today
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/stake"
                  className="inline-flex items-center justify-center px-8 py-3 bg-gray-800 border border-gray-700 rounded-lg font-semibold hover:bg-gray-700 transition-all duration-300"
                >
                  Learn About Staking
                </Link>
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