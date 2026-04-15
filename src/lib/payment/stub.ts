/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  CheckoutParams,
  CheckoutResult,
  PaymentProvider,
  ProviderPayment,
  WebhookEvent,
} from "./types";

/**
 * Stub payment provider used when PAYMENT_PROVIDER is not set.
 *
 * The checkout API route handles the DB write directly in stub mode,
 * so most methods here are no-ops or return empty data.
 */
export class StubPaymentProvider implements PaymentProvider {
  async createCheckoutSession({ successUrl }: CheckoutParams): Promise<CheckoutResult> {
    return { checkoutUrl: successUrl, sessionId: "stub", customerId: "stub_customer" };
  }

  async parseWebhook(rawBody: string, signature: string | null): Promise<WebhookEvent | null> {
    const secret = process.env.STUB_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error("Stub webhook is disabled: set STUB_WEBHOOK_SECRET to enable it");
    }
    if (signature !== secret) {
      throw new Error("Stub webhook: invalid signature");
    }
    return JSON.parse(rawBody) as WebhookEvent;
  }

  async cancelSubscription(
    _providerSubscriptionId: string,
    _providerCustomerId: string | null
  ): Promise<void> {
    // no-op: cancel route updates the DB directly in stub mode
  }

  async getPaymentHistory(_providerCustomerId: string): Promise<ProviderPayment[]> {
    return [
      // {
      //   providerPaymentId: "stub_payment_1",
      //   amountCents: 999,
      //   currency: "EUR",
      //   status: "paid",
      //   paidAt: new Date("2026-04-01T10:00:00Z"),
      //   description: "Premium",
      // },
      // {
      //   providerPaymentId: "stub_payment_2",
      //   amountCents: 2999,
      //   currency: "EUR",
      //   status: "paid",
      //   paidAt: new Date("2026-03-01T10:00:00Z"),
      //   description: "6-Month Plan",
      // },
    ];
  }
}
