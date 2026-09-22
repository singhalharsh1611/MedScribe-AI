import type { NextConfig } from "next";

const backendOrigin = process.env.BACKEND_INTERNAL_URL || "http://localhost:3001";

const nextConfig: NextConfig = {
  // Keep Turbopack scoped to the frontend app. The repository has a separate
  // root lockfile, which otherwise makes Next infer the wrong workspace root.
  turbopack: {
    root: __dirname,
  },
  experimental: {
    cpus: 1,
    workerThreads: true,
  },
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${backendOrigin}/api/:path*` }];
  },
};

export default nextConfig;
