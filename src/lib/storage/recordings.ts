import { GetObjectCommand, HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "./s3";

const BUCKET = process.env.S3_BUCKET_RECORDINGS ?? "speaking-recordings";

/** Upload a speaking recording. Returns the error instead of throwing. */
export async function uploadRecording(
  path: string,
  body: ArrayBuffer,
  contentType: string
): Promise<{ error: Error | null }> {
  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: path,
        Body: new Uint8Array(body),
        ContentType: contentType,
      })
    );
    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }
}

/**
 * Whether a recording still exists. Recordings expire after 30 days via the
 * bucket's lifecycle rule, so a miss here is expected, not a failure.
 */
export async function recordingExists(path: string): Promise<boolean> {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: path }));
    return true;
  } catch {
    return false;
  }
}

/** Create a short-lived signed URL for a recording. */
export function recordingSignedUrl(path: string, expiresInSeconds: number): Promise<string> {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: path }), {
    expiresIn: expiresInSeconds,
  });
}
