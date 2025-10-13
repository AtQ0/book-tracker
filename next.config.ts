import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Allow Image-element to load images from external host
  images: { domains: ["picsum.photos"] },
};

export default nextConfig;
