'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: "Is this legit?",
      answer: "Yes! We've been in the phone wholesale and repair business for 15 years. ReFit brings our expertise on-chain with smart contracts and instant SOL settlements. Every transaction is secured by Solana's blockchain."
    },
    {
      question: "How fast do I get paid?",
      answer: "You receive SOL in your wallet within 24 hours of device inspection. Get instant quotes online, ship your phone with our prepaid label, and payment is automated via smart contract."
    },
    {
      question: "What phones do you accept?",
      answer: "We accept all major brands including iPhone (6 and newer), Samsung Galaxy, Google Pixel, and Solana phones. Even devices with cracked screens or battery issues have value. Check our instant quote tool for your specific model."
    },
    {
      question: "Why Solana?",
      answer: "Solana offers instant settlements, minimal fees, and the infrastructure we need for tokenizing inventory. Plus, with Solana Mobile integration, we can create seamless experiences for Saga and Seeker users."
    }
  ]

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-800/50 transition-colors"
          >
            <span className="font-semibold text-lg">{faq.question}</span>
            <ChevronDown 
              className={`h-5 w-5 text-gray-400 transition-transform ${
                openIndex === index ? 'rotate-180' : ''
              }`}
            />
          </button>
          
          <AnimatePresence>
            {openIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-4 text-gray-400">
                  {faq.answer}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  )
}