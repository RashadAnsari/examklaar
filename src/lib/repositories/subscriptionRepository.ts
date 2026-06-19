import type { PostgrestError } from "@supabase/supabase-js";
import type { DbClient } from "./client";

const TABLE = "subscriptions";

const COLUMNS =
  "plan_id, status, current_period_end, cancel_at_period_end, provider_subscription_id, provider_customer_id, payment_provider";

export interface SubscriptionRow {
  plan_id: string;
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  provider_subscription_id: string | null;
  provider_customer_id: string | null;
  payment_provider: string | null;
}

/** A subscription record to upsert (the full current snapshot for a user). */
export interface SubscriptionUpsert {
  user_id: string;
  plan_id: string;
  status: string;
  payment_provider: string | null;
  provider_customer_id: string | null;
  provider_subscription_id: string | null;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  updated_at: string;
}

/** All subscriptions table access. The table holds one row per user. */
export class SubscriptionRepository {
  constructor(private readonly db: DbClient) {}

  /** The user's current subscription row, or null if they never subscribed. */
  async findByUserId(userId: string): Promise<SubscriptionRow | null> {
    const { data } = await this.db.from(TABLE).select(COLUMNS).eq("user_id", userId).single();
    return (data as SubscriptionRow | null) ?? null;
  }

  /** Look up a subscription by its provider-side id (for webhook handling). */
  async findByProviderSubscriptionId(providerSubscriptionId: string) {
    const { data } = await this.db
      .from(TABLE)
      .select("user_id, status, payment_provider")
      .eq("provider_subscription_id", providerSubscriptionId)
      .single();
    return data;
  }

  /** Create or replace the user's current subscription snapshot. */
  async upsert(row: SubscriptionUpsert): Promise<{ error: PostgrestError | null }> {
    const { error } = await this.db.from(TABLE).upsert(row, { onConflict: "user_id" });
    return { error };
  }

  /**
   * Insert a subscription only if the user has none yet. Returns whether a row
   * was newly created (false when one already existed). Idempotent via the
   * unique index on user_id.
   */
  async insertIfAbsent(
    row: SubscriptionUpsert
  ): Promise<{ inserted: boolean; error: PostgrestError | null }> {
    const { data, error } = await this.db
      .from(TABLE)
      .upsert(row, { onConflict: "user_id", ignoreDuplicates: true })
      .select("id");
    return { inserted: !!data?.length, error };
  }

  /** Patch the user's subscription row. */
  async updateByUserId(
    userId: string,
    patch: Record<string, unknown>
  ): Promise<{ error: PostgrestError | null }> {
    const { error } = await this.db.from(TABLE).update(patch).eq("user_id", userId);
    return { error };
  }
}
