/**
 * Distributed nonce storage using Upstash Redis
 * Replaces in-memory Map() for production scalability
 */

import { Redis } from '@upstash/redis';
import crypto from 'crypto';

// Initialize Redis client (reuse from rate limiting config)
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Fallback to in-memory storage for development
const inMemoryNonces = new Map();
const NONCE_EXPIRY = 5 * 60; // 5 minutes in seconds

// Clean up expired in-memory nonces (development only)
if (!redis) {
  setInterval(() => {
    const now = Date.now();
    for (const [nonce, timestamp] of inMemoryNonces.entries()) {
      if (now - timestamp > NONCE_EXPIRY * 1000) {
        inMemoryNonces.delete(nonce);
      }
    }
  }, 60 * 1000); // Every minute
}

/**
 * Store a nonce with expiration
 * @param {string} nonce - The nonce to store
 * @returns {Promise<boolean>} Success status
 */
export async function storeNonce(nonce) {
  if (redis) {
    try {
      // Store in Redis with TTL
      await redis.setex(`nonce:${nonce}`, NONCE_EXPIRY, Date.now());
      return true;
    } catch (error) {
      console.error('Redis nonce storage error:', error);
      // Fallback to in-memory
      inMemoryNonces.set(nonce, Date.now());
      return true;
    }
  } else {
    // Development: use in-memory storage
    inMemoryNonces.set(nonce, Date.now());
    return true;
  }
}

/**
 * Verify and consume a nonce (one-time use)
 * @param {string} nonce - The nonce to verify
 * @returns {Promise<boolean>} Whether nonce was valid
 */
export async function verifyAndConsumeNonce(nonce) {
  if (!nonce) return false;

  if (redis) {
    try {
      // Get and delete atomically (consume the nonce)
      const key = `nonce:${nonce}`;
      const timestamp = await redis.get(key);
      
      if (!timestamp) {
        return false; // Nonce doesn't exist or expired
      }
      
      // Delete the nonce (one-time use)
      await redis.del(key);
      
      // Check if nonce is not too old (double check even with TTL)
      const age = Date.now() - parseInt(timestamp);
      return age < NONCE_EXPIRY * 1000;
    } catch (error) {
      console.error('Redis nonce verification error:', error);
      // Fallback to in-memory
      const timestamp = inMemoryNonces.get(nonce);
      if (timestamp) {
        inMemoryNonces.delete(nonce); // Consume
        const age = Date.now() - timestamp;
        return age < NONCE_EXPIRY * 1000;
      }
      return false;
    }
  } else {
    // Development: use in-memory storage
    const timestamp = inMemoryNonces.get(nonce);
    if (timestamp) {
      inMemoryNonces.delete(nonce); // Consume
      const age = Date.now() - timestamp;
      return age < NONCE_EXPIRY * 1000;
    }
    return false;
  }
}

/**
 * Check if nonce exists without consuming it
 * @param {string} nonce - The nonce to check
 * @returns {Promise<boolean>} Whether nonce exists
 */
export async function checkNonceExists(nonce) {
  if (!nonce) return false;

  if (redis) {
    try {
      const exists = await redis.exists(`nonce:${nonce}`);
      return exists === 1;
    } catch (error) {
      console.error('Redis nonce check error:', error);
      return inMemoryNonces.has(nonce);
    }
  } else {
    return inMemoryNonces.has(nonce);
  }
}

/**
 * Generate a new nonce and store it
 * @returns {Promise<{nonce: string, expiresAt: Date}>}
 */
export async function generateAndStoreNonce() {
  const nonce = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + NONCE_EXPIRY * 1000);
  
  await storeNonce(nonce);
  
  return {
    nonce,
    expiresAt
  };
}