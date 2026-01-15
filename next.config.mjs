/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  // Optimize for production
  reactStrictMode: true,
  swcMinify: true,
  // Enable compression
  compress: true,
};

export default nextConfig;