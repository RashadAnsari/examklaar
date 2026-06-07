#!/usr/bin/env bun
/**
 * Manually grant a subscription to a user without a payment provider.
 *
 * Usage:
 *   bun scripts/grant-subscription.ts <userId> <plan>
 *
 * Plans:
 *   premium   - monthly (1 month from now)
 *   biannual  - 6-month (6 months from now)
 *
 * Example:
 *   bun scripts/grant-subscription.ts 550e8400-e29b-41d4-a716-446655440000 biannual
 */
import { createClient } from "@supabase/supabase-js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function usage(msg?: string): never {
  if (msg) {
    console.error(`Error: ${msg}\n`);
  }
  console.error("Usage: bun scripts/grant-subscription.ts <userId> <plan>");
  console.error("  plan: premium (1 month) | biannual (6 months)");
  process.exit(1);
}

const [userId, plan] = process.argv.slice(2);

if (!userId || !plan) {
  usage("missing arguments");
}
if (!UUID_RE.test(userId)) {
  usage(`"${userId}" is not a valid UUID`);
}
if (plan !== "premium" && plan !== "biannual") {
  usage(`plan must be "premium" or "biannual"`);
}

const supabaseUrl = process.env.SUPABASE_PUBLIC_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_PUBLIC_URL or SUPABASE_SERVICE_ROLE_KEY in environment.");
  process.exit(1);
}

const admin = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const now = new Date();
const periodEnd = new Date(now);
periodEnd.setMonth(periodEnd.getMonth() + (plan === "premium" ? 1 : 6));

const { error } = await admin.from("subscriptions").upsert(
  {
    user_id: userId,
    plan_id: plan,
    status: "active",
    payment_provider: null,
    provider_customer_id: null,
    provider_subscription_id: null,
    current_period_start: now.toISOString(),
    current_period_end: periodEnd.toISOString(),
    cancel_at_period_end: false,
    updated_at: now.toISOString(),
  },
  { onConflict: "user_id" }
);

if (error) {
  console.error("Failed:", error.message);
  process.exit(1);
}

const label = plan === "premium" ? "Premium (1 month)" : "Biannual (6 months)";
console.log(`Granted ${label} to user ${userId}`);
console.log(`  Expires: ${periodEnd.toISOString()}`);
