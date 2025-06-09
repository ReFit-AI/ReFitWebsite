import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Zap, Users, Globe } from 'lucide-react'

const AboutPage = () => {
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
              We're building the future of device buyback, where blockchain technology 
              meets minimalist design to create a seamless trading experience.
            </p>
          </div>

          {/* Mission Section */}
          <div className="glass rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-300 leading-relaxed">
              We're creating a platform that makes selling your devices as simple as a single click. 
              By leveraging Solana's orderbook functionality and smart contracts, we eliminate middlemen, 
              reduce fees, and ensure instant, transparent transactions.
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

          {/* Roadmap */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center">Roadmap</h2>
            <div className="space-y-4">
              {[
                { phase: 'Phase 1', title: 'Launch Buyback Platform', status: 'current', desc: 'Accept phones with instant Solana payments' },
                { phase: 'Phase 2', title: 'Orderbook Integration', status: 'upcoming', desc: 'Full integration with Openbook for dynamic pricing' },
                { phase: 'Phase 3', title: 'P2P Marketplace', status: 'future', desc: 'Enable users to list and trade devices directly' },
                { phase: 'Phase 4', title: 'Global Expansion', status: 'future', desc: 'Support for international shipping and more devices' },
              ].map((item, index) => (
                <motion.div
                  key={item.phase}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`glass rounded-xl p-6 ${
                    item.status === 'current' ? 'border-l-4 border-solana-purple' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold mb-1">{item.phase}: {item.title}</h3>
                      <p className="text-sm text-gray-400">{item.desc}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === 'current' ? 'bg-solana-purple/20 text-solana-purple' :
                      item.status === 'upcoming' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-gray-800 text-gray-400'
                    }`}>
                      {item.status === 'current' ? 'In Progress' : 
                       item.status === 'upcoming' ? 'Coming Soon' : 'Future'}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center glass border border-solana-purple/20 rounded-2xl p-12 relative overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-solana-purple/10 rounded-full filter blur-3xl"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-solana-green bg-clip-text text-transparent">
                Ready to Get Started?
              </h2>
              <p className="text-gray-300 mb-8 text-lg max-w-2xl mx-auto">
                Join the future of device trading on Solana
              </p>
              <a 
                href="/sell" 
                className="group relative inline-flex items-center justify-center px-8 py-4 overflow-hidden rounded-xl hover:shadow-lg hover:shadow-solana-purple/30 transition-all duration-300 ease-out"
                style={{
                  background: 'linear-gradient(45deg, #9945FF 0%, #14F195 100%)',
                  boxShadow: '0 0 15px rgba(153, 69, 255, 0.5)'
                }}
              >
                <span className="relative z-10 flex items-center">
                  <span className="mr-2 font-bold text-lg tracking-wide">Sell Your Phone Now</span>
                  <svg className="w-5 h-5 font-bold transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
                <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default AboutPage
