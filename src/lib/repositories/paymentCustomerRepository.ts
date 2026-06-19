import type { PostgrestError } from "@supabase/supabase-js";
import type { DbClient } from "./client";

const TABLE = "payment_customers";

/** All payment_customers table access (provider-side customer ids per user). */
export class PaymentCustomerRepository {
  constructor(private readonly db: DbClient) {}

  /** Every provider customer id on file for a user. */
  async listByUserId(userId: string): Promise<{ provider: string; customer_id: string }[]> {
    const { data } = await this.db
      .from(TABLE)
      .select("provider, customer_id")
      .eq("user_id", userId);
    return data ?? [];
  }

  /** The customer id for a user at a specific provider, or null. */
  async findByUserAndProvider(
    userId: string,
    provider: string
  ): Promise<{ customer_id: string } | null> {
    const { data } = await this.db
      .from(TABLE)
      .select("customer_id")
      .eq("user_id", userId)
      .eq("provider", provider)
      .single();
    return data;
  }

  /** Persist a newly created provider customer id. */
  async create(row: {
    user_id: string;
    provider: string;
    customer_id: string;
  }): Promise<{ error: PostgrestError | null }> {
    const { error } = await this.db.from(TABLE).insert(row);
    return { error };
  }
}
