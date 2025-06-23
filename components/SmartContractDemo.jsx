'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Smartphone, 
  Camera, 
  Package, 
  DollarSign, 
  CheckCircle, 
  ArrowRight,
  Zap,
  ShieldCheck,
  RefreshCw,
  X,
  Cpu,
  Lock,
  Truck,
  Wallet
} from 'lucide-react'

const steps = [
  {
    id: 'order',
    title: 'Order Seeker Phone',
    description: 'Choose your new refurbished Seeker phone',
    icon: Smartphone,
    color: 'from-blue-500 to-cyan-500',
    details: 'Smart contract locks your payment securely'
  },
  {
    id: 'contract',
    title: 'Smart Contract Activated',
    description: 'Your payment is held in escrow',
    icon: Lock,
    color: 'from-purple-500 to-pink-500',
    details: 'Funds secured until trade completion'
  },
  {
    id: 'receive',
    title: 'Receive New Phone',
    description: 'Seeker arrives with ReFit pre-installed',
    icon: Package,
    color: 'from-green-500 to-emerald-500',
    details: 'Quality guaranteed refurbished device'
  },
  {
    id: 'capture',
    title: 'Capture Old Phone',
    description: 'Take photos with V3RA AI guidance',
    icon: Camera,
    color: 'from-orange-500 to-red-500',
    details: 'AI ensures accurate valuation'
  },
  {
    id: 'quote',
    title: 'Instant AI Quote',
    description: 'V3RA analyzes and values your device',
    icon: Zap,
    color: 'from-yellow-500 to-amber-500',
    details: 'Fair market value in seconds'
  },
  {
    id: 'ship',
    title: 'Ship Old Phone',
    description: 'Prepaid label, insured shipping',
    icon: Truck,
    color: 'from-indigo-500 to-blue-500',
    details: 'Free shipping with tracking'
  },
  {
    id: 'release',
    title: 'Contract Releases Funds',
    description: 'Difference credited to your wallet',
    icon: Wallet,
    color: 'from-green-500 to-teal-500',
    details: 'Automatic settlement on delivery'
  },
  {
    id: 'circular',
    title: 'Circular Economy',
    description: 'Old phones fund new ones',
    icon: RefreshCw,
    color: 'from-purple-500 to-blue-500',
    details: 'Sustainable tech lifecycle'
  }
]

export default function SmartContractDemo({ onClose }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1)
      }, 3000)
      return () => clearTimeout(timer)
    } else if (currentStep === steps.length - 1) {
      setIsPlaying(false)
      setShowDetails(true)
    }
  }, [currentStep, isPlaying])

  const handleStepClick = (index) => {
    setCurrentStep(index)
    setIsPlaying(false)
  }

  const handleRestart = () => {
    setCurrentStep(0)
    setIsPlaying(true)
    setShowDetails(false)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl max-w-6xl w-full border border-gray-800 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-8 border-b border-gray-800">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
                  Smart Contract Phone Purchase
                </h2>
                <p className="text-xl text-gray-400">
                  Experience the future of circular economy in tech
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-3 hover:bg-gray-800 rounded-xl transition-all hover:scale-110"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-8 pt-6">
            <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-blue-500"
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Steps Timeline */}
          <div className="p-8">
            <div className="flex items-center justify-between mb-12 overflow-x-auto pb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => handleStepClick(index)}
                    className={`relative flex flex-col items-center min-w-[100px] group transition-all ${
                      index <= currentStep ? 'opacity-100' : 'opacity-50'
                    }`}
                  >
                    <motion.div
                      animate={{
                        scale: index === currentStep ? 1.2 : 1,
                        rotate: index === currentStep ? 360 : 0
                      }}
                      transition={{ duration: 0.5 }}
                      className={`w-16 h-16 rounded-full bg-gradient-to-br ${step.color} p-0.5 mb-2`}
                    >
                      <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                        <step.icon className={`h-6 w-6 ${
                          index <= currentStep ? 'text-white' : 'text-gray-600'
                        }`} />
                      </div>
                    </motion.div>
                    <span className="text-xs text-center max-w-[80px] group-hover:text-white transition-colors">
                      {step.title}
                    </span>
                  </button>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-2 transition-all ${
                      index < currentStep ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gray-800'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Current Step Display */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center mb-12"
              >
                <div className={`w-32 h-32 mx-auto bg-gradient-to-br ${steps[currentStep].color} p-1 rounded-3xl mb-6`}>
                  <div className="w-full h-full bg-black rounded-3xl flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      {React.createElement(steps[currentStep].icon, {
                        className: "h-16 w-16 text-white"
                      })}
                    </motion.div>
                  </div>
                </div>
                
                <h3 className="text-3xl font-bold mb-3">{steps[currentStep].title}</h3>
                <p className="text-xl text-gray-400 mb-2">{steps[currentStep].description}</p>
                <p className="text-lg text-gray-500">{steps[currentStep].details}</p>
              </motion.div>
            </AnimatePresence>

            {/* Special Features */}
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
              >
                <div className="bg-gradient-to-br from-purple-500/10 to-transparent rounded-2xl p-6 border border-purple-500/20">
                  <ShieldCheck className="h-8 w-8 text-purple-400 mb-3" />
                  <h4 className="font-semibold text-lg mb-2">Secure Escrow</h4>
                  <p className="text-gray-400 text-sm">
                    Smart contract ensures safe transactions with automatic fund release
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-green-500/10 to-transparent rounded-2xl p-6 border border-green-500/20">
                  <Cpu className="h-8 w-8 text-green-400 mb-3" />
                  <h4 className="font-semibold text-lg mb-2">V3RA AI Valuation</h4>
                  <p className="text-gray-400 text-sm">
                    Instant, accurate quotes powered by advanced computer vision
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-500/10 to-transparent rounded-2xl p-6 border border-blue-500/20">
                  <RefreshCw className="h-8 w-8 text-blue-400 mb-3" />
                  <h4 className="font-semibold text-lg mb-2">Circular Economy</h4>
                  <p className="text-gray-400 text-sm">
                    Old devices fund new ones, reducing e-waste and costs
                  </p>
                </div>
              </motion.div>
            )}

            {/* Controls */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold transition-all flex items-center gap-2"
              >
                {isPlaying ? 'Pause' : 'Play'} Demo
              </button>
              
              <button
                onClick={handleRestart}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl font-semibold transition-all flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Restart
              </button>
            </div>

            {/* Call to Action */}
            {showDetails && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 text-center bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl p-8 border border-gray-800"
              >
                <h3 className="text-2xl font-bold mb-3">Ready to Experience the Future?</h3>
                <p className="text-gray-400 mb-6">
                  Join the circular economy revolution. Trade in your old phone while getting a new one.
                </p>
                <div className="flex justify-center gap-4">
                  <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-bold text-lg transition-all transform hover:scale-105">
                    Start Trading
                  </button>
                  <button 
                    onClick={onClose}
                    className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold text-lg transition-all"
                  >
                    Maybe Later
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