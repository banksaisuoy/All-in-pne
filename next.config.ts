import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Next.js 15 has an issue when running ESLint using Flat Config from inside next build (next lint).
    // It passes `extensions` which was removed in ESLint 8.
    // Workaround is ignoring it during build.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
