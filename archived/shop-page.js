'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Star, Check, Info, Zap } from 'lucide-react'

export default function ShopPage() {
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
            <div className="inline-flex bg-gray-900 rounded-lg p-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="group relative bg-gray-900 rounded-2xl overflow-hidden hover:bg-gray-800 transition-all duration-300"
              >
                {product.isNew && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="px-3 py-1 bg-solana-green text-black text-sm font-bold rounded-full flex items-center">
                      <Zap size={14} className="mr-1" />
                      NEW
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Product Image */}
                  <div className="text-8xl text-center mb-6">{product.image}</div>

                  {/* Product Info */}
                  <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      product.condition === 'Brand New' 
                        ? 'bg-solana-green/20 text-solana-green' 
                        : product.condition === 'Like New'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-gray-700 text-gray-300'
                    }`}>
                      {product.condition}
                    </span>
                    
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="ml-1 text-sm">{product.rating}</span>
                      <span className="ml-1 text-sm text-gray-500">({product.reviews})</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <Check className="w-4 h-4 text-solana-green mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold">${product.price}</span>
                      <span className="ml-2 text-lg text-gray-400">or {product.priceSOL} SOL</span>
                    </div>
                    <span className={`text-sm ${
                      product.availability === 'In Stock' 
                        ? 'text-solana-green' 
                        : product.availability === 'Pre-order'
                        ? 'text-yellow-500'
                        : 'text-orange-500'
                    }`}>
                      {product.availability}
                    </span>
                  </div>

                  {/* Action Button */}
                  <button className="w-full py-3 bg-gradient-to-r from-solana-purple to-solana-green text-white font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center group-hover:scale-105 transform transition-transform">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {product.availability === 'Pre-order' ? 'Pre-order Now' : 'Add to Cart'}
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 bg-gray-900 rounded-2xl p-8 text-center"
          >
            <Info className="w-12 h-12 text-solana-purple mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Why Buy From ReFit?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
              <div>
                <h3 className="font-semibold mb-2">✓ Certified Quality</h3>
                <p className="text-sm text-gray-400">Every refurbished phone is thoroughly tested and certified to meet our high standards.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">✓ Warranty Included</h3>
                <p className="text-sm text-gray-400">All devices come with warranty protection for your peace of mind.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">✓ Pay with SOL</h3>
                <p className="text-sm text-gray-400">Native crypto payments with instant settlement and no conversion fees.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
  )
}
