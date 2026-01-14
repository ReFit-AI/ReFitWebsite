/**
 * CSRF Protection for Next.js API Routes
 * Implements Origin/Referer verification for state-changing operations
 */

/**
 * Verify request origin to prevent CSRF attacks
 *
 * @param {Request} request - Next.js request object
 * @param {Object} options - Configuration options
 * @returns {Object} { valid: boolean, error?: string }
 */
export function verifyOrigin(request, options = {}) {
  const {
    allowedOrigins = [],
    strictMode = false // In strict mode, require origin for all methods
  } = options;

  // Get request method
  const method = request.method?.toUpperCase();

  // Only check state-changing methods by default (unless strictMode)
  const statefulMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (!strictMode && !statefulMethods.includes(method)) {
    return { valid: true };
  }

  // Get origin and referer headers
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');

  // Build allowed origins list
  const allowed = [
    ...allowedOrigins,
    process.env.NEXT_PUBLIC_APP_URL,
    `https://${host}`,
    `http://${host}`,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002'
  ].filter(Boolean);

  // Check origin header first (most reliable)
  if (origin) {
    const isAllowed = allowed.some(allowedOrigin => {
      // Exact match
      if (origin === allowedOrigin) return true;
      // Allow subdomains if wildcard
      if (allowedOrigin.includes('*')) {
        const pattern = allowedOrigin.replace('*', '.*');
        return new RegExp(pattern).test(origin);
      }
      return false;
    });

    if (!isAllowed) {
      console.warn('CSRF: Origin not allowed:', origin);
      return {
        valid: false,
        error: 'Invalid origin'
      };
    }

    return { valid: true };
  }

  // Fallback to referer header
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`;

      const isAllowed = allowed.some(allowedOrigin =>
        refererOrigin === allowedOrigin ||
        refererOrigin.startsWith(allowedOrigin)
      );

      if (!isAllowed) {
        console.warn('CSRF: Referer not allowed:', refererOrigin);
        return {
          valid: false,
          error: 'Invalid referer'
        };
      }

      return { valid: true };
    } catch (error) {
      console.error('CSRF: Invalid referer URL:', referer);
      return {
        valid: false,
        error: 'Invalid referer format'
      };
    }
  }

  // Mobile apps and API clients may not send origin/referer
  // Allow if:
  // 1. Request has Authorization header (API token)
  // 2. Request is from localhost (development)
  // 3. Request has X-Requested-With header (AJAX)
  const hasAuth = request.headers.get('authorization');
  const isLocalhost = host?.includes('localhost');
  const isAjax = request.headers.get('x-requested-with') === 'XMLHttpRequest';

  if (hasAuth || isLocalhost || isAjax) {
    return { valid: true };
  }

  // No origin/referer and no exemptions - potentially suspicious
  console.warn('CSRF: No origin/referer header and no authorization');

  // In development, allow it with warning
  if (process.env.NODE_ENV === 'development') {
    console.warn('CSRF: Allowing request in development mode');
    return { valid: true };
  }

  return {
    valid: false,
    error: 'Missing origin verification headers'
  };
}

/**
 * Middleware wrapper for CSRF protection
 * Use this in API routes that need CSRF protection
 *
 * @param {Request} request - Next.js request object
 * @param {Object} options - Configuration options
 * @returns {Response|null} - Returns error response if invalid, null if valid
 */
export function requireValidOrigin(request, options = {}) {
  const result = verifyOrigin(request, options);

  if (!result.valid) {
    return new Response(
      JSON.stringify({
        success: false,
        error: result.error || 'CSRF validation failed'
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  return null; // Valid - continue processing
}

/**
 * Generate CSRF token (for browser-based forms)
 * Only needed if you have browser forms that aren't using fetch
 *
 * @param {string} secret - Server-side secret
 * @param {string} sessionId - User session identifier
 * @returns {string} CSRF token
 */
export function generateCSRFToken(secret, sessionId) {
  const crypto = require('crypto');
  const timestamp = Date.now();
  const data = `${sessionId}:${timestamp}`;

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(data);
  const signature = hmac.digest('hex');

  return `${data}:${signature}`;
}

/**
 * Verify CSRF token
 *
 * @param {string} token - Token to verify
 * @param {string} secret - Server-side secret
 * @param {string} sessionId - User session identifier
 * @param {number} maxAge - Maximum token age in milliseconds (default: 1 hour)
 * @returns {boolean} True if valid
 */
export function verifyCSRFToken(token, secret, sessionId, maxAge = 3600000) {
  const crypto = require('crypto');

  try {
    const [providedSessionId, timestamp, providedSignature] = token.split(':');

    // Verify session matches
    if (providedSessionId !== sessionId) {
      return false;
    }

    // Verify not expired
    const age = Date.now() - parseInt(timestamp);
    if (age > maxAge) {
      return false;
    }

    // Verify signature
    const data = `${providedSessionId}:${timestamp}`;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(data);
    const expectedSignature = hmac.digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(providedSignature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('CSRF token verification error:', error);
    return false;
  }
}
