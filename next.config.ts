import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  serverExternalPackages: [
    "@0gfoundation/0g-storage-ts-sdk",
    "@0gfoundation/0g-compute-ts-sdk",
  ],
};

export default nextConfig;
