/**
 * JWT Authentication Utilities
 * Secure token generation and verification for session management
 */

import jwt from 'jsonwebtoken';

// Get JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET;

// Token expiry times
const ACCESS_TOKEN_EXPIRY = '1h'; // Short-lived access token
const REFRESH_TOKEN_EXPIRY = '7d'; // Longer-lived refresh token

/**
 * Generate a JWT access token
 * @param {Object} payload - Data to encode in the token
 * @param {Object} options - Additional JWT options
 * @returns {string} Signed JWT token
 */
export function generateAccessToken(payload, options = {}) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    {
      ...payload,
      type: 'access',
      iat: Math.floor(Date.now() / 1000),
    },
    JWT_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRY,
      issuer: 'refit',
      audience: 'refit-api',
      ...options,
    }
  );
}

/**
 * Generate a JWT refresh token
 * @param {Object} payload - Data to encode in the token
 * @param {Object} options - Additional JWT options
 * @returns {string} Signed JWT refresh token
 */
export function generateRefreshToken(payload, options = {}) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    {
      ...payload,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
    },
    JWT_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRY,
      issuer: 'refit',
      audience: 'refit-api',
      ...options,
    }
  );
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @param {Object} options - Verification options
 * @returns {Object} Decoded token payload
 */
export function verifyToken(token, options = {}) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'refit',
      audience: 'refit-api',
      ...options,
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
}

/**
 * Decode a JWT token without verification (for debugging)
 * WARNING: Only use for debugging, not for authentication
 * @param {string} token - JWT token to decode
 * @returns {Object|null} Decoded token payload or null
 */
export function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch {
    return null;
  }
}

/**
 * Generate a session token pair (access + refresh)
 * @param {Object} userData - User data to encode
 * @returns {Object} Token pair
 */
export function generateTokenPair(userData) {
  const payload = {
    wallet_address: userData.wallet_address,
    profile_id: userData.profile_id,
    role: userData.role || 'user',
  };

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
    expiresIn: 3600, // 1 hour in seconds
  };
}

/**
 * Refresh an access token using a refresh token
 * @param {string} refreshToken - Valid refresh token
 * @returns {Object} New token pair
 */
export function refreshAccessToken(refreshToken) {
  const decoded = verifyToken(refreshToken);
  
  if (decoded.type !== 'refresh') {
    throw new Error('Invalid token type for refresh');
  }

  // Generate new token pair with same user data
  return generateTokenPair({
    wallet_address: decoded.wallet_address,
    profile_id: decoded.profile_id,
    role: decoded.role,
  });
}

/**
 * Extract bearer token from authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Token or null
 */
export function extractBearerToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Middleware to verify JWT in request
 * @param {Request} request - Next.js request object
 * @returns {Object} Verification result
 */
export function verifyRequestToken(request) {
  const authHeader = request.headers.get('authorization');
  const token = extractBearerToken(authHeader);

  if (!token) {
    return {
      authenticated: false,
      error: 'Missing authorization token',
    };
  }

  try {
    const decoded = verifyToken(token);
    
    if (decoded.type !== 'access') {
      return {
        authenticated: false,
        error: 'Invalid token type',
      };
    }

    return {
      authenticated: true,
      user: {
        wallet_address: decoded.wallet_address,
        profile_id: decoded.profile_id,
        role: decoded.role,
      },
    };
  } catch (error) {
    return {
      authenticated: false,
      error: error.message,
    };
  }
}