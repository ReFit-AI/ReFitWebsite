/**
 * Simple in-memory rate limiter
 * For production, use Redis-based rate limiting
 */

const rateLimit = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimit.entries()) {
    if (now - data.resetTime > 60000) { // Remove entries older than 1 minute
      rateLimit.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Rate limit middleware
 * @param {Object} options - Rate limit options
 * @param {number} options.limit - Max requests per window
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {string} options.message - Error message when rate limited
 */
export function createRateLimit(options = {}) {
  const {
    limit = 10, // 10 requests
    windowMs = 60000, // per minute
    message = 'Too many requests, please try again later.'
  } = options;
  
  return async function rateLimitMiddleware(request) {
    // Get client identifier (IP address or 'anonymous')
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'anonymous';
    const key = `${request.nextUrl.pathname}:${ip}`;
    
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get or create rate limit data for this key
    let data = rateLimit.get(key);
    
    if (!data || data.resetTime < windowStart) {
      // New window
      data = {
        count: 1,
        resetTime: now + windowMs
      };
      rateLimit.set(key, data);
      return { success: true, remaining: limit - 1 };
    }
    
    // Increment counter
    data.count++;
    
    // Check if limit exceeded
    if (data.count > limit) {
      const retryAfter = Math.ceil((data.resetTime - now) / 1000);
      return {
        success: false,
        message,
        retryAfter,
        remaining: 0
      };
    }
    
    return {
      success: true,
      remaining: limit - data.count
    };
  };
}

// Pre-configured rate limiters for different use cases
export const rateLimiters = {
  // Strict: 5 requests per minute (for sensitive endpoints)
  strict: createRateLimit({ limit: 5, windowMs: 60000 }),
  
  // Standard: 20 requests per minute (for normal API endpoints)
  standard: createRateLimit({ limit: 20, windowMs: 60000 }),
  
  // Relaxed: 60 requests per minute (for public endpoints)
  relaxed: createRateLimit({ limit: 60, windowMs: 60000 }),
  
  // Auth: 3 attempts per 15 minutes (for login/signup)
  auth: createRateLimit({ 
    limit: 3, 
    windowMs: 15 * 60000,
    message: 'Too many authentication attempts. Please try again later.'
  }),
};