import type { NextConfig } from "next";

const supabaseUrl = (process.env.SUPABASE_PUBLIC_URL ?? "").replace(/\/$/, "");
const supabaseWss = supabaseUrl.replace(/^https?:\/\//, "wss://");

const csp = [
  "default-src 'self'",
  // Next.js requires 'unsafe-inline' for hydration scripts unless nonces are used
  `script-src 'self' 'unsafe-inline' https://cdn.paddle.com https://cloud.umami.is`,
  "style-src 'self' 'unsafe-inline'",
  // Supabase Storage serves exam assets; blob: for client-side audio recording
  `img-src 'self' data: blob: ${supabaseUrl}`,
  "font-src 'self'",
  // Supabase REST + Realtime (WSS), Paddle checkout API, Umami event ping
  `connect-src 'self' ${supabaseUrl} ${supabaseWss} https://*.paddle.com https://cloud.umami.is`,
  // Paddle checkout overlay iframe — exact subdomain varies by environment, wildcard covers all
  "frame-src https://*.paddle.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // blob: needed for recording playback in the speaking exam
  "media-src 'self' blob:",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(self)" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
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
