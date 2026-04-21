import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getPaymentProviderByName } from "@/lib/payment/provider";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  let providerName;
  const paddleSignature = req.headers.get("paddle-signature");
  if (paddleSignature) {
    providerName = "paddle";
  } else {
    console.error("[webhook] No signature header found");
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }

  const provider = getPaymentProviderByName(providerName);
  if (!provider) {
    console.error("[webhook] No provider found for name:", providerName);
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }

  let event;
  try {
    event = await provider.parseWebhook(rawBody, paddleSignature);
  } catch (err) {
    console.error("[webhook] Failed to parse event:", err);
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }

  if (!event) {
    console.info("[webhook] no-op event received, returning OK");
    return NextResponse.json({ ok: true });
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();

  try {
    if (event.type === "subscription.refunded") {
      const { data: sub } = await admin
        .from("subscriptions")
        .select("user_id, status, payment_provider")
        .eq("provider_subscription_id", event.providerSubscriptionId)
        .single();

      if (sub && (sub.status === "active" || sub.status === "past_due")) {
        await provider.cancelSubscription(
          event.providerSubscriptionId,
          event.providerCustomerId,
          true
        );
      }

      console.info(
        "[webhook] Refund processed, subscription cancelled for subscriptionId=%s",
        event.providerSubscriptionId
      );
      return NextResponse.json({ ok: true });
    }

    if (event.type === "payment.failed") {
      // Only update the status — don't overwrite period dates.
      await admin
        .from("subscriptions")
        .update({ status: "past_due", updated_at: now })
        .eq("user_id", event.userId);
    } else {
      await admin.from("subscriptions").upsert(
        {
          user_id: event.userId,
          plan_id: event.planId,
          status: event.status,
          payment_provider: providerName,
          provider_customer_id: event.providerCustomerId,
          provider_subscription_id: event.providerSubscriptionId,
          current_period_start: event.currentPeriodStart.toISOString(),
          current_period_end: event.currentPeriodEnd.toISOString(),
          cancel_at_period_end: event.cancelAtPeriodEnd,
          updated_at: now,
        },
        { onConflict: "user_id" }
      );
    }
  } catch (err) {
    console.error("[webhook] DB error:", err);
    // Return 500 so the provider retries.
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  console.info("[webhook] Processed type=%s userId=%s", event.type, event.userId);
  return NextResponse.json({ ok: true });
}
