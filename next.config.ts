import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "*.insforge.app", pathname: "/**" },
      { protocol: "https", hostname: "cdn.insforge.dev", pathname: "/**" },
    ],
  },
};

export default nextConfig;
