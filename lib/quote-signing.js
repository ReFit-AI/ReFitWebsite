/**
 * Quote Signing and Verification
 * Prevents price manipulation by signing quotes with HMAC
 */

import crypto from 'crypto';

// Use a dedicated secret for quote signing (different from admin secret)
const QUOTE_SECRET = process.env.QUOTE_SIGNING_SECRET || process.env.ADMIN_SECRET || 'INSECURE_FALLBACK_CHANGE_ME';

if (!process.env.QUOTE_SIGNING_SECRET && process.env.NODE_ENV === 'production') {
  console.warn('⚠️ WARNING: QUOTE_SIGNING_SECRET not set. Using fallback. Set in production!');
}

/**
 * Sign a quote with HMAC-SHA256
 * Returns signature that can be verified later
 */
export function signQuote(quoteData) {
  const {
    quoteId,
    modelId,
    storage,
    carrier,
    condition,
    usdPrice,
    solPrice,
    expiresAt
  } = quoteData;

  // Create a canonical string of the quote data
  // Note: solPrice is optional (null when SOL price unavailable)
  const canonicalData = [
    quoteId,
    modelId,
    storage,
    carrier,
    condition,
    usdPrice.toString(),
    solPrice !== null && solPrice !== undefined ? solPrice.toString() : '',
    expiresAt
  ].join('|');

  // Sign with HMAC-SHA256
  const hmac = crypto.createHmac('sha256', QUOTE_SECRET);
  hmac.update(canonicalData);
  const signature = hmac.digest('hex');

  return {
    signature,
    canonicalData // For debugging, remove in production
  };
}

/**
 * Verify a quote signature
 * Returns true if signature is valid, false otherwise
 */
export function verifyQuote(quoteData, providedSignature) {
  try {
    const { signature } = signQuote(quoteData);

    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(providedSignature, 'hex')
    );
  } catch (error) {
    console.error('Quote verification error:', error.message);
    return false;
  }
}

/**
 * Check if quote has expired
 */
export function isQuoteExpired(expiresAt) {
  if (!expiresAt) return true;

  const expiration = new Date(expiresAt);
  const now = new Date();

  return now > expiration;
}

/**
 * Validate quote data structure
 * Note: solPrice is optional (USDC is primary payment method)
 */
export function validateQuoteStructure(quoteData) {
  // solPrice is optional - USDC is primary
  const required = ['quoteId', 'modelId', 'storage', 'carrier', 'condition', 'usdPrice', 'expiresAt'];

  for (const field of required) {
    if (quoteData[field] === undefined || quoteData[field] === null) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }

  // Validate USDC price is a positive number (required)
  if (typeof quoteData.usdPrice !== 'number' || quoteData.usdPrice <= 0) {
    return { valid: false, error: 'Invalid USD price' };
  }

  // Validate SOL price only if provided (optional)
  if (quoteData.solPrice !== null && quoteData.solPrice !== undefined) {
    if (typeof quoteData.solPrice !== 'number' || quoteData.solPrice <= 0) {
      return { valid: false, error: 'Invalid SOL price' };
    }
  }

  return { valid: true };
}

/**
 * Complete quote verification (structure + signature + expiration)
 */
export function verifyQuoteComplete(quoteData, providedSignature) {
  // 1. Validate structure
  const structureCheck = validateQuoteStructure(quoteData);
  if (!structureCheck.valid) {
    return { valid: false, error: structureCheck.error };
  }

  // 2. Check expiration
  if (isQuoteExpired(quoteData.expiresAt)) {
    return { valid: false, error: 'Quote has expired. Please request a new quote.' };
  }

  // 3. Verify signature
  if (!verifyQuote(quoteData, providedSignature)) {
    return { valid: false, error: 'Invalid quote signature. Quote may have been tampered with.' };
  }

  return { valid: true };
}

export default {
  signQuote,
  verifyQuote,
  verifyQuoteComplete,
  isQuoteExpired,
  validateQuoteStructure
};
