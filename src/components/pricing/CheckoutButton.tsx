"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface CheckoutButtonProps {
  planId: "premium" | "biannual";
  variant?: "primary" | "outline" | "white";
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function CheckoutButton({
  planId,
  variant = "primary",
  fullWidth,
  children,
}: CheckoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      if (res.status === 401) {
        router.push("/signup?next=/pricing");
        return;
      }

      const data = await res.json();

      if (!res.ok || !data.checkoutUrl) {
        setError("Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button variant={variant} fullWidth={fullWidth} disabled={loading} onClick={handleClick}>
        {loading ? "Redirecting…" : children}
      </Button>
      {error && <p className="text-xs text-center text-[var(--red)]">{error}</p>}
    </div>
  );
}
