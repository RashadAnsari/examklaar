"use client";

import { useEffect } from "react";

interface ErrorBannerProps {
  message: string | null;
  onHide: () => void;
  duration?: number;
}

export function ErrorBanner({ message, onHide, duration = 6000 }: ErrorBannerProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onHide, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onHide]);

  if (!message) return null;

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium mb-6"
      style={{
        background: "var(--red-50, #fef2f2)",
        color: "var(--red, #dc2626)",
        border: "1px solid var(--red, #dc2626)",
      }}
    >
      <svg
        width="18"
        height="18"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
      {/email rate limit exceeded/i.test(message)
        ? "Something went wrong. Please try again later."
        : message}
    </div>
  );
}
