/**
 * Plan definitions and the pure access rules built on them.
 *
 * This module deliberately imports nothing. Client components need PlanId and
 * the UserSubscription type, and importing those from subscription.ts would
 * drag the pg connection pool into the browser bundle, failing the build with
 * a "Can't resolve util/types" error that points at pg rather than the import.
 */

export type PlanId = "monthly";
export type SubscriptionStatus = "active" | "cancelled" | "past_due" | "expired";

/** Every plan the app currently offers. Add new plan ids here. */
export const PLAN_IDS: readonly PlanId[] = ["monthly"];
export const DEFAULT_PLAN_ID: PlanId = "monthly";

/** What the paid plan is called in provider-side descriptions and invoices. */
export const PLAN_LABEL = "Monthly";

/**
 * Months of free access granted to a new user while no payment provider is
 * configured (early-stage launch). See grantComplimentaryAccess.
 */
export const COMPLIMENTARY_ACCESS_MONTHS = 3;

/**
 * The exam every skill offers for free. Exams are numbered from 1 per skill,
 * so this makes the first exam of each skill free for any signed-in user.
 *
 * It lives here, next to hasPremiumAccess, because it is an access rule: every
 * caller that asks whether a single exam may be opened needs both answers in
 * the same breath (see canAccessExam).
 */
export const FREE_EXAM_NUMBER = 1;

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

export const NO_SUBSCRIPTION: UserSubscription = {
  planId: null,
  status: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  providerSubscriptionId: null,
  providerCustomerId: null,
  paymentProvider: null,
};

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
 * - active → allow
 * - past_due → allow (provider is still retrying payment; revoke only on expired)
 * - cancelled but still within the paid period → allow (user paid through the end)
 * - expired / no subscription → deny
 *
 * We intentionally do NOT enforce current_period_end for an active provider sub:
 * that would falsely deny access during the renewal window (period ended, renewal
 * webhook not yet processed).
 */
export function hasPremiumAccess(sub: UserSubscription): boolean {
  if (sub.planId === null) {
    return false;
  }

  // Manually granted (no payment provider): the period end is the only authority.
  if (!sub.paymentProvider) {
    return !!sub.currentPeriodEnd && sub.currentPeriodEnd > new Date();
  }

  if (sub.status === "active" || sub.status === "past_due") {
    return true;
  }

  if (sub.status === "cancelled" && sub.currentPeriodEnd && sub.currentPeriodEnd > new Date()) {
    return true;
  }

  return false;
}

/** Whether this exam number is the free sample of its skill. */
export function isFreeExam(n: number): boolean {
  return n === FREE_EXAM_NUMBER;
}

/**
 * Returns true when the user may open one specific exam of a skill: the first
 * exam of every skill is free for everyone, the rest need a subscription.
 */
export function canAccessExam(sub: UserSubscription, n: number): boolean {
  return isFreeExam(n) || hasPremiumAccess(sub);
}
