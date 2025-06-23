'use client'

import React from 'react'
import { motion } from 'framer-motion'
export default function PitchPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold mb-6">
              The Future of Physical Asset Trading
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              ReFit - DeFi meets Real World Assets
            </p>
            <div className="text-7xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-green-400 bg-clip-text text-transparent mb-8">
              Trade phones like tokens
            </div>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Starting with Solana phones. Expanding to all hardware.
            </p>
          </motion.div>
        </div>
      </div>
  )
}
