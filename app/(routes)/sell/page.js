'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Smartphone, Shield, Clock, DollarSign, MapPin, Truck, Camera } from 'lucide-react'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import { toast } from 'react-hot-toast'
import PhoneForm from '@/components/PhoneForm'
import PriceQuote from '@/components/PriceQuote'
import ShippingAddressForm from '@/components/ShippingAddressForm'
import ShippingSelection from '@/components/ShippingSelection'
import { getUserProfileService, getShippingService, initializeServices } from '@/services'

export default function SellPage() {
  const { publicKey, connected } = useWallet()
  const [currentStep, setCurrentStep] = useState(1)
  const [phoneData, setPhoneData] = useState(null)
  const [priceQuote, setPriceQuote] = useState(null)
  const [userAddress, setUserAddress] = useState(null)
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedShippingRate, setSelectedShippingRate] = useState(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [shippingLabel, setShippingLabel] = useState(null)

  const steps = [
    { number: 1, title: 'Device Info', icon: Smartphone },
    { number: 2, title: 'Get Quote', icon: DollarSign },
    { number: 3, title: 'Shipping', icon: MapPin },
    { number: 4, title: 'Ship & Get Paid', icon: Shield }
  ]

  useEffect(() => {
    if (connected && publicKey && currentStep === 3) {
      loadUserAddresses()
    }
  }, [connected, publicKey, currentStep])

  const loadUserAddresses = async () => {
    try {
      const userProfileService = getUserProfileService()
      const addresses = await userProfileService.getShippingAddresses()
      if (addresses && addresses.length > 0) {
        setSavedAddresses(addresses)
        const defaultAddr = addresses.find(a => a.is_default) || addresses[0]
        setUserAddress(defaultAddr)
      }
    } catch (error) {
      console.error('Load addresses error:', error)
    }
  }

  const handlePhoneSubmit = (data) => {
    setPhoneData(data)
    setPriceQuote({
      usdPrice: 850,
      solPrice: 4.72,
      estimatedProcessingTime: '2-3 business days',
      confidence: 'high'
    })
    setCurrentStep(2)
  }

  const handleAcceptQuote = () => {
    setCurrentStep(3)
  }

  const handleSaveAddress = async (addressData) => {
    setUserAddress(addressData)
    setShowAddressForm(false)
    
    if (connected && publicKey) {
      try {
        // First ensure the user profile is initialized
        await initializeServices(publicKey.toString())
        
        const userProfileService = getUserProfileService()
        const result = await userProfileService.addShippingAddress(addressData)
        if (result.success) {
          await loadUserAddresses()
          toast.success('Address saved to profile')
        } else {
          console.warn('Failed to save to profile:', result.error)
          // Still show success since the address is saved locally
          toast.success('Address saved for this session')
        }
      } catch (error) {
        console.error('Save address error:', error)
        // Still show success since the address is saved locally  
        toast.success('Address saved for this session')
      }
    }
  }

  const handleSelectShippingRate = (rate) => {
    setSelectedShippingRate(rate)
  }

  const handleGenerateLabel = async () => {
    if (!userAddress) {
      toast.error('Please add a shipping address')
      return
    }
    if (!selectedShippingRate) {
      toast.error('Please select a shipping method')
      return
    }
    setCurrentStep(4)
  }

  const handleCreateOrder = async () => {
    if (!connected) {
      toast.error('Please connect your wallet')
      return
    }

    try {
      const shippingService = getShippingService()
      const labelResult = await shippingService.purchaseLabel(
        selectedShippingRate.rateId,
        userAddress
      )

      if (labelResult.success) {
        setShippingLabel(labelResult.label)
        toast.success('Shipping label generated! Ready to print.')
      } else {
        toast.error(labelResult.error || 'Failed to generate label')
      }
    } catch (error) {
      console.error('Create order error:', error)
      toast.error('Failed to create order')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Link 
              href="/" 
              className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to home
            </Link>
            
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-solana-purple to-solana-green bg-clip-text text-transparent">
              Sell Your Phone
            </h1>
            <p className="text-xl text-gray-400">Get instant payment in SOL</p>
          </motion.div>

          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = currentStep === step.number
                const isCompleted = currentStep > step.number
                
                return (
                  <div key={step.number} className="flex items-center">
                    <div className="relative">
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                        ${isActive ? 'bg-solana-purple text-white' : 
                          isCompleted ? 'bg-solana-green text-white' : 
                          'bg-gray-800 text-gray-500'}
                      `}>
                        <Icon size={20} />
                      </div>
                      <span className={`
                        absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm whitespace-nowrap
                        ${isActive ? 'text-white' : 'text-gray-500'}
                      `}>
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`
                        h-0.5 w-16 sm:w-24 mx-2 transition-all duration-300
                        ${isCompleted ? 'bg-solana-green' : 'bg-gray-800'}
                      `} />
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Step Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16"
          >
            {currentStep === 1 && (
              <PhoneForm onSubmit={handlePhoneSubmit} />
            )}

            {currentStep === 2 && priceQuote && (
              <div className="space-y-8">
                <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
                  <div className="text-center mb-8">
                    <DollarSign className="mx-auto mb-4 text-solana-green" size={48} />
                    <h2 className="text-2xl font-bold mb-2">Your instant quote</h2>
                    <p className="text-gray-400">Based on current market conditions</p>
                  </div>
                  <PriceQuote quote={priceQuote} phoneData={phoneData} />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="btn-secondary flex-1"
                  >
                    Back to Edit
                  </button>
                  <button
                    onClick={handleAcceptQuote}
                    className="btn-primary flex-1"
                  >
                    Accept Quote
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-8">
                {/* Shipping Address Section */}
                <div className="bg-gray-900 rounded-lg p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold">Shipping Address</h2>
                    {savedAddresses.length > 0 && (
                      <button
                        onClick={() => setShowAddressForm(!showAddressForm)}
                        className="text-solana-purple hover:text-solana-green transition-colors"
                      >
                        {showAddressForm ? 'Cancel' : userAddress ? 'Change Address' : 'Add New'}
                      </button>
                    )}
                  </div>

                  {showAddressForm || savedAddresses.length === 0 ? (
                    <ShippingAddressForm
                      onSave={handleSaveAddress}
                      initialData={userAddress}
                      onCancel={() => setShowAddressForm(false)}
                    />
                  ) : userAddress ? (
                    <div className="p-4 bg-gray-800 rounded">
                      <p className="font-medium">{userAddress.name}</p>
                      <p className="text-gray-400">{userAddress.street1}</p>
                      {userAddress.street2 && <p className="text-gray-400">{userAddress.street2}</p>}
                      <p className="text-gray-400">
                        {userAddress.city}, {userAddress.state} {userAddress.zip}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                    >
                      Add Shipping Address
                    </button>
                  )}
                </div>

                {/* Shipping Method Section */}
                {userAddress && (
                  <ShippingSelection
                    fromAddress={userAddress}
                    toAddress={{
                      name: 'ReFit Warehouse',
                      company: 'ReFit',
                      street1: '123 Tech Blvd',
                      city: 'San Francisco',
                      state: 'CA',
                      zip: '94105',
                      country: 'US',
                      phone: '415-555-0123',
                      email: 'warehouse@refit.com'
                    }}
                    onSelectRate={handleSelectShippingRate}
                    selectedRateId={selectedShippingRate?.rateId}
                  />
                )}

                {/* Print Label Button */}
                {userAddress && selectedShippingRate && (
                  <button
                    onClick={handleGenerateLabel}
                    className="w-full py-4 bg-gradient-to-r from-solana-purple to-solana-green text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Print Your Shipping Label
                  </button>
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800 text-center">
                <Shield className="mx-auto mb-6 text-solana-green" size={64} />
                <h2 className="text-3xl font-bold mb-4">Ready to Ship!</h2>
                <p className="text-xl text-gray-400 mb-8">
                  Review your order details and complete your trade
                </p>
                
                <div className="space-y-4 mb-8">
                  {/* Order Summary */}
                  <div className="bg-gray-800/30 rounded-xl p-4 text-left">
                    <h4 className="font-semibold mb-3">Order Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Device:</span>
                        <span>{phoneData?.brand} {phoneData?.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Condition:</span>
                        <span>{phoneData?.condition}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Shipping:</span>
                        <span>{selectedShippingRate?.carrier} {selectedShippingRate?.service}</span>
                      </div>
                      <div className="border-t border-gray-700 pt-2 mt-2">
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total Payout:</span>
                          <span className="text-solana-green">
                            {priceQuote?.solPrice} SOL (${priceQuote?.usdPrice})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div className="bg-gray-800/30 rounded-xl p-4 text-left">
                    <h4 className="font-semibold mb-2">Shipping From:</h4>
                    <p className="text-sm text-gray-400">
                      {userAddress?.name}<br />
                      {userAddress?.street1}<br />
                      {userAddress?.city}, {userAddress?.state} {userAddress?.zip}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-4 bg-gray-800/50 rounded-xl">
                    <Truck className="mx-auto mb-2 text-solana-purple" size={24} />
                    <div className="font-semibold">Free Label</div>
                    <div className="text-sm text-gray-400">Email within 5 min</div>
                  </div>
                  <div className="text-center p-4 bg-gray-800/50 rounded-xl">
                    <Shield className="mx-auto mb-2 text-solana-purple" size={24} />
                    <div className="font-semibold">Insured</div>
                    <div className="text-sm text-gray-400">Full coverage</div>
                  </div>
                  <div className="text-center p-4 bg-gray-800/50 rounded-xl">
                    <Clock className="mx-auto mb-2 text-solana-purple" size={24} />
                    <div className="font-semibold">Fast Payment</div>
                    <div className="text-sm text-gray-400">SOL in 24 hours</div>
                  </div>
                </div>

                {/* Shipping Label Section */}
                {shippingLabel && (
                  <div className="mb-8 p-6 bg-green-900/20 rounded-xl border border-green-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-green-400">Shipping Label Ready!</h3>
                        <p className="text-green-300">Your prepaid label has been generated</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-black/30 rounded-lg p-4">
                        <h4 className="font-semibold text-white mb-2">Tracking Number</h4>
                        <p className="text-lg font-mono text-green-400">{shippingLabel.trackingNumber}</p>
                      </div>
                      <div className="bg-black/30 rounded-lg p-4">
                        <h4 className="font-semibold text-white mb-2">Carrier</h4>
                        <p className="text-lg text-green-400">{shippingLabel.carrier}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      {shippingLabel.labelUrl && (
                        <a
                          href={shippingLabel.labelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-center transition-colors"
                        >
                          📄 Print Label
                        </a>
                      )}
                      {shippingLabel.trackingUrl && (
                        <a
                          href={shippingLabel.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-center transition-colors"
                        >
                          📦 Track Package
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {!shippingLabel ? (
                    <button
                      onClick={handleCreateOrder}
                      disabled={!connected}
                      className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {connected ? 'Generate Shipping Label' : 'Connect Wallet to Continue'}
                    </button>
                  ) : (
                    <div className="text-center">
                      <div className="text-green-400 font-semibold mb-2">✅ All Done!</div>
                      <p className="text-gray-400">Print your label, pack your phone, and drop it off at any USPS location.</p>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-500">
                    By continuing, you agree to our terms of service and privacy policy
                  </p>
                </div>
              </div>
            )}
          </motion.div>
      </div>
    </div>
  )
}
