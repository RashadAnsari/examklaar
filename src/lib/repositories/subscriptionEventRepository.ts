import type { PostgrestError } from "@supabase/supabase-js";
import type { DbClient } from "./client";

const TABLE = "subscription_events";

/** A single append-only entry in the subscription history. */
export interface SubscriptionEvent {
  user_id: string;
  event_type: string;
  plan_id?: string | null;
  status?: string | null;
  payment_provider?: string | null;
  provider_customer_id?: string | null;
  provider_subscription_id?: string | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean | null;
  raw_event?: unknown;
  occurred_at?: string;
}

/** Append-only log of subscription state changes (see Option A history). */
export class SubscriptionEventRepository {
  constructor(private readonly db: DbClient) {}

  /** Record one history entry. Never throws; logging must not break the write path. */
  async record(event: SubscriptionEvent): Promise<{ error: PostgrestError | null }> {
    const { error } = await this.db.from(TABLE).insert(event);
    if (error) {
      console.error(
        "[subscription_events] Failed to record event_type=%s user=%s error=%o",
        event.event_type,
        event.user_id,
        error
      );
    }
    return { error };
  }
}
