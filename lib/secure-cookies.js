/**
 * Secure Cookie Management
 * Server-side only - HTTP-only cookies for sensitive data
 */

import { cookies } from 'next/headers';

/**
 * Cookie configuration for production security
 */
const COOKIE_CONFIG = {
  httpOnly: true,      // Can't be accessed via JavaScript
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'lax',     // CSRF protection (lax allows navigation)
  path: '/',
  maxAge: 30 * 24 * 60 * 60, // 30 days
};

/**
 * Set a secure cookie (server-side only)
 *
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {Object} options - Additional cookie options
 */
export async function setSecureCookie(name, value, options = {}) {
  try {
    const cookieStore = await cookies();
    cookieStore.set(name, value, {
      ...COOKIE_CONFIG,
      ...options
    });
    return { success: true };
  } catch (error) {
    console.error('Error setting cookie:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get a secure cookie (server-side only)
 *
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null
 */
export async function getSecureCookie(name) {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(name);
    return cookie?.value || null;
  } catch (error) {
    console.error('Error getting cookie:', error);
    return null;
  }
}

/**
 * Delete a secure cookie (server-side only)
 *
 * @param {string} name - Cookie name
 */
export async function deleteSecureCookie(name) {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(name);
    return { success: true };
  } catch (error) {
    console.error('Error deleting cookie:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Set wallet session cookie
 *
 * @param {string} walletAddress - Solana wallet address
 */
export async function setWalletSession(walletAddress) {
  return await setSecureCookie('wallet_session', walletAddress, {
    maxAge: 7 * 24 * 60 * 60, // 7 days for wallet sessions
  });
}

/**
 * Get wallet session from cookie
 *
 * @returns {string|null} Wallet address or null
 */
export async function getWalletSession() {
  return await getSecureCookie('wallet_session');
}

/**
 * Clear wallet session
 */
export async function clearWalletSession() {
  return await deleteSecureCookie('wallet_session');
}

/**
 * Set user preferences (non-sensitive, can be regular cookie)
 *
 * @param {Object} preferences - User preferences object
 */
export async function setUserPreferences(preferences) {
  return await setSecureCookie('user_preferences', JSON.stringify(preferences), {
    httpOnly: false, // Allow client-side access for preferences
    maxAge: 365 * 24 * 60 * 60, // 1 year
  });
}

/**
 * Get user preferences
 *
 * @returns {Object|null} Preferences object or null
 */
export async function getUserPreferences() {
  try {
    const prefs = await getSecureCookie('user_preferences');
    return prefs ? JSON.parse(prefs) : null;
  } catch (error) {
    console.error('Error parsing preferences:', error);
    return null;
  }
}
