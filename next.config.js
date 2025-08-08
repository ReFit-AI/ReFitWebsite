/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        path: false,
        stream: false,
      };
    }
    return config;
  },
  images: {
    domains: [
      'localhost',
      'kxtuwewckwqpveaupkwv.supabase.co',
      'shoprefit.com',
      'www.shoprefit.com'
    ],
  },
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    
    // Development CSP - more permissive
    const devCSP = [
      "default-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https: wss:",
      "font-src 'self' data:",
      "frame-src 'self'",
      "media-src 'self'"
    ].join('; ');
    
    // Production CSP - strict
    const prodCSP = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'", // Remove unsafe-eval in prod, keep unsafe-inline for Next.js
      "style-src 'self' 'unsafe-inline'", // Required for styled-jsx
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https: wss:",
      "font-src 'self' data:",
      "frame-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "media-src 'self'",
      "object-src 'none'"
    ].join('; ');
    
    const cspHeader = isDev ? devCSP : prodCSP;
    
    // Allowed origins for CORS
    const allowedOrigins = isDev 
      ? ['http://localhost:3000', 'http://localhost:3001']
      : ['https://shoprefit.com', 'https://www.shoprefit.com'];
    
    return [
      {
        source: '/:path*',
        headers: [
          // Security headers
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          { key: 'Content-Security-Policy', value: cspHeader },
          { key: 'X-DNS-Prefetch-Control', value: 'off' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
          // HSTS - only in production
          ...(isDev ? [] : [
            { 
              key: 'Strict-Transport-Security', 
              value: 'max-age=31536000; includeSubDomains; preload' 
            }
          ]),
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          // CORS headers for API routes
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { 
            key: 'Access-Control-Allow-Origin', 
            value: allowedOrigins[0] // Use first allowed origin, handle multiple via Vary header
          },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' },
          { 
            key: 'Access-Control-Allow-Headers', 
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
          },
          { key: 'Access-Control-Max-Age', value: '86400' },
          // Important: Vary header for proper caching with CORS
          { key: 'Vary', value: 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers' },
        ],
      },
    ];
  },
  // Handle OPTIONS preflight requests
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          has: [
            {
              type: 'header',
              key: 'access-control-request-method',
            },
          ],
          destination: '/api/preflight',
        },
      ],
    };
  },
}

module.exports = nextConfig;