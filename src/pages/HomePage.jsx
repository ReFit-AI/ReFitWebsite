import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, Zap, DollarSign, Smartphone, Coins, TrendingUp, Calculator, Package, Wallet, Play } from 'lucide-react'

const HomePage = () => {
  const features = [
    {
      icon: Zap,
      title: 'Instant Quotes',
      description: 'Get an immediate price for your device powered by Solana smart contracts'
    },
    {
      icon: Shield,
      title: 'Secure & Transparent',
      description: 'All transactions are recorded on the Solana blockchain'
    },
    {
      icon: DollarSign,
      title: 'Best Prices',
      description: 'Competitive offers backed by orderbook liquidity'
    }
  ]

  const phoneModels = [
    { name: 'iPhone 15 Pro', price: '$960', image: '📱' },
    { name: 'Solana Phone', price: '$240', image: '📱' },
    { name: 'iPhone 14 Pro', price: '$720', image: '📱' },
    { name: 'Samsung Galaxy S24', price: '$680', image: '📱' },
    { name: 'iPhone 13 Pro', price: '$560', image: '📱' },
    { name: 'Pixel 8 Pro', price: '$520', image: '📱' }
  ]

  const steps = [
    { icon: Calculator, title: 'Get Quote', description: 'Select your device and condition for instant pricing' },
    { icon: Package, title: 'Ship Free', description: 'We provide a prepaid shipping label' },
    { icon: Wallet, title: 'Get Paid', description: 'Receive SOL payment within 24 hours of inspection' }
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-solana-purple/10 via-transparent to-solana-green/10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            className="text-center max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Centered Vision Text */}
            <div className="mb-12">
              <h2 className="text-3xl lg:text-4xl font-light text-gray-300 mb-6">
                DeFi meets Real World Assets
              </h2>
              <h1 className="text-6xl lg:text-8xl font-bold tracking-tight mb-6">
                <span className="bg-gradient-to-r from-solana-purple via-cyan-400 to-solana-green bg-clip-text text-transparent">
                  Trade phones like tokens
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-400 max-w-3xl mx-auto">
                Starting with Solana phones. Expanding to all hardware.
              </p>
            </div>
            
            {/* Expanded Vision Preview */}
            <div className="mb-12 p-6 bg-gray-900/50 rounded-2xl backdrop-blur-sm max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="text-center">
                  <div className="text-solana-purple font-bold mb-2">Consumer Layer</div>
                  <p className="text-gray-400">Instant buyback • Shop refurbished • Trade-in credits</p>
                </div>
                <div className="text-center">
                  <div className="text-cyan-400 font-bold mb-2">Wholesale Layer</div>
                  <p className="text-gray-400">100+ unit lots • B2B DEX • Bulk pricing</p>
                </div>
                <div className="text-center">
                  <div className="text-solana-green font-bold mb-2">DeFi Layer</div>
                  <p className="text-gray-400">Tokenized inventory • Futures • Yield vaults</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link to="/sell" className="btn-primary group">
                Sell Your Phone
                <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={20} />
              </Link>
              <Link to="/shop" className="btn-secondary group">
                <Smartphone className="mr-2" size={20} />
                Shop Phones
              </Link>
              <Link to="/pitch" className="btn-secondary group">
                <Play className="mr-2" size={20} />
                View Full Vision
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Popular Devices */}
      <section className="py-20 border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Popular Devices</h2>
            <p className="text-gray-400 text-lg">See what your device is worth today</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {phoneModels.map((phone, index) => (
              <motion.div
                key={phone.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition-all duration-300 group cursor-pointer"
              >
                <div className="text-4xl mb-4">{phone.image}</div>
                <h3 className="text-xl font-semibold mb-2">{phone.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-solana-green">{phone.price}</span>
                  <TrendingUp className="text-solana-purple group-hover:text-solana-green transition-colors" size={20} />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/sell" className="btn-secondary">
              See All Devices
              <ArrowRight className="ml-2" size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-gray-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">How it works</h2>
            <p className="text-gray-400 text-lg">Three simple steps to get paid</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-solana-purple to-solana-green rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                    <Icon className="text-black" size={32} />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{step.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Why choose us?</h2>
            <p className="text-gray-400 text-lg">Built for the crypto generation</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center p-8 rounded-2xl bg-gray-900/30 border border-gray-800 hover:border-gray-700 transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-solana-purple/20 to-solana-green/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Icon className="text-solana-purple" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Complete Circle Section */}
      <section className="py-20 bg-gradient-to-b from-gray-950/50 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">The Complete Circle</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Trade in your old device and upgrade to crypto-native hardware. 
              One platform, endless possibilities.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-8"
            >
              <h3 className="text-2xl font-bold mb-4 text-solana-purple">Sell Your Old Phone</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <TrendingUp className="text-solana-green mr-3" size={20} />
                  <span>Get instant quotes and SOL payments</span>
                </li>
                <li className="flex items-center">
                  <Package className="text-solana-green mr-3" size={20} />
                  <span>Free shipping with prepaid labels</span>
                </li>
                <li className="flex items-center">
                  <Shield className="text-solana-green mr-3" size={20} />
                  <span>Secure data wiping guaranteed</span>
                </li>
              </ul>
              <Link to="/sell" className="btn-secondary w-full justify-center">
                Check Trade-In Value
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-8"
            >
              <h3 className="text-2xl font-bold mb-4 text-solana-green">Buy Solana Phones</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <Smartphone className="text-solana-purple mr-3" size={20} />
                  <span>Saga & Seeker devices available</span>
                </li>
                <li className="flex items-center">
                  <Coins className="text-solana-purple mr-3" size={20} />
                  <span>Built-in hardware wallet security</span>
                </li>
                <li className="flex items-center">
                  <Zap className="text-solana-purple mr-3" size={20} />
                  <span>Native Solana dApp integration</span>
                </li>
              </ul>
              <Link to="/shop" className="btn-primary w-full justify-center">
                Browse Phones
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center space-x-2 text-sm text-gray-400 bg-gray-900/50 px-4 py-2 rounded-full">
              <Zap size={16} className="text-solana-green" />
              <span>Trade-in customers get 20% extra credit on phone purchases</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-solana-purple/10 to-solana-green/10">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Smartphone className="mx-auto mb-8 text-solana-purple" size={64} />
            <h2 className="text-4xl font-bold mb-6">Ready to get started?</h2>
            <p className="text-xl text-gray-400 mb-10">
              Turn your old device into SOL in minutes. Fast, secure, and transparent.
            </p>
            <Link to="/sell" className="btn-primary text-lg px-10 py-4">
              Sell Your Device Now
              <ArrowRight className="ml-3" size={20} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
