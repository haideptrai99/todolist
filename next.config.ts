import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/todos/:path*',
        destination: 'http://localhost:8000/todos/:path*',
      },
      {
        source: '/api/todos',
        destination: 'http://localhost:8000/todos',
      },
    ];
  },
};

export default nextConfig;
