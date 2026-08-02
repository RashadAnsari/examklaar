import { S3Client } from "@aws-sdk/client-s3";

// No "server-only" guard here: scripts/delete-user.ts reaches this module
// through @/lib/storage/recordings under plain bun, where that package throws.

/**
 * S3-compatible object storage. forcePathStyle keeps the client working with
 * providers that do not support virtual-hosted bucket subdomains (MinIO and
 * most self-hosted gateways).
 */
export const s3 = new S3Client({
  region: process.env.S3_REGION ?? "auto",
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
  },
});
