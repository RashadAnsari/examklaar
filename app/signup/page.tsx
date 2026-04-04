"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    terms?: string;
  }>({});

  function validate() {
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = "Please enter your name";
    if (!form.email || !form.email.includes("@")) next.email = "Please enter a valid email";
    if (!form.password || form.password.length < 8)
      next.password = "Password must be at least 8 characters";
    if (!termsAccepted) next.terms = "You must accept the terms to continue";
    return next;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = validate();
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    // In a real app this would call a registration API
    router.push("/dashboard");
  }

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 py-12"
      style={{ background: "var(--gray-50)" }}
    >
      <div className="w-full" style={{ maxWidth: "440px" }}>
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="logo" style={{ fontSize: "2rem" }}>
            ExamKlaar
          </Link>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: "3rem" }}>
          <h1 className="font-bold mb-1" style={{ fontSize: "1.875rem", color: "var(--gray-900)" }}>
            Create your account
          </h1>
          <p className="mb-8" style={{ color: "var(--gray-600)" }}>
            Start practicing for free
          </p>

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
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    if (errors.terms) setErrors((prev) => ({ ...prev, terms: undefined }));
                  }}
                  className="mt-0.5 cursor-pointer"
                  style={{ accentColor: "var(--green-900)" }}
                />
                <span className="text-sm" style={{ color: "var(--gray-600)", lineHeight: 1.5 }}>
                  I agree to the{" "}
                  <Link href="#" className="font-medium" style={{ color: "var(--green-900)" }}>
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="font-medium" style={{ color: "var(--green-900)" }}>
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.terms && <p className="input-error-msg">{errors.terms}</p>}
            </div>

            <Button type="submit" variant="primary" fullWidth>
              Create Account
            </Button>
          </form>

          <div className="divider">
            <span>or</span>
          </div>

          <p className="text-center text-sm" style={{ color: "var(--gray-600)" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold" style={{ color: "var(--green-900)" }}>
              Log in
            </Link>
          </p>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm inline-flex items-center gap-2"
            style={{ color: "var(--gray-600)" }}
          >
            <ArrowLeftIcon />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 19l-7-7m0 0l7-7m-7 7h18"
      />
    </svg>
  );
}
