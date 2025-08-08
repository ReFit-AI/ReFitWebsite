/**
 * Solana wallet authentication utilities
 * Implements signature verification and nonce management
 */

import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import crypto from 'crypto';

// Store for nonces (in production, use Redis)
const nonceStore = new Map();
const NONCE_EXPIRY = 5 * 60 * 1000; // 5 minutes

/**
 * Clean up expired nonces
 */
setInterval(() => {
  const now = Date.now();
  for (const [nonce, timestamp] of nonceStore.entries()) {
    if (now - timestamp > NONCE_EXPIRY) {
      nonceStore.delete(nonce);
    }
  }
}, 60 * 1000); // Every minute

/**
 * Generate a challenge nonce for authentication
 * @returns {Object} { nonce, message, expiresAt }
 */
export function generateAuthChallenge() {
  const nonce = crypto.randomUUID();
  const timestamp = Date.now();
  const expiresAt = new Date(timestamp + NONCE_EXPIRY);
  
  // Store nonce with timestamp
  nonceStore.set(nonce, timestamp);
  
  // Create challenge message
  const message = `Sign this message to authenticate with ReFit\n\nNonce: ${nonce}\nTimestamp: ${timestamp}\nExpires: ${expiresAt.toISOString()}`;
  
  return {
    nonce,
    message,
    expiresAt: expiresAt.toISOString()
  };
}

/**
 * Verify a Solana wallet signature
 * @param {string} publicKeyString - The public key as a base58 string
 * @param {string} signature - The signature as a base58 string
 * @param {string} message - The original message that was signed
 * @param {string} nonce - The nonce from the challenge
 * @returns {Object} { valid: boolean, error?: string }
 */
export function verifySignature(publicKeyString, signature, message, nonce) {
  try {
    // Validate nonce
    if (!nonce || !nonceStore.has(nonce)) {
      return { valid: false, error: 'Invalid or expired nonce' };
    }
    
    // Check nonce expiry
    const nonceTimestamp = nonceStore.get(nonce);
    if (Date.now() - nonceTimestamp > NONCE_EXPIRY) {
      nonceStore.delete(nonce);
      return { valid: false, error: 'Nonce expired' };
    }
    
    // Verify message contains the nonce
    if (!message.includes(nonce)) {
      return { valid: false, error: 'Message does not contain valid nonce' };
    }
    
    // Convert public key from base58
    const publicKey = new PublicKey(publicKeyString);
    const publicKeyBytes = publicKey.toBytes();
    
    // Decode signature from base58
    const signatureBytes = bs58.decode(signature);
    
    // Convert message to bytes
    const messageBytes = new TextEncoder().encode(message);
    
    // Verify signature
    const verified = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );
    
    if (verified) {
      // Remove used nonce to prevent replay
      nonceStore.delete(nonce);
      return { valid: true };
    }
    
    return { valid: false, error: 'Invalid signature' };
  } catch (error) {
    console.error('Signature verification error:', error);
    return { valid: false, error: 'Signature verification failed' };
  }
}

/**
 * Generate a secure session token
 * @returns {string} Hashed session token
 */
export function generateSessionToken() {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  return {
    token, // Send this to client
    hashedToken // Store this in database
  };
}

/**
 * Hash a session token for storage
 * @param {string} token - The raw token
 * @returns {string} Hashed token
 */
export function hashSessionToken(token) {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
}

/**
 * Create session metadata
 * @param {Object} request - Next.js request object
 * @returns {Object} Session metadata
 */
export function createSessionMetadata(request) {
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const ip = request.headers.get('x-real-ip') || 
             request.headers.get('x-forwarded-for')?.split(',')[0] || 
             'unknown';
  
  // Parse user agent for device info
  const isMobile = /mobile/i.test(userAgent);
  const isTablet = /tablet|ipad/i.test(userAgent);
  const deviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';
  
  // Basic browser detection
  let browser = 'unknown';
  if (/chrome/i.test(userAgent)) browser = 'chrome';
  else if (/firefox/i.test(userAgent)) browser = 'firefox';
  else if (/safari/i.test(userAgent)) browser = 'safari';
  else if (/edge/i.test(userAgent)) browser = 'edge';
  
  return {
    user_agent: userAgent.substring(0, 500), // Limit length
    ip_address: ip,
    device_type: deviceType,
    browser: browser,
    created_at: new Date().toISOString()
  };
}

/**
 * Validate session binding
 * @param {Object} session - Session from database
 * @param {Object} request - Current request
 * @returns {boolean} Whether session is valid for this request
 */
export function validateSessionBinding(session, request) {
  const currentUA = request.headers.get('user-agent');
  const currentIP = request.headers.get('x-real-ip') || 
                   request.headers.get('x-forwarded-for')?.split(',')[0];
  
  // In development, be more lenient
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // Check if user agent matches (allow minor variations)
  if (session.user_agent && currentUA) {
    const sessionBrowser = session.browser || '';
    const currentBrowser = currentUA.includes('Chrome') ? 'chrome' :
                          currentUA.includes('Firefox') ? 'firefox' :
                          currentUA.includes('Safari') ? 'safari' : '';
    
    if (sessionBrowser && currentBrowser && sessionBrowser !== currentBrowser) {
      console.warn('Session browser mismatch');
      return false;
    }
  }
  
  // Check if IP is from same subnet (first 3 octets)
  if (session.ip_address && currentIP && session.ip_address !== 'unknown') {
    const sessionSubnet = session.ip_address.split('.').slice(0, 3).join('.');
    const currentSubnet = currentIP.split('.').slice(0, 3).join('.');
    
    if (sessionSubnet !== currentSubnet) {
      console.warn('Session IP subnet mismatch');
      // Log but don't block - IPs can change
    }
  }
  
  return true;
}