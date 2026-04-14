import type {
  CheckoutParams,
  CheckoutResult,
  PaymentProvider,
  ProviderPayment,
  WebhookEvent,
} from "./types";
import createMollieClient, { SequenceType } from "@mollie/api-client";
import { createHmac, timingSafeEqual } from "crypto";
import { Buffer } from "buffer";

const PLAN_CONFIG = {
  premium: {
    amount: "9.99",
    interval: "1 month" as const,
    description: "ExamKlaar Premium",
  },
  biannual: {
    amount: "29.99",
    interval: "6 months" as const,
    description: "ExamKlaar 6-Month Plan",
  },
} as const;

type Interval = "1 month" | "6 months";

function addInterval(date: Date, interval: Interval): Date {
  const result = new Date(date);
  if (interval === "1 month") {
    result.setMonth(result.getMonth() + 1);
  } else {
    result.setMonth(result.getMonth() + 6);
  }
  return result;
}

function getClient() {
  const apiKey = process.env.MOLLIE_API_KEY;
  if (!apiKey) {
    throw new Error("MOLLIE_API_KEY is not set");
  }

  return createMollieClient({ apiKey });
}

function verifyMollieWebhookSignature(rawBody: string, signature: string | null) {
  const signingSecret = process.env.MOLLIE_WEBHOOK_SECRET;
  if (!signingSecret) {
    throw new Error("MOLLIE_WEBHOOK_SECRET is not set");
  }

  if (!signature) {
    throw new Error("Missing Mollie webhook signature");
  }

  const signatures = signature
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => {
      const [, rawSignature] = value.split("=");
      return rawSignature?.trim() ?? "";
    })
    .filter(Boolean);

  if (signatures.length === 0) {
    throw new Error("Invalid Mollie webhook signature header");
  }

  const expectedSignature = createHmac("sha256", signingSecret)
    .update(rawBody, "utf8")
    .digest("hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  for (const rawSignature of signatures) {
    const signatureBuffer = Buffer.from(rawSignature, "hex");
    if (
      signatureBuffer.length === expectedBuffer.length &&
      timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return;
    }
  }

  throw new Error("Mollie webhook signature verification failed");
}

export class MollieProvider implements PaymentProvider {
  private readonly client = getClient();

  async createCheckoutSession({
    userId,
    userEmail,
    planId,
    successUrl,
    cancelUrl,
    existingCustomerId,
  }: CheckoutParams): Promise<CheckoutResult> {
    const config = PLAN_CONFIG[planId];
    const webhookUrl = `${process.env.APP_URL}/api/payments/webhook`;

    let customerId = existingCustomerId;
    if (!customerId) {
      const customer = await this.client.customers.create({
        email: userEmail,
        metadata: { userId },
      });
      customerId = customer.id;
    }

    const payment = await this.client.customerPayments.create({
      amount: { value: config.amount, currency: "EUR" },
      customerId,
      sequenceType: SequenceType.first,
      description: config.description,
      redirectUrl: successUrl,
      cancelUrl,
      webhookUrl,
      metadata: { userId, planId },
    });

    const checkoutUrl = payment.getCheckoutUrl();
    if (!checkoutUrl) {
      throw new Error("Mollie did not return a checkout URL");
    }

    return {
      checkoutUrl,
      sessionId: payment.id,
      customerId,
    };
  }

  async parseWebhook(rawBody: string, signature: string | null): Promise<WebhookEvent | null> {
    verifyMollieWebhookSignature(rawBody, signature);

    const params = new URLSearchParams(rawBody);
    const paymentId = params.get("id");
    if (!paymentId) {
      throw new Error("Missing payment ID in Mollie webhook body");
    }

    const payment = await this.client.payments.get(paymentId);
    const customerId = payment.customerId;
    if (!customerId) {
      throw new Error("Mollie payment is missing customerId");
    }

    const paymentMetadata = payment.metadata as Record<string, string> | undefined;
    let userId = paymentMetadata?.userId ?? "";
    let planId = (paymentMetadata?.planId as "premium" | "biannual") ?? "premium";
    let subscriptionId = payment.subscriptionId;

    if (payment.sequenceType !== SequenceType.first) {
      if (!subscriptionId) {
        throw new Error("Recurring Mollie payment is missing subscriptionId");
      }
      const subscription = await this.client.customerSubscriptions.get(subscriptionId, {
        customerId,
      });
      const subscriptionMetadata = subscription.metadata as Record<string, string> | undefined;
      userId = subscriptionMetadata?.userId ?? userId;
      planId = (subscriptionMetadata?.planId as "premium" | "biannual") ?? planId;
    }

    if (["open", "canceled", "pending", "authorized"].includes(payment.status)) {
      return null;
    }

    const config = PLAN_CONFIG[planId];
    if (payment.status === "paid") {
      const paidAt = new Date(payment.paidAt ?? new Date().toISOString());
      const periodEnd = addInterval(paidAt, config.interval);

      if (payment.sequenceType === SequenceType.first) {
        const subscription = await this.client.customerSubscriptions.create({
          customerId,
          amount: { value: config.amount, currency: "EUR" },
          interval: config.interval,
          description: config.description,
          webhookUrl: `${process.env.APP_URL}/api/payments/webhook`,
          metadata: { userId, planId },
        });
        subscriptionId = subscription.id;

        return {
          type: "subscription.activated",
          userId,
          providerCustomerId: customerId,
          providerSubscriptionId: subscriptionId,
          planId,
          status: "active",
          currentPeriodStart: paidAt,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
        };
      }

      return {
        type: "subscription.renewed",
        userId,
        providerCustomerId: customerId,
        providerSubscriptionId: subscriptionId!,
        planId,
        status: "active",
        currentPeriodStart: paidAt,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      };
    }

    if (payment.status === "failed" || payment.status === "expired") {
      return {
        type: "payment.failed",
        userId,
        providerCustomerId: customerId,
        providerSubscriptionId: subscriptionId ?? "",
        planId,
        status: "past_due",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
      };
    }

    throw new Error(`Unhandled Mollie payment status: ${payment.status}`);
  }

  async cancelSubscription(
    providerSubscriptionId: string,
    providerCustomerId: string | null
  ): Promise<void> {
    if (!providerCustomerId) {
      throw new Error("Mollie requires a customer ID to cancel a subscription");
    }
    await this.client.customerSubscriptions.cancel(providerSubscriptionId, {
      customerId: providerCustomerId,
    });
  }

  async getPaymentHistory(providerCustomerId: string): Promise<ProviderPayment[]> {
    const payments: ProviderPayment[] = [];
    for await (const payment of this.client.customerPayments.iterate({
      customerId: providerCustomerId,
    })) {
      if (payment.status === "paid") {
        payments.push({
          providerPaymentId: payment.id,
          amountCents: Math.round(parseFloat(payment.amount.value) * 100),
          currency: payment.amount.currency,
          status: "paid",
          paidAt: payment.paidAt ? new Date(payment.paidAt) : null,
          description: payment.description,
        });
      }
    }

    return payments;
  }
}
