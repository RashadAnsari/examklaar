"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { authClient, authErrorMessage } from "@/lib/auth-client";
import { analytics } from "@/lib/analytics";
import { SettingsSection } from "./SettingsSection";

/**
 * Lets the signed-in user erase their own account. The form stays hidden until
 * asked for and needs the password, so one stray click cannot delete anything.
 */
export function DeleteAccountSection() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function cancel() {
    setConfirming(false);
    setPassword("");
    setPasswordError("");
  }

  async function deleteAccount(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!password) {
      setPasswordError("Required");
      return;
    }
    setLoading(true);
    setPasswordError("");
    const { error } = await authClient.deleteUser({ password });
    if (error) {
      setLoading(false);
      if (error.code === "INVALID_PASSWORD") {
        setPasswordError("Incorrect password");
      } else {
        setFormError(authErrorMessage(error));
      }
      return;
    }
    // The button stays disabled: the account is gone and we are leaving.
    analytics.accountDeleted();
    router.push("/");
  }

  return (
    <SettingsSection
      title="Delete Account"
      description="Permanently delete your account and all of your data"
    >
      <p
        className="text-sm mb-6"
        style={{ color: "var(--gray-600)", lineHeight: 1.6, maxWidth: "600px" }}
      >
        Deleting your account removes your profile, exam results, answers and feedback. This cannot
        be undone.
      </p>
      {confirming ? (
        <>
          <ErrorBanner message={formError} onHide={() => setFormError(null)} />
          <form
            onSubmit={deleteAccount}
            noValidate
            className="flex flex-col gap-6"
            style={{ maxWidth: "400px" }}
          >
            <Input
              label="Confirm With Your Password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError("");
              }}
              error={passwordError}
              autoComplete="current-password"
              autoFocus
            />
            <div className="flex flex-wrap gap-3">
              <Button variant="danger" type="submit" disabled={loading}>
                {loading ? "Deleting…" : "Delete My Account"}
              </Button>
              <Button variant="outline" onClick={cancel} disabled={loading}>
                Cancel
              </Button>
            </div>
          </form>
        </>
      ) : (
        <Button variant="danger" onClick={() => setConfirming(true)}>
          Delete Account
        </Button>
      )}
    </SettingsSection>
  );
}
