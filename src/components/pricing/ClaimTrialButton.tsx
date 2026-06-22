"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface ClaimTrialButtonProps {
  contactHref: string;
  variant?: "primary" | "outline" | "white";
  fullWidth?: boolean;
  children: React.ReactNode;
}

/**
 * Claims the early-stage complimentary access (used while no payment provider is
 * configured). On click it grants access server-side and sends the user to the
 * dashboard with the welcome gift modal. When the grant cannot be made, the same
 * button opens the mailto contact option instead.
 */
export function ClaimTrialButton({
  contactHref,
  variant = "primary",
  fullWidth,
  children,
}: ClaimTrialButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/payments/complimentary", { method: "POST" });
      if (res.status === 401) {
        router.push("/auth/signup?next=/pricing");
        return;
      }

      const data = await res.json();
      if (res.ok && data.granted) {
        router.push("/dashboard?welcome=gift");
        return;
      }

      // Could not grant access: fall back to the contact option.
      setLoading(false);
      window.location.href = contactHref;
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
