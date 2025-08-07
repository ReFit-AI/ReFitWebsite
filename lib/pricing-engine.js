/**
 * Pricing Engine using KT Corp wholesale data
 * Uses Grade B as baseline with safety margins
 */

import supplierPricingData from '@/data/supplier-pricing-iphones.json';

// Popular models for quick selection (based on volume and recent releases)
export const POPULAR_MODELS = [
  { id: 'iphone-16-pro-max', brand: 'Apple', model: 'iPhone 16 Pro Max', display: 'iPhone 16 Pro Max', icon: '📱' },
  { id: 'iphone-16-pro', brand: 'Apple', model: 'iPhone 16 Pro', display: 'iPhone 16 Pro', icon: '📱' },
  { id: 'iphone-16-plus', brand: 'Apple', model: 'iPhone 16 Plus', display: 'iPhone 16 Plus', icon: '📱' },
  { id: 'iphone-16', brand: 'Apple', model: 'iPhone 16', display: 'iPhone 16', icon: '📱' },
  { id: 'iphone-15-pro-max', brand: 'Apple', model: 'iPhone 15 Pro Max', display: 'iPhone 15 Pro Max', icon: '📱' },
  { id: 'iphone-15-pro', brand: 'Apple', model: 'iPhone 15 Pro', display: 'iPhone 15 Pro', icon: '📱' },
  { id: 'iphone-15', brand: 'Apple', model: 'iPhone 15', display: 'iPhone 15', icon: '📱' },
  { id: 'iphone-14-pro-max', brand: 'Apple', model: 'iPhone 14 Pro Max', display: 'iPhone 14 Pro Max', icon: '📱' },
  { id: 'iphone-14-pro', brand: 'Apple', model: 'iPhone 14 Pro', display: 'iPhone 14 Pro', icon: '📱' },
  { id: 'iphone-14', brand: 'Apple', model: 'iPhone 14', display: 'iPhone 14', icon: '📱' },
  { id: 'iphone-13-pro-max', brand: 'Apple', model: 'iPhone 13 Pro Max', display: 'iPhone 13 Pro Max', icon: '📱' },
  { id: 'iphone-13', brand: 'Apple', model: 'iPhone 13', display: 'iPhone 13', icon: '📱' },
];

// Map user-friendly conditions to KT grades with safety margins
const CONDITION_MAPPING = {
  'excellent': { ktGrade: 'B', margin: 0.95 },  // 95% of B price
  'good': { ktGrade: 'C', margin: 0.95 },       // 95% of C price  
  'fair': { ktGrade: 'D', margin: 0.90 },       // 90% of D price
};

// Deductions for specific issues (from KT sheet)
const ISSUE_DEDUCTIONS = {
  'face_id_broken': 400,
  'cracked_camera_lens': 80,
  'unknown_parts': 80,
  'bad_charging_port': 200,
  'back_crack': 150,
  'mdm_locked': 200,
  'battery_message': 50,
};

/**
 * Build searchable model index from KT data
 */
export function buildModelIndex() {
  const index = {};
  
  supplierPricingData.iphones?.forEach(device => {
    const modelKey = device.model.toLowerCase().replace(/\s+/g, '-');
    
    if (!index[modelKey]) {
      index[modelKey] = {
        display: device.model,
        variants: []
      };
    }
    
    index[modelKey].variants.push({
      storage: device.storage,
      lockStatus: device.lock_status,
      prices: device.prices
    });
  });
  
  return index;
}

/**
 * Search for phone models with fuzzy matching
 */
export function searchModels(query) {
  if (!query || query.length < 2) return [];
  
  const index = buildModelIndex();
  const searchTerm = query.toLowerCase().replace(/\s+/g, '-');
  const results = [];
  
  // Direct matches first
  Object.keys(index).forEach(key => {
    if (key.includes(searchTerm)) {
      results.push({
        id: key,
        ...index[key]
      });
    }
  });
  
  // Fuzzy matches
  if (results.length === 0) {
    // Try removing 'iphone' prefix
    const simplified = searchTerm.replace('iphone-', '');
    Object.keys(index).forEach(key => {
      if (key.includes(simplified)) {
        results.push({
          id: key,
          ...index[key]
        });
      }
    });
  }
  
  return results.slice(0, 10); // Max 10 results
}

/**
 * Get available storage options for a model
 */
export function getStorageOptions(modelId) {
  const index = buildModelIndex();
  const model = index[modelId];
  
  if (!model) return [];
  
  const storageSet = new Set();
  model.variants.forEach(v => storageSet.add(v.storage));
  
  return Array.from(storageSet).sort((a, b) => {
    const aNum = parseInt(a);
    const bNum = parseInt(b);
    return aNum - bNum;
  });
}

/**
 * Calculate quote based on model, condition, and issues
 */
export function calculateQuote({
  modelId,
  storage,
  carrier,
  condition,
  issues = [],
  accessories = { charger: false, box: false }
}) {
  const index = buildModelIndex();
  const model = index[modelId];
  
  if (!model) {
    return { error: 'Model not found' };
  }
  
  // Find the right variant
  const lockStatus = carrier === 'unlocked' ? 'Unlocked' : 'Carrier Locked';
  const variant = model.variants.find(v => 
    v.storage === storage && 
    (v.lockStatus === lockStatus || v.lockStatus === 'Unknown')
  );
  
  if (!variant) {
    return { error: 'This configuration not available' };
  }
  
  // Get base price from KT grade with safety margin
  const mapping = CONDITION_MAPPING[condition];
  if (!mapping) {
    return { error: 'Invalid condition' };
  }
  
  const ktPrice = variant.prices[mapping.ktGrade];
  if (!ktPrice) {
    return { error: 'Price not available for this condition' };
  }
  
  // Apply safety margin
  let price = ktPrice * mapping.margin;
  
  // Apply deductions for issues
  issues.forEach(issue => {
    if (ISSUE_DEDUCTIONS[issue]) {
      price -= ISSUE_DEDUCTIONS[issue];
    }
  });
  
  // Small bonus for accessories (optional)
  if (accessories.charger) price += 5;
  if (accessories.box) price += 5;
  
  // Ensure price doesn't go negative
  price = Math.max(price, 50);
  
  // Calculate SOL price (assuming $180/SOL rate - should be dynamic)
  const solPrice = (price / 180).toFixed(3);
  
  return {
    success: true,
    usdPrice: Math.round(price),
    solPrice: parseFloat(solPrice),
    ktGrade: mapping.ktGrade,
    confidence: price > 500 ? 'high' : price > 200 ? 'medium' : 'low',
    estimatedProcessingTime: '2-3 business days',
    breakdown: {
      basePrice: ktPrice,
      condition: mapping.ktGrade,
      margin: mapping.margin,
      deductions: issues.map(i => ({ issue: i, amount: ISSUE_DEDUCTIONS[i] || 0 })),
      accessories: accessories
    }
  };
}

/**
 * Get all available models for dropdown (if needed)
 */
export function getAllModels() {
  const index = buildModelIndex();
  return Object.keys(index).map(key => ({
    id: key,
    display: index[key].display,
    brand: index[key].display.includes('iPhone') ? 'Apple' : 'Other'
  }));
}