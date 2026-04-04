"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function validate() {
    const next: { email?: string; password?: string } = {};
    if (!email || !email.includes("@")) next.email = "Please enter a valid email";
    if (!password) next.password = "Password is required";
    return next;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = validate();
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    // In a real app this would call an auth API
    router.push("/dashboard");
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
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
            Welcome back
          </h1>
          <p className="mb-8" style={{ color: "var(--gray-600)" }}>
            Log in to continue your exam practice
          </p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              error={errors.email}
              autoComplete="email"
            />

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                error={errors.password}
                autoComplete="current-password"
              />
              <div className="text-right mt-2">
                <Link
                  href="#"
                  className="text-sm font-medium"
                  style={{ color: "var(--green-900)" }}
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button type="submit" variant="primary" fullWidth>
              Log In
            </Button>
          </form>

          <div className="divider">
            <span>or</span>
          </div>

          <p className="text-center text-sm" style={{ color: "var(--gray-600)" }}>
            {"Don't have an account? "}
            <Link href="/signup" className="font-semibold" style={{ color: "var(--green-900)" }}>
              Sign up
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
