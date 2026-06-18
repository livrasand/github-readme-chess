import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow SVGs from the API routes
  images: {
    localPatterns: [
      {
        pathname: "/api/chessboard",
        search: "*",
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  // Ensure API routes can return raw SVG content
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
