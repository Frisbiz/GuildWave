import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Export a static site so Tauri can bundle from the out/ folder
  output: "export",
  images: {
    // Disable the image optimizer so export works without a server
    unoptimized: true,
  },
};

export default nextConfig;
