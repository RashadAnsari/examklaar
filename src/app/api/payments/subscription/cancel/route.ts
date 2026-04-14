import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getUserSubscription } from "@/lib/payment/subscription";
import { getPaymentProvider } from "@/lib/payment/provider";

export async function POST() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sub = await getUserSubscription(user.id);
  if (sub.planId === "free" || sub.status !== "active") {
    return NextResponse.json({ error: "No active subscription to cancel" }, { status: 400 });
  }

  // Call the provider first (no-op for stub).
  if (sub.providerSubscriptionId) {
    try {
      const provider = getPaymentProvider();
      await provider.cancelSubscription(sub.providerSubscriptionId, sub.providerCustomerId);
    } catch (err) {
      console.error("[subscription/cancel] provider error:", err);
      return NextResponse.json({ error: "Failed to cancel with provider" }, { status: 500 });
    }
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("subscriptions")
    .update({ cancel_at_period_end: true, updated_at: new Date().toISOString() })
    .eq("user_id", user.id);
  if (error) {
    console.error("[subscription/cancel] db error:", error);
    return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
