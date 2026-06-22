"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

/**
 * One-time welcome modal shown to a user who just claimed complimentary access
 * from the pricing page (while no payment provider is configured). Dismissed
 * client-side; the dashboard only renders it on the post-grant redirect.
 */
export function WelcomeGiftModal({ months }: { months: number }) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0, 0, 0, 0.5)" }}
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-gift-title"
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 text-center"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="mx-auto mb-5 flex items-center justify-center rounded-full"
          style={{ width: 56, height: 56, background: "var(--green-50)" }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--green-700)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 12 20 22 4 22 4 12" />
            <rect x="2" y="7" width="20" height="5" />
            <line x1="12" y1="22" x2="12" y2="7" />
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
          </svg>
        </div>

        <p
          className="mb-2 text-xs font-semibold uppercase tracking-wide"
          style={{ color: "var(--green-700)" }}
        >
          Welcome gift
        </p>
        <h2
          id="welcome-gift-title"
          className="mb-3 font-bold"
          style={{ fontSize: "1.5rem", color: "var(--gray-900)" }}
        >
          {months} months on us
        </h2>
        <p className="mb-6" style={{ color: "var(--gray-600)", lineHeight: 1.6 }}>
          Thanks for signing up. We are still in our early stages, so you get {months} months of
          full access to every practice exam, completely free, to try out the platform.
        </p>

        <Button variant="primary" fullWidth onClick={() => setOpen(false)}>
          Start practicing
        </Button>
      </div>
    </div>
  );
}
