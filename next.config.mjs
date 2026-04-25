/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Fix workspace root warning
  turbopack: {
    root: process.cwd(),
  },

  /**
   * Security Headers
   * Applied to all routes for enhanced security
   */
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
      {
        // Additional security for admin routes
        source: '/admin/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow'
          },
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate'
          },
          {
            key: 'Pragma',
            value: 'no-cache'
          },
          {
            key: 'Expires',
            value: '0'
          }
        ],
      },
      {
        // Additional security for dashboard routes
        source: '/dashboard/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow'
          },
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate'
          }
        ],
      },
      {
        // API routes security
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          }
        ],
      }
    ];
  },

  /**
   * Webpack optimization for code splitting
   * Separate admin code from user-facing code
   */
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Split chunks for better caching and smaller bundles
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Separate vendor libraries
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10,
            },
            // Separate admin components
            admin: {
              test: /[\\/]src[\\/](components|app)[\\/]admin[\\/]/,
              name: 'admin',
              priority: 20,
            },
            // Separate MUI components
            mui: {
              test: /[\\/]node_modules[\\/]@mui[\\/]/,
              name: 'mui',
              priority: 15,
            },
            // Common components
            common: {
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    return config;
  },

  /**
   * Experimental features for optimization
   */
  experimental: {
    // Optimize package imports
    optimizePackageImports: [
      '@mui/material',
      '@mui/x-charts',
      '@mui/x-data-grid',
      'lucide-react',
      'react-icons',
      'framer-motion'
    ],
  },

  /**
   * Production optimizations
   */
  productionBrowserSourceMaps: false, // Disable source maps in production for security
  poweredByHeader: false, // Remove X-Powered-By header
  compress: true, // Enable gzip compression

  /**
   * Environment variables validation
   */
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Bánh Tâm Cô Đào',
  },
};

export default nextConfig;