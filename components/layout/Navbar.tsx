"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

const LANGUAGES = ["NL", "EN", "فا", "AR"];

export function Navbar() {
  const [activeLang, setActiveLang] = useState("NL");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="nav">
      <div className="nav-container">
        <Link href="/" className="logo">
          ExamKlaar
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/#features" className="nav-link">
            Features
          </Link>
          <Link href="/pricing" className="nav-link">
            Pricing
          </Link>

          {/* Language switcher */}
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: "var(--gray-100)" }}>
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className="px-3 py-1 rounded-md text-sm font-medium transition-all"
                style={{
                  background: activeLang === lang ? "white" : "transparent",
                  color: activeLang === lang ? "var(--green-900)" : "var(--gray-600)",
                  boxShadow: activeLang === lang ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                }}
              >
                {lang}
              </button>
            ))}
          </div>

          <Link href="/login" className="nav-link">
            Log in
          </Link>
          <Button href="/signup" variant="primary" size="sm">
            Start Practicing
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-t px-6 py-4 flex flex-col gap-4"
          style={{ borderColor: "var(--gray-200)", background: "white" }}
        >
          <Link href="/#features" className="nav-link" onClick={() => setMobileOpen(false)}>
            Features
          </Link>
          <Link href="/pricing" className="nav-link" onClick={() => setMobileOpen(false)}>
            Pricing
          </Link>
          <Link href="/login" className="nav-link" onClick={() => setMobileOpen(false)}>
            Log in
          </Link>
          <Button href="/signup" variant="primary" fullWidth>
            Start Practicing
          </Button>
        </div>
      )}
    </nav>
  );
}
