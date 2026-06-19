import type { NextConfig } from "next";

const csp = [
  "font-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "default-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "frame-src https://*.paddle.com",
  "style-src 'self' 'unsafe-inline'",
  "media-src 'self' blob: https://*.supabase.co",
  "img-src 'self' data: blob: https://*.supabase.co https://www.google-analytics.com https://*.google-analytics.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.paddle.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""} https://cdn.paddle.com https://www.googletagmanager.com`,
].join("; ");

const nextConfig: NextConfig = {
  // Allow a dev tunnel (e.g. ngrok/cloudflared) to reach the dev server, so the
  // site is reachable through the tunnel's public URL (for testing Paddle
  // webhooks, viewing on another device, sharing, etc.). Set DEV_TUNNEL_HOST to
  // the tunnel host (no protocol, e.g. "abc123.trycloudflare.com").
  ...(process.env.DEV_TUNNEL_HOST ? { allowedDevOrigins: [process.env.DEV_TUNNEL_HOST] } : {}),
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
    ANALYTICS_GA_MEASUREMENT_ID: process.env.ANALYTICS_GA_MEASUREMENT_ID ?? "",
  },
};

export default nextConfig;
