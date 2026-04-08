"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/utils/supabase/client";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const next: typeof errors = {};
    if (!email || !email.includes("@")) {
      next.email = "Please enter a valid email";
    }
    if (!password) {
      next.password = "Password is required";
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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setErrors({ form: error.message });
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 py-12"
      style={{ background: "var(--gray-50)" }}
    >
      <div className="w-full" style={{ maxWidth: "440px" }}>
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="logo flex items-center gap-2.5" style={{ fontSize: "1.5rem" }}>
            <Image src="/examklaar-logo.svg" alt="" width={44} height={44} priority />
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

          <ErrorBanner
            message={errors.form ?? null}
            onHide={() => setErrors((prev) => ({ ...prev, form: undefined }))}
          />
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              error={errors.email}
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              error={errors.password}
              autoComplete="current-password"
            />

            <Button type="submit" variant="primary" fullWidth disabled={loading}>
              {loading ? "Logging in…" : "Log In"}
            </Button>
          </form>

          <div className="text-right mt-3">
            <Link
              href="/forgot-password"
              className="text-sm font-medium"
              style={{ color: "var(--green-900)" }}
            >
              Forgot password?
            </Link>
          </div>

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
            <ArrowLeftIcon style={{ width: 16, height: 16 }} />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
