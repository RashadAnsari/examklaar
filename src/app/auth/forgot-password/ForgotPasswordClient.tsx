"use client";

import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { authClient, authErrorMessage } from "@/lib/auth-client";
import { analytics } from "@/lib/analytics";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { AuthCard } from "@/components/ui/AuthCard";

export function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setEmailError("Please enter a valid email");
      return;
    }
    setLoading(true);
    setFormError(null);
    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/auth/reset-password",
    });
    setLoading(false);
    if (error) {
      setFormError(authErrorMessage(error));
      return;
    }
    analytics.passwordReset();
    setSent(true);
  }

  return (
    <AuthCard>
      {sent ? (
        <div className="text-center flex flex-col gap-4">
          <h1 className="font-bold" style={{ fontSize: "1.875rem", color: "var(--gray-900)" }}>
            Check your email
          </h1>
          <p style={{ color: "var(--gray-600)" }}>
            We sent a password reset link to <strong>{email}</strong>. Click it to choose a new
            password.
          </p>
          <Link
            href="/auth/login"
            className="text-sm font-medium"
            style={{ color: "var(--green-900)" }}
          >
            Back to log in
          </Link>
        </div>
      ) : (
        <>
          <h1 className="font-bold mb-1" style={{ fontSize: "1.875rem", color: "var(--gray-900)" }}>
            Forgot password?
          </h1>
          <p className="mb-8" style={{ color: "var(--gray-600)" }}>
            Enter your email and we&apos;ll send you a reset link.
          </p>

          <ErrorBanner message={formError} onHide={() => setFormError(null)} />

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              error={emailError}
              autoComplete="email"
            />
            <Button type="submit" variant="primary" fullWidth disabled={loading}>
              {loading ? "Sending…" : "Send Reset Link"}
            </Button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: "var(--gray-600)" }}>
            <Link
              href="/auth/login"
              className="font-semibold"
              style={{ color: "var(--green-900)" }}
            >
              Back to log in
            </Link>
          </p>
        </>
      )}
    </AuthCard>
  );
}
