"use client";

import { useEffect } from "react";
import { initializePaddle, CheckoutEventNames } from "@paddle/paddle-js";

export function PaddleInitializer() {
  useEffect(() => {
    const token = process.env.PADDLE_CLIENT_TOKEN;
    if (!token) {
      return;
    }

    initializePaddle({
      environment:
        process.env.PADDLE_ENVIRONMENT === "production" ||
        (!process.env.PADDLE_ENVIRONMENT && process.env.NODE_ENV === "production")
          ? "production"
          : "sandbox",
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
  }, []);

  return null;
}
