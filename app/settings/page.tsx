"use client";

import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: "Rashad Ansari",
    email: "rashad@example.com",
  });

  const [prefs, setPrefs] = useState({
    language: "en",
    examLevel: "a2",
    emailNotifications: true,
    studyReminders: true,
  });

  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  function updatePref<K extends keyof typeof prefs>(key: K, value: (typeof prefs)[K]) {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--gray-50)" }}>
      {/* Navbar */}
      <nav className="nav">
        <div className="nav-container">
          <Link href="/" className="logo">
            ExamKlaar
          </Link>
          <Link href="/dashboard" className="nav-link">
            Back to Dashboard
          </Link>
        </div>
      </nav>

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
          <div className="flex flex-col gap-6">
            <Input
              label="Full Name"
              type="text"
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              autoComplete="name"
            />
            <Input
              label="Email Address"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              autoComplete="email"
            />
            <div>
              <Button variant="primary" type="button">
                Save Changes
              </Button>
            </div>
          </div>
        </SettingsSection>

        {/* Subscription */}
        <SettingsSection title="Subscription" description="Manage your plan and billing">
          <div
            className="rounded-xl p-6 border-2 mb-6"
            style={{ background: "var(--gray-50)", borderColor: "var(--gray-200)" }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
              <span
                className="font-semibold"
                style={{ fontSize: "1.125rem", color: "var(--gray-900)" }}
              >
                Free Plan
              </span>
              <span
                className="px-3 py-1 text-xs font-semibold uppercase rounded-full"
                style={{ background: "var(--green-50)", color: "var(--green-900)" }}
              >
                Active
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--gray-600)" }}>
              {"You're currently on the free plan with access to basic practice exams."}
              <br />
              Upgrade to Premium for unlimited exams and AI feedback.
            </p>
          </div>
          <Button href="/pricing" variant="primary">
            Upgrade to Premium
          </Button>
        </SettingsSection>

        {/* Preferences */}
        <SettingsSection title="Preferences" description="Customize your learning experience">
          <SettingsItem
            label="Interface Language"
            description="Choose the language for the app interface"
          >
            <select
              value={prefs.language}
              onChange={(e) => updatePref("language", e.target.value)}
              className="input"
              style={{ width: "auto", minWidth: "200px" }}
            >
              <option value="nl">Nederlands</option>
              <option value="en">English</option>
              <option value="fa">فارسی (Farsi)</option>
              <option value="ar">العربية (Arabic)</option>
              <option value="tr">Türkçe (Turkish)</option>
            </select>
          </SettingsItem>

          <SettingsItem
            label="Target Exam Level"
            description="Select your target inburgering exam level"
          >
            <select
              value={prefs.examLevel}
              onChange={(e) => updatePref("examLevel", e.target.value)}
              className="input"
              style={{ width: "auto", minWidth: "200px" }}
            >
              <option value="a2">A2 (Standard)</option>
              <option value="b1">B1 (Advanced)</option>
            </select>
          </SettingsItem>

          <Toggle
            checked={prefs.emailNotifications}
            onChange={(v) => updatePref("emailNotifications", v)}
            label="Email Notifications"
            description="Receive updates about your progress and new features"
          />

          <div className="mt-6">
            <Toggle
              checked={prefs.studyReminders}
              onChange={(v) => updatePref("studyReminders", v)}
              label="Study Reminders"
              description="Get daily reminders to practice"
            />
          </div>
        </SettingsSection>

        {/* Security */}
        <SettingsSection title="Security" description="Manage your password and account security">
          <SettingsItem label="Password" description="Last changed 2 months ago">
            <Button variant="outline" type="button">
              Change Password
            </Button>
          </SettingsItem>

          {/* Password change form (hidden by default, shown here for completeness) */}
          <div className="mt-6 flex flex-col gap-4" style={{ maxWidth: "400px" }}>
            <Input
              label="Current Password"
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
              autoComplete="current-password"
            />
            <Input
              label="New Password"
              type="password"
              value={passwords.next}
              onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))}
              autoComplete="new-password"
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
              autoComplete="new-password"
            />
            <div>
              <Button variant="primary" type="button">
                Update Password
              </Button>
            </div>
          </div>
        </SettingsSection>

        {/* Danger zone */}
        <SettingsSection
          title="Danger Zone"
          description="Irreversible actions for your account"
          danger
        >
          <SettingsItem
            label="Delete Account"
            description="Permanently delete your account and all your data. This action cannot be undone."
          >
            <Button
              variant="danger"
              type="button"
              onClick={() => {
                if (
                  confirm(
                    "Are you sure you want to delete your account? This action cannot be undone."
                  )
                ) {
                  // In a real app, call the delete API
                }
              }}
            >
              Delete Account
            </Button>
          </SettingsItem>
        </SettingsSection>
      </div>
    </div>
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
      className="flex flex-col sm:flex-row justify-between items-start gap-6 py-6 border-b last:border-b-0 first:pt-0"
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
