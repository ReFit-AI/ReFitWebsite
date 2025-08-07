'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Check, ChevronRight, Smartphone } from 'lucide-react'
import { 
  POPULAR_MODELS, 
  searchModels, 
  getStorageOptions,
  getAllModels 
} from '@/lib/pricing-engine'

const SmartPhoneSelector = ({ onSelect }) => {
  const [selectedModel, setSelectedModel] = useState(null)
  const [selectedStorage, setSelectedStorage] = useState(null)
  const [selectedCarrier, setSelectedCarrier] = useState(null)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [storageOptions, setStorageOptions] = useState([])
  const searchInputRef = useRef(null)

  // Handle search
  useEffect(() => {
    if (searchQuery.length > 1) {
      const results = searchModels(searchQuery)
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  // Load storage options when model selected
  useEffect(() => {
    if (selectedModel) {
      const options = getStorageOptions(selectedModel.id)
      setStorageOptions(options)
      setSelectedStorage(null) // Reset storage selection
      setSelectedCarrier(null) // Reset carrier selection
    }
  }, [selectedModel])

  // Focus search when opened
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [showSearch])

  const handleModelSelect = (model) => {
    setSelectedModel(model)
    setShowSearch(false)
    setSearchQuery('')
  }

  const handleStorageSelect = (storage) => {
    setSelectedStorage(storage)
  }

  const handleCarrierSelect = (carrier) => {
    setSelectedCarrier(carrier)
    
    // Submit the complete selection
    if (selectedModel && selectedStorage) {
      onSelect({
        model: selectedModel,
        storage: selectedStorage,
        carrier: carrier
      })
    }
  }

  const carriers = [
    { id: 'unlocked', name: 'Unlocked', icon: '🔓' },
    { id: 'verizon', name: 'Verizon', icon: '📶' },
    { id: 'att', name: 'AT&T', icon: '📶' },
    { id: 't-mobile', name: 'T-Mobile', icon: '📶' },
  ]

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Step 1: Model Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Select Your Phone Model
          </h2>
          <p className="text-gray-400">
            Choose from popular models or search for yours
          </p>
        </div>

        {!selectedModel && (
          <>
            {/* Popular Models Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {POPULAR_MODELS.map(model => (
                <motion.button
                  key={model.id}
                  onClick={() => handleModelSelect(model)}
                  className="relative bg-gray-900/50 hover:bg-gray-800/50 border border-gray-700 hover:border-solana-purple rounded-xl p-4 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-3xl mb-2">{model.icon}</div>
                  <div className="text-sm font-medium text-white">
                    {model.display}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Search Option */}
            <div className="relative">
              {!showSearch ? (
                <button
                  onClick={() => setShowSearch(true)}
                  className="w-full py-4 bg-gray-900/30 hover:bg-gray-900/50 border border-gray-700 hover:border-gray-600 rounded-xl text-gray-400 hover:text-white transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Search size={20} />
                  <span>Can't find your model? Search here...</span>
                </button>
              ) : (
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type your phone model (e.g., iPhone 13 Pro)"
                    className="w-full px-4 py-4 pl-12 bg-gray-900 border border-solana-purple rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-solana-purple"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  
                  {/* Search Results Dropdown */}
                  <AnimatePresence>
                    {searchResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-10 w-full mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden"
                      >
                        {searchResults.map((result, index) => (
                          <button
                            key={result.id}
                            onClick={() => handleModelSelect(result)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors flex items-center justify-between group"
                          >
                            <span className="text-white">{result.display}</span>
                            <ChevronRight className="text-gray-500 group-hover:text-solana-purple" size={16} />
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </>
        )}

        {/* Selected Model Display */}
        {selectedModel && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-solana-purple/10 to-solana-green/10 border border-solana-purple/30 rounded-xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{selectedModel.icon || '📱'}</div>
              <div>
                <div className="font-semibold text-white">{selectedModel.display}</div>
                <div className="text-sm text-gray-400">Model selected</div>
              </div>
            </div>
            <button
              onClick={() => setSelectedModel(null)}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Change
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Step 2: Storage Selection */}
      {selectedModel && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-white">Select Storage Capacity</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {storageOptions.map(storage => (
              <motion.button
                key={storage}
                onClick={() => handleStorageSelect(storage)}
                className={`py-3 px-4 rounded-lg border-2 font-medium transition-all duration-200 ${
                  selectedStorage === storage
                    ? 'border-solana-purple bg-solana-purple/10 text-solana-purple'
                    : 'border-gray-700 bg-gray-900/30 text-gray-300 hover:border-gray-600'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {storage}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Step 3: Carrier Selection */}
      {selectedStorage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-white">Select Carrier Status</h3>
          <div className="grid grid-cols-2 gap-3">
            {carriers.map(carrier => (
              <motion.button
                key={carrier.id}
                onClick={() => handleCarrierSelect(carrier.id)}
                className={`py-4 px-4 rounded-lg border-2 font-medium transition-all duration-200 ${
                  selectedCarrier === carrier.id
                    ? 'border-solana-purple bg-solana-purple/10 text-solana-purple'
                    : 'border-gray-700 bg-gray-900/30 text-gray-300 hover:border-gray-600'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-xl">{carrier.icon}</span>
                  <span>{carrier.name}</span>
                </div>
                {carrier.id === 'unlocked' && (
                  <div className="text-xs text-gray-500 mt-1">Best value</div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Progress Indicator */}
      <div className="flex justify-center space-x-2 pt-4">
        <div className={`w-2 h-2 rounded-full ${selectedModel ? 'bg-solana-purple' : 'bg-gray-600'}`} />
        <div className={`w-2 h-2 rounded-full ${selectedStorage ? 'bg-solana-purple' : 'bg-gray-600'}`} />
        <div className={`w-2 h-2 rounded-full ${selectedCarrier ? 'bg-solana-purple' : 'bg-gray-600'}`} />
      </div>
    </div>
  )
}

export default SmartPhoneSelector