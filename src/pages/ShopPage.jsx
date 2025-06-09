import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Smartphone, Star, Check, Info, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

const ShopPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const products = [
    {
      id: 'saga-used',
      name: 'Solana Saga (Refurbished)',
      category: 'used',
      price: 299,
      priceSOL: 2.5,
      image: '📱',
      condition: 'Excellent',
      features: [
        'Seed Vault hardware wallet',
        'Solana dApp Store',
        '512GB storage',
        'Fully tested & certified'
      ],
      availability: 'In Stock',
      rating: 4.8,
      reviews: 156
    },
    {
      id: 'seeker-new',
      name: 'Solana Seeker',
      category: 'new',
      price: 450,
      priceSOL: 3.75,
      image: '📱',
      condition: 'Brand New',
      features: [
        'Latest Seed Vault 2.0',
        'Enhanced crypto features',
        '256GB storage',
        'Factory sealed'
      ],
      availability: 'Pre-order',
      rating: 5.0,
      reviews: 42,
      isNew: true
    },
    {
      id: 'saga-mint',
      name: 'Solana Saga (Mint Condition)',
      category: 'used',
      price: 349,
      priceSOL: 2.9,
      image: '📱',
      condition: 'Like New',
      features: [
        'Original packaging',
        'All accessories included',
        '512GB storage',
        '90-day warranty'
      ],
      availability: 'Limited Stock',
      rating: 4.9,
      reviews: 89
    }
  ]

  const categories = [
    { id: 'all', label: 'All Phones' },
    { id: 'new', label: 'New' },
    { id: 'used', label: 'Refurbished' }
  ]

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory)

  return (
    <div className="min-h-screen py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4">
            Shop Solana Phones
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Get the ultimate crypto-native mobile experience. New and certified refurbished devices available.
          </p>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex rounded-xl bg-gray-900/50 p-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-solana-purple to-solana-green text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition-all duration-300 group"
            >
              {/* Product Badge */}
              {product.isNew && (
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-solana-purple to-solana-green text-white text-xs font-bold px-3 py-1 rounded-full">
                  NEW
                </div>
              )}

              {/* Product Image */}
              <div className="text-center mb-6">
                <div className="text-8xl mb-4">{product.image}</div>
                <div className="flex items-center justify-center space-x-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.floor(product.rating) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'}
                    />
                  ))}
                  <span className="text-sm text-gray-400 ml-2">({product.reviews})</span>
                </div>
              </div>

              {/* Product Info */}
              <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-2xl font-bold text-white">${product.price}</div>
                  <div className="text-sm text-gray-400">≈ {product.priceSOL} SOL</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-solana-green">{product.condition}</div>
                  <div className={`text-xs ${
                    product.availability === 'In Stock' ? 'text-green-400' :
                    product.availability === 'Pre-order' ? 'text-yellow-400' :
                    'text-orange-400'
                  }`}>
                    {product.availability}
                  </div>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-6">
                {product.features.map((feature, i) => (
                  <li key={i} className="flex items-start text-sm text-gray-300">
                    <Check size={16} className="text-solana-green mr-2 mt-0.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              <button className="w-full btn-primary group-hover:shadow-lg group-hover:shadow-solana-purple/30 transition-all duration-300">
                <ShoppingCart size={18} className="mr-2" />
                {product.availability === 'Pre-order' ? 'Pre-order Now' : 'Add to Cart'}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Trade-In Promo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass border border-solana-purple/20 rounded-2xl p-8 text-center"
        >
          <div className="max-w-3xl mx-auto">
            <Zap className="w-12 h-12 text-solana-green mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Trade In & Save</h2>
            <p className="text-gray-300 mb-6">
              Get an extra 20% credit when you trade in your old phone towards a Solana device.
              Complete the circle - sell your old phone and upgrade to crypto-native hardware.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/sell" className="btn-secondary">
                Check Trade-In Value
              </Link>
              <button className="btn-primary">
                Learn More
              </button>
            </div>
          </div>
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-solana-purple/20 to-solana-green/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Smartphone className="text-solana-purple" size={24} />
            </div>
            <h3 className="font-semibold mb-2">Certified Quality</h3>
            <p className="text-sm text-gray-400">
              All refurbished phones undergo rigorous testing and come with warranty
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-solana-purple/20 to-solana-green/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Zap className="text-solana-green" size={24} />
            </div>
            <h3 className="font-semibold mb-2">Crypto Ready</h3>
            <p className="text-sm text-gray-400">
              Built-in hardware wallet and native Solana dApp support
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-solana-purple/20 to-solana-green/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Info className="text-white" size={24} />
            </div>
            <h3 className="font-semibold mb-2">Expert Support</h3>
            <p className="text-sm text-gray-400">
              Get help from our crypto-savvy support team 24/7
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ShopPage
