import type { PaymentProvider } from "./types";
import { PaddleProvider } from "./paddle";

export function getPaymentProvider(): PaymentProvider {
  switch (process.env.PAYMENT_PROVIDER) {
    case "paddle":
      return new PaddleProvider();
    default:
      throw new Error(`No payment provider configured. Set PAYMENT_PROVIDER in your environment.`);
  }
}

export function getPaymentProviderByName(name: string): PaymentProvider | null {
  switch (name) {
    case "paddle":
      return new PaddleProvider();
    default:
      return null;
  }
}
