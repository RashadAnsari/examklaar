"use client";

import { useEffect } from "react";

interface SuccessBannerProps {
  message: string | null;
  onHide: () => void;
  duration?: number;
}

export function SuccessBanner({ message, onHide, duration = 4000 }: SuccessBannerProps) {
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
        background: "var(--green-50)",
        color: "var(--green-900)",
        border: "1px solid var(--green-900)",
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
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      {message}
    </div>
  );
}
