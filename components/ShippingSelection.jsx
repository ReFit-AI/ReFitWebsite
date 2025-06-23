import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, Clock, DollarSign, Package } from 'lucide-react';
import { getShippingService } from '../services';

const ShippingSelection = ({ 
  fromAddress, 
  toAddress, 
  parcel = null, 
  onSelectRate, 
  selectedRateId = null 
}) => {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadShippingRates();
  }, [fromAddress, toAddress]);

  const loadShippingRates = async () => {
    setLoading(true);
    setError(null);

    try {
      const shippingService = getShippingService();
      
      // Use default phone parcel if not provided
      const defaultParcel = {
        length: '7',
        width: '4', 
        height: '2',
        distance_unit: 'in',
        weight: '1',
        mass_unit: 'lb'
      };
      const packageParcel = parcel || defaultParcel;
      
      const result = await shippingService.getRates(fromAddress, toAddress, packageParcel);

      if (result.success) {
        setRates(result.rates);
        // Auto-select cheapest option if none selected
        if (!selectedRateId && result.rates.length > 0) {
          onSelectRate(result.rates[0]);
        }
      } else {
        setError(result.error || 'Failed to load shipping rates');
      }
    } catch (err) {
      console.error('Load rates error:', err);
      setError('Failed to load shipping options');
    } finally {
      setLoading(false);
    }
  };

  const getCarrierIcon = (carrier) => {
    const iconProps = { className: "w-8 h-8" };
    
    switch (carrier.toUpperCase()) {
      case 'USPS':
        return (
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">
            USPS
          </div>
        );
      case 'FEDEX':
        return (
          <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center text-white font-bold text-xs">
            FedEx
          </div>
        );
      case 'UPS':
        return (
          <div className="w-8 h-8 bg-amber-700 rounded flex items-center justify-center text-white font-bold text-xs">
            UPS
          </div>
        );
      default:
        return <Truck {...iconProps} />;
    }
  };

  const getDeliveryTimeText = (days) => {
    if (days === 1) return 'Next Day';
    if (days === 2) return '2 Days';
    if (days <= 3) return '2-3 Days';
    if (days <= 5) return '3-5 Days';
    return `${days} Days`;
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <span className="ml-3 text-gray-400">Loading shipping options...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
          <button
            onClick={loadShippingRates}
            className="mt-3 text-sm text-purple-400 hover:text-purple-300"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (rates.length === 0) {
    return (
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <p className="text-gray-400 text-center">
          No shipping options available for this address.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
      <div className="flex items-center gap-3 mb-6">
        <Package className="w-6 h-6 text-purple-400" />
        <h3 className="text-xl font-bold">Free Prepaid Shipping</h3>
      </div>

      <div className="space-y-3">
        {rates.map((rate) => (
          <motion.div
            key={rate.rateId || `rate-${rates.indexOf(rate)}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => onSelectRate(rate)}
            className={`
              relative p-4 rounded-xl border-2 cursor-pointer transition-all
              ${selectedRateId === rate.rateId
                ? 'border-purple-500 bg-purple-900/20'
                : 'border-gray-700 hover:border-gray-600 bg-black/30'
              }
            `}
          >
            <div className="flex items-center gap-4">
              {/* Carrier Icon */}
              <div className="flex-shrink-0">
                {getCarrierIcon(rate.carrier)}
              </div>

              {/* Service Details */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-white">
                      {rate.carrier} {rate.service}
                    </h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {getDeliveryTimeText(rate.estimatedDays)}
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">
                      ${rate.price.toFixed(2)}
                    </div>
                    {rate.price === Math.min(...rates.map(r => r.price)) && (
                      <span className="text-xs text-green-400">Best Value</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Indicator */}
            {selectedRateId === rate.rateId && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </motion.div>
            )}

            {/* Free Shipping Badge */}
            {rate.price === 0 && (
              <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                FREE
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Shipping Info */}
      <div className="mt-6 p-4 bg-green-900/10 rounded-lg border border-green-900/30">
        <h4 className="text-sm font-semibold text-green-400 mb-2">
          Free USPS Priority Mail Shipping:
        </h4>
        <ul className="space-y-1 text-sm text-gray-400">
          <li>• We'll email you a prepaid Priority Mail label</li>
          <li>• Includes up to $100 insurance coverage</li>
          <li>• Free tracking from pickup to delivery</li>
          <li>• Typically arrives in 1-3 business days</li>
          <li>• Drop off at any USPS location or schedule a pickup</li>
          <li>• Get paid instantly once we verify your device</li>
        </ul>
      </div>
    </div>
  );
};

export default ShippingSelection;
