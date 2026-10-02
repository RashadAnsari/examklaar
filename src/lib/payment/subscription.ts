import "server-only";
import { pool } from "@/lib/db";
import { SubscriptionRepository } from "@/lib/repositories/subscriptionRepository";
import {
  canAccessExam,
  hasPremiumAccess,
  NO_SUBSCRIPTION,
  type PlanId,
  type SubscriptionStatus,
  type UserSubscription,
} from "./plans";

/**
 * The database side of subscriptions. Everything here touches Postgres, so the
 * module is server-only: import plan constants, types and the access rules from
 * ./plans instead, which is safe in client components.
 */

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
 * Early access: until a payment provider is configured, every exam is free for
 * every signed-in user. It ends on its own once PAYMENT_PROVIDER is set, at
 * which point the subscription rules below take over.
 *
 * It lives here rather than in ./plans because it reads the server
 * environment, which client components cannot see.
 */
export function isEarlyAccess(): boolean {
  return !process.env.PAYMENT_PROVIDER;
}

/** Whether the user can open every exam: always during early access. */
export function hasFullAccess(sub: UserSubscription): boolean {
  return isEarlyAccess() || hasPremiumAccess(sub);
}

/** Whether the user may open one specific exam right now. */
export async function userCanAccessExam(userId: string, n: number): Promise<boolean> {
  if (isEarlyAccess()) {
    return true;
  }
  return canAccessExam(await getUserSubscription(userId), n);
}
