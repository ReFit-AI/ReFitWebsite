'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, Package, Battery, Smartphone, Info } from 'lucide-react'
import SmartPhoneSelectorV2 from './SmartPhoneSelectorV2'
import { calculateQuote } from '@/lib/pricing-engine'

const PhoneFormV2 = ({ onSubmit }) => {
  const [phoneSelection, setPhoneSelection] = useState(null)
  const [imei, setImei] = useState('')
  const [condition, setCondition] = useState('')
  const [issues, setIssues] = useState([])
  const [quoteError, setQuoteError] = useState(null)
  const [showConditionInfo, setShowConditionInfo] = useState(false)

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
    
    // Standard conditions for iPhone/Android (Grade B, C, D)
    return [
      {
        value: 'excellent',
        label: 'Good Condition',
        description: 'Fully functional, cosmetic wear only',
        icon: '✨',
        grade: 'B',
        details: 'No cracks • Original screen • Light scratches OK'
      },
      {
        value: 'good',
        label: 'Cracked Screen',
        description: 'Cracked but fully functional, LCD works',
        icon: '👍',
        grade: 'C',
        details: 'Screen/back cracked • Original LCD works • Fully functional'
      },
      {
        value: 'fair',
        label: 'LCD Issues',
        description: 'LCD damaged (spots/lines) or replaced',
        icon: '🔧',
        grade: 'D',
        details: 'LCD spots/lines • Non-original screen • Still powers on'
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
      setQuoteError('Please select a phone model and condition')
      return
    }

    // IMEI is optional for quotes, but validate if provided
    let imeiClean = ''
    if (imei) {
      imeiClean = imei.replace(/\s/g, '')
      if (!/^\d{15}$/.test(imeiClean)) {
        setQuoteError('If provided, IMEI must be exactly 15 digits')
        return
      }
    }

    // Calculate quote using KT pricing
    const quote = calculateQuote({
      modelId: phoneSelection.model.id,
      storage: phoneSelection.storage,
      carrier: phoneSelection.carrier,
      condition,
      issues
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
        imei: imeiClean
      },
      quote
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Phone Selection */}
      <SmartPhoneSelectorV2 onSelect={handlePhoneSelect} />

      {/* IMEI Number - Optional for quote, shown after phone selected */}
      {phoneSelection && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white">
              IMEI Number
              <span className="ml-2 text-sm font-normal text-gray-400">(Optional for quote)</span>
            </h3>
            <Info className="text-gray-400" size={16} />
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-2">
              <Info className="text-blue-400 mt-0.5" size={16} />
              <div className="text-sm text-blue-200 space-y-2">
                <p className="font-semibold">How to find your IMEI:</p>
                <div className="text-gray-300 space-y-1">
                  <div>
                    <span className="font-medium text-white">Easiest Method:</span> Dial <span className="font-mono bg-gray-800 px-2 py-0.5 rounded">*#06#</span> on your phone
                  </div>
                  <div>
                    <span className="font-medium text-white">iPhone:</span> Settings → General → About → IMEI
                  </div>
                  <div>
                    <span className="font-medium text-white">Android:</span> Settings → About Phone → IMEI
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Optional for quote. Helps us verify your device during inspection.
                </p>
              </div>
            </div>
          </div>

          <input
            type="text"
            value={imei}
            onChange={(e) => setImei(e.target.value)}
            placeholder="Enter 15-digit IMEI (optional for quote)"
            maxLength={15}
            className="w-full bg-gray-900/30 border-2 border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-solana-purple focus:outline-none transition-colors"
          />

          {imei && !/^\d{15}$/.test(imei.replace(/\s/g, '')) && (
            <p className="text-sm text-red-400">IMEI must be exactly 15 digits</p>
          )}
        </motion.div>
      )}

      {/* Condition Selection - Shown after phone selected (IMEI optional) */}
      {phoneSelection && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Device Condition</h3>
            <button
              type="button"
              onClick={() => setShowConditionInfo(!showConditionInfo)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Info size={20} />
            </button>
          </div>
          
          {/* Condition Info Panel */}
          {showConditionInfo && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4 space-y-3">
              <div className="flex items-start space-x-2">
                <Info className="text-blue-400 mt-0.5" size={16} />
                <div className="text-sm text-blue-200 space-y-2">
                  <p className="font-semibold">Grading Guidelines:</p>
                  <div className="space-y-1 text-gray-300">
                    <div><span className="font-medium text-green-400">Grade B:</span> No cracks, original screen, cosmetic wear OK</div>
                    <div><span className="font-medium text-yellow-400">Grade C:</span> Cracked screen/back OK if LCD works perfectly</div>
                    <div><span className="font-medium text-orange-400">Grade D:</span> LCD has spots/lines or non-original screen</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
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
                {cond.grade && (
                  <div className="absolute top-3 left-3 px-2 py-1 bg-gray-800 rounded text-xs font-bold text-gray-400">
                    Grade {cond.grade}
                  </div>
                )}
                <div className="text-3xl mb-3">{cond.icon}</div>
                <div className="font-semibold text-white mb-1">{cond.label}</div>
                <div className="text-sm text-gray-400 mb-2">{cond.description}</div>
                {cond.details && (
                  <div className="text-xs text-gray-500 border-t border-gray-700 pt-2 mt-2">
                    {cond.details}
                  </div>
                )}
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