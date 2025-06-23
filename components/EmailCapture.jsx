'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, CheckCircle } from 'lucide-react'

export default function EmailCapture() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle, loading, success, error
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      setStatus('error')
      setMessage('Please enter a valid email')
      return
    }

    setStatus('loading')
    
    // Simulate API call
    setTimeout(() => {
      setStatus('success')
      setMessage('Thanks! You\'ll be the first to know when we launch.')
      setEmail('')
      
      // Reset after 5 seconds
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 5000)
    }, 1000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-gradient-to-br from-purple-900/20 to-green-900/20 rounded-2xl p-8 border border-gray-800"
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
          <Mail className="h-8 w-8 text-purple-400" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Get Early Access</h3>
        <p className="text-gray-400">
          Be the first to trade your phone for SOL when we launch Week 1
        </p>
      </div>

      {status === 'success' ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-4"
        >
          <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
          <p className="text-green-400 font-medium">{message}</p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className={`
                w-full px-4 py-3 bg-gray-900/50 border rounded-lg 
                placeholder-gray-500 focus:outline-none focus:ring-2 
                transition-all duration-200
                ${status === 'error' 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-700 focus:ring-purple-500 focus:border-transparent'
                }
              `}
              disabled={status === 'loading'}
            />
            {status === 'error' && (
              <p className="text-red-400 text-sm mt-2">{message}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={status === 'loading'}
            className={`
              w-full py-3 rounded-lg font-semibold transition-all duration-200
              ${status === 'loading'
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
              }
            `}
          >
            {status === 'loading' ? 'Submitting...' : 'Get Early Access'}
          </button>
          
          <p className="text-xs text-gray-500 text-center">
            No spam. Unsubscribe anytime.
          </p>
        </form>
      )}
    </motion.div>
  )
}