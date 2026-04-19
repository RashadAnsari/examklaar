import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tie the build ID to the git SHA so Next.js can detect stale clients after a
  // redeploy and trigger a full page reload instead of failing on mismatched
  // Server Action IDs.
  generateBuildId: async () => process.env.GIT_SHA ?? "development",
  // Keep native addons out of the webpack bundle so Node can require them at runtime.
  serverExternalPackages: ["@xenova/transformers", "onnxruntime-node", "sharp"],
  // Expose public vars to the client bundle (replaces the NEXT_PUBLIC_ convention).
  env: {
    SUPABASE_PUBLIC_URL: process.env.SUPABASE_PUBLIC_URL ?? "",
    SUPABASE_PUBLISHABLE_DEFAULT_KEY: process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY ?? "",
  },
};

export default nextConfig;
