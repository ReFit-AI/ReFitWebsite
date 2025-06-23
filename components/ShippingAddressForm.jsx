import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Check, X, User } from 'lucide-react';
import { getShippingService, getUserProfileService } from '../services';
import { useWallet } from '@solana/wallet-adapter-react';

const ShippingAddressForm = ({ onSave, onCancel, initialAddress = null }) => {
  const { publicKey } = useWallet();
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedSavedAddress, setSelectedSavedAddress] = useState(null);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  
  const [address, setAddress] = useState({
    name: initialAddress?.name || '',
    street1: initialAddress?.street1 || '',
    street2: initialAddress?.street2 || '',
    city: initialAddress?.city || '',
    state: initialAddress?.state || '',
    zip: initialAddress?.zip || '',
    country: initialAddress?.country || 'US',
    phone: initialAddress?.phone || '',
    email: initialAddress?.email || ''
  });

  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [errors, setErrors] = useState({});

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const handleChange = (field, value) => {
    setAddress(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!address.name.trim()) newErrors.name = 'Name is required';
    if (!address.street1.trim()) newErrors.street1 = 'Street address is required';
    if (!address.city.trim()) newErrors.city = 'City is required';
    if (!address.state) newErrors.state = 'State is required';
    if (!address.zip.trim()) newErrors.zip = 'ZIP code is required';
    if (!address.phone.trim()) newErrors.phone = 'Phone number is required';
    
    // Basic phone validation
    const phoneRegex = /^[\d\s\-\(\)\+]+$/;
    if (address.phone && !phoneRegex.test(address.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }
    
    // Basic ZIP validation
    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (address.zip && !zipRegex.test(address.zip)) {
      newErrors.zip = 'Invalid ZIP code format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleValidate = async () => {
    if (!validateForm()) return;

    setValidating(true);
    setValidationResult(null);

    try {
      const shippingService = getShippingService();
      const result = await shippingService.validateAddress(address);
      setValidationResult(result);
      
      if (result.success) {
        // Auto-save if validation passes
        handleSave();
      }
    } catch (error) {
      console.error('Address validation error:', error);
      setValidationResult({
        success: false,
        error: 'Failed to validate address'
      });
    } finally {
      setValidating(false);
    }
  };

  const handleSave = () => {
    if (!validateForm()) return;
    onSave(address);
  };

  // Load saved addresses on mount
  useEffect(() => {
    if (publicKey) {
      loadSavedAddresses();
    }
  }, [publicKey]);

  const loadSavedAddresses = async () => {
    if (!publicKey) return;
    
    try {
      const userProfileService = getUserProfileService();
      const addresses = await userProfileService.getShippingAddresses();
      if (addresses && addresses.length > 0) {
        setSavedAddresses(addresses);
        setShowSavedAddresses(true);
      }
    } catch (error) {
      console.error('Error loading saved addresses:', error);
    }
  };

  const handleSelectSavedAddress = (savedAddr) => {
    setAddress({
      name: savedAddr.name || '',
      street1: savedAddr.street1 || '',
      street2: savedAddr.street2 || '',
      city: savedAddr.city || '',
      state: savedAddr.state || '',
      zip: savedAddr.zip || '',
      country: savedAddr.country || 'US',
      phone: savedAddr.phone || '',
      email: savedAddr.email || ''
    });
    setSelectedSavedAddress(savedAddr);
    setShowSavedAddresses(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg p-6 border border-purple-500/20"
    >
      <div className="flex items-center mb-6">
        <MapPin className="text-purple-400 mr-2" size={24} />
        <h3 className="text-xl font-semibold text-white">Shipping Address</h3>
      </div>

      {/* Saved Addresses Section */}
      {savedAddresses.length > 0 && showSavedAddresses && (
        <div className="mb-6 p-4 bg-purple-900/20 rounded-lg border border-purple-500/20">
          <div className="flex items-center mb-3">
            <User className="text-purple-400 mr-2" size={20} />
            <h4 className="text-white font-medium">Use a saved address</h4>
          </div>
          <div className="space-y-2">
            {savedAddresses.map((addr, index) => (
              <button
                key={index}
                onClick={() => handleSelectSavedAddress(addr)}
                className="w-full text-left p-3 bg-black/30 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-colors"
              >
                <div className="text-white font-medium">{addr.name}</div>
                <div className="text-gray-400 text-sm">
                  {addr.street1}, {addr.city}, {addr.state} {addr.zip}
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowSavedAddresses(false)}
            className="mt-3 text-sm text-purple-400 hover:text-purple-300"
          >
            Enter a new address instead
          </button>
        </div>
      )}

      {/* Show selected saved address indicator */}
      {selectedSavedAddress && !showSavedAddresses && (
        <div className="mb-4 p-3 bg-green-900/20 rounded-lg border border-green-500/20 flex items-center justify-between">
          <div className="flex items-center">
            <Check className="text-green-400 mr-2" size={16} />
            <span className="text-green-400 text-sm">Using saved address</span>
          </div>
          <button
            onClick={() => {
              setShowSavedAddresses(true);
              setSelectedSavedAddress(null);
            }}
            className="text-sm text-green-400 hover:text-green-300"
          >
            Change
          </button>
        </div>
      )}

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={address.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`w-full px-4 py-2 bg-black/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              errors.name ? 'border-red-500' : 'border-gray-700'
            }`}
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="text-red-400 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Street Address */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Street Address
          </label>
          <input
            type="text"
            value={address.street1}
            onChange={(e) => handleChange('street1', e.target.value)}
            className={`w-full px-4 py-2 bg-black/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              errors.street1 ? 'border-red-500' : 'border-gray-700'
            }`}
            placeholder="123 Main St"
          />
          {errors.street1 && (
            <p className="text-red-400 text-sm mt-1">{errors.street1}</p>
          )}
        </div>

        {/* Apartment/Suite */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Apartment, Suite, etc. (optional)
          </label>
          <input
            type="text"
            value={address.street2}
            onChange={(e) => handleChange('street2', e.target.value)}
            className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Apt 4B"
          />
        </div>

        {/* City, State, ZIP */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              City
            </label>
            <input
              type="text"
              value={address.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className={`w-full px-4 py-2 bg-black/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.city ? 'border-red-500' : 'border-gray-700'
              }`}
              placeholder="San Francisco"
            />
            {errors.city && (
              <p className="text-red-400 text-sm mt-1">{errors.city}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              State
            </label>
            <select
              value={address.state}
              onChange={(e) => handleChange('state', e.target.value)}
              className={`w-full px-4 py-2 bg-black/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.state ? 'border-red-500' : 'border-gray-700'
              }`}
            >
              <option value="">Select</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            {errors.state && (
              <p className="text-red-400 text-sm mt-1">{errors.state}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              ZIP Code
            </label>
            <input
              type="text"
              value={address.zip}
              onChange={(e) => handleChange('zip', e.target.value)}
              className={`w-full px-4 py-2 bg-black/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.zip ? 'border-red-500' : 'border-gray-700'
              }`}
              placeholder="94105"
            />
            {errors.zip && (
              <p className="text-red-400 text-sm mt-1">{errors.zip}</p>
            )}
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            value={address.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={`w-full px-4 py-2 bg-black/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              errors.phone ? 'border-red-500' : 'border-gray-700'
            }`}
            placeholder="(555) 123-4567"
          />
          {errors.phone && (
            <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Default Address Checkbox */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={address.isDefault}
            onChange={(e) => handleChange('isDefault', e.target.checked)}
            className="w-4 h-4 rounded border-gray-700 bg-black/50 text-purple-500 focus:ring-purple-500"
          />
          <span className="text-sm text-gray-400">
            Set as default shipping address
          </span>
        </label>

        {/* Validation Result */}
        {validationResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg ${
              validationResult.success
                ? 'bg-green-900/20 border border-green-700'
                : 'bg-red-900/20 border border-red-700'
            }`}
          >
            <div className="flex items-center gap-2">
              {validationResult.success ? (
                <>
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-green-400">Address validated successfully!</span>
                </>
              ) : (
                <>
                  <X className="w-5 h-5 text-red-400" />
                  <span className="text-red-400">
                    {validationResult.error || 'Address validation failed. Please check your information.'}
                  </span>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleValidate}
            disabled={validating}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {validating ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Validating...
              </span>
            ) : (
              'Validate & Save'
            )}
          </button>
          
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-gray-800 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ShippingAddressForm;
