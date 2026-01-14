/**
 * Dead simple admin authentication
 * No external dependencies needed
 */

import { recordFailedAttempt, clearFailedAttempts, isLocked } from './account-lockout';

// Use environment variable or generate warning
const ADMIN_SECRET = process.env.ADMIN_SECRET || (() => {
  const fallback = 'CHANGE_THIS_SECRET_NOW_' + Math.random().toString(36);
  console.warn('⚠️ WARNING: Using random admin secret. Set ADMIN_SECRET in .env.local');
  return fallback;
})();

/**
 * Check if request has valid admin token
 */
export function isAdminRequest(request) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return false;
  }

  const token = authHeader.replace('Bearer ', '');
  return token === ADMIN_SECRET;
}

/**
 * Require admin authentication
 * Returns authorization status object
 * Includes account lockout protection against brute force
 */
export async function requireAdmin(request) {
  // Get IP address for lockout tracking
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
             request.headers.get('x-real-ip') ||
             'unknown';

  // Check if IP is locked out
  const lockStatus = await isLocked(ip, 'ip');
  if (lockStatus.locked) {
    console.warn(`🔒 Blocked admin request from locked IP: ${ip}`);
    return {
      authorized: false,
      error: lockStatus.message || 'Account temporarily locked due to failed login attempts',
      locked: true,
      lockedUntil: lockStatus.lockedUntil
    };
  }

  // Check authentication
  if (!isAdminRequest(request)) {
    // Record failed attempt
    const attemptResult = await recordFailedAttempt(ip, 'ip');
    console.warn(`❌ Failed admin auth from IP: ${ip} (${attemptResult.attemptsRemaining} attempts remaining)`);

    return {
      authorized: false,
      error: attemptResult.message || 'Unauthorized - Admin only',
      attemptsRemaining: attemptResult.attemptsRemaining,
      locked: attemptResult.locked,
      lockedUntil: attemptResult.lockedUntil
    };
  }

  // Successful authentication - clear any failed attempts
  await clearFailedAttempts(ip, 'ip');
  console.log(`✅ Admin authenticated from IP: ${ip}`);

  return { authorized: true };
}

/**
 * Helper for frontend admin panel
 * SECURITY NOTE: This should be replaced with proper session-based auth
 * For now, admin secret must be entered manually by admin user
 */
export function getAdminHeaders(adminSecret) {
  if (!adminSecret) {
    console.warn('⚠️ Admin secret required');
    return {};
  }

  return {
    'Authorization': `Bearer ${adminSecret}`
  };
}

/**
 * DEPRECATED: This function exposed secrets client-side
 * Admin tokens should be stored in HTTP-only cookies, not validated client-side
 */
export function validateAdminToken(token) {
  console.warn('⚠️ validateAdminToken is deprecated - implement server-side session validation');
  return false;
}