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
  // Allow cross-origin requests in development
  experimental: {
    allowedDevOrigins: ['192.168.1.200'],
  },
  // Configure src directory
  srcDir: 'src',
};

export default nextConfig;