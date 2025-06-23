'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Upload, X, Zap, CheckCircle } from 'lucide-react'

export default function DemoFlow({ onClose }) {
  const [step, setStep] = useState('upload')
  const [analyzing, setAnalyzing] = useState(false)
  const [showQuote, setShowQuote] = useState(false)

  const handleFileUpload = () => {
    setStep('analyzing')
    setAnalyzing(true)
    
    // Simulate AI analysis
    setTimeout(() => {
      setAnalyzing(false)
      setShowQuote(true)
    }, 3000)
  }

  const demoQuote = {
    model: "iPhone 12 Pro",
    condition: "Grade B - Good",
    details: [
      "Minor scratches on screen",
      "Battery health: 87%",
      "All functions working"
    ],
    valueUSD: 420,
    valueSOL: 2.8,
    solPrice: 150
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-800 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Try ReFit Demo</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 'upload' && !showQuote && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="mb-6">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500/20 to-green-500/20 rounded-2xl flex items-center justify-center mb-4">
                    <Camera className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Upload Phone Photo</h3>
                  <p className="text-gray-400">
                    Upload a photo of your phone for instant AI valuation
                  </p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleFileUpload}
                    className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors flex items-center justify-center gap-3"
                  >
                    <Upload className="h-5 w-5" />
                    <span>Upload Photo</span>
                  </button>
                  
                  <button
                    onClick={handleFileUpload}
                    className="w-full p-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl transition-all flex items-center justify-center gap-3"
                  >
                    <Camera className="h-5 w-5" />
                    <span>Use Demo Photo</span>
                  </button>
                </div>

                <p className="mt-4 text-sm text-gray-500">
                  This is a demo. In production, V3RA AI will analyze your actual device.
                </p>
              </motion.div>
            )}

            {step === 'analyzing' && !showQuote && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="mb-6">
                  <div className="w-32 h-32 mx-auto relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full animate-pulse" />
                    <div className="absolute inset-2 bg-gray-900 rounded-full flex items-center justify-center">
                      <Zap className="h-12 w-12 text-white animate-pulse" />
                    </div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold mb-2">V3RA AI Analyzing...</h3>
                <p className="text-gray-400 mb-6">
                  Evaluating condition, authenticity, and market value
                </p>
                
                <div className="space-y-2 max-w-sm mx-auto">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1 }}
                    className="h-1 bg-purple-600 rounded-full"
                  />
                  <p className="text-sm text-gray-500">Processing image...</p>
                </div>
              </motion.div>
            )}

            {showQuote && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Quote Header */}
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Your Quote is Ready!</h3>
                </div>

                {/* Device Info */}
                <div className="bg-gray-800/50 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-semibold">{demoQuote.model}</h4>
                      <p className="text-green-400">{demoQuote.condition}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-400">
                        {demoQuote.valueSOL} SOL
                      </div>
                      <div className="text-sm text-gray-400">
                        ${demoQuote.valueUSD} USD
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {demoQuote.details.map((detail, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-400">
                        <div className="w-1 h-1 bg-gray-600 rounded-full" />
                        {detail}
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-gray-700">
                    <p className="text-xs text-gray-500">
                      SOL price: ${demoQuote.solPrice} • Quote valid for 10 minutes
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <div className="bg-purple-500/10 rounded-xl p-6 text-center">
                  <h4 className="font-semibold mb-2">Ready to sell?</h4>
                  <p className="text-sm text-gray-400 mb-4">
                    This is just a demo. Launch Week 1 for real transactions!
                  </p>
                  <button className="px-6 py-3 bg-gray-700 rounded-lg font-semibold cursor-not-allowed opacity-50">
                    Coming Soon
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}