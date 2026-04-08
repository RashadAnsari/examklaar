"use client";

import { useEffect } from "react";
import { XCircleIcon } from "@heroicons/react/20/solid";

interface ErrorBannerProps {
  message: string | null;
  onHide: () => void;
  duration?: number;
}

export function ErrorBanner({ message, onHide, duration = 6000 }: ErrorBannerProps) {
  useEffect(() => {
    if (!message) {
      return;
    }
    const timer = setTimeout(onHide, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onHide]);

  if (!message) {
    return null;
  }

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium mb-6"
      style={{
        background: "var(--red-50, #fef2f2)",
        color: "var(--red, #dc2626)",
        border: "1px solid var(--red, #dc2626)",
      }}
    >
      <XCircleIcon style={{ width: 18, height: 18, flexShrink: 0 }} />
      {/email rate limit exceeded/i.test(message)
        ? "Something went wrong. Please try again later."
        : message}
    </div>
  );
}
