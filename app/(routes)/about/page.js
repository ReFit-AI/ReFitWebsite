'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Zap, Users, Globe } from 'lucide-react'
export default function AboutPage() {
  const values = [
    {
      icon: Shield,
      title: 'Trust & Transparency',
      description: 'Every transaction is recorded on the Solana blockchain, ensuring complete transparency and security.'
    },
    {
      icon: Zap,
      title: 'Speed & Efficiency',
      description: 'Leveraging Solana\'s high-performance blockchain for instant quotes and rapid settlements.'
    },
    {
      icon: Users,
      title: 'Community First',
      description: 'Building a platform that serves the Solana community with fair prices and excellent service.'
    },
    {
      icon: Globe,
      title: 'Global Access',
      description: 'Borderless transactions powered by cryptocurrency, accessible to users worldwide.'
    }
  ]

  return (
    <div className="min-h-screen py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Hero Section */}
            <div className="text-center mb-16">
              <h1 className="text-5xl font-bold mb-6">
                Reimagining Device Trade
                <span className="block text-3xl mt-2 bg-gradient-to-r from-solana-purple to-solana-green bg-clip-text text-transparent">
                  on Solana
                </span>
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                We&apos;re building the future of device buyback, where blockchain technology 
                enables transparent pricing and instant, secure transactions.
              </p>
            </div>

            {/* Mission Section */}
            <div className="glass rounded-2xl p-8 mb-12">
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-gray-300 leading-relaxed">
                We&apos;re creating a platform that makes selling your devices simple and transparent. 
                By leveraging Solana&apos;s orderbook functionality and smart contracts, we eliminate middlemen, 
                reduce fees, and ensure instant, verifiable transactions.
              </p>
            </div>

            {/* Values Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              {values.map((value, index) => {
                const Icon = value.icon
                return (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="glass rounded-2xl p-6"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-solana-purple to-solana-green flex items-center justify-center flex-shrink-0">
                        <Icon size={24} className="text-black" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                        <p className="text-gray-400">{value.description}</p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Technology Section */}
            <div className="glass rounded-2xl p-8 mb-12">
              <h2 className="text-2xl font-bold mb-6">Powered by Solana</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-bold text-solana-purple mb-2">65,000+</div>
                  <p className="text-sm text-gray-400">Transactions per second</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-solana-green mb-2">$0.00025</div>
                  <p className="text-sm text-gray-400">Average transaction cost</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white mb-2">400ms</div>
                  <p className="text-sm text-gray-400">Block time</p>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold mb-8 text-center">How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    step: '1',
                    title: 'Get Quote',
                    description: 'Select your device and condition to receive an instant quote powered by market data.'
                  },
                  {
                    step: '2',
                    title: 'Ship Device',
                    description: 'Print your prepaid shipping label and send your device with full tracking.'
                  },
                  {
                    step: '3',
                    title: 'Get Paid',
                    description: 'Receive payment in USDC or SOL directly to your wallet upon device verification.'
                  }
                ].map((item, index) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-solana-purple to-solana-green flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-black">{item.step}</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="text-gray-400">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Contact Section */}
            <div className="glass rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
              <p className="text-gray-400 mb-6">
                Have questions or feedback? We&apos;d love to hear from you.
              </p>
              <a
                href="mailto:support@shoprefit.com"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-solana-purple to-solana-green text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Contact Support
              </a>
            </div>
          </motion.div>
        </div>
      </div>
  )
}
