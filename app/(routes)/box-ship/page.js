'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Package, Truck, Shield, CheckCircle, ArrowRight, Info } from 'lucide-react'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import { toast } from 'react-hot-toast'
import ShippingAddressForm from '@/components/ShippingAddressForm'
import { getShippingService } from '@/services'

export default function BoxShipPage() {
  const { publicKey, connected } = useWallet()
  const [step, setStep] = useState(1)
  const [shippingAddress, setShippingAddress] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [labelUrl, setLabelUrl] = useState(null)

  const handleAddressSubmit = async (addressData) => {
    setShippingAddress(addressData)
    setStep(2)
  }

  const generateShippingLabel = async () => {
    if (!shippingAddress) {
      toast.error('Please provide shipping address')
      return
    }

    setIsLoading(true)
    try {
      const shippingService = getShippingService()
      
      // Create a box shipment (larger parcel)
      const parcel = {
        length: '12',
        width: '10',
        height: '8',
        distance_unit: 'in',
        weight: '10',
        mass_unit: 'lb'
      }

      // Get shipping rates
      const ratesResult = await shippingService.getRates(
        shippingService.constructor.getWarehouseAddress(),
        shippingAddress,
        parcel
      )

      if (!ratesResult.success) {
        throw new Error('Failed to get shipping rates')
      }

      // Select the cheapest rate
      const cheapestRate = ratesResult.rates.sort((a, b) => 
        parseFloat(a.amount) - parseFloat(b.amount)
      )[0]

      // Purchase the label
      const labelResult = await shippingService.purchaseLabel(cheapestRate.object_id)
      
      if (labelResult.success) {
        setLabelUrl(labelResult.labelUrl)
        setStep(3)
        toast.success('Shipping label generated!')
      } else {
        throw new Error(labelResult.error || 'Failed to generate label')
      }
    } catch (error) {
      console.error('Error generating label:', error)
      toast.error(error.message || 'Failed to generate shipping label')
    } finally {
      setIsLoading(false)
    }
  }

  const benefits = [
    {
      icon: Package,
      title: "Fill Your Box",
      description: "Pack all your old electronics - phones, tablets, laptops, accessories"
    },
    {
      icon: Truck,
      title: "Free Shipping",
      description: "We provide a prepaid shipping label instantly"
    },
    {
      icon: Shield,
      title: "We Itemize & Quote",
      description: "Our experts evaluate each item and send you a detailed quote"
    },
    {
      icon: CheckCircle,
      title: "You Decide",
      description: "Accept the quote for instant SOL, or we ship items back free"
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
            Box & Ship
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            The easiest way to sell multiple devices. Just fill a box and ship - we'll handle the rest!
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900/50 rounded-xl p-6 border border-gray-800"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-400">{benefit.description}</p>
              </motion.div>
            )
          })}
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800"
            >
              <h2 className="text-2xl font-bold mb-6">Get Your Free Shipping Label</h2>
              
              {/* Info Box */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-blue-300 font-semibold mb-1">How it works:</p>
                    <ul className="text-gray-400 space-y-1">
                      <li>• Use any box up to 12" x 10" x 8"</li>
                      <li>• Pack phones, tablets, laptops, smartwatches</li>
                      <li>• We'll evaluate and quote each item</li>
                      <li>• Items you reject are returned free</li>
                    </ul>
                  </div>
                </div>
              </div>

              <ShippingAddressForm onSubmit={handleAddressSubmit} />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800"
            >
              <h2 className="text-2xl font-bold mb-6">Confirm & Generate Label</h2>
              
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Shipping From:</p>
                  <p className="font-semibold">{shippingAddress.name}</p>
                  <p className="text-sm text-gray-400">
                    {shippingAddress.street1}<br />
                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}
                  </p>
                </div>

                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Box Size:</p>
                  <p className="font-semibold">Up to 12" x 10" x 8" (10 lbs max)</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={generateShippingLabel}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Generating...' : 'Generate Free Label'}
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800 text-center"
            >
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              
              <h2 className="text-2xl font-bold mb-4">Label Generated!</h2>
              <p className="text-gray-400 mb-8">
                Your prepaid shipping label is ready. Print it and attach to your box.
              </p>

              <div className="space-y-4">
                {labelUrl && (
                  <a
                    href={labelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
                  >
                    Download Label
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                )}

                <div className="pt-4">
                  <h3 className="font-semibold mb-2">Next Steps:</h3>
                  <ol className="text-left text-sm text-gray-400 space-y-2 max-w-md mx-auto">
                    <li>1. Pack your electronics securely in a box</li>
                    <li>2. Attach the shipping label to the outside</li>
                    <li>3. Drop off at any {shippingAddress.country === 'US' ? 'USPS' : 'carrier'} location</li>
                    <li>4. We'll email you the itemized quote within 2-3 days</li>
                  </ol>
                </div>

                <div className="pt-6">
                  <Link
                    href="/orders"
                    className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                  >
                    Track Your Shipment →
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-16">
          <h3 className="text-2xl font-bold mb-8 text-center">Common Questions</h3>
          <div className="space-y-6">
            <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
              <h4 className="font-semibold mb-2">What devices do you accept?</h4>
              <p className="text-gray-400">
                We accept smartphones, tablets, laptops, smartwatches, gaming consoles, and most consumer electronics. 
                Items should be in working or repairable condition.
              </p>
            </div>
            
            <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
              <h4 className="font-semibold mb-2">What if I don't agree with a quote?</h4>
              <p className="text-gray-400">
                No problem! You can reject any item's quote and we'll ship it back to you completely free. 
                You only sell what you want to sell.
              </p>
            </div>
            
            <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
              <h4 className="font-semibold mb-2">How long does the process take?</h4>
              <p className="text-gray-400">
                Once we receive your box (typically 2-5 days), we'll evaluate and send quotes within 24-48 hours. 
                If you accept, payment is sent instantly to your wallet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}