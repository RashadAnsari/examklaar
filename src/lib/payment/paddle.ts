import {
  Paddle,
  Environment,
  EventName,
  type AdjustmentCreatedEvent,
  type AdjustmentUpdatedEvent,
} from "@paddle/paddle-node-sdk";
import type {
  CheckoutParams,
  CheckoutResult,
  PaymentProvider,
  ProviderPayment,
  WebhookEvent,
} from "./types";

const PLAN_DESCRIPTIONS = {
  premium: "ExamKlaar Premium",
  biannual: "ExamKlaar 6-Month Plan",
} as const;

function getClient(): Paddle {
  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) {
    throw new Error("PADDLE_API_KEY is not set");
  }

  // const environment = process.env.NODE_ENV === "production" ? Environment.production : Environment.sandbox;
  // FIXME: Use above line once we have separate Paddle environments for production and development.
  const environment = Environment.sandbox;

  return new Paddle(apiKey, { environment: environment });
}

function getPriceId(planId: "premium" | "biannual"): string {
  const envVar = planId === "premium" ? "PADDLE_PRICE_ID_PREMIUM" : "PADDLE_PRICE_ID_BIANNUAL";
  const id = process.env[envVar];
  if (!id) {
    throw new Error(`${envVar} is not set`);
  }
  return id;
}

function planIdFromPriceId(priceId: string): "premium" | "biannual" {
  return priceId === process.env.PADDLE_PRICE_ID_BIANNUAL ? "biannual" : "premium";
}

export class PaddleProvider implements PaymentProvider {
  private readonly client = getClient();

  async createCheckoutSession({
    userId,
    userEmail,
    planId,
    existingCustomerId,
  }: CheckoutParams): Promise<CheckoutResult> {
    const priceId = getPriceId(planId);

    let customerId = existingCustomerId;
    if (!customerId) {
      // Search for an existing Paddle customer with this email before creating.
      // Guards against duplicates when payment_customers row is absent (e.g. after
      // account deletion and re-signup with the same email).
      for await (const existing of this.client.customers.list({ email: [userEmail] })) {
        customerId = existing.id;
        break;
      }

      if (!customerId) {
        const customer = await this.client.customers.create({
          email: userEmail,
          customData: { userId },
        });
        customerId = customer.id;
      }
    }

    const transaction = await this.client.transactions.create({
      items: [{ priceId, quantity: 1 }],
      customerId,
      customData: { userId, planId },
    });

    const checkoutUrl = transaction.checkout?.url;
    if (!checkoutUrl) {
      throw new Error("Paddle did not return a checkout URL");
    }

    return {
      checkoutUrl,
      sessionId: transaction.id,
      customerId,
    };
  }

  async parseWebhook(rawBody: string, signature: string | null): Promise<WebhookEvent | null> {
    const secret = process.env.PADDLE_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error("PADDLE_WEBHOOK_SECRET is not set");
    }
    if (!signature) {
      throw new Error("Missing Paddle-Signature header");
    }

    const event = await this.client.webhooks.unmarshal(rawBody, secret, signature);

    switch (event.eventType) {
      case EventName.SubscriptionCreated:
      case EventName.SubscriptionActivated: {
        const sub = event.data;
        const customData = sub.customData as Record<string, string> | null;
        const userId = customData?.userId;
        if (!userId) {
          return null;
        }

        const priceId = sub.items[0]?.price?.id;
        const planId = priceId ? planIdFromPriceId(priceId) : "premium";
        const periodStart = new Date(sub.currentBillingPeriod?.startsAt ?? new Date());
        const periodEnd = new Date(sub.currentBillingPeriod?.endsAt ?? new Date());

        return {
          type: "subscription.activated",
          userId,
          providerCustomerId: sub.customerId,
          providerSubscriptionId: sub.id,
          planId,
          status: "active",
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: sub.scheduledChange?.action === "cancel",
        };
      }

      case EventName.SubscriptionUpdated: {
        const sub = event.data;
        const customData = sub.customData as Record<string, string> | null;
        const userId = customData?.userId;
        if (!userId) {
          return null;
        }

        const priceId = sub.items[0]?.price?.id;
        const planId = priceId ? planIdFromPriceId(priceId) : "premium";
        const periodStart = new Date(sub.currentBillingPeriod?.startsAt ?? new Date());
        const periodEnd = new Date(sub.currentBillingPeriod?.endsAt ?? new Date());

        if (sub.status === "canceled") {
          return {
            type: "subscription.cancelled",
            userId,
            providerCustomerId: sub.customerId,
            providerSubscriptionId: sub.id,
            planId,
            status: "cancelled",
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: false,
          };
        }

        if (sub.status === "past_due") {
          return {
            type: "payment.failed",
            userId,
            providerCustomerId: sub.customerId,
            providerSubscriptionId: sub.id,
            planId,
            status: "past_due",
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: false,
          };
        }

        if (sub.status === "active" || sub.status === "trialing") {
          return {
            type: "subscription.renewed",
            userId,
            providerCustomerId: sub.customerId,
            providerSubscriptionId: sub.id,
            planId,
            status: "active",
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: sub.scheduledChange?.action === "cancel",
          };
        }

        return null;
      }

      case EventName.SubscriptionCanceled: {
        const sub = event.data;
        const customData = sub.customData as Record<string, string> | null;
        const userId = customData?.userId;
        if (!userId) {
          return null;
        }

        const priceId = sub.items[0]?.price?.id;
        const planId = priceId ? planIdFromPriceId(priceId) : "premium";

        return {
          type: "subscription.cancelled",
          userId,
          providerCustomerId: sub.customerId,
          providerSubscriptionId: sub.id,
          planId,
          status: "cancelled",
          currentPeriodStart: new Date(sub.currentBillingPeriod?.startsAt ?? new Date()),
          currentPeriodEnd: new Date(sub.currentBillingPeriod?.endsAt ?? new Date()),
          cancelAtPeriodEnd: false,
        };
      }

      case EventName.SubscriptionPastDue: {
        const sub = event.data;
        const customData = sub.customData as Record<string, string> | null;
        const userId = customData?.userId;
        if (!userId) {
          return null;
        }

        const priceId = sub.items[0]?.price?.id;
        const planId = priceId ? planIdFromPriceId(priceId) : "premium";

        return {
          type: "payment.failed",
          userId,
          providerCustomerId: sub.customerId,
          providerSubscriptionId: sub.id,
          planId,
          status: "past_due",
          currentPeriodStart: new Date(sub.currentBillingPeriod?.startsAt ?? new Date()),
          currentPeriodEnd: new Date(sub.currentBillingPeriod?.endsAt ?? new Date()),
          cancelAtPeriodEnd: false,
        };
      }

      case EventName.TransactionPaymentFailed: {
        const tx = event.data;
        const customData = tx.customData as Record<string, string> | null;
        const userId = customData?.userId;
        if (!userId) {
          return null;
        }

        const priceId = tx.items[0]?.price?.id;
        const planId = priceId ? planIdFromPriceId(priceId) : "premium";

        return {
          type: "payment.failed",
          userId,
          providerCustomerId: tx.customerId ?? "",
          providerSubscriptionId: tx.subscriptionId ?? "",
          planId,
          status: "past_due",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(),
          cancelAtPeriodEnd: false,
        };
      }

      case EventName.AdjustmentCreated:
      case EventName.AdjustmentUpdated: {
        const adj = (event as AdjustmentCreatedEvent | AdjustmentUpdatedEvent).data;
        const isRefund = adj.action === "refund" || adj.action === "chargeback";
        if (!isRefund || adj.status !== "approved" || !adj.subscriptionId) {
          return null;
        }

        return {
          type: "subscription.refunded",
          userId: "",
          providerCustomerId: adj.customerId,
          providerSubscriptionId: adj.subscriptionId,
          planId: "premium",
          status: "cancelled",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(),
          cancelAtPeriodEnd: false,
        };
      }

      default:
        return null;
    }
  }

  async cancelSubscription(
    providerSubscriptionId: string,
    _providerCustomerId: string | null,
    immediately = false
  ): Promise<void> {
    await this.client.subscriptions.cancel(providerSubscriptionId, {
      effectiveFrom: immediately ? "immediately" : "next_billing_period",
    });
  }

  async getPaymentHistory(providerCustomerId: string): Promise<ProviderPayment[]> {
    const refundedTransactionIds = new Set<string>();
    for await (const adj of this.client.adjustments.list({
      customerId: [providerCustomerId],
      action: "refund",
      status: ["approved"],
    })) {
      refundedTransactionIds.add(adj.transactionId);
    }

    const payments: ProviderPayment[] = [];
    for await (const tx of this.client.transactions.list({
      customerId: [providerCustomerId],
      status: ["completed"],
    })) {
      const total = tx.details?.totals?.total;
      if (!total) {
        continue;
      }

      const priceId = tx.items[0]?.price?.id ?? "";
      const planId = planIdFromPriceId(priceId);
      const description = tx.items[0]?.price?.description ?? PLAN_DESCRIPTIONS[planId];

      payments.push({
        providerPaymentId: tx.id,
        amountCents: Math.round(parseFloat(total)),
        currency: tx.currencyCode,
        status: refundedTransactionIds.has(tx.id) ? "refunded" : "paid",
        paidAt: tx.billedAt ? new Date(tx.billedAt) : null,
        description,
      });
    }
    return payments;
  }
}
