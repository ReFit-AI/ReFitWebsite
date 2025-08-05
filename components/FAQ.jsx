'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: "How does staking work?",
      answer: "When you trade in your device, you can choose to stake some or all of the value instead of taking instant cash. Your staked value earns SOL staking yields (5-7.5% APY) plus RFT token rewards. Lock for longer periods (up to 4 years) to earn higher multipliers - up to 10x RFT rewards for Diamond tier."
    },
    {
      question: "What are the potential returns?",
      answer: "Returns vary based on your staking tier and RFT token value. Conservative estimates: 20-50% APR. Expected scenario: 100-400% APR. Early adopters in Diamond tier could see 500-1000% APR in Year 1. Remember: SOL yields are guaranteed by the network, while RFT value depends on market conditions."
    },
    {
      question: "Can I withdraw my stake early?",
      answer: "Flex tier has no lock - withdraw anytime. For locked tiers, you can emergency unlock with a 25-50% penalty on unclaimed RFT rewards (you keep all earned SOL). There's a 3-day cooldown period for any withdrawal."
    },
    {
      question: "Is this legit?",
      answer: "Yes! We've been in the phone wholesale and repair business for 15 years. ReFit brings our expertise on-chain with smart contracts and instant SOL settlements. Every transaction is secured by Solana's blockchain."
    },
    {
      question: "How fast do I get paid?",
      answer: "For instant cash: You receive SOL in your wallet within 24 hours of device inspection. For staking: Your position activates immediately upon trade confirmation, and you start earning rewards daily."
    },
    {
      question: "What phones do you accept?",
      answer: "We accept all major brands including iPhone (6 and newer), Samsung Galaxy, Google Pixel, and Solana phones. Even devices with cracked screens or battery issues have value. Check our instant quote tool for your specific model."
    },
    {
      question: "What is RFT token?",
      answer: "RFT (ReFit Token) is our ecosystem token with 1 billion total supply. 35% allocated for staking rewards over 5 years. Early stakers earn the highest share - Year 1 has 100M RFT emissions. Token utility includes governance, fee discounts, and future device purchases."
    },
    {
      question: "Why should I stake instead of taking cash?",
      answer: "Staking turns a one-time payment into perpetual income. Your $600 iPhone trade could earn $40-400+ annually depending on your tier and RFT value. First 100 stakers get bonus APY and founding member benefits. It's perfect if you don't need immediate liquidity."
    },
    {
      question: "How does the validator work?",
      answer: "All staked SOL goes into our Solana validator, earning network staking rewards. We pass through 95% of rewards (5% commission). The validator strengthens Solana's network while generating sustainable yield for your trade-in value."
    },
    {
      question: "Why Solana?",
      answer: "Solana offers instant settlements, minimal fees, 6-7% staking yields, and the infrastructure we need for tokenizing inventory. Plus, with Solana Mobile integration, we can create seamless experiences for Saga and Seeker users."
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