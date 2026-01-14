/**
 * Input validation schemas using Zod
 * Ensures all API inputs are properly validated and sanitized
 */

import { z } from 'zod';

// Common schemas
const walletAddressSchema = z.string()
  .min(32, 'Invalid wallet address')
  .max(44, 'Invalid wallet address')
  .regex(/^[1-9A-HJ-NP-Za-km-z]+$/, 'Invalid wallet address format');

const phoneConditionSchema = z.enum(['excellent', 'good', 'fair', 'working', 'broken']);

const addressSchema = z.object({
  name: z.string().min(1).max(100),
  company: z.string().max(100).optional(),
  street1: z.string().min(1).max(200),
  street2: z.string().max(200).optional(),
  city: z.string().min(1).max(100),
  state: z.string().length(2),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/),
  country: z.string().length(2).default('US'),
  phone: z.string().regex(/^[\d\s\-\(\)\+]+$/).optional(),
  email: z.string().email().optional()
});

// Phone quote validation
export const phoneQuoteSchema = z.object({
  modelId: z.string().min(1).max(100),
  storage: z.string().regex(/^\d+(GB|TB)$/),
  carrier: z.enum(['unlocked', 'att', 'tmobile', 'verizon', 'other']),
  condition: phoneConditionSchema,
  issues: z.array(z.enum([
    'face_id_broken',
    'cracked_camera_lens',
    'unknown_parts',
    'bad_charging_port',
    'back_crack',
    'mdm_locked',
    'battery_message',
    'missing_stylus',
    'seed_vault_issue'
  ])).default([]),
  accessories: z.object({
    charger: z.boolean().default(false),
    box: z.boolean().default(false)
  }).default({})
});

// Mobile app quote validation (accepts "model" instead of "modelId")
export const mobileQuoteSchema = z.object({
  model: z.string().min(1).max(100),
  storage: z.string().regex(/^\d+(GB|TB)$/).optional().default('128GB'),
  carrier: z.enum(['unlocked', 'att', 'tmobile', 'verizon', 'other', 'Unlocked', 'AT&T', 'T-Mobile', 'Verizon', 'Other']).optional(),
  condition: z.enum(['excellent', 'good', 'fair', 'working', 'broken', 'poor', 'Excellent', 'Good', 'Fair', 'Working', 'Broken', 'Poor']),
  issues: z.array(z.string()).optional().default([])
});

// Shipping rates validation
export const shippingRatesSchema = z.object({
  fromAddress: addressSchema.optional(),
  toAddress: addressSchema,
  parcel: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
    weight: z.number().positive(),
    distance_unit: z.enum(['in', 'cm']).default('in'),
    mass_unit: z.enum(['lb', 'kg']).default('lb')
  }).optional()
});

// Purchase label validation
export const purchaseLabelSchema = z.object({
  rateId: z.string().min(1),
  userAddress: addressSchema,
  walletAddress: walletAddressSchema
});

// Wallet auth validation
export const walletAuthSchema = z.object({
  publicKey: walletAddressSchema,
  signature: z.string().min(1).max(200),
  message: z.string().min(1).max(500),
  nonce: z.string().uuid().optional() // For replay protection
});

// Mobile auth connect validation
export const mobileAuthConnectSchema = z.object({
  publicKey: walletAddressSchema,
  signature: z.string().min(1),
  message: z.string().min(1),
  deviceInfo: z.object({
    userAgent: z.string().optional(),
    platform: z.string().optional(),
    version: z.string().optional()
  }).optional()
});

// Order creation validation
export const createOrderSchema = z.object({
  walletAddress: walletAddressSchema,
  phoneData: z.object({
    brand: z.string(),
    model: z.string(),
    storage: z.string(),
    carrier: z.string(),
    condition: phoneConditionSchema,
    category: z.enum(['iphone', 'android', 'solana']),
    issues: z.array(z.string()).default([])
  }),
  priceQuote: z.object({
    usdPrice: z.number().positive(),
    solPrice: z.number().positive(),
    breakdown: z.any().optional()
  }),
  shippingAddress: addressSchema,
  shippingRate: z.any().optional(),
  shippingLabel: z.object({
    trackingNumber: z.string(),
    labelUrl: z.string().url(),
    carrier: z.string()
  }).optional()
});

// Webhook validation
export const webhookSchema = z.object({
  event: z.string(),
  tracking_number: z.string(),
  tracking_status: z.object({
    status: z.string(),
    status_details: z.string().optional()
  }).optional(),
  location: z.object({
    city: z.string().optional(),
    state: z.string().optional()
  }).optional(),
  occurred_at: z.string().datetime().optional()
});

/**
 * Validate request body against schema
 * @param {*} data - Request body to validate
 * @param {ZodSchema} schema - Zod schema to validate against
 * @returns {Object} { success: boolean, data?: parsed data, error?: error message }
 */
export function validateInput(data, schema) {
  try {
    const parsed = schema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format error messages
      const errors = error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }));
      
      return { 
        success: false, 
        error: 'Validation failed',
        errors 
      };
    }
    
    return { 
      success: false, 
      error: 'Invalid input'
    };
  }
}

/**
 * Sanitize error message for client response
 * - In development: Shows full error details for debugging
 * - In production: Shows generic message, logs full error server-side
 *
 * @param {Error} error - The error object
 * @param {string} fallbackMessage - Generic message to show in production
 * @returns {string} Sanitized error message
 */
export function sanitizeError(error, fallbackMessage = 'Internal server error') {
  // Always log full error server-side
  console.error('Error occurred:', {
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    name: error.name,
    code: error.code
  });

  // Return detailed error in development, generic in production
  if (process.env.NODE_ENV === 'development') {
    return error.message;
  }

  // In production, check for safe error messages we can expose
  const safeErrors = [
    'Missing required fields',
    'Invalid wallet address',
    'Insufficient balance',
    'Order not found',
    'Transaction already processed',
    'Quote has expired',
    'Authentication required',
    'Unauthorized',
    'Too many requests',
    'Rate limit exceeded',
    'Invalid amount',
    'Minimum deposit',
    'Maximum deposit',
    'Invalid input',
    'Validation error'
  ];

  // If error message starts with a safe prefix, allow it
  const isSafeError = safeErrors.some(safe =>
    error.message?.toLowerCase().includes(safe.toLowerCase())
  );

  if (isSafeError) {
    return error.message;
  }

  // Otherwise return generic message
  return fallbackMessage;
}

/**
 * Redact sensitive fields from logs
 * @param {Object} data - Data to redact
 * @returns {Object} Redacted data
 */
export function redactSensitive(data) {
  if (!data) return data;
  
  const sensitiveFields = [
    'password', 'token', 'api_key', 'apiKey', 
    'secret', 'signature', 'session_token',
    'email', 'phone', 'street1', 'street2',
    'name', 'company'
  ];
  
  const redacted = { ...data };
  
  for (const field of sensitiveFields) {
    if (field in redacted) {
      redacted[field] = '[REDACTED]';
    }
  }
  
  // Recursively redact nested objects
  for (const key in redacted) {
    if (typeof redacted[key] === 'object' && redacted[key] !== null) {
      redacted[key] = redactSensitive(redacted[key]);
    }
  }
  
  return redacted;
}