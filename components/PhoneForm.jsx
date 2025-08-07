import React, { useState } from 'react'
import { motion } from 'framer-motion'

const PhoneForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    storage: '',
    carrier: '',
    condition: '',
    hasCharger: false,
    hasBox: false,
    screenDamage: 'none',
    batteryHealth: 'good'
  })

  const phoneModels = {
    Apple: [
      'iPhone 15 Pro Max',
      'iPhone 15 Pro',
      'iPhone 15 Plus',
      'iPhone 15',
      'iPhone 14 Pro Max',
      'iPhone 14 Pro',
      'iPhone 14 Plus',
      'iPhone 14',
      'iPhone 13 Pro Max',
      'iPhone 13 Pro',
      'iPhone 13',
      'iPhone 12 Pro Max',
      'iPhone 12 Pro',
      'iPhone 12',
      'iPhone 11 Pro Max',
      'iPhone 11 Pro',
      'iPhone 11'
    ],
    Samsung: [
      'Galaxy S24 Ultra',
      'Galaxy S24+',
      'Galaxy S24',
      'Galaxy S23 Ultra',
      'Galaxy S23+',
      'Galaxy S23',
      'Galaxy Note 20 Ultra',
      'Galaxy Note 20',
      'Galaxy S21 Ultra',
      'Galaxy S21+',
      'Galaxy S21'
    ],
    Google: [
      'Pixel 8 Pro',
      'Pixel 8',
      'Pixel 7 Pro',
      'Pixel 7',
      'Pixel 6 Pro',
      'Pixel 6'
    ],
    Solana: [
      'Solana Saga',
      'Solana Chapter 2'
    ]
  }

  const storageOptions = ['64GB', '128GB', '256GB', '512GB', '1TB']
  
  const carrierOptions = [
    { value: 'verizon', label: 'Verizon' },
    { value: 'att', label: 'AT&T' },
    { value: 't-mobile', label: 'T-Mobile' },
    { value: 'unlocked', label: 'Unlocked' },
    { value: 'other', label: 'Other' }
  ]
  
  const conditionOptions = [
    { value: 'excellent', label: 'Excellent (Grade B)', description: 'Fully functional, light scratches only, no cracks' },
    { value: 'good', label: 'Good (Grade C)', description: 'Cracked screen/back but fully functional, original LCD' },
    { value: 'fair', label: 'Fair (Grade D)', description: 'LCD issues (spots/lines), heavy damage, still powers on' }
  ]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleButtonSelect = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const isFormValid = formData.brand && formData.model && formData.storage && formData.carrier && formData.condition

  return (
    <div className="max-w-2xl mx-auto">
      {/* Phone Icon Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-solana-purple/10 rounded-2xl border border-solana-purple/20 mb-4">
          <svg className="w-8 h-8 text-solana-purple" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM7 4h10v14H7V4z"/>
            <circle cx="12" cy="19" r="1"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Get Your Quote</h2>
        <p className="text-gray-400">Tell us about your device to get an instant quote</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Brand Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-4">
          Select Brand
        </label>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(phoneModels).map(brand => (
            <motion.button
              key={brand}
              type="button"
              onClick={() => handleButtonSelect('brand', brand)}
              className={`py-3 px-4 rounded-lg border font-medium text-sm transition-all duration-300 ${
                formData.brand === brand
                  ? 'border-solana-purple bg-solana-purple/10 text-solana-purple'
                  : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
              }`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {brand}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Model Selection */}
      {formData.brand && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <label className="block text-sm font-medium text-gray-300 mb-4">
            Select Model
          </label>
          <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto">
            {phoneModels[formData.brand].map(model => (
              <motion.button
                key={model}
                type="button"
                onClick={() => handleButtonSelect('model', model)}
                className={`py-2.5 px-3 rounded-md border text-left font-medium text-sm transition-all duration-300 ${
                  formData.model === model
                    ? 'border-solana-purple bg-solana-purple/10 text-solana-purple'
                    : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
                }`}
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.995 }}
              >
                {model}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Storage */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-4">
          Select Storage
        </label>
        <div className="flex flex-wrap gap-2">
          {storageOptions.map(storage => (
            <motion.button
              key={storage}
              type="button"
              onClick={() => handleButtonSelect('storage', storage)}
              className={`px-4 py-2.5 rounded-lg border font-medium text-sm transition-all duration-300 ${
                formData.storage === storage
                  ? 'border-solana-purple bg-solana-purple/10 text-solana-purple'
                  : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {storage}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Carrier */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-4">
          Select Carrier
        </label>
        <div className="grid grid-cols-2 gap-2">
          {carrierOptions.map(carrier => (
            <motion.button
              key={carrier.value}
              type="button"
              onClick={() => handleButtonSelect('carrier', carrier.value)}
              className={`py-3 px-4 rounded-lg border font-medium text-sm transition-all duration-300 ${
                formData.carrier === carrier.value
                  ? 'border-solana-purple bg-solana-purple/10 text-solana-purple'
                  : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
              }`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {carrier.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Device Condition
        </label>
        <div className="grid grid-cols-1 gap-3">
          {conditionOptions.map(({ value, label, description }) => (
            <motion.div
              key={value}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleButtonSelect('condition', value)}
              className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
                formData.condition === value
                  ? 'border-solana-purple bg-solana-purple/10'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                  value === 'excellent' ? 'bg-green-500/20 text-green-400' :
                  value === 'good' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-orange-500/20 text-orange-400'
                }`}>
                  {value === 'excellent' ? '✨' : value === 'good' ? '👍' : '🔧'}
                </div>
                <div className="flex-1">
                  <div className={`font-semibold ${formData.condition === value ? 'text-solana-purple' : 'text-white'}`}>
                    {label}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">{description}</div>
                  {value === 'excellent' && (
                    <div className="text-xs text-gray-500 mt-2">
                      ✓ No cracks • ✓ Original screen • ✓ Minor cosmetic wear only
                    </div>
                  )}
                  {value === 'good' && (
                    <div className="text-xs text-gray-500 mt-2">
                      ✓ Fully functional • ✓ Original LCD works • ⚠️ May have cracks
                    </div>
                  )}
                  {value === 'fair' && (
                    <div className="text-xs text-gray-500 mt-2">
                      ✓ Powers on • ⚠️ Screen issues • ⚠️ Heavy cosmetic damage
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Screen Damage */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-4">
          Screen Condition
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'none', label: 'Perfect - No damage' },
            { value: 'minor', label: 'Minor scratches' },
            { value: 'moderate', label: 'Moderate scratches' },
            { value: 'cracked', label: 'Cracked but functional' },
            { value: 'shattered', label: 'Shattered' }
          ].map(screen => (
            <motion.button
              key={screen.value}
              type="button"
              onClick={() => handleButtonSelect('screenDamage', screen.value)}
              className={`py-2.5 px-4 rounded-md border font-medium text-sm transition-all duration-300 ${
                formData.screenDamage === screen.value
                  ? 'border-solana-purple bg-solana-purple/10 text-solana-purple'
                  : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {screen.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Battery Health */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-4">
          Battery Health
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'excellent', label: 'Excellent (90%+)' },
            { value: 'good', label: 'Good (80-89%)' },
            { value: 'fair', label: 'Fair (70-79%)' },
            { value: 'poor', label: 'Poor (Below 70%)' },
            { value: 'unknown', label: 'Unknown' }
          ].map(battery => (
            <motion.button
              key={battery.value}
              type="button"
              onClick={() => handleButtonSelect('batteryHealth', battery.value)}
              className={`py-2.5 px-4 rounded-md border font-medium text-sm transition-all duration-300 ${
                formData.batteryHealth === battery.value
                  ? 'border-solana-purple bg-solana-purple/10 text-solana-purple'
                  : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {battery.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Accessories */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-4">
          Included Accessories
        </label>
        <div className="flex flex-wrap gap-2">
          <motion.button
            type="button"
            onClick={() => handleButtonSelect('hasCharger', !formData.hasCharger)}
            className={`py-2.5 px-4 rounded-md border font-medium text-sm transition-all duration-300 ${
              formData.hasCharger
                ? 'border-solana-purple bg-solana-purple/10 text-solana-purple'
                : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                formData.hasCharger ? 'border-solana-purple bg-solana-purple' : 'border-gray-600'
              }`}>
                {formData.hasCharger && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
              </div>
              <span>Original charger included</span>
            </div>
          </motion.button>
          
          <motion.button
            type="button"
            onClick={() => handleButtonSelect('hasBox', !formData.hasBox)}
            className={`py-2.5 px-4 rounded-md border font-medium text-sm transition-all duration-300 ${
              formData.hasBox
                ? 'border-solana-purple bg-solana-purple/10 text-solana-purple'
                : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                formData.hasBox ? 'border-solana-purple bg-solana-purple' : 'border-gray-600'
              }`}>
                {formData.hasBox && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
              </div>
              <span>Original box included</span>
            </div>
          </motion.button>
        </div>
      </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={!isFormValid}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
            isFormValid
              ? 'bg-solana-purple text-white hover:bg-solana-purple/90'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
          whileHover={isFormValid ? { scale: 1.01 } : {}}
          whileTap={isFormValid ? { scale: 0.99 } : {}}
        >
          Get Instant Quote
        </motion.button>
      </form>
    </div>
  )
}

export default PhoneForm
