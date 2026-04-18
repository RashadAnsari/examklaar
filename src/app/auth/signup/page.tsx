"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/utils/supabase/client";
import { analytics } from "@/lib/analytics";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { AuthCard } from "@/components/ui/AuthCard";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    terms?: string;
    form?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  function validate() {
    const next: typeof errors = {};
    if (!form.name.trim()) {
      next.name = "Please enter your name";
    }
    if (!form.email || !form.email.includes("@")) {
      next.email = "Please enter a valid email";
    }
    if (!form.password || form.password.length < 8) {
      next.password = "Password must be at least 8 characters";
    }
    if (!termsAccepted) {
      next.terms = "You must accept the terms to continue";
    }
    return next;
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    const next = validate();
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    setLoading(true);
    setErrors({});
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) {
      setErrors({ form: error.message });
      return;
    }
    analytics.signUp();
    // If session is null, Supabase requires email confirmation
    if (data.session) {
      router.push("/dashboard");
    } else {
      setEmailSent(true);
    }
  }

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  return (
    <AuthCard backLink>
      {emailSent ? (
        <div className="text-center flex flex-col gap-4">
          <h1 className="font-bold" style={{ fontSize: "1.875rem", color: "var(--gray-900)" }}>
            Check your email
          </h1>
          <p style={{ color: "var(--gray-600)" }}>
            We sent a confirmation link to <strong>{form.email}</strong>. Click it to activate your
            account.
          </p>
        </div>
      ) : (
        <>
          <h1 className="font-bold mb-1" style={{ fontSize: "1.875rem", color: "var(--gray-900)" }}>
            Create your account
          </h1>
          <p className="mb-8" style={{ color: "var(--gray-600)" }}>
            Start practicing for free
          </p>

          <ErrorBanner
            message={errors.form ?? null}
            onHide={() => setErrors((prev) => ({ ...prev, form: undefined }))}
          />
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
            <Input
              label="Full name"
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              error={errors.name}
              autoComplete="name"
            />

            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              error={errors.email}
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              placeholder="Create a password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              hint="Must be at least 8 characters with a mix of letters and numbers"
              error={errors.password}
              autoComplete="new-password"
            />

            {/* Terms checkbox */}
            <div className="flex flex-col gap-1">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    if (errors.terms) {
                      setErrors((prev) => ({ ...prev, terms: undefined }));
                    }
                  }}
                  className="cursor-pointer flex-shrink-0"
                  style={{ accentColor: "var(--green-900)" }}
                />
                <span className="text-sm" style={{ color: "var(--gray-600)", lineHeight: 1.5 }}>
                  I agree to the{" "}
                  <Link
                    href="/terms-and-conditions"
                    className="font-medium"
                    style={{ color: "var(--green-900)" }}
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy-policy"
                    className="font-medium"
                    style={{ color: "var(--green-900)" }}
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.terms && <p className="input-error-msg">{errors.terms}</p>}
            </div>

            <Button type="submit" variant="primary" fullWidth disabled={loading}>
              {loading ? "Creating account…" : "Create Account"}
            </Button>
          </form>

          <div className="divider">
            <span>or</span>
          </div>

          <p className="text-center text-sm" style={{ color: "var(--gray-600)" }}>
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-semibold"
              style={{ color: "var(--green-900)" }}
            >
              Log in
            </Link>
          </p>
        </>
      )}
    </AuthCard>
  );
}
