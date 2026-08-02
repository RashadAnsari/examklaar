"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { authClient, authErrorMessage } from "@/lib/auth-client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SuccessBanner } from "@/components/ui/SuccessBanner";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { SettingsSection } from "./SettingsSection";
import { SubscriptionSection } from "./SubscriptionSection";

export function SettingsClient() {
  const { data: session } = authClient.useSession();
  // null until the field is edited, so it shows the session name once it loads.
  const [editedName, setEditedName] = useState<string | null>(null);
  const name = editedName ?? session?.user.name ?? "";
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

  async function saveName() {
    if (!name.trim()) {
      setNameError("Name cannot be empty");
      return;
    }
    setNameLoading(true);
    setNameError("");
    const { error } = await authClient.updateUser({ name });
    setNameLoading(false);
    if (error) {
      setNameError(authErrorMessage(error));
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
    const { error } = await authClient.changePassword({
      currentPassword: passwords.current,
      newPassword: passwords.next,
      revokeOtherSessions: true,
    });
    setPwLoading(false);
    if (error) {
      setPwErrors({ form: authErrorMessage(error) });
    } else {
      setSuccessMessage("Password updated successfully.");
      setPasswords({ current: "", next: "", confirm: "" });
    }
  }

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
                setEditedName(e.target.value);
                setNameError("");
              }}
              error={nameError}
              autoComplete="name"
            />
            <Input
              label="Email Address"
              type="email"
              value={session?.user.email ?? ""}
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
      </div>
      <Footer />
    </div>
  );
}
