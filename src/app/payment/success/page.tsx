"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircleIcon, SparklesIcon, XCircleIcon } from "@heroicons/react/20/solid";
import { Button } from "@/components/ui/Button";
import { analytics } from "@/lib/analytics";
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
        const res = await fetch("/api/payments/subscription");
        if (res.ok) {
          const sub = await res.json();
          if (sub.planId) {
            analytics.checkoutCompleted(sub.planId);
            setReady(true);
            return;
          }
        }
      } catch {
        // ignore transient errors, keep polling
      }

      attempts += 1;
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
      <div className="flex items-center justify-center py-20 px-4 sm:px-6">
        <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-700">
              <XCircleIcon className="h-8 w-8" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900">
                Payment received, still processing
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                We&apos;re finalizing your subscription in the background. If your plan doesn&apos;t
                appear shortly, refresh this page or go to your dashboard.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left">
              <p className="text-sm font-semibold text-slate-900">What to expect</p>
              <p className="mt-2 text-sm text-slate-500">
                Your payment is complete. The final activation can take a few seconds, and
                we&apos;ll confirm as soon as it&apos;s ready.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left">
              <p className="text-sm font-semibold text-slate-900">Next step</p>
              <p className="mt-2 text-sm text-slate-500">
                Check your dashboard for plan access, then jump into exams and AI feedback.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button variant="primary" fullWidth onClick={() => router.push("/dashboard")}>
              Go to dashboard
            </Button>
            <Button href="/pricing" variant="outline" fullWidth>
              Review plans
            </Button>
          </div>
        </div>
      </div>
    );
  } else if (!ready) {
    content = (
      <div className="flex items-center justify-center py-20 px-4 sm:px-6">
        <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-current border-t-transparent" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900">Activating your subscription…</p>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                We&apos;re checking your payment status and updating your account. This should only
                take a few seconds.
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <SparklesIcon className="h-5 w-5 text-emerald-700" />
              <p className="text-sm font-semibold text-slate-900">Ready soon</p>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Once we confirm your plan, you can start using all exam content right away.
            </p>
          </div>
        </div>
      </div>
    );
  } else {
    content = (
      <div className="flex items-center justify-center py-20 px-4 sm:px-6">
        <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircleIcon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">You&apos;re all set</h1>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Your subscription is active. You now have access to every exam type, exam review,
                and AI feedback.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left">
              <p className="text-sm font-semibold text-slate-900">Jump into practice</p>
              <p className="mt-3 text-sm text-slate-500">
                Launch your next exam from the dashboard and monitor progress across every skill.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left">
              <p className="text-sm font-semibold text-slate-900">Choose your next focus</p>
              <p className="mt-2 text-sm text-slate-500">
                Continue with the next exam or review recent results to improve faster.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button variant="primary" fullWidth onClick={() => router.push("/dashboard")}>
              Go to dashboard
            </Button>
            <Button href="/pricing" variant="outline" fullWidth>
              View plans
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">{content}</main>
      <Footer />
    </div>
  );
}
