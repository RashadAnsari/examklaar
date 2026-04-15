import type { PaymentProvider } from "./types";
import { StubPaymentProvider } from "./stub";
import { MollieProvider } from "./mollie";
import { PaddleProvider } from "./paddle";

/**
 * Returns the configured payment provider.
 *
 * To add a new provider:
 *   1. Create src/lib/payment/{provider}.ts implementing PaymentProvider
 *   2. Add a case below
 *   3. Set PAYMENT_PROVIDER in your environment
 */
export function getPaymentProvider(): PaymentProvider {
  switch (process.env.PAYMENT_PROVIDER) {
    case "mollie":
      return new MollieProvider();
    case "paddle":
      return new PaddleProvider();
    default:
      return new StubPaymentProvider();
  }
}
