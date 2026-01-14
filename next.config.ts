import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
    // Safety Valve: If local dev is slow, allow unoptimized images to prevent timeouts
    unoptimized: process.env.NODE_ENV === 'development', 
  },
  // Increase connection timeout
  httpAgentOptions: {
    keepAlive: true,
  },
};

export default nextConfig;