import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray lockfile in the home directory makes Next.js infer the wrong
  // workspace root without this.
  turbopack: {
    root: __dirname,
  },
  images: {
    // AVIF first for browsers that support it (~30% smaller than WebP for
    // these photos), WebP as the fallback. Both variants cache immutably.
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        // Without this the host serves /public files with max-age=5, so the
        // CDN re-fetches the videos from origin for nearly every viewer.
        // Immutable is a promise: replacing a clip means renaming the file.
        source: "/:path(.*\\.mp4)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
