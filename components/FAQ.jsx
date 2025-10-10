'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: "How does the liquidity pool work?",
      answer: "Think of it like a savings account that funds a phone flipping business. You deposit money, we use it to buy phones locally and flip them to wholesale buyers for 10-20% profit. You get 2% weekly returns (104% APY) from those profits. It's simple arbitrage - buy low locally, sell high wholesale."
    },
    {
      question: "Where does the 2% weekly come from?",
      answer: "Real phone sales. We buy phones from local sellers (Facebook, OfferUp, etc) and flip them same-day to established wholesale buyers. Every phone generates 10-20% profit. We split it: 80% goes to liquidity providers as your 2% weekly, 20% covers our time and operations."
    },
    {
      question: "Is this sustainable?",
      answer: "Yes. The phone arbitrage market is massive - people constantly upgrade devices. We've already flipped $2.3M in phones proving the model works. The 2% weekly is conservative - our margins support it even with slower weeks. Plus, you can see every phone we buy and sell on the public inventory page."
    },
    {
      question: "Can I withdraw anytime?",
      answer: "After a 7-day waiting period, yes. When you request withdrawal, there's a 7-day cooldown to protect pool stability (prevents bank-run scenarios). After that, you can withdraw your full deposit plus accumulated earnings. No penalties, no tricks."
    },
    {
      question: "How fast do I get paid?",
      answer: "Instantly when you deposit - your position starts earning immediately. Weekly distributions happen every Monday. Your earnings accumulate in your account and you can withdraw them anytime (after the initial 7-day waiting period)."
    },
    {
      question: "What's the minimum deposit?",
      answer: "$1,000 minimum. That's about the cost of a new iPhone - except instead of losing value, you earn $20/week in passive income. This ensures we can efficiently deploy capital for phone purchases while keeping the pool accessible to everyone."
    },
    {
      question: "Why phones specifically?",
      answer: "Phones are perfect for arbitrage: high value-to-weight ratio, massive market (billions of devices), predictable pricing, and quick turnover. We've spent years building wholesale relationships that give us instant liquidity. Buy Monday, sell Tuesday, profit lands in the pool."
    },
    {
      question: "What are the risks?",
      answer: "Main risks: (1) Phone market changes reducing margins, (2) Large coordinated withdrawal, (3) Smart contract bugs. We mitigate these with diverse phone models, the 7-day withdrawal cooldown, and audited contracts. You can also watch the public inventory to verify we're actively trading."
    },
    {
      question: "Why Solana?",
      answer: "Speed and cost. Solana's instant transactions and near-zero fees let us pay out weekly returns efficiently. Ethereum would cost $50+ per distribution - that's your profit gone in gas fees. Solana makes it practical to run a high-frequency profit-sharing pool."
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
