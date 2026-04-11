"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const MAX_ATTEMPTS = 10;
const POLL_INTERVAL_MS = 1500;

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let attempts = 0;

    async function poll() {
      try {
        const res = await fetch("/api/subscription");
        if (res.ok) {
          const sub = await res.json();
          if (sub.planId !== "free") {
            setReady(true);
            return;
          }
        }
      } catch {
        // ignore transient errors, keep polling
      }

      attempts++;
      if (attempts >= MAX_ATTEMPTS) {
        setFailed(true);
        return;
      }

      setTimeout(poll, POLL_INTERVAL_MS);
    }

    poll();
  }, []);

  let content;

  if (failed) {
    content = (
      <div
        className="flex items-center justify-center py-20"
        style={{ background: "var(--gray-50)" }}
      >
        <div className="text-center px-6" style={{ maxWidth: "480px" }}>
          <p className="font-semibold mb-2" style={{ color: "var(--gray-900)" }}>
            Payment received — still processing
          </p>
          <p className="text-sm mb-6" style={{ color: "var(--gray-500)" }}>
            Your subscription is being activated. If it doesn&apos;t appear in a few minutes, please
            contact support.
          </p>
          <Button variant="primary" onClick={() => router.push("/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  } else if (!ready) {
    content = (
      <div
        className="flex items-center justify-center py-20"
        style={{ background: "var(--gray-50)" }}
      >
        <div className="text-center px-6">
          <div
            className="mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ width: 48, height: 48, background: "var(--green-50)" }}
          >
            <div
              className="rounded-full border-2 border-t-transparent animate-spin"
              style={{
                width: 24,
                height: 24,
                borderColor: "var(--green-700)",
                borderTopColor: "transparent",
              }}
            />
          </div>
          <p className="font-medium" style={{ color: "var(--gray-700)" }}>
            Activating your subscription…
          </p>
        </div>
      </div>
    );
  } else {
    content = (
      <div
        className="flex items-center justify-center py-20"
        style={{ background: "var(--gray-50)" }}
      >
        <div className="text-center px-6" style={{ maxWidth: "480px" }}>
          <div className="flex justify-center mb-6">
            <CheckCircleIcon style={{ width: 56, height: 56, color: "var(--green-700)" }} />
          </div>
          <h1 className="font-bold mb-2" style={{ fontSize: "1.75rem", color: "var(--gray-900)" }}>
            You&apos;re all set
          </h1>
          <p className="mb-8" style={{ color: "var(--gray-500)" }}>
            Your subscription is active. You now have access to all exams and AI feedback.
          </p>
          <Button variant="primary" onClick={() => router.push("/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--gray-50)" }}>
      <Navbar />
      <main className="flex-1">{content}</main>
      <Footer />
    </div>
  );
}
