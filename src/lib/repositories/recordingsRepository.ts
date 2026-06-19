import type { DbClient } from "./client";

const BUCKET = "speaking-recordings";

/** All access to the speaking-recordings storage bucket. */
export class RecordingsRepository {
  constructor(private readonly db: DbClient) {}

  /** Upload an audio recording. */
  async upload(path: string, body: ArrayBuffer, contentType: string) {
    return this.db.storage.from(BUCKET).upload(path, body, { contentType });
  }

  /** Find a file by name within a directory (used to check it still exists). */
  async findInDir(dir: string, filename: string) {
    const { data } = await this.db.storage.from(BUCKET).list(dir, { search: filename });
    return data ?? [];
  }

  /** Create a short-lived signed URL for a recording. */
  async createSignedUrl(path: string, expiresInSeconds: number) {
    return this.db.storage.from(BUCKET).createSignedUrl(path, expiresInSeconds);
  }
}
