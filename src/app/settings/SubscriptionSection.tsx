"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { SuccessBanner } from "@/components/ui/SuccessBanner";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { PLAN_LABEL, type UserSubscription } from "@/lib/payment/plans";
import type { ProviderPayment } from "@/lib/payment/types";
import { analytics } from "@/lib/analytics";
import { SettingsItem, SettingsSection } from "./SettingsSection";

type SubscriptionInfo = UserSubscription & { hasAccess: boolean };

export function SubscriptionSection() {
  const [sub, setSub] = useState<SubscriptionInfo | null>(null);
  const [payments, setPayments] = useState<ProviderPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [subRes, paymentsRes] = await Promise.all([
        fetch("/api/payments/subscription"),
        fetch("/api/payments"),
      ]);
      if (subRes.ok) {
        setSub(await subRes.json());
      }
      if (paymentsRes.ok) {
        const data = await paymentsRes.json();
        setPayments(data.payments ?? []);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleCancel() {
    const message =
      "Are you sure you want to cancel your subscription? You'll keep access until the end of your current billing period.";
    if (!confirm(message)) {
      return;
    }
    setCancelling(true);
    setCancelError(null);
    const res = await fetch("/api/payments/subscription/cancel", { method: "POST" });
    setCancelling(false);
    if (res.ok) {
      analytics.cancelSubscription();
      setCancelSuccess(
        "Your subscription has been cancelled. Access continues until the end of your billing period."
      );
      setSub((prev) => (prev ? { ...prev, cancelAtPeriodEnd: true } : prev));
    } else {
      const data = await res.json();
      setCancelError(data.error ?? "Failed to cancel subscription. Please try again.");
    }
  }

  const isSubscribed = !!sub?.planId;
  const hasAccess = !!sub?.hasAccess;
  const planLabel = isSubscribed ? PLAN_LABEL : "No plan";
  // Only Paddle-backed active subscriptions can be cancelled, and only while
  // access is live and a cancellation isn't already scheduled.
  const canCancel =
    hasAccess && !!sub?.paymentProvider && sub.status === "active" && !sub.cancelAtPeriodEnd;
  const periodEnd = sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : null;

  function planDescription() {
    if (!isSubscribed || !periodEnd) {
      return "No active plan";
    }

    const formatted = periodEnd.toLocaleDateString("en-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    if (!hasAccess) {
      return "Access ended";
    }

    if (sub.cancelAtPeriodEnd) {
      return `Cancels on ${formatted}`;
    }

    if (!sub.paymentProvider) {
      return `Ends on ${formatted}`;
    }

    return `Renews on ${formatted}`;
  }

  return (
    <SettingsSection title="Subscription" description="Your current plan and billing history">
      <SuccessBanner message={cancelSuccess} onHide={() => setCancelSuccess(null)} />
      <ErrorBanner message={cancelError} onHide={() => setCancelError(null)} />

      {loading ? (
        <p className="text-sm" style={{ color: "var(--gray-500)" }}>
          Loading…
        </p>
      ) : (
        <>
          <SettingsItem
            label={
              <div className="flex flex-wrap items-center gap-2">
                <span>Current Plan</span>
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{
                    background: hasAccess ? "var(--green-50)" : "var(--gray-100)",
                    color: hasAccess ? "var(--green-900)" : "var(--gray-600)",
                  }}
                >
                  {planLabel}
                </span>
              </div>
            }
            description={planDescription()}
          >
            <div className="flex items-center gap-3 flex-wrap">
              {canCancel ? (
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling ? "Cancelling…" : "Cancel plan"}
                </Button>
              ) : (
                !hasAccess && (
                  <Button href="/pricing" variant="primary">
                    Subscribe
                  </Button>
                )
              )}
            </div>
          </SettingsItem>

          {/* Payment history */}
          <div className="mt-6">
            <p
              className="font-semibold mb-3"
              style={{ fontSize: "0.9375rem", color: "var(--gray-900)" }}
            >
              Payment History
            </p>
            {payments.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--gray-400)" }}>
                No payments yet
              </p>
            ) : (
              <div
                className="rounded-xl overflow-x-auto border"
                style={{ borderColor: "var(--gray-100)" }}
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: "var(--gray-50)" }}>
                      <th
                        className="text-left px-4 py-3 font-medium"
                        style={{ color: "var(--gray-500)" }}
                      >
                        Date
                      </th>
                      <th
                        className="text-left px-4 py-3 font-medium"
                        style={{ color: "var(--gray-500)" }}
                      >
                        Description
                      </th>
                      <th
                        className="text-left px-4 py-3 font-medium"
                        style={{ color: "var(--gray-500)" }}
                      >
                        Amount
                      </th>
                      <th
                        className="text-left px-4 py-3 font-medium"
                        style={{ color: "var(--gray-500)" }}
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr
                        key={p.providerPaymentId}
                        style={{ borderTop: "1px solid var(--gray-100)" }}
                      >
                        <td className="px-4 py-3" style={{ color: "var(--gray-700)" }}>
                          {p.paidAt
                            ? new Date(p.paidAt).toLocaleDateString("en-NL", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "N/A"}
                        </td>
                        <td className="px-4 py-3" style={{ color: "var(--gray-700)" }}>
                          {p.description}
                        </td>
                        <td className="px-4 py-3" style={{ color: "var(--gray-700)" }}>
                          {(p.amountCents / 100).toLocaleString("nl-NL", {
                            style: "currency",
                            currency: p.currency,
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{
                              background:
                                p.status === "paid"
                                  ? "var(--green-50)"
                                  : p.status === "refunded"
                                    ? "var(--gray-100)"
                                    : "var(--red-50, #fef2f2)",
                              color:
                                p.status === "paid"
                                  ? "var(--green-900)"
                                  : p.status === "refunded"
                                    ? "var(--gray-600)"
                                    : "var(--red)",
                            }}
                          >
                            {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </SettingsSection>
  );
}
