#!/usr/bin/env bun
/**
 * Manually grant one month of access to a user without a payment provider.
 *
 * Usage:
 *   bun scripts/grant-subscription.ts <userId>
 *
 * The user id is the "user".id value from the database (Better Auth generates
 * these, they are random strings rather than UUIDs).
 */
import { pool } from "@/lib/db";
import { SubscriptionRepository } from "@/lib/repositories/subscriptionRepository";
import { SubscriptionEventRepository } from "@/lib/repositories/subscriptionEventRepository";

function usage(msg?: string): never {
  if (msg) {
    console.error(`Error: ${msg}\n`);
  }
  console.error("Usage: bun scripts/grant-subscription.ts <userId>");
  process.exit(1);
}

const [userId] = process.argv.slice(2);

if (!userId) {
  usage("missing arguments");
}

const now = new Date();
const periodEnd = new Date(now);
periodEnd.setMonth(periodEnd.getMonth() + 1);

const { error } = await new SubscriptionRepository(pool).upsert({
  user_id: userId,
  plan_id: "monthly",
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
  console.error("Failed:", error.message);
  await pool.end();
  process.exit(1);
}

await new SubscriptionEventRepository(pool).record({
  user_id: userId,
  event_type: "manual_grant",
  plan_id: "monthly",
  status: "active",
  payment_provider: null,
  current_period_start: now.toISOString(),
  current_period_end: periodEnd.toISOString(),
  cancel_at_period_end: false,
  occurred_at: now.toISOString(),
});

console.log(`Granted 1 month of access to user ${userId}`);
console.log(`  Expires: ${periodEnd.toISOString()}`);

await pool.end();
