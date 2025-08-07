'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, Package, Battery, Smartphone } from 'lucide-react'
import SmartPhoneSelectorV2 from './SmartPhoneSelectorV2'
import { calculateQuote } from '@/lib/pricing-engine-v2'

const PhoneFormV2 = ({ onSubmit }) => {
  const [phoneSelection, setPhoneSelection] = useState(null)
  const [condition, setCondition] = useState('')
  const [issues, setIssues] = useState([])
  const [accessories, setAccessories] = useState({
    charger: false,
    box: false
  })
  const [quoteError, setQuoteError] = useState(null)

  // Conditions based on phone type
  const getConditions = () => {
    if (phoneSelection?.category === 'solana') {
      // Simplified for Solana phones
      return [
        {
          value: 'working',
          label: 'Working',
          description: 'Powers on and functions',
          icon: '✅'
        },
        {
          value: 'broken',
          label: 'Broken/For Parts',
          description: 'Not working or has major issues',
          icon: '🔧'
        }
      ]
    }
    
    // Standard conditions for iPhone/Android
    return [
      {
        value: 'excellent',
        label: 'Excellent',
        description: 'Minor signs of wear, fully functional',
        icon: '✨'
      },
      {
        value: 'good',
        label: 'Good',
        description: 'Visible wear but works perfectly',
        icon: '👍'
      },
      {
        value: 'fair',
        label: 'Fair',
        description: 'Heavy wear, may have minor issues',
        icon: '👌'
      }
    ]
  }
  
  const conditions = getConditions()

  // Common issues that affect price (dynamically based on phone type)
  const getIssuesForPhone = () => {
    if (!phoneSelection) return []
    
    const baseIssues = [
      { id: 'cracked_camera_lens', label: 'Cracked camera lens', deduction: 80 },
      { id: 'back_crack', label: 'Back glass cracked', deduction: 150 },
      { id: 'bad_charging_port', label: 'Charging port issues', deduction: 200 },
    ]
    
    // iPhone-specific issues
    if (phoneSelection.category === 'iphone') {
      baseIssues.push(
        { id: 'face_id_broken', label: 'Face ID not working', deduction: 400 },
        { id: 'unknown_parts', label: 'Non-genuine parts message', deduction: 80 }
      )
    }
    
    // Android-specific issues
    if (phoneSelection.category === 'android') {
      baseIssues.push(
        { id: 'missing_stylus', label: 'Missing S-Pen (if applicable)', deduction: 40 }
      )
    }
    
    // Solana-specific issues
    if (phoneSelection.category === 'solana') {
      baseIssues.push(
        { id: 'seed_vault_issue', label: 'Seed vault hardware issue', deduction: 100 }
      )
    }
    
    return baseIssues
  }
  
  const commonIssues = getIssuesForPhone()

  const handlePhoneSelect = (selection) => {
    setPhoneSelection(selection)
  }

  const handleIssueToggle = (issueId) => {
    setIssues(prev => 
      prev.includes(issueId) 
        ? prev.filter(i => i !== issueId)
        : [...prev, issueId]
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!phoneSelection || !condition) {
      setQuoteError('Please complete all required fields')
      return
    }

    // Calculate quote using KT pricing
    const quote = calculateQuote({
      modelId: phoneSelection.model.id,
      storage: phoneSelection.storage,
      carrier: phoneSelection.carrier,
      condition,
      issues,
      accessories
    })

    if (quote.error) {
      setQuoteError(quote.error)
      return
    }

    // Pass the quote and form data to parent
    onSubmit({
      phoneData: {
        brand: phoneSelection.model.brand || 'Apple',
        model: phoneSelection.model.display,
        storage: phoneSelection.storage,
        carrier: phoneSelection.carrier,
        condition,
        issues,
        ...accessories
      },
      quote
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Phone Selection */}
      <SmartPhoneSelectorV2 onSelect={handlePhoneSelect} />

      {/* Condition Selection - Only shown after phone selected */}
      {phoneSelection && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-white">Device Condition</h3>
          <div className={`grid grid-cols-1 ${phoneSelection?.category === 'solana' ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4`}>
            {conditions.map(cond => (
              <motion.button
                key={cond.value}
                type="button"
                onClick={() => setCondition(cond.value)}
                className={`relative p-6 rounded-xl border-2 transition-all duration-200 ${
                  condition === cond.value
                    ? 'border-solana-purple bg-solana-purple/10'
                    : 'border-gray-700 bg-gray-900/30 hover:border-gray-600'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-3xl mb-3">{cond.icon}</div>
                <div className="font-semibold text-white mb-1">{cond.label}</div>
                <div className="text-sm text-gray-400">{cond.description}</div>
                {condition === cond.value && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 bg-solana-purple rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Known Issues - Skip for Solana "broken" phones */}
      {condition && !(phoneSelection?.category === 'solana' && condition === 'broken') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Any Issues?</h3>
            <span className="text-sm text-gray-400">Optional - affects price</span>
          </div>
          
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-start space-x-2">
            <AlertCircle className="text-yellow-500 mt-0.5" size={16} />
            <p className="text-sm text-yellow-200">
              Be honest about issues - we'll verify during inspection
            </p>
          </div>

          <div className="space-y-2">
            {commonIssues.map(issue => (
              <label
                key={issue.id}
                className="flex items-center justify-between p-4 bg-gray-900/30 hover:bg-gray-900/50 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={issues.includes(issue.id)}
                    onChange={() => handleIssueToggle(issue.id)}
                    className="w-5 h-5 rounded border-gray-600 text-solana-purple focus:ring-solana-purple focus:ring-offset-0 bg-gray-800"
                  />
                  <span className="text-white">{issue.label}</span>
                </div>
                <span className="text-red-400 text-sm font-medium">
                  -${issue.deduction}
                </span>
              </label>
            ))}
          </div>
        </motion.div>
      )}

      {/* Accessories */}
      {condition && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-white">Included Accessories</h3>
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center space-x-2 px-4 py-3 bg-gray-900/30 hover:bg-gray-900/50 rounded-lg cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={accessories.charger}
                onChange={(e) => setAccessories(prev => ({ ...prev, charger: e.target.checked }))}
                className="w-5 h-5 rounded border-gray-600 text-solana-purple focus:ring-solana-purple focus:ring-offset-0 bg-gray-800"
              />
              <span className="text-white">Original Charger</span>
              <span className="text-green-400 text-sm">+$5</span>
            </label>
            
            <label className="flex items-center space-x-2 px-4 py-3 bg-gray-900/30 hover:bg-gray-900/50 rounded-lg cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={accessories.box}
                onChange={(e) => setAccessories(prev => ({ ...prev, box: e.target.checked }))}
                className="w-5 h-5 rounded border-gray-600 text-solana-purple focus:ring-solana-purple focus:ring-offset-0 bg-gray-800"
              />
              <span className="text-white">Original Box</span>
              <span className="text-green-400 text-sm">+$5</span>
            </label>
          </div>
        </motion.div>
      )}

      {/* Error Display */}
      {quoteError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">{quoteError}</p>
        </div>
      )}

      {/* Submit Button */}
      {condition && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-solana-purple to-solana-green text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            Get Instant Quote
          </button>
        </motion.div>
      )}
    </form>
  )
}

export default PhoneFormV2