import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Smartphone, Shield, Clock, DollarSign, MapPin, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useWallet } from '@solana/wallet-adapter-react'
import { toast } from 'react-hot-toast'
import PhoneForm from '../components/PhoneForm'
import PriceQuote from '../components/PriceQuote'
import ShippingAddressForm from '../components/ShippingAddressForm'
import ShippingSelection from '../components/ShippingSelection'
import userProfileService from '../services/userProfile'
import shippingService from '../services/shipping'

const SellPage = () => {
  const { publicKey, connected } = useWallet()
  const [currentStep, setCurrentStep] = useState(1)
  const [phoneData, setPhoneData] = useState(null)
  const [priceQuote, setPriceQuote] = useState(null)
  const [userAddress, setUserAddress] = useState(null)
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedShippingRate, setSelectedShippingRate] = useState(null)
  const [showAddressForm, setShowAddressForm] = useState(false)

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
      const result = await userProfileService.getShippingAddresses(publicKey.toString())
      if (result.success && result.addresses.length > 0) {
        setSavedAddresses(result.addresses)
        // Auto-select default address
        const defaultAddr = result.addresses.find(a => a.isDefault) || result.addresses[0]
        setUserAddress(defaultAddr)
      }
    } catch (error) {
      console.error('Load addresses error:', error)
    }
  }

  const handlePhoneSubmit = (data) => {
    setPhoneData(data)
    // Simulate price calculation
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
    
    // Save to profile if connected
    if (connected && publicKey) {
      try {
        await userProfileService.saveShippingAddress(
          publicKey.toString(),
          addressData,
          addressData.isDefault
        )
        await loadUserAddresses()
        toast.success('Address saved to profile')
      } catch (error) {
        console.error('Save address error:', error)
      }
    }
  }

  const handleSelectShippingRate = (rate) => {
    setSelectedShippingRate(rate)
  }

  const handleProceedToPayment = async () => {
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
      // In production, this would create the order and purchase the shipping label
      const labelResult = await shippingService.purchaseLabel(
        selectedShippingRate.rateId,
        userAddress,
        shippingService.constructor.getWarehouseAddress()
      )

      if (labelResult.success) {
        toast.success('Order created! Check your email for shipping label.')
        // In production: redirect to order confirmation page
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
            to="/" 
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
            <div className="max-w-2xl mx-auto">
              <PhoneForm onSubmit={handlePhoneSubmit} />
            </div>
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
            <div className="space-y-6">
              {/* Shipping Address Section */}
              <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-purple-400" />
                    Shipping From
                  </h3>
                  {savedAddresses.length > 0 && !showAddressForm && (
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="text-purple-400 hover:text-purple-300 text-sm"
                    >
                      + Add New
                    </button>
                  )}
                </div>

                {showAddressForm ? (
                  <ShippingAddressForm
                    onSave={handleSaveAddress}
                    onCancel={() => setShowAddressForm(false)}
                  />
                ) : userAddress ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-black/30 rounded-lg border border-gray-700">
                      <p className="font-semibold">{userAddress.name}</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {userAddress.street1}<br />
                        {userAddress.street2 && <>{userAddress.street2}<br /></>}
                        {userAddress.city}, {userAddress.state} {userAddress.zip}<br />
                        {userAddress.phone}
                      </p>
                    </div>
                    {savedAddresses.length > 1 && (
                      <select
                        value={userAddress.id}
                        onChange={(e) => {
                          const addr = savedAddresses.find(a => a.id === e.target.value)
                          setUserAddress(addr)
                        }}
                        className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg"
                      >
                        {savedAddresses.map(addr => (
                          <option key={addr.id} value={addr.id}>
                            {addr.name} - {addr.street1}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ) : (
                  <ShippingAddressForm
                    onSave={handleSaveAddress}
                  />
                )}
              </div>

              {/* Shipping Method Selection */}
              {userAddress && (
                <ShippingSelection
                  fromAddress={userAddress}
                  toAddress={shippingService.constructor.getWarehouseAddress()}
                  onSelectRate={handleSelectShippingRate}
                  selectedRateId={selectedShippingRate?.rateId}
                />
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="btn-secondary flex-1"
                >
                  Back
                </button>
                <button
                  onClick={handleProceedToPayment}
                  disabled={!userAddress || !selectedShippingRate}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Payment
                </button>
              </div>
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

              <div className="space-y-4">
                <button
                  onClick={handleCreateOrder}
                  disabled={!connected}
                  className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {connected ? 'Complete Order' : 'Connect Wallet to Continue'}
                </button>
                
                <p className="text-sm text-gray-500">
                  By continuing, you agree to our terms of service and privacy policy
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-center space-x-2 text-gray-400">
              <Shield size={20} />
              <span>Secure & Trusted</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-400">
              <Clock size={20} />
              <span>Fast Processing</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-400">
              <DollarSign size={20} />
              <span>Best Prices</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default SellPage
