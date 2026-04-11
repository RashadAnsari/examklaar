import type {
  CheckoutParams,
  CheckoutResult,
  PaymentProvider,
  ProviderPayment,
  WebhookEvent,
} from "./types";

const MOLLIE_BASE_URL = "https://api.mollie.com/v2";

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

// ─── Mollie API response shapes ───────────────────────────────────────────────

interface MolliePayment {
  id: string;
  status: string;
  sequenceType: "first" | "recurring" | "oneoff";
  customerId: string;
  subscriptionId?: string;
  paidAt?: string;
  amount: { value: string; currency: string };
  metadata?: { userId?: string; planId?: string };
  _links: { checkout?: { href: string } };
}

interface MollieSubscription {
  id: string;
  metadata?: { userId?: string; planId?: string };
}

interface MollieCustomerPaymentsResponse {
  _embedded?: { payments?: MolliePayment[] };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export class MollieProvider implements PaymentProvider {
  private apiKey: string;

  constructor() {
    const key = process.env.MOLLIE_API_KEY;
    if (!key) {
      throw new Error("MOLLIE_API_KEY is not set");
    }
    this.apiKey = key;
  }

  private async request<T>(method: string, path: string, body?: object): Promise<T> {
    const res = await fetch(`${MOLLIE_BASE_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    // DELETE returns 204 No Content on success.
    if (method === "DELETE" && res.status === 204) {
      return undefined as T;
    }

    const data = await res.json();
    if (!res.ok) {
      throw new Error(
        `Mollie API error ${res.status}: ${(data as { detail?: string; title?: string }).detail ?? (data as { title?: string }).title ?? "Unknown error"}`
      );
    }
    return data as T;
  }

  // ─── createCheckoutSession ────────────────────────────────────────────────

  async createCheckoutSession({
    userId,
    userEmail,
    planId,
    successUrl,
    cancelUrl,
    existingCustomerId,
  }: CheckoutParams): Promise<CheckoutResult> {
    const config = PLAN_CONFIG[planId];
    const webhookUrl = `${process.env.APP_URL}/api/webhook/payment`;

    // Reuse existing customer or create a new one.
    let customerId = existingCustomerId;
    if (!customerId) {
      const customer = await this.request<{ id: string }>("POST", "/customers", {
        email: userEmail,
        metadata: { userId },
      });
      customerId = customer.id;
    }

    // Create a first-sequence payment to collect the direct-debit mandate.
    // The recurring subscription is created in parseWebhook once this payment succeeds.
    const payment = await this.request<MolliePayment>("POST", "/payments", {
      amount: { value: config.amount, currency: "EUR" },
      customerId,
      sequenceType: "first",
      description: config.description,
      redirectUrl: successUrl,
      cancelUrl,
      webhookUrl,
      metadata: { userId, planId },
    });

    if (!payment._links.checkout?.href) {
      throw new Error("Mollie did not return a checkout URL");
    }

    return {
      checkoutUrl: payment._links.checkout.href,
      sessionId: payment.id,
      customerId,
    };
  }

  // ─── parseWebhook ─────────────────────────────────────────────────────────

  async parseWebhook(rawBody: string): Promise<WebhookEvent> {
    // Mollie sends form-encoded: id=tr_xxxxx
    const params = new URLSearchParams(rawBody);
    const paymentId = params.get("id");
    if (!paymentId) {
      throw new Error("Missing payment ID in Mollie webhook body");
    }

    const payment = await this.request<MolliePayment>("GET", `/payments/${paymentId}`);

    const customerId = payment.customerId;
    let userId: string;
    let planId: "premium" | "biannual";
    let subscriptionId = payment.subscriptionId;

    if (payment.sequenceType === "first") {
      // Metadata lives on the first payment itself.
      userId = payment.metadata?.userId ?? "";
      planId = (payment.metadata?.planId as "premium" | "biannual") ?? "premium";
    } else {
      // Recurring payment: fetch the subscription to get its metadata.
      if (!subscriptionId) {
        throw new Error("Recurring Mollie payment is missing subscriptionId");
      }
      const sub = await this.request<MollieSubscription>(
        "GET",
        `/customers/${customerId}/subscriptions/${subscriptionId}`
      );
      userId = sub.metadata?.userId ?? "";
      planId = (sub.metadata?.planId as "premium" | "biannual") ?? "premium";
    }

    const config = PLAN_CONFIG[planId];

    if (payment.status === "paid") {
      const paidAt = new Date(payment.paidAt!);
      const periodEnd = addInterval(paidAt, config.interval);

      if (payment.sequenceType === "first") {
        // First payment succeeded: create the recurring subscription.
        const sub = await this.request<{ id: string }>(
          "POST",
          `/customers/${customerId}/subscriptions`,
          {
            amount: { value: config.amount, currency: "EUR" },
            interval: config.interval,
            description: config.description,
            webhookUrl: `${process.env.APP_URL}/api/webhook/payment`,
            metadata: { userId, planId },
          }
        );
        subscriptionId = sub.id;

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

      // Recurring payment: just update the period.
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

    // Mollie sends webhooks for other statuses (open, pending, cancelled).
    // Ignore them by throwing — the webhook handler returns 400 and Mollie stops retrying.
    throw new Error(`Unhandled Mollie payment status: ${payment.status}`);
  }

  // ─── cancelSubscription ───────────────────────────────────────────────────

  async cancelSubscription(
    providerSubscriptionId: string,
    providerCustomerId: string | null
  ): Promise<void> {
    if (!providerCustomerId) {
      throw new Error("Mollie requires a customer ID to cancel a subscription");
    }
    await this.request(
      "DELETE",
      `/customers/${providerCustomerId}/subscriptions/${providerSubscriptionId}`
    );
  }

  // ─── getPaymentHistory ────────────────────────────────────────────────────

  async getPaymentHistory(providerCustomerId: string): Promise<ProviderPayment[]> {
    const data = await this.request<MollieCustomerPaymentsResponse>(
      "GET",
      `/customers/${providerCustomerId}/payments`
    );

    const payments = data._embedded?.payments ?? [];

    return payments
      .filter((p) => ["paid", "failed", "refunded"].includes(p.status))
      .map((p) => ({
        providerPaymentId: p.id,
        amountCents: Math.round(parseFloat(p.amount.value) * 100),
        currency: p.amount.currency,
        status: (p.status === "paid" ? "paid" : p.status === "refunded" ? "refunded" : "failed") as
          | "paid"
          | "failed"
          | "refunded",
        paidAt: p.paidAt ? new Date(p.paidAt) : null,
        description: "",
      }));
  }
}
