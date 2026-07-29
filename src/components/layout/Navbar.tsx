"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { authClient } from "@/lib/auth-client";
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  Squares2X2Icon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { analytics } from "@/lib/analytics";

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
  const { data: session } = authClient.useSession();
  const user = session?.user ?? null;
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setMobileOpen(false);
      setMenuOpen(false);
    }, 0);
    return () => clearTimeout(timeout);
  }, [pathname]);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  async function signOut() {
    await authClient.signOut();
    analytics.logOut();
    router.push("/");
  }

  const userName = user?.name || user?.email || "User";
  const userInitials = user ? getInitials(userName) : "";

  return (
    <>
      <nav
        className={`sticky top-0 z-50 bg-white border-b border-[var(--gray-200)] transition-shadow duration-200 ${
          scrolled ? "shadow-sm" : "shadow-none"
        }`}
      >
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-bold text-[var(--green-900)]"
            >
              <Image src="/examklaar-logo.svg" alt="" width={34} height={34} priority />
              ExamKlaar
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/#features"
                className="text-sm font-medium text-[var(--gray-600)] transition hover:text-[var(--green-900)]"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-medium text-[var(--gray-600)] transition hover:text-[var(--green-900)]"
              >
                Pricing
              </Link>
              <Link
                href="/privacy-policy"
                className="text-sm font-medium text-[var(--gray-600)] transition hover:text-[var(--green-900)]"
              >
                Privacy
              </Link>
              <Link
                href="/terms-and-conditions"
                className="text-sm font-medium text-[var(--gray-600)] transition hover:text-[var(--green-900)]"
              >
                Terms
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  id="user-menu-button"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((open) => !open)}
                  className={`flex items-center gap-2.5 rounded-full px-3 py-1.5 transition-colors ${
                    menuOpen ? "bg-[var(--gray-200)]" : "bg-[var(--gray-100)]"
                  }`}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--green-900)] text-xs font-semibold text-white">
                    {userInitials}
                  </div>
                  <span className="text-sm font-medium text-[var(--gray-800)]">{userName}</span>
                  <ChevronDownIcon
                    className={`h-3.5 w-3.5 text-[var(--gray-500)] transition-transform duration-200 ${
                      menuOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    aria-labelledby="user-menu-button"
                    className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-[var(--gray-200)] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.1)] py-1.5"
                  >
                    <Link
                      role="menuitem"
                      href="/dashboard"
                      className={`flex items-center gap-2.5 px-4 py-2 text-sm transition ${
                        pathname === "/dashboard"
                          ? "bg-[var(--green-50)] text-[var(--green-900)]"
                          : "text-[var(--gray-700)] hover:bg-[var(--gray-50)]"
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      <Squares2X2Icon className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link
                      role="menuitem"
                      href="/settings"
                      className={`flex items-center gap-2.5 px-4 py-2 text-sm transition ${
                        pathname === "/settings"
                          ? "bg-[var(--green-50)] text-[var(--green-900)]"
                          : "text-[var(--gray-700)] hover:bg-[var(--gray-50)]"
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      <Cog6ToothIcon className="h-4 w-4" />
                      Settings
                    </Link>
                    <div className="my-1 h-px bg-[var(--gray-100)]" />
                    <button
                      role="menuitem"
                      type="button"
                      onClick={signOut}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-[var(--red)] transition hover:bg-[var(--red-light)]"
                    >
                      <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-[var(--gray-600)] transition hover:text-[var(--green-900)]"
                >
                  Log in
                </Link>
                <Button href="/auth/signup" variant="primary" size="sm">
                  Start Practicing
                </Button>
              </>
            )}
          </div>

          <button
            type="button"
            className={`md:hidden flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
              mobileOpen ? "bg-[var(--gray-100)]" : "bg-transparent"
            }`}
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <XMarkIcon className="h-5 w-5 text-[var(--gray-700)]" />
            ) : (
              <Bars3Icon className="h-5 w-5 text-[var(--gray-700)]" />
            )}
          </button>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-40 md:hidden bg-black/30 backdrop-blur-sm transition-opacity duration-200 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
        onClick={() => setMobileOpen(false)}
      />

      <div
        className={`fixed top-0 right-0 z-50 flex h-full w-72 flex-col bg-white shadow-2xl transition-transform duration-200 md:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!mobileOpen}
      >
        <div className="flex items-center justify-between border-b border-[var(--gray-200)] px-5 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold text-[var(--green-900)]"
          >
            <Image src="/examklaar-logo.svg" alt="" width={30} height={30} />
            ExamKlaar
          </Link>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--gray-100)]"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <XMarkIcon className="h-4.5 w-4.5 text-[var(--gray-600)]" />
          </button>
        </div>

        <nav className="flex flex-col flex-1 gap-0.5 overflow-y-auto px-3 py-3">
          {user && (
            <>
              <MobileNavLink href="/dashboard">Dashboard</MobileNavLink>
              <MobileNavLink href="/settings">Settings</MobileNavLink>
              <div className="my-2 h-px bg-[var(--gray-100)]" />
            </>
          )}
          <MobileNavLink href="/#features">Features</MobileNavLink>
          <MobileNavLink href="/pricing">Pricing</MobileNavLink>
          <MobileNavLink href="/privacy-policy">Privacy</MobileNavLink>
          <MobileNavLink href="/terms-and-conditions">Terms</MobileNavLink>
        </nav>

        <div className="border-t border-[var(--gray-200)] px-4 py-5">
          {user ? (
            <>
              <div className="flex items-center gap-3 rounded-xl bg-[var(--gray-50)] px-3 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--green-900)] text-sm font-semibold text-white">
                  {userInitials}
                </div>
                <p className="truncate text-sm font-semibold text-[var(--gray-900)]">{userName}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  signOut();
                }}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--red-light)] px-4 py-2.5 text-sm font-medium text-[var(--red)] transition hover:bg-[var(--red)]/10"
              >
                <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="flex w-full items-center justify-center rounded-lg border border-[var(--gray-200)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--gray-700)] transition hover:border-[var(--green-900)] hover:text-[var(--green-900)]"
              >
                Log in
              </Link>
              <Link
                href="/auth/signup"
                className="mt-2 flex w-full items-center justify-center rounded-lg bg-[var(--green-900)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--green-700)]"
              >
                Start Practicing
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function MobileNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        isActive ? "bg-[var(--green-50)] text-[var(--green-900)]" : "text-[var(--gray-700)]"
      }`}
    >
      {children}
    </Link>
  );
}
