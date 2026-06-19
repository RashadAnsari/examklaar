import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getPaymentProviderByName } from "@/lib/payment/provider";
import type { WebhookEvent } from "@/lib/payment/types";
import { SubscriptionRepository } from "@/lib/repositories/subscriptionRepository";
import { SubscriptionEventRepository } from "@/lib/repositories/subscriptionEventRepository";

/** JSON-safe snapshot of a webhook event for the history's raw_event column. */
function serializeEvent(event: WebhookEvent) {
  return {
    ...event,
    currentPeriodStart: event.currentPeriodStart.toISOString(),
    currentPeriodEnd: event.currentPeriodEnd.toISOString(),
  };
}

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
  const subscriptions = new SubscriptionRepository(admin);
  const events = new SubscriptionEventRepository(admin);
  const now = new Date().toISOString();

  try {
    if (event.type === "subscription.refunded") {
      const sub = await subscriptions.findByProviderSubscriptionId(event.providerSubscriptionId);

      if (sub && (sub.status === "active" || sub.status === "past_due")) {
        await provider.cancelSubscription(
          event.providerSubscriptionId,
          event.providerCustomerId,
          true
        );
      }

      await events.record({
        user_id: event.userId,
        event_type: event.type,
        payment_provider: providerName,
        provider_customer_id: event.providerCustomerId,
        provider_subscription_id: event.providerSubscriptionId,
        occurred_at: now,
        raw_event: serializeEvent(event),
      });

      console.info(
        "[webhook] Refund processed, subscription cancelled for subscriptionId=%s",
        event.providerSubscriptionId
      );
      return NextResponse.json({ ok: true });
    }

    if (event.type === "payment.failed") {
      // Only update the status — don't overwrite period dates.
      await subscriptions.updateByUserId(event.userId, { status: "past_due", updated_at: now });
    } else {
      await subscriptions.upsert({
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
      });
    }

    await events.record({
      user_id: event.userId,
      event_type: event.type,
      plan_id: event.planId,
      status: event.type === "payment.failed" ? "past_due" : event.status,
      payment_provider: providerName,
      provider_customer_id: event.providerCustomerId,
      provider_subscription_id: event.providerSubscriptionId,
      current_period_start: event.currentPeriodStart.toISOString(),
      current_period_end: event.currentPeriodEnd.toISOString(),
      cancel_at_period_end: event.cancelAtPeriodEnd,
      occurred_at: now,
      raw_event: serializeEvent(event),
    });
  } catch (err) {
    console.error("[webhook] DB error:", err);
    // Return 500 so the provider retries.
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  console.info("[webhook] Processed type=%s userId=%s", event.type, event.userId);
  return NextResponse.json({ ok: true });
}
