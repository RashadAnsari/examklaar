import { pool } from "@/lib/db";
import { SubscriptionRepository } from "@/lib/repositories/subscriptionRepository";
import { SubscriptionEventRepository } from "@/lib/repositories/subscriptionEventRepository";

export type PlanId = "monthly";
export type SubscriptionStatus = "trialing" | "active" | "cancelled" | "past_due" | "expired";

/** Every plan the app currently offers. Add new plan ids here. */
export const PLAN_IDS: readonly PlanId[] = ["monthly"];
export const DEFAULT_PLAN_ID: PlanId = "monthly";

/**
 * Months of free access granted to a new user while no payment provider is
 * configured (early-stage launch). See grantComplimentaryAccess.
 */
export const COMPLIMENTARY_ACCESS_MONTHS = 3;

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
  const repo = new SubscriptionRepository(pool);
  const data = await repo.findByUserId(userId);

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
 * Manually granted subscriptions (no payment provider, e.g. via
 * scripts/grant-subscription.ts) have no provider to update their status when
 * the period ends, so current_period_end is the sole authority: access lasts
 * only until that date.
 *
 * For provider-backed (Paddle) subscriptions we trust the status, which the
 * provider keeps in sync via webhooks:
 * - trialing → allow (within the 7-day free trial)
 * - active → allow
 * - past_due → allow (provider is still retrying payment; revoke only on expired)
 * - cancelled but still within the paid period → allow (user paid through the end)
 * - expired / no subscription → deny
 *
 * We intentionally do NOT enforce current_period_end for an active provider sub:
 * that would falsely deny access during the renewal window (period ended, renewal
 * webhook not yet processed). A trial cancelled immediately has current_period_end
 * set to now, so it falls through to denied here.
 */
export function hasPremiumAccess(sub: UserSubscription): boolean {
  if (sub.planId === null) {
    return false;
  }

  // Manually granted (no payment provider): the period end is the only authority.
  if (!sub.paymentProvider) {
    return !!sub.currentPeriodEnd && sub.currentPeriodEnd > new Date();
  }

  if (sub.status === "active" || sub.status === "trialing" || sub.status === "past_due") {
    return true;
  }

  if (sub.status === "cancelled" && sub.currentPeriodEnd && sub.currentPeriodEnd > new Date()) {
    return true;
  }

  return false;
}

/**
 * Whether the user is eligible for the free trial. Only users who have never
 * subscribed (no subscription row) get the trial; anyone who has subscribed or
 * trialed before is billed immediately on checkout.
 */
export function isTrialEligible(sub: UserSubscription): boolean {
  return sub.planId === null;
}

/**
 * While no payment provider is configured (early-stage launch), give a brand
 * new user COMPLIMENTARY_ACCESS_MONTHS of free access. Creates a provider-less
 * subscription row (the same shape grant-subscription.ts produces), so
 * hasPremiumAccess grants access purely on current_period_end.
 *
 * Idempotent: the unique index on subscriptions.user_id means a user who
 * already has a row keeps it and is not re-granted. Returns whether a row was
 * newly created, which the caller uses to show the welcome gift modal once.
 */
export async function grantComplimentaryAccess(userId: string): Promise<{ granted: boolean }> {
  // Only complimentary while there is no provider to bill through.
  if (process.env.PAYMENT_PROVIDER) {
    return { granted: false };
  }

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + COMPLIMENTARY_ACCESS_MONTHS);

  const { inserted, error } = await new SubscriptionRepository(pool).insertIfAbsent({
    user_id: userId,
    plan_id: DEFAULT_PLAN_ID,
    status: "active",
    payment_provider: null,
    provider_customer_id: null,
    provider_subscription_id: null,
    current_period_start: now.toISOString(),
    current_period_end: periodEnd.toISOString(),
    cancel_at_period_end: false,
    updated_at: now.toISOString(),
  });

  if (error) {
    console.error(
      "[subscription] Failed to grant complimentary access — user=%s error=%o",
      userId,
      error
    );
    return { granted: false };
  }

  // Record the grant in the append-only history (only when newly created).
  if (inserted) {
    await new SubscriptionEventRepository(pool).record({
      user_id: userId,
      event_type: "complimentary_grant",
      plan_id: DEFAULT_PLAN_ID,
      status: "active",
      payment_provider: null,
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      cancel_at_period_end: false,
      occurred_at: now.toISOString(),
    });
  }

  return { granted: inserted };
}
