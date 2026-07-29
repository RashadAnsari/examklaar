"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";

/**
 * Catches render and data errors anywhere below the root layout. Without it an
 * unhandled error falls through to Next's own screen, which in production is an
 * unstyled page with no way back into the app.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The digest is the only handle on the real message: Next strips the rest
    // from production client bundles so server details cannot leak. Send it to
    // an error reporting service here if one is added later.
    console.error("[error]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--gray-50)" }}>
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="text-center" style={{ maxWidth: "520px" }}>
          <h1 className="font-bold" style={{ fontSize: "1.75rem", color: "var(--gray-900)" }}>
            Something went wrong
          </h1>
          <p
            className="mt-3 leading-relaxed"
            style={{ fontSize: "1.125rem", color: "var(--gray-500)" }}
          >
            The page could not be loaded. Trying again often fixes it.
          </p>
          {error.digest && (
            <p className="mt-4 text-sm" style={{ color: "var(--gray-400)" }}>
              Reference: <code>{error.digest}</code>
            </p>
          )}

          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={reset}>Try again</Button>
            <Link href="/" className="btn btn-outline">
              Go to homepage
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
