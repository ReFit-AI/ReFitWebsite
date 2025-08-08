/**
 * Dynamic CORS middleware for Next.js API routes
 * Handles multiple allowed origins securely
 */

// Allowed origins for CORS
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      'https://shoprefit.com',
      'https://www.shoprefit.com',
      'https://app.shoprefit.com',
      // Add any other production domains
    ]
  : [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ];

/**
 * Check if origin is allowed
 * @param {string} origin - Request origin
 * @returns {boolean}
 */
function isOriginAllowed(origin) {
  // Allow requests with no origin (e.g., mobile apps, Postman)
  // But be careful in production
  if (!origin) {
    return process.env.NODE_ENV === 'development';
  }
  
  return allowedOrigins.includes(origin);
}

/**
 * CORS middleware for API routes
 * @param {Request} request - Next.js request
 * @returns {Object} CORS headers
 */
export function getCorsHeaders(request) {
  const origin = request.headers.get('origin');
  const headers = new Headers();

  // Only set CORS headers if origin is allowed
  if (isOriginAllowed(origin)) {
    headers.set('Access-Control-Allow-Origin', origin || '*');
    headers.set('Access-Control-Allow-Credentials', 'true');
  }

  // Always set these headers
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  headers.set('Vary', 'Origin'); // Important for caching

  return headers;
}

/**
 * Handle preflight OPTIONS requests
 * @param {Request} request - Next.js request
 * @returns {Response}
 */
export function handlePreflight(request) {
  const headers = getCorsHeaders(request);
  
  return new Response(null, {
    status: 204,
    headers,
  });
}

/**
 * Apply CORS to a response
 * @param {Response} response - Response to add CORS headers to
 * @param {Request} request - Original request
 * @returns {Response}
 */
export function applyCors(response, request) {
  const corsHeaders = getCorsHeaders(request);
  
  // Copy existing headers
  const newHeaders = new Headers(response.headers);
  
  // Add CORS headers
  for (const [key, value] of corsHeaders.entries()) {
    newHeaders.set(key, value);
  }
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

/**
 * Middleware wrapper for API routes
 * @param {Function} handler - API route handler
 * @returns {Function} Wrapped handler with CORS
 */
export function withCors(handler) {
  return async (request, context) => {
    // Handle preflight
    if (request.method === 'OPTIONS') {
      return handlePreflight(request);
    }
    
    // Check origin
    const origin = request.headers.get('origin');
    if (origin && !isOriginAllowed(origin)) {
      return new Response('CORS origin not allowed', {
        status: 403,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }
    
    // Execute handler
    const response = await handler(request, context);
    
    // Apply CORS headers
    return applyCors(response, request);
  };
}