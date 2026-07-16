import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray lockfile in the home directory makes Next.js infer the wrong
  // workspace root without this.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
