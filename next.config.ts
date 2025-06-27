import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' http://localhost:* https://localhost:*",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
