#!/usr/bin/env bun
/**
 * Manually grant one month of access to a user without a payment provider.
 *
 * Usage:
 *   bun scripts/grant-subscription.ts <userId>
 *
 * Example:
 *   bun scripts/grant-subscription.ts 550e8400-e29b-41d4-a716-446655440000
 */
import { createClient } from "@supabase/supabase-js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
if (!UUID_RE.test(userId)) {
  usage(`"${userId}" is not a valid UUID`);
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
periodEnd.setMonth(periodEnd.getMonth() + 1);

const { error } = await admin.from("subscriptions").upsert(
  {
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
  },
  { onConflict: "user_id" }
);

if (error) {
  console.error("Failed:", error.message);
  process.exit(1);
}

console.log(`Granted 1 month of access to user ${userId}`);
console.log(`  Expires: ${periodEnd.toISOString()}`);
