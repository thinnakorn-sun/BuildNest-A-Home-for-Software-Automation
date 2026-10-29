import type { NextConfig } from 'next';
const nextConfig: NextConfig = { reactStrictMode: true, transpilePackages: ['@buildnest/contracts'] };
export default nextConfig;
