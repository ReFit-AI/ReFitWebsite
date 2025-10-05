import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Smartphone, ChevronRight } from 'lucide-react'

const SeekerComparison = ({ tradeInValue }) => {
  const [isHovered, setIsHovered] = useState(false)
  const SEEKER_PRICE = 500
  const difference = SEEKER_PRICE - tradeInValue
  const isUpgrade = difference <= 0
  const percentCovered = Math.min((tradeInValue / SEEKER_PRICE) * 100, 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mt-8"
    >
      {/* Special Offer Banner */}
      <div className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-green-600/20 rounded-2xl p-1">
        <div className="bg-black/80 rounded-xl p-8">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-green-400">
              Upgrade to Solana Seeker
            </h3>
          </div>

          {/* Visual Comparison */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Your Trade-In */}
            <motion.div 
              className="bg-gray-900/50 rounded-xl p-4 border border-gray-700"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-2">Your Trade-In Value</div>
                <div className="text-3xl font-bold text-green-400 mb-1">
                  ${tradeInValue}
                </div>
                <div className="text-sm text-gray-500">USDC</div>
              </div>
            </motion.div>

            {/* Seeker Price */}
            <motion.div 
              className="bg-gradient-to-br from-purple-900/30 to-green-900/30 rounded-xl p-4 border border-purple-500/30"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-2">Solana Seeker</div>
                <div className="text-3xl font-bold text-white mb-1">
                  ${SEEKER_PRICE}
                </div>
                <div className="text-sm text-purple-400">Web3 Phone</div>
              </div>
            </motion.div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Trade-in covers</span>
              <span className="text-sm font-bold text-green-400">{percentCovered.toFixed(0)}%</span>
            </div>
            <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-green-500"
                initial={{ width: 0 }}
                animate={{ width: `${percentCovered}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </div>

          {/* The Deal */}
          <motion.div
            className={`text-center p-6 rounded-xl mb-6 ${
              isUpgrade 
                ? 'bg-gradient-to-br from-green-900/50 to-green-800/30 border-2 border-green-500/50' 
                : 'bg-gray-900/50 border border-gray-700'
            }`}
            animate={{ 
              boxShadow: isUpgrade 
                ? ['0 0 20px rgba(34, 197, 94, 0.3)', '0 0 40px rgba(34, 197, 94, 0.5)', '0 0 20px rgba(34, 197, 94, 0.3)']
                : 'none'
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {isUpgrade ? (
              <>
                <div className="text-3xl font-bold text-green-400 mb-3">
                  FREE UPGRADE!
                </div>
                <p className="text-gray-300">
                  Your device covers the full cost of a Solana Seeker
                </p>
              </>
            ) : (
              <>
                <div className="text-lg text-gray-400 mb-2">Get a Solana Seeker for only</div>
                <div className="text-4xl font-bold text-white mb-2">
                  ${difference} more
                </div>
                <p className="text-sm text-gray-400">
                  Upgrade to the future of mobile Web3
                </p>
              </>
            )}
          </motion.div>


          {/* CTA Button */}
          <motion.a
            href="https://store.solanamobile.com/?utm_source=refit&utm_medium=trade_in&utm_campaign=seeker_upgrade"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`
              relative overflow-hidden rounded-xl p-4
              bg-gradient-to-r from-purple-600 to-green-600
              text-white font-bold text-lg
              flex items-center justify-center
              transition-all duration-300
              ${isHovered ? 'shadow-lg shadow-purple-500/50' : ''}
            `}>
              {/* Animated background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-green-600 to-purple-600"
                animate={{ x: isHovered ? '100%' : '0%' }}
                transition={{ duration: 0.5 }}
              />
              
              {/* Button content */}
              <div className="relative flex items-center">
                <Smartphone className="mr-2" size={20} />
                {isUpgrade ? 'Claim Your Free Seeker' : `Order Seeker - Only $${difference} More`}
                <motion.div
                  animate={{ x: isHovered ? 5 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronRight className="ml-2" size={20} />
                </motion.div>
              </div>
            </div>
          </motion.a>

          {/* Bonus RFT Info */}
          <div className="text-center mt-4 text-sm">
            <span className="text-yellow-400 font-semibold">BONUS:</span>
            <span className="text-gray-400 ml-2">
              Get 2X RFT tokens when you trade in AND buy a Seeker
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default SeekerComparison