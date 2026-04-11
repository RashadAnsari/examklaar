import { createAdminClient } from "@/utils/supabase/admin";

export type PlanId = "free" | "premium" | "biannual";
export type SubscriptionStatus = "active" | "cancelled" | "past_due" | "expired";

export interface UserSubscription {
  planId: PlanId;
  status: SubscriptionStatus | null; // null = free (no row in subscriptions table)
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  providerSubscriptionId: string | null;
  providerCustomerId: string | null;
  paymentProvider: string | null;
}

const FREE_SUBSCRIPTION: UserSubscription = {
  planId: "free",
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
    return FREE_SUBSCRIPTION;
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

export function isPaidPlan(planId: PlanId): boolean {
  return planId === "premium" || planId === "biannual";
}

/**
 * Returns true when the user should be allowed to access premium content.
 *
 * - active subscription → allow
 * - cancelled but still within the paid period → allow (user paid through the end)
 * - past_due → allow (provider is still retrying payment; revoke only on expired)
 * - expired / free → deny
 */
export function canAccessPremium(sub: UserSubscription): boolean {
  if (!isPaidPlan(sub.planId)) {
    return false;
  }

  if (sub.status === "active" || sub.status === "past_due") {
    return true;
  }

  if (sub.status === "cancelled" && sub.currentPeriodEnd && sub.currentPeriodEnd > new Date()) {
    return true;
  }

  return false;
}
