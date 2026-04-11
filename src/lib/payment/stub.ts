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

  async parseWebhook(rawBody: string): Promise<WebhookEvent> {
    return JSON.parse(rawBody) as WebhookEvent;
  }

  async cancelSubscription(): Promise<void> {
    // no-op: cancel route updates the DB directly in stub mode
  }

  async getPaymentHistory(): Promise<ProviderPayment[]> {
    return [];
  }
}
