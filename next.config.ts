import type { NextConfig } from "next";

/** Scheme and host of a URL, or empty when it is unset or malformed. */
function origin(url: string | undefined): string {
  if (!url) {
    return "";
  }
  try {
    return new URL(url).origin;
  } catch {
    return "";
  }
}

// Storage origins the browser loads media from, derived rather than configured
// separately. Exam images, audio, and video come from the public exam-assets
// bucket; signed speaking-recording URLs come from the S3 endpoint itself.
// The two can be different hosts when exam assets sit behind a CDN.
const assetsOrigin = origin(process.env.EXAM_ASSETS_BASE_URL);
const recordingsOrigin = origin(process.env.S3_ENDPOINT);
const mediaOrigins = [...new Set([assetsOrigin, recordingsOrigin])].filter(Boolean).join(" ");

const media = mediaOrigins ? ` ${mediaOrigins}` : "";
const images = assetsOrigin ? ` ${assetsOrigin}` : "";

const csp = [
  "font-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "default-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "frame-src https://*.paddle.com",
  "style-src 'self' 'unsafe-inline'",
  `media-src 'self' blob:${media}`,
  `img-src 'self' data: blob:${images} https://www.google-analytics.com https://*.google-analytics.com`,
  // blob: is required by connect-src, not just media-src: submitting a speaking
  // exam reads each recording back out of its object URL with fetch() to build
  // the upload body (see submitExam in ExamClient).
  "connect-src 'self' blob: https://*.paddle.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""} https://cdn.paddle.com https://www.googletagmanager.com`,
].join("; ");

const nextConfig: NextConfig = {
  // Ship only the files the server needs (see Dockerfile). Files loaded by paths the tracer cannot
  // follow are included explicitly: the exam JSON, and the ONNX runtime library that Whisper's
  // native binding loads for the build's platform.
  output: "standalone",
  outputFileTracingIncludes: {
    "/**": ["./src/data/exams/**/*.json"],
    "/api/recordings/transcribe": [
      `./node_modules/onnxruntime-node/bin/napi-v3/${process.platform}/${process.arch}/**`,
    ],
  },
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
  serverExternalPackages: ["@xenova/transformers", "onnxruntime-node", "sharp", "pg"],
  // Expose public vars to the client bundle (replaces the NEXT_PUBLIC_ convention).
  env: {
    ANALYTICS_GA_MEASUREMENT_ID: process.env.ANALYTICS_GA_MEASUREMENT_ID ?? "",
  },
};

export default nextConfig;
