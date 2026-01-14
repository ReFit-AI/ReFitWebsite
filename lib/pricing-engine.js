/**
 * Simplified Pricing Engine
 * Uses best prices from all vendors for iPhones and Samsung phones
 */

import iphonePrices from '../data/pricing-iphones.json' with { type: 'json' };
import samsungPrices from '../data/pricing-samsung.json' with { type: 'json' };

// Simple, clear condition mappings
export const CONDITIONS = {
  'excellent': {
    label: 'Good Condition',
    grade: 'B',           // Wholesale grade we use
    margin: 0.83,         // 17% margin (includes ~2% shipping)
    description: 'No cracks, fully functional'
  },
  'good': {
    label: 'Cracked Screen',
    grade: 'C',
    margin: 0.80,         // 20% margin
    description: 'Cracked screen/back, LCD works'
  },
  'fair': {
    label: 'LCD Issues',
    grade: 'D',
    margin: 0.77,         // 23% margin
    description: 'LCD damaged or non-original screen'
  }
};

// Issue deductions (same for all devices)
export const ISSUE_DEDUCTIONS = {
  'face_id_broken': 400,
  'cracked_camera_lens': 80,
  'unknown_parts': 80,
  'bad_charging_port': 200,
  'back_crack': 150,
  'mdm_locked': 200,
  'battery_message': 50,
  'missing_stylus': 40    // Samsung S-Pen
};

// Popular models for UI display
export const POPULAR_MODELS = {
  iphone: [
    { id: 'iphone-17-pro-max', model: 'iPhone 17 Pro Max', display: 'iPhone 17 Pro Max' },
    { id: 'iphone-17-pro', model: 'iPhone 17 Pro', display: 'iPhone 17 Pro' },
    { id: 'iphone-17', model: 'iPhone 17', display: 'iPhone 17' },
    { id: 'iphone-16-pro-max', model: 'iPhone 16 Pro Max', display: 'iPhone 16 Pro Max' },
    { id: 'iphone-16-pro', model: 'iPhone 16 Pro', display: 'iPhone 16 Pro' },
    { id: 'iphone-16', model: 'iPhone 16', display: 'iPhone 16' },
    { id: 'iphone-15-pro-max', model: 'iPhone 15 Pro Max', display: 'iPhone 15 Pro Max' },
    { id: 'iphone-15-pro', model: 'iPhone 15 Pro', display: 'iPhone 15 Pro' },
    { id: 'iphone-15', model: 'iPhone 15', display: 'iPhone 15' }
  ],
  samsung: [
    { id: 'galaxy-s25-ultra', model: 'GALAXY S25 ULTRA', display: 'Galaxy S25 Ultra' },
    { id: 'galaxy-s25-plus', model: 'GALAXY S25 PLUS', display: 'Galaxy S25+' },
    { id: 'galaxy-s25', model: 'GALAXY S25', display: 'Galaxy S25' },
    { id: 'galaxy-s24-ultra', model: 'GALAXY S24 ULTRA', display: 'Galaxy S24 Ultra' },
    { id: 'galaxy-s24-plus', model: 'GALAXY S24 PLUS', display: 'Galaxy S24+' },
    { id: 'galaxy-s24', model: 'GALAXY S24', display: 'Galaxy S24' },
    { id: 'galaxy-z-fold-6', model: 'GALAXY Z FOLD 6', display: 'Galaxy Z Fold 6' },
    { id: 'galaxy-z-fold-5', model: 'GALAXY Z FOLD 5', display: 'Galaxy Z Fold 5' }
  ]
};

/**
 * Build device index from price data
 */
function buildDeviceIndex() {
  const index = {};

  // Add iPhones
  for (const device of iphonePrices.devices || []) {
    const key = normalizeModelKey(device.model);
    if (!index[key]) {
      index[key] = {
        model: device.model,
        brand: 'Apple',
        category: 'iphone',
        variants: []
      };
    }
    index[key].variants.push({
      storage: device.storage,
      lockStatus: device.lock_status,
      prices: device.prices,
      vendors: device.vendors || {}
    });
  }

  // Add Samsung phones
  for (const device of samsungPrices.devices || []) {
    const key = normalizeModelKey(device.model);
    if (!index[key]) {
      index[key] = {
        model: device.model,
        brand: 'Samsung',
        category: 'samsung',
        variants: []
      };
    }
    index[key].variants.push({
      storage: device.storage,
      lockStatus: device.lock_status,
      prices: device.prices,
      vendor: 'KT'
    });
  }

  return index;
}

/**
 * Normalize model name to key
 */
function normalizeModelKey(model) {
  return model.toLowerCase()
    .replace(/\s+/g, '-')
    .replace('iphone-', 'iphone-')
    .replace('galaxy-', 'galaxy-');
}

/**
 * Get storage options for a model
 */
export function getStorageOptions(modelId) {
  const index = buildDeviceIndex();
  const device = index[modelId];

  if (!device) return [];

  const storageSet = new Set();
  device.variants.forEach(v => storageSet.add(v.storage));

  return Array.from(storageSet).sort((a, b) => {
    const aNum = parseInt(a);
    const bNum = parseInt(b);
    return aNum - bNum;
  });
}

/**
 * Get carrier options for a model and storage
 */
export function getCarrierOptions(modelId, storage) {
  const index = buildDeviceIndex();
  const device = index[modelId];

  if (!device) return [];

  const carriers = new Set();
  device.variants
    .filter(v => v.storage === storage)
    .forEach(v => {
      if (v.lockStatus === 'Unlocked') {
        carriers.add('unlocked');
      } else {
        carriers.add('carrier');
      }
    });

  return Array.from(carriers);
}

/**
 * Calculate quote for a device
 */
export function calculateQuote({
  modelId,
  storage,
  carrier = 'unlocked',
  condition,
  issues = []
}) {
  const index = buildDeviceIndex();
  const device = index[modelId];

  if (!device) {
    return { error: 'Model not found' };
  }

  // Find the right variant
  const lockStatus = carrier === 'unlocked' ? 'Unlocked' : 'Carrier Locked';
  const variant = device.variants.find(v =>
    v.storage === storage &&
    v.lockStatus === lockStatus
  );

  if (!variant) {
    return { error: 'This configuration not available' };
  }

  // Get condition info
  const conditionInfo = CONDITIONS[condition];
  if (!conditionInfo) {
    return { error: 'Invalid condition' };
  }

  // Get wholesale price for the grade
  const wholesalePrice = variant.prices[conditionInfo.grade];
  if (!wholesalePrice) {
    return { error: 'No price available for this condition' };
  }

  // Calculate our offer price
  let offerPrice = wholesalePrice * conditionInfo.margin;

  // Apply issue deductions
  let totalDeductions = 0;
  for (const issue of issues) {
    const deduction = ISSUE_DEDUCTIONS[issue] || 0;
    totalDeductions += deduction;
    offerPrice -= deduction;
  }

  // Ensure minimum price
  offerPrice = Math.max(offerPrice, 20);

  // Calculate SOL price (approximate rate)
  const solPrice = (offerPrice / 180).toFixed(3);

  return {
    success: true,
    // Main prices
    usdPrice: Math.round(offerPrice),
    solPrice: parseFloat(solPrice),

    // Details
    wholesalePrice,
    margin: conditionInfo.margin,
    marginPercent: Math.round((1 - conditionInfo.margin) * 100) + '%',

    // Breakdown for transparency
    breakdown: {
      wholesalePrice,
      ourPrice: Math.round(wholesalePrice * conditionInfo.margin),
      deductions: totalDeductions,
      finalPrice: Math.round(offerPrice)
    },

    // Vendor info (if available)
    vendors: variant.vendors || {},

    // Additional info
    category: device.category,
    brand: device.brand,
    condition: conditionInfo.label,
    supplierGrade: conditionInfo.grade,
    confidence: wholesalePrice > 500 ? 'high' : wholesalePrice > 200 ? 'medium' : 'low',
    estimatedProcessingTime: '2-3 business days'
  };
}

/**
 * Get all available models
 */
export function getAllModels() {
  const index = buildDeviceIndex();
  const models = {
    iphone: [],
    samsung: []
  };

  for (const [key, device] of Object.entries(index)) {
    const modelInfo = {
      id: key,
      model: device.model,
      brand: device.brand,
      storageOptions: [],
      priceRange: { min: Infinity, max: 0 }
    };

    // Get storage options and price range
    const storageSet = new Set();
    for (const variant of device.variants) {
      storageSet.add(variant.storage);
      const bPrice = variant.prices.B || 0;
      if (bPrice > 0) {
        modelInfo.priceRange.min = Math.min(modelInfo.priceRange.min, bPrice);
        modelInfo.priceRange.max = Math.max(modelInfo.priceRange.max, bPrice);
      }
    }

    modelInfo.storageOptions = Array.from(storageSet).sort();

    // Add to appropriate category
    if (device.category === 'iphone') {
      models.iphone.push(modelInfo);
    } else if (device.category === 'samsung') {
      models.samsung.push(modelInfo);
    }
  }

  return models;
}

/**
 * Get pricing statistics
 */
export function getPricingStats() {
  const stats = {
    lastUpdated: iphonePrices.last_updated || new Date().toISOString(),
    sources: [...(iphonePrices.sources || []), 'KT Corp'],
    deviceCount: {
      iphone: iphonePrices.devices?.length || 0,
      samsung: samsungPrices.devices?.length || 0,
      total: (iphonePrices.devices?.length || 0) + (samsungPrices.devices?.length || 0)
    },
    priceRange: {
      iphone: { min: Infinity, max: 0 },
      samsung: { min: Infinity, max: 0 }
    }
  };

  // Calculate price ranges
  for (const device of iphonePrices.devices || []) {
    const bPrice = device.prices?.B || 0;
    if (bPrice > 0) {
      stats.priceRange.iphone.min = Math.min(stats.priceRange.iphone.min, bPrice);
      stats.priceRange.iphone.max = Math.max(stats.priceRange.iphone.max, bPrice);
    }
  }

  for (const device of samsungPrices.devices || []) {
    const bPrice = device.prices?.B || 0;
    if (bPrice > 0) {
      stats.priceRange.samsung.min = Math.min(stats.priceRange.samsung.min, bPrice);
      stats.priceRange.samsung.max = Math.max(stats.priceRange.samsung.max, bPrice);
    }
  }

  return stats;
}

/**
 * Search for phone models (for UI search functionality)
 */
export function searchModels(query, category = null) {
  if (!query || query.length < 2) return [];

  const searchTerm = query.toLowerCase();
  const models = getAllModels();

  // Get models from the specified category or all
  let searchPool = [];
  if (category === 'iphone') {
    searchPool = models.iphone;
  } else if (category === 'samsung' || category === 'android') {
    searchPool = models.samsung;
  } else {
    searchPool = [...models.iphone, ...models.samsung];
  }

  // Search by model name
  const results = searchPool.filter(model =>
    model.model.toLowerCase().includes(searchTerm) ||
    model.id.includes(searchTerm)
  );

  // Return top 10 results with proper format
  return results.slice(0, 10).map(m => ({
    id: m.id,
    display: m.model,
    model: m.model,
    brand: m.brand
  }));
}

/**
 * Get all models by category (for backward compatibility)
 */
export function getAllModelsByCategory() {
  return getAllModels();
}

// Export main functions
export default {
  calculateQuote,
  getStorageOptions,
  getCarrierOptions,
  getAllModels,
  getAllModelsByCategory,
  searchModels,
  getPricingStats,
  CONDITIONS,
  ISSUE_DEDUCTIONS,
  POPULAR_MODELS
};