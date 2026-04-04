"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface NavbarProps {
  variant?: "marketing" | "dashboard";
}

export function Navbar({ variant = "marketing" }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  const userName = user?.user_metadata?.full_name ?? user?.email ?? "User";
  const userInitials = user ? getInitials(userName) : "";

  const profilePill = (
    <button
      onClick={() => setMenuOpen((o) => !o)}
      className="flex items-center gap-3 px-4 py-2 rounded-full cursor-pointer"
      style={{ background: "var(--gray-100)" }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
        style={{ background: "var(--green-900)" }}
      >
        {userInitials}
      </div>
      <span className="text-sm font-medium" style={{ color: "var(--gray-900)" }}>
        {userName}
      </span>
    </button>
  );

  return (
    <nav className="nav">
      <div className="nav-container">
        <Link href="/" className="logo">
          ExamKlaar
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {variant === "dashboard" ? (
            <Link href="/pricing" className="nav-link">
              Upgrade
            </Link>
          ) : (
            <>
              <Link href="/#features" className="nav-link">
                Features
              </Link>
              <Link href="/pricing" className="nav-link">
                Pricing
              </Link>
            </>
          )}

          {user ? (
            <div className="relative" ref={menuRef}>
              {profilePill}
              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-44 rounded-xl border py-1 z-50"
                  style={{
                    background: "white",
                    borderColor: "var(--gray-200)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  }}
                >
                  {pathname !== "/dashboard" && (
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm"
                      style={{ color: "var(--gray-700)" }}
                      onClick={() => setMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  {pathname !== "/settings" && (
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm"
                      style={{ color: "var(--gray-700)" }}
                      onClick={() => setMenuOpen(false)}
                    >
                      Settings
                    </Link>
                  )}
                  <div style={{ borderTop: "1px solid var(--gray-100)", margin: "4px 0" }} />
                  <button
                    onClick={signOut}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm"
                    style={{ color: "var(--red, #dc2626)" }}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="nav-link">
                Log in
              </Link>
              <Button href="/signup" variant="primary" size="sm">
                Start Practicing
              </Button>
            </>
          )}
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
          {variant === "dashboard" ? (
            <Link href="/pricing" className="nav-link" onClick={() => setMobileOpen(false)}>
              Upgrade
            </Link>
          ) : (
            <>
              <Link href="/#features" className="nav-link" onClick={() => setMobileOpen(false)}>
                Features
              </Link>
              <Link href="/pricing" className="nav-link" onClick={() => setMobileOpen(false)}>
                Pricing
              </Link>
            </>
          )}

          {user ? (
            <>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                  style={{ background: "var(--green-900)" }}
                >
                  {userInitials}
                </div>
                <span className="text-sm font-medium" style={{ color: "var(--gray-900)" }}>
                  {userName}
                </span>
              </div>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  signOut();
                }}
                className="text-left text-sm font-medium"
                style={{ color: "var(--red, #dc2626)" }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link" onClick={() => setMobileOpen(false)}>
                Log in
              </Link>
              <Button href="/signup" variant="primary" fullWidth>
                Start Practicing
              </Button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
