import type { PaymentProvider } from "./types";
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
    case "paddle":
      return new PaddleProvider();
    default:
      throw new Error(`No payment provider configured. Set PAYMENT_PROVIDER in your environment.`);
  }
}

export function hasPaymentProvider(): boolean {
  return !!process.env.PAYMENT_PROVIDER;
}
