import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';
import shippingService from '../services/shipping';

const TrackingStatus = ({ trackingNumber, carrier }) => {
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (trackingNumber) {
      loadTrackingInfo();
    }
  }, [trackingNumber]);

  const loadTrackingInfo = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await shippingService.trackShipment(trackingNumber);
      if (result.success) {
        setTrackingInfo(result.tracking);
      } else {
        setError(result.error || 'Failed to load tracking information');
      }
    } catch (err) {
      console.error('Tracking error:', err);
      setError('Unable to track shipment');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'created':
        return <Package className="w-6 h-6" />;
      case 'in_transit':
        return <Truck className="w-6 h-6" />;
      case 'delivered':
        return <CheckCircle className="w-6 h-6" />;
      default:
        return <Clock className="w-6 h-6" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'created':
        return 'text-gray-400';
      case 'in_transit':
        return 'text-blue-400';
      case 'delivered':
        return 'text-green-400';
      default:
        return 'text-yellow-400';
    }
  };

  const statusSteps = [
    { key: 'created', label: 'Label Created', description: 'Shipping label has been generated' },
    { key: 'picked_up', label: 'Picked Up', description: 'Package collected by carrier' },
    { key: 'in_transit', label: 'In Transit', description: 'On the way to destination' },
    { key: 'out_for_delivery', label: 'Out for Delivery', description: 'With delivery courier' },
    { key: 'delivered', label: 'Delivered', description: 'Package delivered successfully' }
  ];

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-3 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <span className="ml-3 text-gray-400">Loading tracking info...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <div className="text-center py-8">
          <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">{error}</p>
          <button
            onClick={loadTrackingInfo}
            className="mt-3 text-purple-400 hover:text-purple-300 text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!trackingInfo) {
    return null;
  }

  const currentStepIndex = statusSteps.findIndex(step => step.key === trackingInfo.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 rounded-2xl p-6 border border-gray-800"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold mb-1">Tracking Information</h3>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>Tracking #: {trackingNumber}</span>
            <span>•</span>
            <span>{carrier}</span>
          </div>
        </div>
        <div className={`${getStatusColor(trackingInfo.status)}`}>
          {getStatusIcon(trackingInfo.status)}
        </div>
      </div>

      {/* Current Status */}
      <div className="mb-8 p-4 bg-black/30 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Current Status</span>
          <span className="text-sm text-gray-400">
            {trackingInfo.estimatedDelivery && `ETA: ${new Date(trackingInfo.estimatedDelivery).toLocaleDateString()}`}
          </span>
        </div>
        <div className={`text-lg font-semibold ${getStatusColor(trackingInfo.status)}`}>
          {statusSteps.find(s => s.key === trackingInfo.status)?.label || trackingInfo.status}
        </div>
        {trackingInfo.location && (
          <div className="flex items-center gap-1 mt-1 text-sm text-gray-400">
            <MapPin className="w-4 h-4" />
            {trackingInfo.location}
          </div>
        )}
      </div>

      {/* Progress Steps */}
      <div className="relative">
        {statusSteps.map((step, index) => {
          const isCompleted = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <div key={step.key} className="flex items-start mb-6 last:mb-0">
              {/* Step indicator */}
              <div className="relative flex-shrink-0">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.2 : 1,
                    backgroundColor: isCompleted ? '#9945FF' : '#374151'
                  }}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${isCompleted ? 'bg-purple-500' : 'bg-gray-700'}
                    ${isCurrent ? 'ring-4 ring-purple-500/30' : ''}
                  `}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <div className="w-3 h-3 bg-gray-500 rounded-full" />
                  )}
                </motion.div>

                {/* Connecting line */}
                {index < statusSteps.length - 1 && (
                  <div
                    className={`
                      absolute left-5 top-10 w-0.5 h-16 -translate-x-1/2
                      ${isCompleted && index < currentStepIndex ? 'bg-purple-500' : 'bg-gray-700'}
                    `}
                  />
                )}
              </div>

              {/* Step content */}
              <div className="ml-4 flex-1">
                <h4 className={`font-semibold ${isCompleted ? 'text-white' : 'text-gray-500'}`}>
                  {step.label}
                </h4>
                <p className="text-sm text-gray-400 mt-1">{step.description}</p>
                
                {/* Show timestamp for completed steps */}
                {trackingInfo.events && trackingInfo.events[step.key] && (
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(trackingInfo.events[step.key]).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Info */}
      {trackingInfo.notes && (
        <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
          <p className="text-sm text-yellow-400">{trackingInfo.notes}</p>
        </div>
      )}
    </motion.div>
  );
};

export default TrackingStatus;
