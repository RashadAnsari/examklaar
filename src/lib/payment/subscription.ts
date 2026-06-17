import { createAdminClient } from "@/utils/supabase/admin";

export type PlanId = "monthly";
export type SubscriptionStatus = "trialing" | "active" | "cancelled" | "past_due" | "expired";

/** Every plan the app currently offers. Add new plan ids here. */
export const PLAN_IDS: readonly PlanId[] = ["monthly"];
export const DEFAULT_PLAN_ID: PlanId = "monthly";

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === "string" && (PLAN_IDS as readonly string[]).includes(value);
}

export interface UserSubscription {
  planId: PlanId | null; // null = no subscription row (never subscribed)
  status: SubscriptionStatus | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  providerSubscriptionId: string | null;
  providerCustomerId: string | null;
  paymentProvider: string | null;
}

const NO_SUBSCRIPTION: UserSubscription = {
  planId: null,
  status: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  providerSubscriptionId: null,
  providerCustomerId: null,
  paymentProvider: null,
};

export async function getUserSubscription(userId: string): Promise<UserSubscription> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("subscriptions")
    .select(
      "plan_id, status, current_period_end, cancel_at_period_end, provider_subscription_id, provider_customer_id, payment_provider"
    )
    .eq("user_id", userId)
    .single();

  if (!data) {
    return NO_SUBSCRIPTION;
  }

  return {
    planId: data.plan_id as PlanId,
    status: data.status as SubscriptionStatus,
    currentPeriodEnd: new Date(data.current_period_end),
    cancelAtPeriodEnd: data.cancel_at_period_end,
    providerSubscriptionId: data.provider_subscription_id,
    providerCustomerId: data.provider_customer_id,
    paymentProvider: data.payment_provider,
  };
}

/**
 * Returns true when the user should be allowed to access exam content.
 *
 * - trialing → allow (within the 7-day free trial)
 * - active → allow
 * - past_due → allow (provider is still retrying payment; revoke only on expired)
 * - cancelled but still within the paid period → allow (user paid through the end)
 * - expired / no subscription → deny
 *
 * A trial cancelled immediately has current_period_end set to now, so it falls
 * through to denied here.
 */
export function hasAccess(sub: UserSubscription): boolean {
  if (sub.status === "active" || sub.status === "trialing" || sub.status === "past_due") {
    return true;
  }

  if (sub.status === "cancelled" && sub.currentPeriodEnd && sub.currentPeriodEnd > new Date()) {
    return true;
  }

  return false;
}
