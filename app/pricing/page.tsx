"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

type BillingCycle = "monthly" | "yearly";

const PLANS = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for trying out the platform",
    monthlyPrice: "€0",
    yearlyPrice: "€0",
    priceNote: "Forever free",
    features: [
      { text: "1 practice exam per skill", included: true },
      { text: "Basic scoring & results", included: true },
      { text: "Multi-language UI", included: true },
      { text: "KNM, Reading, Listening", included: true },
      { text: "No AI feedback", included: false },
      { text: "No Writing & Speaking", included: false },
    ],
    cta: "Current Plan",
    ctaVariant: "outline" as const,
    href: "/signup",
    featured: false,
  },
  {
    id: "premium",
    name: "Premium",
    description: "Complete exam preparation with AI feedback",
    monthlyPrice: "€8",
    yearlyPrice: "€77",
    yearlyNote: "€6.42/month when billed yearly",
    monthlyPeriod: "/month",
    yearlyPeriod: "/year",
    features: [
      { text: "Unlimited practice exams", included: true },
      { text: "AI writing corrections", included: true },
      { text: "AI speaking feedback", included: true },
      { text: "All 5 skills (KNM + 4)", included: true },
      { text: "Full progress tracking", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "Upgrade Now",
    ctaVariant: "primary" as const,
    href: "#",
    featured: true,
  },
  {
    id: "onetime",
    name: "One-Time Pack",
    description: "Pay once, practice until you pass",
    monthlyPrice: "€25",
    yearlyPrice: "€25",
    priceNote: "One-time payment",
    features: [
      { text: "20 full practice exams", included: true },
      { text: "AI feedback included", included: true },
      { text: "All 5 skills", included: true },
      { text: "No recurring charge", included: true },
      { text: "Perfect for focused prep", included: true },
      { text: "6 months access", included: true },
    ],
    cta: "Buy Pack",
    ctaVariant: "outline" as const,
    href: "#",
    featured: false,
  },
];

const FAQS = [
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes! You can cancel your Premium subscription at any time. You'll retain access until the end of your billing period, and you won't be charged again.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept iDEAL, credit cards (Visa, Mastercard), and other payment methods through Mollie. All payments are secure and encrypted.",
  },
  {
    question: "How does the AI feedback work?",
    answer:
      "Our AI analyzes your written Dutch and spoken recordings to provide detailed corrections on grammar, vocabulary, and pronunciation. You'll see exactly where you made mistakes and how to improve.",
  },
  {
    question: "Is the content up to date with the 2025 exam format?",
    answer:
      "Yes! All our content is updated to match the July 2025 KNM exam format and follows the official CEFR A2/B1 standards from DUO.",
  },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<BillingCycle>("monthly");

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

      {/* Header */}
      <div className="container py-16 text-center">
        <h1 className="font-bold mb-4" style={{ fontSize: "2.5rem", color: "var(--gray-900)" }}>
          Choose Your Plan
        </h1>
        <p
          className="mx-auto"
          style={{ fontSize: "1.25rem", color: "var(--gray-600)", maxWidth: "700px" }}
        >
          Get unlimited access to all exam practice with AI-powered feedback
        </p>

        {/* Billing toggle */}
        <div className="flex justify-center items-center gap-4 mt-8">
          <span
            className="text-base font-medium"
            style={{ color: billing === "monthly" ? "var(--gray-900)" : "var(--gray-500)" }}
          >
            Monthly
          </span>
          <button
            onClick={() => setBilling((b) => (b === "monthly" ? "yearly" : "monthly"))}
            className={`toggle-switch ${billing === "yearly" ? "active" : ""}`}
            aria-label="Toggle billing cycle"
            style={{ width: "56px", height: "32px" }}
          >
            <span
              className="toggle-slider"
              style={{ width: "24px", height: "24px", top: "4px", left: "4px" }}
            />
          </button>
          <span
            className="text-base font-medium"
            style={{ color: billing === "yearly" ? "var(--gray-900)" : "var(--gray-500)" }}
          >
            Yearly <span style={{ color: "var(--green-900)" }}>(Save 20%)</span>
          </span>
        </div>
      </div>

      {/* Pricing cards */}
      <div className="container pb-20">
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          style={{ maxWidth: "1280px", margin: "0 auto" }}
        >
          {PLANS.map((plan) => (
            <PricingCard key={plan.id} plan={plan} billing={billing} />
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mx-auto px-6 pb-20" style={{ maxWidth: "800px" }}>
        <h2
          className="font-bold text-center mb-8"
          style={{ fontSize: "2rem", color: "var(--gray-900)" }}
        >
          Frequently Asked Questions
        </h2>
        <div className="flex flex-col gap-4">
          {FAQS.map((faq) => (
            <div
              key={faq.question}
              className="rounded-xl p-6 border"
              style={{ background: "white", borderColor: "var(--gray-200)" }}
            >
              <h3
                className="font-semibold mb-3"
                style={{ fontSize: "1.125rem", color: "var(--gray-900)" }}
              >
                {faq.question}
              </h3>
              <p style={{ color: "var(--gray-600)", lineHeight: 1.7 }}>{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PricingCard({ plan, billing }: { plan: (typeof PLANS)[number]; billing: BillingCycle }) {
  const price = billing === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
  const period = plan.id === "premium" ? (billing === "yearly" ? "/year" : "/month") : undefined;
  const note = plan.id === "premium" && billing === "yearly" ? plan.yearlyNote : plan.priceNote;

  return (
    <div
      className="relative rounded-3xl p-12 border-2"
      style={{
        background: "white",
        borderColor: plan.featured ? "var(--green-900)" : "var(--gray-200)",
        boxShadow: plan.featured ? "0 20px 40px rgba(27,107,74,0.15)" : "none",
      }}
    >
      {plan.featured && (
        <span
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-white text-xs font-bold uppercase tracking-wider px-5 py-1.5 rounded-full"
          style={{ background: "var(--green-900)" }}
        >
          Most Popular
        </span>
      )}

      <h2 className="font-bold mb-2" style={{ fontSize: "1.5rem", color: "var(--gray-900)" }}>
        {plan.name}
      </h2>
      <p className="mb-8 text-sm leading-relaxed" style={{ color: "var(--gray-600)" }}>
        {plan.description}
      </p>

      <div className="mb-8">
        <span
          className="font-bold"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "3rem",
            color: "var(--green-900)",
            lineHeight: 1,
          }}
        >
          {price}
        </span>
        {period && (
          <span className="ml-2" style={{ color: "var(--gray-500)" }}>
            {period}
          </span>
        )}
        {note && (
          <p className="mt-2 text-sm" style={{ color: "var(--gray-500)" }}>
            {note}
          </p>
        )}
      </div>

      <ul className="mb-8 flex flex-col gap-0">
        {plan.features.map((f) => (
          <li
            key={f.text}
            className="flex items-center gap-3 py-3 border-b last:border-b-0 text-sm"
            style={{
              borderColor: "var(--gray-100)",
              color: f.included ? "var(--gray-700)" : "var(--gray-400)",
              opacity: f.included ? 1 : 0.6,
            }}
          >
            <span
              style={{ color: f.included ? "var(--green-900)" : "var(--gray-400)", flexShrink: 0 }}
            >
              {f.included ? <CheckIcon /> : <XIcon />}
            </span>
            {f.text}
          </li>
        ))}
      </ul>

      <Button href={plan.href} variant={plan.ctaVariant} fullWidth>
        {plan.cta}
      </Button>
    </div>
  );
}

/* ==================== ICONS ==================== */

function CheckIcon() {
  return (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}
