"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PricingCards } from "@/components/pricing/PricingCards";

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
  return (
    <div className="min-h-screen" style={{ background: "var(--gray-50)" }}>
      <Navbar />

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
      </div>

      {/* Pricing cards */}
      <div className="container pb-20">
        <PricingCards />
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
      <Footer />
    </div>
  );
}
