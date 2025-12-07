/**
 * Robots.txt generator
 * @file src/app/robots.js
 * @returns {Object} Robots configuration
 */
export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3300';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/',
        '/account/',
        '/checkout/',
        '/cart/',
        '/order-tracking/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

