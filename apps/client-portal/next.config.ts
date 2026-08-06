import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@doubleday/database', '@doubleday/auth'],
};

export default nextConfig;
