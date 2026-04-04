"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/utils/supabase/client";
import { ErrorBanner } from "@/components/ui/ErrorBanner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [passwords, setPasswords] = useState({ next: "", confirm: "" });
  const [errors, setErrors] = useState<{ next?: string; confirm?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!passwords.next || passwords.next.length < 8) errs.next = "Must be at least 8 characters";
    if (passwords.next !== passwords.confirm) errs.confirm = "Passwords do not match";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setErrors({});
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: passwords.next });
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
        <div className="text-center mb-8">
          <Link href="/" className="logo" style={{ fontSize: "2rem" }}>
            ExamKlaar
          </Link>
        </div>

        <div className="card" style={{ padding: "3rem" }}>
          <h1 className="font-bold mb-1" style={{ fontSize: "1.875rem", color: "var(--gray-900)" }}>
            Set new password
          </h1>
          <p className="mb-8" style={{ color: "var(--gray-600)" }}>
            Choose a strong password for your account.
          </p>

          <ErrorBanner
            message={errors.form ?? null}
            onHide={() => setErrors((p) => ({ ...p, form: undefined }))}
          />

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
            <Input
              label="New password"
              type="password"
              placeholder="At least 8 characters"
              value={passwords.next}
              onChange={(e) => {
                setPasswords((p) => ({ ...p, next: e.target.value }));
                if (errors.next) setErrors((p) => ({ ...p, next: undefined }));
              }}
              error={errors.next}
              autoComplete="new-password"
            />
            <Input
              label="Confirm new password"
              type="password"
              placeholder="Repeat your password"
              value={passwords.confirm}
              onChange={(e) => {
                setPasswords((p) => ({ ...p, confirm: e.target.value }));
                if (errors.confirm) setErrors((p) => ({ ...p, confirm: undefined }));
              }}
              error={errors.confirm}
              autoComplete="new-password"
            />
            <Button type="submit" variant="primary" fullWidth disabled={loading}>
              {loading ? "Updating…" : "Update Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
