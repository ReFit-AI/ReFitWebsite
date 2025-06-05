import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Clock, Shield, CheckCircle } from 'lucide-react'

const PriceQuote = ({ quote, phoneData }) => {
  const { usdPrice, solPrice, estimatedProcessingTime, confidence } = quote

  const formatPhoneDetails = (data) => {
    return `${data.brand} ${data.model} (${data.storage})`
  }

  const getConfidenceColor = (level) => {
    switch (level) {
      case 'high': return 'text-solana-green'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-red-500'
      default: return 'text-gray-400'
    }
  }

  const getConditionDetails = (condition) => {
    const conditions = {
      'like-new': { label: 'Like New', multiplier: '100%' },
      'excellent': { label: 'Excellent', multiplier: '90%' },
      'good': { label: 'Good', multiplier: '75%' },
      'fair': { label: 'Fair', multiplier: '60%' },
      'poor': { label: 'Poor', multiplier: '40%' }
    }
    return conditions[condition] || { label: 'Unknown', multiplier: 'N/A' }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Main Quote Card */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl p-8 border border-gray-700">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold mb-2">Your Device Quote</h3>
          <p className="text-gray-400">{formatPhoneDetails(phoneData)}</p>
        </div>

        {/* Price Display */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center space-x-4 bg-black/30 rounded-2xl p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-solana-green mb-1">
                {solPrice} SOL
              </div>
              <div className="text-2xl text-gray-300">
                ${usdPrice}
              </div>
            </div>
            <div className="w-px h-12 bg-gray-700" />
            <div className="text-center">
              <div className={`text-lg font-semibold ${getConfidenceColor(confidence)}`}>
                {confidence.charAt(0).toUpperCase() + confidence.slice(1)} Confidence
              </div>
              <div className="text-sm text-gray-400">
                Based on market data
              </div>
            </div>
          </div>
        </div>

        {/* Quote Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800/30 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp size={16} className="text-solana-purple" />
              <span className="font-medium">Market Performance</span>
            </div>
            <p className="text-sm text-gray-400">
              This model has shown strong resale value with {confidence === 'high' ? 'minimal' : 'moderate'} depreciation.
            </p>
          </div>

          <div className="bg-gray-800/30 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock size={16} className="text-solana-green" />
              <span className="font-medium">Processing Time</span>
            </div>
            <p className="text-sm text-gray-400">
              {estimatedProcessingTime} after we receive your device
            </p>
          </div>
        </div>

        {/* Device Assessment */}
        <div className="border-t border-gray-700 pt-6">
          <h4 className="font-semibold mb-4">Device Assessment</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Condition</span>
              <span className="font-medium">
                {getConditionDetails(phoneData.condition).label} 
                <span className="text-solana-green ml-2">
                  ({getConditionDetails(phoneData.condition).multiplier} value)
                </span>
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Storage</span>
              <span className="font-medium">{phoneData.storage}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Screen Condition</span>
              <span className="font-medium capitalize">{phoneData.screenDamage || 'Perfect'}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Battery Health</span>
              <span className="font-medium capitalize">{phoneData.batteryHealth}</span>
            </div>

            {(phoneData.hasCharger || phoneData.hasBox) && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Accessories</span>
                <div className="flex items-center space-x-2">
                  {phoneData.hasCharger && (
                    <span className="text-xs bg-solana-green/20 text-solana-green px-2 py-1 rounded">
                      Charger
                    </span>
                  )}
                  {phoneData.hasBox && (
                    <span className="text-xs bg-solana-green/20 text-solana-green px-2 py-1 rounded">
                      Box
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900/30 rounded-xl p-4 text-center">
          <Shield className="mx-auto mb-2 text-solana-purple" size={24} />
          <div className="font-medium mb-1">Secure Payment</div>
          <div className="text-sm text-gray-400">Blockchain-verified transactions</div>
        </div>

        <div className="bg-gray-900/30 rounded-xl p-4 text-center">
          <CheckCircle className="mx-auto mb-2 text-solana-green" size={24} />
          <div className="font-medium mb-1">Instant Quote</div>
          <div className="text-sm text-gray-400">No waiting, get paid fast</div>
        </div>

        <div className="bg-gray-900/30 rounded-xl p-4 text-center">
          <Clock className="mx-auto mb-2 text-solana-purple" size={24} />
          <div className="font-medium mb-1">Quick Process</div>
          <div className="text-sm text-gray-400">Ship today, get SOL tomorrow</div>
        </div>
      </div>

      {/* Quote Validity */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Clock size={16} className="text-yellow-500" />
          <span className="font-medium text-yellow-500">Quote Valid for 10 Minutes</span>
        </div>
        <p className="text-sm text-gray-400">
          Prices are subject to market fluctuations. Accept now to lock in this quote.
        </p>
      </div>
    </motion.div>
  )
}

export default PriceQuote
