// Utility functions for phone pricing and validation

export const calculatePhonePrice = (model, condition, storage) => {
  const basePrices = {
    'iPhone 15 Pro': 800,
    'iPhone 15': 650,
    'iPhone 14 Pro': 600,
    'iPhone 14': 450,
    'Solana Phone': 300,
  };

  const conditionMultipliers = {
    'excellent': 1.0,
    'good': 0.8,
    'fair': 0.6,
    'poor': 0.4,
  };

  const storageMultipliers = {
    '128GB': 1.0,
    '256GB': 1.2,
    '512GB': 1.4,
    '1TB': 1.6,
  };

  const basePrice = basePrices[model] || 100;
  const conditionMultiplier = conditionMultipliers[condition] || 0.5;
  const storageMultiplier = storageMultipliers[storage] || 1.0;

  return Math.round(basePrice * conditionMultiplier * storageMultiplier);
};

export const validatePhoneData = (phoneData) => {
  const errors = {};

  if (!phoneData.model) {
    errors.model = 'Please select a phone model';
  }

  if (!phoneData.storage) {
    errors.storage = 'Please select storage capacity';
  }

  if (!phoneData.condition) {
    errors.condition = 'Please select device condition';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const formatPrice = (price, currency = 'USD') => {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  }
  
  if (currency === 'SOL') {
    return `${price.toFixed(4)} SOL`;
  }
  
  return price.toString();
};
