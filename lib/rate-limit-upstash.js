/**
 * Distributed rate limiting using Upstash Redis
 * Production-ready rate limiting that works across multiple server instances
 */

import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Initialize Redis client
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Fall back to in-memory rate limiting for development
const inMemoryFallback = new Map();

/**
 * Get client IP address from request
 */
function getClientIp(request) {
  // Priority order for IP detection
  const headers = [
    'x-real-ip',
    'x-forwarded-for',
    'x-client-ip',
    'cf-connecting-ip', // Cloudflare
    'fastly-client-ip', // Fastly
    'true-client-ip', // Akamai
    'x-cluster-client-ip'
  ];
  
  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      // Handle comma-separated values (x-forwarded-for)
      return value.split(',')[0].trim();
    }
  }
  
  // Fallback to a default identifier
  return 'anonymous';
}

/**
 * Create a rate limiter with Upstash or fallback
 */
function createRateLimiter(config) {
  if (redis) {
    // Production: Use Upstash Redis
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(config.requests, config.window),
      analytics: true, // Enable analytics in Upstash dashboard
      prefix: `ratelimit:${config.prefix}`,
    });
  }
  
  // Development: Use in-memory fallback
  console.warn('Upstash Redis not configured, using in-memory rate limiting (development only)');
  
  return {
    async limit(identifier) {
      const now = Date.now();
      const key = `${config.prefix}:${identifier}`;
      const windowMs = config.window === '1m' ? 60000 : 
                       config.window === '15m' ? 900000 : 
                       config.window === '1h' ? 3600000 : 60000;
      
      let data = inMemoryFallback.get(key);
      
      if (!data || now - data.resetTime > windowMs) {
        data = {
          count: 1,
          resetTime: now + windowMs
        };
        inMemoryFallback.set(key, data);
        
        return {
          success: true,
          limit: config.requests,
          remaining: config.requests - 1,
          reset: new Date(data.resetTime)
        };
      }
      
      data.count++;
      
      if (data.count > config.requests) {
        return {
          success: false,
          limit: config.requests,
          remaining: 0,
          reset: new Date(data.resetTime)
        };
      }
      
      return {
        success: true,
        limit: config.requests,
        remaining: config.requests - data.count,
        reset: new Date(data.resetTime)
      };
    }
  };
}

// Pre-configured rate limiters
const limiters = {
  // Auth endpoints: 5 attempts per 15 minutes
  auth: createRateLimiter({
    requests: 5,
    window: '15m',
    prefix: 'auth'
  }),
  
  // Shipping endpoints: 20 requests per minute
  shipping: createRateLimiter({
    requests: 20,
    window: '1m',
    prefix: 'shipping'
  }),
  
  // Standard API: 60 requests per minute
  api: createRateLimiter({
    requests: 60,
    window: '1m',
    prefix: 'api'
  }),
  
  // Webhook endpoints: 100 requests per minute
  webhook: createRateLimiter({
    requests: 100,
    window: '1m',
    prefix: 'webhook'
  }),
  
  // Quote endpoints: 30 requests per minute
  quote: createRateLimiter({
    requests: 30,
    window: '1m',
    prefix: 'quote'
  })
};

/**
 * Rate limit middleware for API routes
 */
export async function rateLimit(request, type = 'api') {
  const limiter = limiters[type] || limiters.api;
  const identifier = getClientIp(request);
  
  // Add route path to identifier for more granular limiting
  const route = request.nextUrl.pathname;
  const fullIdentifier = `${identifier}:${route}`;
  
  const result = await limiter.limit(fullIdentifier);
  
  if (!result.success) {
    const retryAfter = Math.ceil((result.reset.getTime() - Date.now()) / 1000);
    
    return {
      success: false,
      message: 'Too many requests. Please try again later.',
      retryAfter,
      remaining: 0,
      headers: {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': result.reset.toISOString(),
        'Retry-After': retryAfter.toString()
      }
    };
  }
  
  return {
    success: true,
    remaining: result.remaining,
    headers: {
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': result.reset.toISOString()
    }
  };
}

/**
 * Rate limit specific endpoints with custom limits
 */
export const rateLimitEndpoint = {
  // Auth routes
  async auth(request) {
    return rateLimit(request, 'auth');
  },
  
  // Shipping routes
  async shipping(request) {
    return rateLimit(request, 'shipping');
  },
  
  // Quote routes
  async quote(request) {
    return rateLimit(request, 'quote');
  },
  
  // Webhook routes
  async webhook(request) {
    return rateLimit(request, 'webhook');
  },
  
  // Generic API routes
  async api(request) {
    return rateLimit(request, 'api');
  }
};

// Clean up in-memory cache periodically (development only)
if (!redis) {
  setInterval(() => {
    const now = Date.now();
    const maxAge = 3600000; // 1 hour
    
    for (const [key, data] of inMemoryFallback.entries()) {
      if (now - data.resetTime > maxAge) {
        inMemoryFallback.delete(key);
      }
    }
  }, 5 * 60 * 1000); // Every 5 minutes
}

export default rateLimitEndpoint;