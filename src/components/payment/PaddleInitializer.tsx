"use client";

import { useEffect } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";

let paddle: Paddle | undefined;

export function PaddleInitializer() {
  useEffect(() => {
    const token = process.env.PADDLE_CLIENT_TOKEN;
    if (!token || paddle) {
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
          successUrl: `${window.location.origin}/payment/success`,
        },
      },
    }).then((instance) => {
      paddle = instance;
    });
  }, []);

  return null;
}
