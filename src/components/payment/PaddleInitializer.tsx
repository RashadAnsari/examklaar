"use client";

import { useEffect } from "react";
import { initializePaddle, CheckoutEventNames } from "@paddle/paddle-js";

interface Props {
  token: string;
  environment: "production" | "sandbox";
}

export function PaddleInitializer({ token, environment }: Props) {
  useEffect(() => {
    initializePaddle({
      environment,
      token,
      checkout: {
        settings: {
          locale: "en",
          variant: "one-page",
          allowLogout: false,
          showAddTaxId: false,
          displayMode: "overlay",
          showAddDiscounts: false,
          allowDiscountRemoval: false,
          allowedPaymentMethods: ["card", "ideal"],
          successUrl: `${window.location.origin}/payment/success`,
        },
      },
      eventCallback(event) {
        if (event.name === CheckoutEventNames.CHECKOUT_CLOSED) {
          window.location.href = "/pricing";
        }
      },
    });
  }, [token, environment]);

  return null;
}
