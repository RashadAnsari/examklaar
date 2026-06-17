#!/usr/bin/env bun
/**
 * Manually grant a monthly subscription to a user without a payment provider.
 *
 * Usage:
 *   bun scripts/grant-subscription.ts <userId> [status]
 *
 * status:
 *   active   - paid month, 1 month from now (default)
 *   trialing - 7-day free trial from now
 *
 * Example:
 *   bun scripts/grant-subscription.ts 550e8400-e29b-41d4-a716-446655440000 trialing
 */
import { createClient } from "@supabase/supabase-js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function usage(msg?: string): never {
  if (msg) {
    console.error(`Error: ${msg}\n`);
  }
  console.error("Usage: bun scripts/grant-subscription.ts <userId> [status]");
  console.error("  status: active (1 month, default) | trialing (7-day trial)");
  process.exit(1);
}

const [userId, statusArg = "active"] = process.argv.slice(2);

if (!userId) {
  usage("missing arguments");
}
if (!UUID_RE.test(userId)) {
  usage(`"${userId}" is not a valid UUID`);
}
if (statusArg !== "active" && statusArg !== "trialing") {
  usage(`status must be "active" or "trialing"`);
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
if (statusArg === "trialing") {
  periodEnd.setDate(periodEnd.getDate() + 7);
} else {
  periodEnd.setMonth(periodEnd.getMonth() + 1);
}

const { error } = await admin.from("subscriptions").upsert(
  {
    user_id: userId,
    plan_id: "monthly",
    status: statusArg,
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

const label = statusArg === "trialing" ? "Monthly (7-day trial)" : "Monthly (1 month)";
console.log(`Granted ${label} to user ${userId}`);
console.log(`  Expires: ${periodEnd.toISOString()}`);
