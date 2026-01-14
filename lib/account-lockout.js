/**
 * Account Lockout Protection
 * Prevents brute force attacks on admin authentication
 * Uses Redis (Upstash) for distributed tracking across serverless instances
 */

import { Redis } from '@upstash/redis';

// Initialize Redis client (same as rate limiting)
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// In-memory fallback for development (not production-safe)
const memoryStore = new Map();

/**
 * Configuration for account lockout
 */
const LOCKOUT_CONFIG = {
  MAX_ATTEMPTS: 5,           // Max failed attempts before lockout
  LOCKOUT_DURATION: 3600,    // Lockout duration in seconds (1 hour)
  ATTEMPT_WINDOW: 900,       // Window to count attempts in seconds (15 minutes)
  PROGRESSIVE_DELAY: true    // Enable progressive delays
};

/**
 * Get lockout key for identifier (IP or wallet)
 */
function getLockoutKey(identifier, type = 'ip') {
  return `lockout:${type}:${identifier}`;
}

/**
 * Get attempt count key
 */
function getAttemptKey(identifier, type = 'ip') {
  return `attempts:${type}:${identifier}`;
}

/**
 * Record failed authentication attempt
 *
 * @param {string} identifier - IP address or wallet address
 * @param {string} type - Type of identifier ('ip' or 'wallet')
 * @returns {Promise<Object>} { locked: boolean, attemptsRemaining: number, lockedUntil?: Date }
 */
export async function recordFailedAttempt(identifier, type = 'ip') {
  const lockoutKey = getLockoutKey(identifier, type);
  const attemptKey = getAttemptKey(identifier, type);

  if (redis) {
    // Check if already locked
    const locked = await redis.get(lockoutKey);
    if (locked) {
      const ttl = await redis.ttl(lockoutKey);
      return {
        locked: true,
        attemptsRemaining: 0,
        lockedUntil: new Date(Date.now() + ttl * 1000),
        message: `Account locked. Try again in ${Math.ceil(ttl / 60)} minutes.`
      };
    }

    // Increment attempt counter
    const attempts = await redis.incr(attemptKey);

    // Set expiry on first attempt
    if (attempts === 1) {
      await redis.expire(attemptKey, LOCKOUT_CONFIG.ATTEMPT_WINDOW);
    }

    // Check if threshold exceeded
    if (attempts >= LOCKOUT_CONFIG.MAX_ATTEMPTS) {
      // Lock the account
      await redis.setex(lockoutKey, LOCKOUT_CONFIG.LOCKOUT_DURATION, 'locked');

      // Clear attempt counter
      await redis.del(attemptKey);

      console.warn(`🔒 Account locked: ${type}=${identifier} after ${attempts} failed attempts`);

      return {
        locked: true,
        attemptsRemaining: 0,
        lockedUntil: new Date(Date.now() + LOCKOUT_CONFIG.LOCKOUT_DURATION * 1000),
        message: `Too many failed attempts. Account locked for ${LOCKOUT_CONFIG.LOCKOUT_DURATION / 60} minutes.`
      };
    }

    return {
      locked: false,
      attemptsRemaining: LOCKOUT_CONFIG.MAX_ATTEMPTS - attempts,
      message: `Authentication failed. ${LOCKOUT_CONFIG.MAX_ATTEMPTS - attempts} attempts remaining.`
    };
  }

  // Fallback to in-memory (development only)
  if (process.env.NODE_ENV === 'development') {
    const now = Date.now();
    const data = memoryStore.get(identifier) || { attempts: 0, lockedUntil: null };

    // Check if locked
    if (data.lockedUntil && data.lockedUntil > now) {
      return {
        locked: true,
        attemptsRemaining: 0,
        lockedUntil: new Date(data.lockedUntil),
        message: `Account locked. Try again in ${Math.ceil((data.lockedUntil - now) / 60000)} minutes.`
      };
    }

    // Increment attempts
    data.attempts += 1;
    data.lastAttempt = now;

    // Check if should lock
    if (data.attempts >= LOCKOUT_CONFIG.MAX_ATTEMPTS) {
      data.lockedUntil = now + (LOCKOUT_CONFIG.LOCKOUT_DURATION * 1000);
      data.attempts = 0;
      memoryStore.set(identifier, data);

      return {
        locked: true,
        attemptsRemaining: 0,
        lockedUntil: new Date(data.lockedUntil),
        message: `Too many failed attempts. Account locked for ${LOCKOUT_CONFIG.LOCKOUT_DURATION / 60} minutes.`
      };
    }

    memoryStore.set(identifier, data);

    return {
      locked: false,
      attemptsRemaining: LOCKOUT_CONFIG.MAX_ATTEMPTS - data.attempts,
      message: `Authentication failed. ${LOCKOUT_CONFIG.MAX_ATTEMPTS - data.attempts} attempts remaining.`
    };
  }

  // No Redis in production - log warning
  console.warn('⚠️ Account lockout not available: Redis not configured');
  return { locked: false, attemptsRemaining: LOCKOUT_CONFIG.MAX_ATTEMPTS };
}

/**
 * Clear failed attempts on successful authentication
 *
 * @param {string} identifier - IP address or wallet address
 * @param {string} type - Type of identifier ('ip' or 'wallet')
 */
export async function clearFailedAttempts(identifier, type = 'ip') {
  const attemptKey = getAttemptKey(identifier, type);

  if (redis) {
    await redis.del(attemptKey);
  } else if (process.env.NODE_ENV === 'development') {
    memoryStore.delete(identifier);
  }
}

/**
 * Check if account is currently locked
 *
 * @param {string} identifier - IP address or wallet address
 * @param {string} type - Type of identifier ('ip' or 'wallet')
 * @returns {Promise<Object>} { locked: boolean, lockedUntil?: Date }
 */
export async function isLocked(identifier, type = 'ip') {
  const lockoutKey = getLockoutKey(identifier, type);

  if (redis) {
    const locked = await redis.get(lockoutKey);
    if (locked) {
      const ttl = await redis.ttl(lockoutKey);
      return {
        locked: true,
        lockedUntil: new Date(Date.now() + ttl * 1000),
        message: `Account locked. Try again in ${Math.ceil(ttl / 60)} minutes.`
      };
    }
    return { locked: false };
  }

  if (process.env.NODE_ENV === 'development') {
    const data = memoryStore.get(identifier);
    if (data?.lockedUntil && data.lockedUntil > Date.now()) {
      return {
        locked: true,
        lockedUntil: new Date(data.lockedUntil),
        message: `Account locked. Try again in ${Math.ceil((data.lockedUntil - Date.now()) / 60000)} minutes.`
      };
    }
    return { locked: false };
  }

  return { locked: false };
}

/**
 * Manually unlock an account (admin function)
 *
 * @param {string} identifier - IP address or wallet address
 * @param {string} type - Type of identifier ('ip' or 'wallet')
 */
export async function unlockAccount(identifier, type = 'ip') {
  const lockoutKey = getLockoutKey(identifier, type);
  const attemptKey = getAttemptKey(identifier, type);

  if (redis) {
    await redis.del(lockoutKey);
    await redis.del(attemptKey);
    console.log(`🔓 Account unlocked: ${type}=${identifier}`);
  } else if (process.env.NODE_ENV === 'development') {
    memoryStore.delete(identifier);
  }
}

/**
 * Calculate progressive delay based on attempt number
 * Implements exponential backoff
 *
 * @param {number} attemptNumber - Current attempt number
 * @returns {number} Delay in milliseconds
 */
export function getProgressiveDelay(attemptNumber) {
  if (!LOCKOUT_CONFIG.PROGRESSIVE_DELAY) {
    return 0;
  }

  // Exponential backoff: 2^(attempts-1) seconds, max 30 seconds
  const delaySeconds = Math.min(Math.pow(2, attemptNumber - 1), 30);
  return delaySeconds * 1000;
}
