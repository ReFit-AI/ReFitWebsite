'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle, X } from 'lucide-react'

export default function BetaDisclaimerModal({ isOpen, onClose, onAccept }) {
  const [acceptedTerms, setAcceptedTerms] = useState({
    beta: false,
    returns: false,
    risk: false,
    notFDIC: false
  })

  const allAccepted = Object.values(acceptedTerms).every(v => v)

  const handleAccept = () => {
    if (allAccepted) {
      onAccept()
      onClose()
    }
  }

  const terms = [
    {
      id: 'beta',
      label: 'I understand this is a beta product with limited pool size',
      description: 'We\'re testing with early supporters before full launch'
    },
    {
      id: 'returns',
      label: 'Returns depend on phone arbitrage profits and may fluctuate',
      description: 'Monthly distributions based on actual phone sales performance'
    },
    {
      id: 'risk',
      label: 'There is a 7-day withdrawal cooldown period',
      description: 'Protects pool stability and prevents bank-run scenarios'
    },
    {
      id: 'notFDIC',
      label: 'This is not FDIC insured - cryptocurrency carries risk',
      description: 'This is a DeFi product, not a traditional bank account'
    }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-gradient-to-b from-gray-900 to-black border border-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/10 border border-purple-500/30 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-purple-400" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Beta Launch Disclaimer</h2>
              <p className="text-gray-400">Please read and acknowledge before depositing</p>
            </div>

            {/* Terms */}
            <div className="space-y-4 mb-8">
              {terms.map((term) => (
                <label
                  key={term.id}
                  className={`
                    block p-4 border rounded-xl cursor-pointer transition-all
                    ${acceptedTerms[term.id]
                      ? 'bg-purple-500/10 border-purple-500/50'
                      : 'bg-gray-800/30 border-gray-700 hover:border-gray-600'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <input
                        type="checkbox"
                        checked={acceptedTerms[term.id]}
                        onChange={(e) => setAcceptedTerms({
                          ...acceptedTerms,
                          [term.id]: e.target.checked
                        })}
                        className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 bg-gray-800"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white mb-1">{term.label}</div>
                      <div className="text-sm text-gray-400">{term.description}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {/* Info Box */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-200">
                  <strong>Transparency:</strong> You can view every phone purchase and sale on our{' '}
                  <a href="/inventory" className="underline hover:text-blue-100">public inventory page</a>.
                  Track our real-time margins and verify the arbitrage model yourself.
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAccept}
                disabled={!allAccepted}
                className={`
                  flex-1 px-6 py-3 rounded-lg font-semibold transition-all
                  ${allAccepted
                    ? 'bg-gradient-to-r from-purple-600 to-green-600 hover:shadow-lg hover:shadow-purple-500/25 text-white'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                {allAccepted ? 'I Understand - Continue' : 'Accept All Terms'}
              </button>
            </div>

            {/* Fine Print */}
            <p className="text-xs text-gray-500 text-center mt-6">
              By continuing, you acknowledge you have read and understood the risks involved.
              This is not financial advice. Do your own research.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
