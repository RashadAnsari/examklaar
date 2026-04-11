"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/utils/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SuccessBanner } from "@/components/ui/SuccessBanner";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import type { UserSubscription } from "@/lib/subscription";
import type { ProviderPayment } from "@/lib/payment/types";

export default function SettingsPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [pwErrors, setPwErrors] = useState<{
    current?: string;
    next?: string;
    confirm?: string;
    form?: string;
  }>({});
  const [pwLoading, setPwLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setName(data.user.user_metadata?.full_name ?? "");
        setEmail(data.user.email ?? "");
      }
    });
  }, []);

  async function saveName() {
    if (!name.trim()) {
      setNameError("Name cannot be empty");
      return;
    }
    setNameLoading(true);
    setNameError("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ data: { full_name: name } });
    setNameLoading(false);
    if (error) {
      setNameError(error.message);
    } else {
      setProfileSuccess("Profile updated successfully.");
    }
  }

  async function changePassword(e: React.SyntheticEvent) {
    e.preventDefault();
    const errs: typeof pwErrors = {};
    if (!passwords.current) {
      errs.current = "Required";
    }
    if (!passwords.next || passwords.next.length < 8) {
      errs.next = "Must be at least 8 characters";
    }
    if (passwords.next !== passwords.confirm) {
      errs.confirm = "Passwords do not match";
    }
    if (Object.keys(errs).length) {
      setPwErrors(errs);
      return;
    }
    setPwLoading(true);
    setPwErrors({});
    const supabase = createClient();
    // Verify current password before updating
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: passwords.current,
    });
    if (signInError) {
      setPwLoading(false);
      setPwErrors({ current: "Incorrect password" });
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: passwords.next });
    setPwLoading(false);
    if (error) {
      setPwErrors({ form: error.message });
    } else {
      setSuccessMessage("Password updated successfully.");
      setPasswords({ current: "", next: "", confirm: "" });
    }
  }

  const deleteAccount = useCallback(async () => {
    if (
      !confirm(
        "Are you sure you want to delete your account? Your subscription will be cancelled and all your data will be permanently removed. This action cannot be undone."
      )
    ) {
      return;
    }
    setDeleteLoading(true);
    const res = await fetch("/api/account", { method: "DELETE" });
    if (!res.ok) {
      const { error } = await res.json();
      alert(error ?? "Something went wrong. Please try again.");
      setDeleteLoading(false);
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }, [router]);

  return (
    <div className="min-h-screen" style={{ background: "var(--gray-50)" }}>
      <Navbar />

      <div className="mx-auto px-6 py-12" style={{ maxWidth: "900px" }}>
        {/* Page header */}
        <div className="mb-12">
          <h1 className="font-bold mb-1" style={{ fontSize: "2rem", color: "var(--gray-900)" }}>
            Settings
          </h1>
          <p style={{ color: "var(--gray-600)" }}>Manage your account and preferences</p>
        </div>

        {/* Profile */}
        <SettingsSection title="Profile" description="Update your personal information">
          <SuccessBanner message={profileSuccess} onHide={() => setProfileSuccess(null)} />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveName();
            }}
            noValidate
            className="flex flex-col gap-6"
            style={{ maxWidth: "400px" }}
          >
            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError("");
              }}
              error={nameError}
              autoComplete="name"
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              readOnly
              style={{ opacity: 0.6, cursor: "not-allowed" }}
            />
            <div>
              <Button variant="primary" type="submit" disabled={nameLoading}>
                {nameLoading ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </form>
        </SettingsSection>

        {/* Security */}
        <SettingsSection title="Security" description="Manage your password and account security">
          <SuccessBanner message={successMessage} onHide={() => setSuccessMessage(null)} />
          <ErrorBanner
            message={pwErrors.form ?? null}
            onHide={() => setPwErrors((prev) => ({ ...prev, form: undefined }))}
          />
          <form
            onSubmit={changePassword}
            noValidate
            className="flex flex-col gap-6"
            style={{ maxWidth: "400px" }}
          >
            <Input
              label="Current Password"
              type="password"
              value={passwords.current}
              onChange={(e) => {
                setPasswords((p) => ({ ...p, current: e.target.value }));
                if (pwErrors.current) {
                  setPwErrors((p) => ({ ...p, current: undefined }));
                }
              }}
              error={pwErrors.current}
              autoComplete="current-password"
            />
            <Input
              label="New Password"
              type="password"
              value={passwords.next}
              onChange={(e) => {
                setPasswords((p) => ({ ...p, next: e.target.value }));
                if (pwErrors.next) {
                  setPwErrors((p) => ({ ...p, next: undefined }));
                }
              }}
              error={pwErrors.next}
              autoComplete="new-password"
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={passwords.confirm}
              onChange={(e) => {
                setPasswords((p) => ({ ...p, confirm: e.target.value }));
                if (pwErrors.confirm) {
                  setPwErrors((p) => ({ ...p, confirm: undefined }));
                }
              }}
              error={pwErrors.confirm}
              autoComplete="new-password"
            />
            <div>
              <Button variant="primary" type="submit" disabled={pwLoading}>
                {pwLoading ? "Updating…" : "Update Password"}
              </Button>
            </div>
          </form>
        </SettingsSection>

        {/* Subscription */}
        <SubscriptionSection />

        {/* Danger zone */}
        <SettingsSection
          title="Danger Zone"
          description="Irreversible actions for your account"
          danger
        >
          <SettingsItem
            label="Delete Account"
            description="Permanently delete your account, cancel your subscription, and remove all your data. This action cannot be undone."
          >
            <Button variant="danger" type="button" onClick={deleteAccount} disabled={deleteLoading}>
              {deleteLoading ? "Deleting…" : "Delete Account"}
            </Button>
          </SettingsItem>
        </SettingsSection>
      </div>
      <Footer />
    </div>
  );
}

/* ==================== SUBSCRIPTION SECTION ==================== */

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  premium: "Premium",
  biannual: "6-Month Plan",
};

function SubscriptionSection() {
  const [sub, setSub] = useState<UserSubscription | null>(null);
  const [payments, setPayments] = useState<ProviderPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [subRes, paymentsRes] = await Promise.all([
        fetch("/api/subscription"),
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
    if (
      !confirm(
        "Are you sure you want to cancel your subscription? You'll keep access until the end of your current billing period."
      )
    ) {
      return;
    }
    setCancelling(true);
    setCancelError(null);
    const res = await fetch("/api/subscription/cancel", { method: "POST" });
    setCancelling(false);
    if (res.ok) {
      setCancelSuccess(
        "Your subscription has been cancelled. Access continues until the end of your billing period."
      );
      setSub((prev) => (prev ? { ...prev, cancelAtPeriodEnd: true } : prev));
    } else {
      const data = await res.json();
      setCancelError(data.error ?? "Failed to cancel subscription. Please try again.");
    }
  }

  const planLabel = sub ? (PLAN_LABELS[sub.planId] ?? sub.planId) : "Free";
  const isPaid = sub && sub.planId !== "free";
  const periodEnd = sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : null;

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
            label="Current Plan"
            description={
              isPaid && periodEnd
                ? sub.cancelAtPeriodEnd
                  ? `Cancels on ${periodEnd.toLocaleDateString("en-NL", { day: "numeric", month: "long", year: "numeric" })}`
                  : `Active until ${periodEnd.toLocaleDateString("en-NL", { day: "numeric", month: "long", year: "numeric" })}`
                : "Access to 1 free exam per skill"
            }
          >
            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold"
                style={{
                  background: isPaid ? "var(--green-50)" : "var(--gray-100)",
                  color: isPaid ? "var(--green-900)" : "var(--gray-600)",
                }}
              >
                {planLabel}
              </span>
              {isPaid && !sub.cancelAtPeriodEnd && (
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling ? "Cancelling…" : "Cancel plan"}
                </Button>
              )}
              {!isPaid && (
                <Button href="/pricing" variant="primary">
                  Upgrade
                </Button>
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
                className="rounded-xl overflow-hidden border"
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
                        className="text-right px-4 py-3 font-medium"
                        style={{ color: "var(--gray-500)" }}
                      >
                        Amount
                      </th>
                      <th
                        className="text-right px-4 py-3 font-medium"
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
                            : "—"}
                        </td>
                        <td className="px-4 py-3" style={{ color: "var(--gray-700)" }}>
                          {p.description}
                        </td>
                        <td className="px-4 py-3 text-right" style={{ color: "var(--gray-700)" }}>
                          {(p.amountCents / 100).toLocaleString("nl-NL", {
                            style: "currency",
                            currency: p.currency,
                          })}
                        </td>
                        <td className="px-4 py-3 text-right">
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

/* ==================== SUB-COMPONENTS ==================== */

function SettingsSection({
  title,
  description,
  children,
  danger = false,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-8 border mb-8"
      style={{ background: "white", borderColor: "var(--gray-200)" }}
    >
      <div className="mb-8">
        <h2
          className="font-semibold mb-1"
          style={{
            fontSize: "1.25rem",
            color: danger ? "var(--red)" : "var(--gray-900)",
          }}
        >
          {title}
        </h2>
        <p className="text-sm" style={{ color: "var(--gray-600)" }}>
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}

function SettingsItem({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 py-6 border-b last:border-b-0 first:pt-0"
      style={{ borderColor: "var(--gray-100)" }}
    >
      <div className="flex-1">
        <p
          className="font-semibold mb-0.5"
          style={{ fontSize: "0.9375rem", color: "var(--gray-900)" }}
        >
          {label}
        </p>
        <p className="text-sm" style={{ color: "var(--gray-600)", lineHeight: 1.6 }}>
          {description}
        </p>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}
