import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silence turbopack root-detection warning when multiple lockfiles exist
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
