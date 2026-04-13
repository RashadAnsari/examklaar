import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @xenova/transformers runs server-side only (Node.js) — keep it out of the browser bundle
  serverExternalPackages: ["@xenova/transformers", "onnxruntime-node"],
};

export default nextConfig;
