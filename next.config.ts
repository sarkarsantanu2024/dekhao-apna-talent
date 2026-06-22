import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow our own bundled SVG placeholders to be served via next/image.
    // Safe here: these are first-party static files, not user uploads.
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "loremflickr.com" },
    ],
  },
};

export default nextConfig;
