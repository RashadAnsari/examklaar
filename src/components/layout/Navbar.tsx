"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/utils/supabase/client";
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  Squares2X2Icon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
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

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

  // Close everything on route change
  useEffect(() => {
    const t = setTimeout(() => {
      setMobileOpen(false);
      setMenuOpen(false);
    }, 0);
    return () => clearTimeout(t);
  }, [pathname]);

  // Scroll-aware shadow
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Click-outside for profile dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  const userName = user?.user_metadata?.full_name ?? user?.email ?? "User";
  const userInitials = user ? getInitials(userName) : "";

  return (
    <>
      <nav
        className="nav"
        style={{
          transition: "box-shadow var(--transition-base)",
          boxShadow: scrolled ? "0 1px 12px rgba(0,0,0,0.08)" : "none",
        }}
      >
        <div className="nav-container">
          <div className="flex items-center gap-8">
            <Link href="/" className="logo flex items-center gap-2">
              <Image src="/examklaar-logo.svg" alt="" width={34} height={34} priority />
              ExamKlaar
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/#features" className="nav-link">
                Features
              </Link>
              <Link href="/pricing" className="nav-link">
                Pricing
              </Link>
              <Link href="/privacy" className="nav-link">
                Privacy
              </Link>
              <Link href="/terms" className="nav-link">
                Terms
              </Link>
            </div>
          </div>

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center gap-8">
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full cursor-pointer transition-colors"
                  style={{
                    background: menuOpen ? "var(--gray-200)" : "var(--gray-100)",
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                    style={{ background: "var(--green-900)" }}
                  >
                    {userInitials}
                  </div>
                  <span className="text-sm font-medium" style={{ color: "var(--gray-800)" }}>
                    {userName}
                  </span>
                  <ChevronDownIcon
                    style={{
                      width: 14,
                      height: 14,
                      color: "var(--gray-500)",
                      transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 200ms ease",
                      flexShrink: 0,
                    }}
                  />
                </button>

                {menuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-xl border py-1.5 z-50"
                    style={{
                      background: "white",
                      borderColor: "var(--gray-200)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                    }}
                  >
                    {pathname !== "/dashboard" && (
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm transition-colors hover:bg-neutral-50"
                        style={{ color: "var(--gray-700)" }}
                        onClick={() => setMenuOpen(false)}
                      >
                        <Squares2X2Icon style={{ width: 16, height: 16, flexShrink: 0 }} />
                        Dashboard
                      </Link>
                    )}
                    {pathname !== "/settings" && (
                      <Link
                        href="/settings"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm transition-colors hover:bg-neutral-50"
                        style={{ color: "var(--gray-700)" }}
                        onClick={() => setMenuOpen(false)}
                      >
                        <Cog6ToothIcon style={{ width: 16, height: 16, flexShrink: 0 }} />
                        Settings
                      </Link>
                    )}
                    <div style={{ borderTop: "1px solid var(--gray-100)", margin: "6px 0" }} />
                    <button
                      onClick={signOut}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm transition-colors hover:bg-danger-light"
                      style={{ color: "var(--red)" }}
                    >
                      <ArrowRightStartOnRectangleIcon
                        style={{ width: 16, height: 16, flexShrink: 0 }}
                      />
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

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg transition-colors"
            style={{ background: mobileOpen ? "var(--gray-100)" : "transparent" }}
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <XMarkIcon style={{ width: 22, height: 22, color: "var(--gray-700)" }} />
            ) : (
              <Bars3Icon style={{ width: 22, height: 22, color: "var(--gray-700)" }} />
            )}
          </button>
        </div>
      </nav>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 md:hidden"
        aria-hidden="true"
        style={{
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(2px)",
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? "auto" : "none",
          transition: "opacity 280ms ease",
        }}
        onClick={() => setMobileOpen(false)}
      />

      {/* Side drawer */}
      <div
        className="fixed top-0 right-0 h-full w-72 z-50 md:hidden flex flex-col"
        style={{
          background: "white",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
          transform: mobileOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 280ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        aria-hidden={!mobileOpen}
      >
        {/* Drawer header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "var(--gray-200)" }}
        >
          <Link href="/" className="logo text-lg flex items-center gap-2">
            <Image src="/examklaar-logo.svg" alt="" width={30} height={30} />
            ExamKlaar
          </Link>
          <button
            className="flex items-center justify-center w-9 h-9 rounded-lg"
            style={{ background: "var(--gray-100)" }}
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <XMarkIcon style={{ width: 18, height: 18, color: "var(--gray-600)" }} />
          </button>
        </div>

        {/* Drawer nav links */}
        <nav className="flex flex-col flex-1 overflow-y-auto px-3 py-3 gap-0.5">
          <MobileNavLink href="/#features">Features</MobileNavLink>
          <MobileNavLink href="/pricing">Pricing</MobileNavLink>
          <MobileNavLink href="/privacy">Privacy</MobileNavLink>
          <MobileNavLink href="/terms">Terms</MobileNavLink>

          {user && (
            <>
              <div
                style={{
                  borderTop: "1px solid var(--gray-100)",
                  margin: "8px 4px",
                }}
              />
              <MobileNavLink href="/dashboard">Dashboard</MobileNavLink>
              <MobileNavLink href="/settings">Settings</MobileNavLink>
            </>
          )}
        </nav>

        {/* Drawer footer */}
        <div
          className="px-4 py-5 border-t flex flex-col gap-3"
          style={{ borderColor: "var(--gray-200)" }}
        >
          {user ? (
            <>
              <div
                className="flex items-center gap-3 px-3 py-3 rounded-xl"
                style={{ background: "var(--gray-50)" }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                  style={{ background: "var(--green-900)" }}
                >
                  {userInitials}
                </div>
                <p
                  className="text-sm font-semibold truncate min-w-0"
                  style={{ color: "var(--gray-900)" }}
                >
                  {userName}
                </p>
              </div>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  signOut();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{ color: "var(--red)", background: "var(--red-light)" }}
              >
                <ArrowRightStartOnRectangleIcon style={{ width: 16, height: 16, flexShrink: 0 }} />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-outline btn-full">
                Log in
              </Link>
              <Link href="/signup" className="btn btn-primary btn-full">
                Start Practicing
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ==================== SUB-COMPONENTS ==================== */

function MobileNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
      style={{
        color: isActive ? "var(--green-900)" : "var(--gray-700)",
        background: isActive ? "var(--green-50)" : "transparent",
      }}
    >
      {children}
    </Link>
  );
}
