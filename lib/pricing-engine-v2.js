/**
 * Pricing Engine V2 - Multi-brand support
 * Handles iPhones, Android phones, and Saga devices
 */

import supplierIphoneData from '@/data/supplier-pricing-iphones.json';
import supplierAndroidData from '@/data/supplier-pricing-androids.json';
import solanaPricingData from '@/data/saga-pricing.json';

// Popular models by category
export const POPULAR_MODELS = {
  iphone: [
    { id: 'iphone-16-pro-max', brand: 'Apple', model: 'iPhone 16 Pro Max', display: 'iPhone 16 Pro Max', icon: '📱' },
    { id: 'iphone-16-pro', brand: 'Apple', model: 'iPhone 16 Pro', display: 'iPhone 16 Pro', icon: '📱' },
    { id: 'iphone-16-plus', brand: 'Apple', model: 'iPhone 16 Plus', display: 'iPhone 16 Plus', icon: '📱' },
    { id: 'iphone-16', brand: 'Apple', model: 'iPhone 16', display: 'iPhone 16', icon: '📱' },
    { id: 'iphone-15-pro-max', brand: 'Apple', model: 'iPhone 15 Pro Max', display: 'iPhone 15 Pro Max', icon: '📱' },
    { id: 'iphone-15-pro', brand: 'Apple', model: 'iPhone 15 Pro', display: 'iPhone 15 Pro', icon: '📱' },
  ],
  android: [
    { id: 'galaxy-s25-ultra', brand: 'Samsung', model: 'GALAXY S25 ULTRA', display: 'Galaxy S25 Ultra', icon: '📱' },
    { id: 'galaxy-s24-ultra', brand: 'Samsung', model: 'GALAXY S24 ULTRA', display: 'Galaxy S24 Ultra', icon: '📱' },
    { id: 'galaxy-z-fold-6', brand: 'Samsung', model: 'GALAXY Z FOLD 6', display: 'Galaxy Z Fold 6', icon: '📱' },
    { id: 'galaxy-s25-plus', brand: 'Samsung', model: 'GALAXY S25 PLUS', display: 'Galaxy S25+', icon: '📱' },
    { id: 'galaxy-s24-plus', brand: 'Samsung', model: 'GALAXY S24 PLUS', display: 'Galaxy S24+', icon: '📱' },
    { id: 'galaxy-z-fold-5', brand: 'Samsung', model: 'GALAXY Z FOLD 5', display: 'Galaxy Z Fold 5', icon: '📱' },
  ],
  solana: [
    { id: 'saga-512gb', brand: 'Solana', model: 'Saga', display: 'Solana Saga', icon: '📱' }
  ]
};

// Map user-friendly conditions to supplier grades with safety margins
// Grade B: Fully functional, light scratches only, no cracks
// Grade C: Cracked screen/back but fully functional, original LCD
// Grade D: LCD issues (spots/lines/touch), heavy damage, still powers on
const CONDITION_MAPPING = {
  'excellent': { grade: 'B', margin: 0.95 },  // Grade B: Minor cosmetic wear only
  'good': { grade: 'C', margin: 0.95 },       // Grade C: Cracked but functional
  'fair': { grade: 'D', margin: 0.90 },       // Grade D: LCD/heavy issues
};

// Issue deductions
const ISSUE_DEDUCTIONS = {
  'face_id_broken': 400,
  'cracked_camera_lens': 80,
  'unknown_parts': 80,
  'bad_charging_port': 200,
  'back_crack': 150,
  'mdm_locked': 200,
  'battery_message': 50,
  'missing_stylus': 40,  // For Samsung Note/Fold with S-Pen
  'seed_vault_issue': 100, // Saga-specific issue
};

// Minimum price floor (to avoid quoting $0 on trivial cases)
const MIN_PRICE_FLOOR = 20;

/**
 * Build unified model index from all data sources
 */
export function buildModelIndex() {
  const index = {};

  const mergePrices = (a = {}, b = {}) => {
    const grades = ['A', 'B+', 'B', 'C', 'D'];
    const out = { ...a };
    grades.forEach(g => {
      if (b[g] != null) {
        out[g] = out[g] != null ? Math.max(out[g], b[g]) : b[g];
      }
    });
    return out;
  };
  
  // Add iPhones (deduplicate by storage + lockStatus)
  supplierIphoneData.iphones?.forEach(device => {
    const modelKey = device.model.toLowerCase().replace(/\s+/g, '-');
    
    if (!index[modelKey]) {
      index[modelKey] = {
        display: device.model,
        brand: 'Apple',
        category: 'iphone',
        variants: []
      };
    }
    
    const existing = index[modelKey].variants.find(v => v.storage === device.storage && v.lockStatus === device.lock_status);
    if (existing) {
      existing.prices = mergePrices(existing.prices, device.prices);
    } else {
      index[modelKey].variants.push({
        storage: device.storage,
        lockStatus: device.lock_status,
        prices: device.prices
      });
    }
  });
  
  // Add Android phones (deduplicate by storage + lockStatus)
  supplierAndroidData.androids?.forEach(device => {
    const modelKey = device.model.toLowerCase().replace(/\s+/g, '-');
    
    if (!index[modelKey]) {
      index[modelKey] = {
        display: device.model,
        brand: 'Samsung',
        category: 'android',
        variants: []
      };
    }
    
    const existing = index[modelKey].variants.find(v => v.storage === device.storage && v.lockStatus === device.lock_status);
    if (existing) {
      existing.prices = mergePrices(existing.prices, device.prices);
    } else {
      index[modelKey].variants.push({
        storage: device.storage,
        lockStatus: device.lock_status,
        prices: device.prices
      });
    }
  });
  
  // Add Solana phones with simplified pricing
  solanaPricingData.solana_phones?.forEach(device => {
    const modelKey = `${device.model}-${device.storage}`.toLowerCase().replace(/\s+/g, '-');
    
    // Map simple working/broken to grade system for compatibility
    const prices = device.prices.working ? {
      'A': device.prices.working,
      'B+': device.prices.working,
      'B': device.prices.working,
      'C': device.prices.working * 0.8,
      'D': device.prices.broken
    } : device.prices;
    
    index[modelKey] = {
      display: device.display_name,
      brand: 'Solana',
      category: 'solana',
      isSimplePricing: true,
      variants: [{
        storage: device.storage,
        lockStatus: device.lock_status,
        prices: prices
      }]
    };
  });
  
  return index;
}

/**
 * Search across all phone models
 */
export function searchModels(query, category = null) {
  if (!query || query.length < 2) return [];
  
  const index = buildModelIndex();
  const searchTerm = query.toLowerCase().replace(/\s+/g, '-');
  const results = [];
  
  Object.keys(index).forEach(key => {
    const model = index[key];
    
    // Filter by category if specified
    if (category && model.category !== category) return;
    
    // Search logic
    if (key.includes(searchTerm) || model.display.toLowerCase().includes(searchTerm.replace('-', ' '))) {
      results.push({
        id: key,
        ...model
      });
    }
  });
  
  return results.slice(0, 10);
}

/**
 * Get storage options for a model
 */
export function getStorageOptions(modelId) {
  const index = buildModelIndex();
  const model = index[modelId];
  
  if (!model) return [];
  
  const storageSet = new Set();
  model.variants.forEach(v => storageSet.add(v.storage));
  
  return Array.from(storageSet).sort((a, b) => {
    // Convert TB to GB for proper sorting
    const aNum = a.includes('TB') ? parseInt(a) * 1024 : parseInt(a);
    const bNum = b.includes('TB') ? parseInt(b) * 1024 : parseInt(b);
    return aNum - bNum;
  });
}

/**
 * Calculate quote for any phone type
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
  
  // Handle Solana phones with simple pricing
  let price;
  if (model.category === 'solana') {
    // Simple working/broken pricing for Solana
    if (condition === 'working') {
      price = variant.prices['A'] || variant.prices['B'];  // All working conditions same price
    } else if (condition === 'broken') {
      price = variant.prices['D'];  // Broken maps to D grade
    } else {
      return { error: 'Invalid condition for Solana phone' };
    }
  } else {
    // Standard grade-based pricing for iPhone/Android
    const mapping = CONDITION_MAPPING[condition];
    if (!mapping) {
      return { error: 'Invalid condition' };
    }
    
    const supplierPrice = variant.prices[mapping.grade];
    if (!supplierPrice) {
      return { error: 'Price not available for this condition' };
    }
    
    // Apply safety margin
    price = supplierPrice * mapping.margin;
  }
  
  // Apply deductions for issues
  issues.forEach(issue => {
    if (ISSUE_DEDUCTIONS[issue]) {
      price -= ISSUE_DEDUCTIONS[issue];
    }
  });
  
  // Small bonus for accessories
  if (accessories.charger) price += 5;
  if (accessories.box) price += 5;
  
  // Special bonus for Solana phones with original packaging
  if (model.category === 'solana' && accessories.box) {
    price += 20; // Solana phone boxes are more valuable for collectors
  }
  
  // Ensure price doesn't go negative and apply a conservative floor
  price = Math.max(price, MIN_PRICE_FLOOR);
  
  // Calculate SOL price (should be dynamic)
  const solPrice = (price / 180).toFixed(3);
  
  // Prepare return data based on phone type
  const baseReturn = {
    success: true,
    usdPrice: Math.round(price),
    solPrice: parseFloat(solPrice),
    category: model.category,
    brand: model.brand,
    confidence: price > 500 ? 'high' : price > 200 ? 'medium' : 'low',
    estimatedProcessingTime: model.category === 'solana' ? '1-2 business days' : '2-3 business days'
  };
  
  // Add breakdown details
  if (model.category === 'solana') {
    baseReturn.condition = condition;
    baseReturn.breakdown = {
      basePrice: price + issues.reduce((sum, i) => sum + (ISSUE_DEDUCTIONS[i] || 0), 0),
      condition: condition,
      deductions: issues.map(i => ({ issue: i, amount: ISSUE_DEDUCTIONS[i] || 0 })),
      accessories: accessories
    };
  } else {
    const mapping = CONDITION_MAPPING[condition];
    baseReturn.supplierGrade = mapping.grade;
    baseReturn.breakdown = {
      basePrice: variant.prices[mapping.grade],
      condition: mapping.grade,
      margin: mapping.margin,
      deductions: issues.map(i => ({ issue: i, amount: ISSUE_DEDUCTIONS[i] || 0 })),
      accessories: accessories
    };
  }
  
  return baseReturn;
}

/**
 * Get all models organized by category
 */
export function getAllModelsByCategory() {
  const index = buildModelIndex();
  const categories = {
    iphone: [],
    android: [],
    solana: []
  };
  
  Object.keys(index).forEach(key => {
    const model = index[key];
    if (categories[model.category]) {
      categories[model.category].push({
        id: key,
        display: model.display,
        brand: model.brand
      });
    }
  });
  
  return categories;
}