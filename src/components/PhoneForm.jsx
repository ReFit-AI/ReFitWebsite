import React, { useState } from 'react'
import { motion } from 'framer-motion'

const PhoneForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    storage: '',
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
  
  const conditionOptions = [
    { value: 'like-new', label: 'Like New', description: 'No signs of wear' },
    { value: 'excellent', label: 'Excellent', description: 'Minor signs of wear' },
    { value: 'good', label: 'Good', description: 'Visible wear but works perfectly' },
    { value: 'fair', label: 'Fair', description: 'Noticeable wear, minor issues' },
    { value: 'poor', label: 'Poor', description: 'Heavy wear, functional issues' }
  ]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const isFormValid = formData.brand && formData.model && formData.storage && formData.condition

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Brand Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Brand
        </label>
        <select
          name="brand"
          value={formData.brand}
          onChange={handleChange}
          className="form-select w-full"
          required
        >
          <option value="">Select brand</option>
          {Object.keys(phoneModels).map(brand => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
      </div>

      {/* Model Selection */}
      {formData.brand && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Model
          </label>
          <select
            name="model"
            value={formData.model}
            onChange={handleChange}
            className="form-select w-full"
            required
          >
            <option value="">Select model</option>
            {phoneModels[formData.brand].map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>
      )}

      {/* Storage */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Storage
        </label>
        <select
          name="storage"
          value={formData.storage}
          onChange={handleChange}
          className="form-select w-full"
          required
        >
          <option value="">Select storage</option>
          {storageOptions.map(storage => (
            <option key={storage} value={storage}>{storage}</option>
          ))}
        </select>
      </div>

      {/* Condition */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Condition
        </label>
        <div className="space-y-3">
          {conditionOptions.map(({ value, label, description }) => (
            <label key={value} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="condition"
                value={value}
                checked={formData.condition === value}
                onChange={handleChange}
                className="w-4 h-4 text-solana-purple bg-gray-900 border-gray-600 focus:ring-solana-purple focus:ring-2"
              />
              <div className="flex-1">
                <div className="font-medium text-white">{label}</div>
                <div className="text-sm text-gray-400">{description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Screen Damage */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Screen Condition
        </label>
        <select
          name="screenDamage"
          value={formData.screenDamage}
          onChange={handleChange}
          className="form-select w-full"
        >
          <option value="none">Perfect - No damage</option>
          <option value="minor">Minor scratches</option>
          <option value="moderate">Moderate scratches</option>
          <option value="cracked">Cracked but functional</option>
          <option value="shattered">Shattered</option>
        </select>
      </div>

      {/* Battery Health */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Battery Health
        </label>
        <select
          name="batteryHealth"
          value={formData.batteryHealth}
          onChange={handleChange}
          className="form-select w-full"
        >
          <option value="excellent">Excellent (90%+)</option>
          <option value="good">Good (80-89%)</option>
          <option value="fair">Fair (70-79%)</option>
          <option value="poor">Poor (Below 70%)</option>
          <option value="unknown">Unknown</option>
        </select>
      </div>

      {/* Accessories */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Included Accessories
        </label>
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              name="hasCharger"
              checked={formData.hasCharger}
              onChange={handleChange}
              className="w-4 h-4 text-solana-purple bg-gray-900 border-gray-600 rounded focus:ring-solana-purple focus:ring-2"
            />
            <span className="text-white">Original charger included</span>
          </label>
          
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              name="hasBox"
              checked={formData.hasBox}
              onChange={handleChange}
              className="w-4 h-4 text-solana-purple bg-gray-900 border-gray-600 rounded focus:ring-solana-purple focus:ring-2"
            />
            <span className="text-white">Original box included</span>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={!isFormValid}
        className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
          isFormValid
            ? 'bg-solana-purple text-white hover:scale-105'
            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
        }`}
        whileHover={isFormValid ? { scale: 1.02 } : {}}
        whileTap={isFormValid ? { scale: 0.98 } : {}}
      >
        Get Instant Quote
      </motion.button>
    </form>
  )
}

export default PhoneForm
