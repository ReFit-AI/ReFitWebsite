/**
 * Utility functions for ReFit
 */

/**
 * Format a price value for display
 * @param {number} price - Price in dollars
 * @param {string} currency - Currency symbol (default: $)
 * @returns {string} Formatted price string
 */
export function formatPrice(price, currency = '$') {
  if (typeof price !== 'number' || isNaN(price)) {
    return `${currency}0.00`;
  }

  return `${currency}${price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

/**
 * Format a Solana public key for display
 * @param {string} publicKey - Full public key
 * @returns {string} Shortened public key
 */
export function formatPublicKey(publicKey) {
  if (!publicKey || publicKey.length < 8) return publicKey;
  return `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`;
}

/**
 * Format a date for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Convert USDC amount (with 6 decimals) to display value
 * @param {number|string} amount - Amount in USDC base units
 * @returns {number} Display value in dollars
 */
export function usdcToDisplay(amount) {
  return Number(amount) / 1e6;
}

/**
 * Convert display value to USDC amount (with 6 decimals)
 * @param {number} displayValue - Value in dollars
 * @returns {number} Amount in USDC base units
 */
export function displayToUsdc(displayValue) {
  return Math.floor(displayValue * 1e6);
}

/**
 * Format phone model name for display
 * @param {string} model - Phone model
 * @returns {string} Formatted model name
 */
export function formatPhoneModel(model) {
  if (!model) return '';
  // Convert dash-separated to space-separated
  return model.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Calculate platform fee
 * @param {number} amount - Transaction amount
 * @param {number} feePercent - Fee percentage (default: 1%)
 * @returns {number} Fee amount
 */
export function calculatePlatformFee(amount, feePercent = 1) {
  return (amount * feePercent) / 100;
}

/**
 * Calculate seller proceeds after fee
 * @param {number} amount - Total amount
 * @param {number} feePercent - Fee percentage (default: 1%)
 * @returns {number} Amount seller receives
 */
export function calculateSellerProceeds(amount, feePercent = 1) {
  return amount - calculatePlatformFee(amount, feePercent);
}

/**
 * Format percentage
 * @param {number} value - Decimal value (0.15 = 15%)
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value) {
  return `${(value * 100).toFixed(2)}%`;
}

/**
 * Format condition for display
 * @param {string} condition - Condition code
 * @returns {string} Display condition
 */
export function formatCondition(condition) {
  const conditions = {
    'excellent': 'Excellent',
    'good': 'Good',
    'fair': 'Fair',
    'poor': 'Poor',
    'broken': 'For Parts'
  };
  return conditions[condition?.toLowerCase()] || condition;
}

/**
 * Get condition color class
 * @param {string} condition - Condition code
 * @returns {string} Tailwind color class
 */
export function getConditionColor(condition) {
  const colors = {
    'excellent': 'text-green-400',
    'good': 'text-blue-400',
    'fair': 'text-yellow-400',
    'poor': 'text-orange-400',
    'broken': 'text-red-400'
  };
  return colors[condition?.toLowerCase()] || 'text-gray-400';
}

/**
 * Validate phone IMEI
 * @param {string} imei - IMEI number
 * @returns {boolean} Whether IMEI is valid
 */
export function validateIMEI(imei) {
  if (!imei) return false;
  // Remove any non-digits
  const cleaned = imei.replace(/\D/g, '');
  // IMEI should be 15 digits
  return cleaned.length === 15;
}

/**
 * Generate a unique listing ID
 * @returns {string} Unique ID
 */
export function generateListingId() {
  return `LISTING_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a unique order ID
 * @returns {string} Unique ID
 */
export function generateOrderId() {
  return `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (obj instanceof Object) {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

/**
 * Sleep/delay function
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after delay
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry an async function
 * @param {Function} fn - Async function to retry
 * @param {number} retries - Number of retries
 * @param {number} delay - Delay between retries in ms
 * @returns {Promise} Result of function
 */
export async function retry(fn, retries = 3, delay = 1000) {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await sleep(delay);
    return retry(fn, retries - 1, delay * 2);
  }
}