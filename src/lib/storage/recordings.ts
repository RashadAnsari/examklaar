import {
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
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

/**
 * Delete every recording belonging to a user and return how many were removed.
 *
 * Keys are laid out as <userId>/<examId>/<attemptId>/<questionId>.webm by the
 * submit route, so the user id prefix selects exactly one user's objects. The
 * bucket lifecycle rule only expires recordings after 30 days and object
 * storage takes no part in the database cascade, so erasing an account has to
 * remove them explicitly. Throws if the provider reports a failed delete.
 */
export async function deleteUserRecordings(userId: string): Promise<number> {
  let continuationToken: string | undefined;
  let deleted = 0;

  do {
    const listed = await s3.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: `${userId}/`,
        ContinuationToken: continuationToken,
      })
    );

    // A page holds at most 1000 keys, which is also the DeleteObjects limit.
    const objects = (listed.Contents ?? [])
      .map((object) => object.Key)
      .filter((key): key is string => key !== undefined)
      .map((Key) => ({ Key }));

    if (objects.length > 0) {
      const result = await s3.send(
        new DeleteObjectsCommand({ Bucket: BUCKET, Delete: { Objects: objects, Quiet: true } })
      );
      const failed = result.Errors ?? [];
      if (failed.length > 0) {
        throw new Error(
          `Failed to delete ${failed.length} recording(s), first: ${failed[0].Key} ${failed[0].Message}`
        );
      }
      deleted += objects.length;
    }

    continuationToken = listed.NextContinuationToken;
  } while (continuationToken);

  return deleted;
}

/** Create a short-lived signed URL for a recording. */
export function recordingSignedUrl(path: string, expiresInSeconds: number): Promise<string> {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: path }), {
    expiresIn: expiresInSeconds,
  });
}
