import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: '/grand-arbiter',
  assetPrefix: '/grand-arbiter',
  images: {
    unoptimized: true
  }
};

export default nextConfig;
