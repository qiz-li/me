import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The one Tailwind stylesheet is a second hop on the critical path: the
  // browser can't discover it until the HTML is parsed, so it blocks first
  // paint for ~140ms on a cold cache. It's small and atomic, so ship it in a
  // <style> tag with the HTML rather than as a <link>. Production only — dev
  // still links. Costs repeat visitors the bytes on every document; worth it
  // for a single-route site with no cross-page cache to give up.
  experimental: {
    inlineCss: true,
  },
  // A stray lockfile in the home directory makes Next.js infer the wrong
  // workspace root without this.
  turbopack: {
    root: __dirname,
  },
  images: {
    // AVIF first for browsers that support it (~30% smaller than WebP for
    // these photos), WebP as the fallback. Both variants cache immutably.
    formats: ["image/avif", "image/webp"],
    // Photos render at ≤440 CSS px, so the 2x variants browsers fetch are
    // downscaled on screen and q=60 is visually identical to q=75 there.
    // 75 stays allowed so cached HTML with q=75 URLs keeps resolving.
    qualities: [60, 75],
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
