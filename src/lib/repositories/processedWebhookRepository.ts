import type { DbClient } from "./client";

const TABLE = "processed_webhook_events";

/**
 * Idempotency guard for payment webhooks. The key is a hash of the raw,
 * signature-verified webhook body, so a provider retry or a replayed captured
 * request maps to the same key and is processed only once.
 */
export class ProcessedWebhookRepository {
  constructor(private readonly db: DbClient) {}

  /** True when this event key has already been processed. */
  async isProcessed(eventKey: string): Promise<boolean> {
    const { data } = await this.db
      .from(TABLE)
      .select("event_key")
      .eq("event_key", eventKey)
      .maybeSingle();
    return !!data;
  }

  /**
   * Mark an event key as processed. Idempotent: a duplicate key is ignored via
   * ON CONFLICT DO NOTHING, so this needs only INSERT (no UPDATE) privilege.
   * Never throws; a failure here must not fail an otherwise successful webhook.
   */
  async markProcessed(eventKey: string, eventType: string): Promise<void> {
    const { error } = await this.db
      .from(TABLE)
      .upsert(
        { event_key: eventKey, event_type: eventType },
        { onConflict: "event_key", ignoreDuplicates: true }
      );
    if (error) {
      console.error("[processed_webhook_events] Failed to record key error=%o", error);
    }
  }
}
