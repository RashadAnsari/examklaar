import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "Read the ExamKlaar refund policy. Understand how refunds and cancellations are handled for subscriptions.",
  alternates: { canonical: "https://www.examklaar.nl/refund-policy" },
};

const LAST_UPDATED = "17 April 2026";

const SECTIONS = [
  {
    title: "1. Merchant of Record",
    content:
      "All payments on ExamKlaar are processed by Paddle.com Market Ltd ('Paddle'), who acts as the Merchant of Record. Paddle is the legal seller for all transactions and is solely responsible for processing payments, issuing invoices, and handling refund requests. By making a purchase, you agree to Paddle's Buyer Terms of Service.",
  },
  {
    title: "2. No Discretionary Refunds",
    content:
      "ExamKlaar does not offer discretionary refunds. We do not issue refunds for partially used subscription periods, unused access time, or change-of-mind cancellations. When you cancel your subscription, access continues until the end of the current paid billing period and no further charges are made.",
  },
  {
    title: "3. Statutory Right of Withdrawal (EU/EEA Consumers)",
    content:
      "If you are a consumer in the European Union or European Economic Area, you have a statutory 14-day right of withdrawal under the EU Consumer Rights Directive (2011/83/EU). However, by starting to use ExamKlaar immediately after purchase, you expressly request that service delivery begins before the withdrawal period ends. You acknowledge that your right of withdrawal is lost once the service has begun, in accordance with Article 16(m) of the Directive and Article 6:230p(3)(c) of the Dutch Civil Code (BW).",
    footer:
      "If you have not yet accessed any paid features, you may contact Paddle within 14 days of purchase to request a withdrawal. Paddle will assess such requests in accordance with their Buyer Terms.",
  },
  {
    title: "4. How to Request a Refund",
    content:
      "Because Paddle is the Merchant of Record, all refund requests must be directed to Paddle, not to ExamKlaar. You can reach Paddle via:",
    items: [
      {
        subtitle: "Paddle's support portal",
        text: "Visit paddle.net/support to submit a refund or billing dispute request.",
      },
      {
        subtitle: "Your purchase receipt",
        text: "Every Paddle receipt email includes a link to manage or dispute your purchase directly.",
      },
      {
        subtitle: "Chargeback via your bank",
        text: "You also have the right to dispute a charge with your bank or card provider if you believe a charge was unauthorised.",
      },
    ],
    footer:
      "For general account questions (not payment disputes), contact ExamKlaar at hallo@examklaar.nl.",
  },
  {
    title: "5. Refund Processing Time",
    content:
      "Where a refund is approved by Paddle, it is typically processed within 5 to 10 business days and returned to the original payment method. Processing times may vary depending on your bank or card provider.",
  },
  {
    title: "6. Cancellation",
    content:
      "You may cancel your subscription at any time from the account settings page or by contacting hallo@examklaar.nl. Cancellation stops future billing. You retain access to paid features until the end of the current billing period. Cancellation does not entitle you to a refund of the current period.",
  },
  {
    title: "7. Changes to This Policy",
    content:
      "We may update this Refund Policy from time to time. We will notify you of material changes by email or via a notice on the platform. The date at the top of this page always reflects the latest version.",
  },
  {
    title: "8. Contact",
    content:
      "For billing and payment questions, contact Paddle at paddle.net/support. For all other enquiries, reach ExamKlaar at hallo@examklaar.nl.",
  },
];

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--gray-50)" }}>
      <Navbar />

      {/* Header */}
      <div className="container py-16 text-center">
        <h1 className="font-bold mb-4" style={{ fontSize: "2.5rem", color: "var(--gray-900)" }}>
          Refund Policy
        </h1>
        <p style={{ color: "var(--gray-500)", fontSize: "0.9rem" }}>Last updated: {LAST_UPDATED}</p>
        <p
          className="mx-auto mt-4"
          style={{ fontSize: "1.125rem", color: "var(--gray-600)", maxWidth: "680px" }}
        >
          All payments on ExamKlaar are processed by Paddle, who acts as Merchant of Record and
          handles all refund requests.
        </p>
      </div>

      {/* Sections */}
      <div className="mx-auto px-6 pb-20 flex flex-col gap-6" style={{ maxWidth: "800px" }}>
        {SECTIONS.map((section) => (
          <div
            key={section.title}
            className="rounded-xl p-8 border"
            style={{ background: "white", borderColor: "var(--gray-200)" }}
          >
            <h2
              className="font-semibold mb-4"
              style={{ fontSize: "1.125rem", color: "var(--gray-900)" }}
            >
              {section.title}
            </h2>

            {section.content && (
              <p style={{ color: "var(--gray-600)", lineHeight: 1.7 }} className="mb-4">
                {section.content}
              </p>
            )}

            {section.items && (
              <ul className="flex flex-col gap-3 mb-4">
                {section.items.map((item, i) => (
                  <li
                    key={i}
                    className="flex gap-3"
                    style={{ color: "var(--gray-600)", lineHeight: 1.7 }}
                  >
                    <span
                      className="mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: "var(--green-50)", color: "var(--green-700)" }}
                    >
                      ✓
                    </span>
                    <span>
                      {"subtitle" in item && item.subtitle ? (
                        <>
                          <strong style={{ color: "var(--gray-800)" }}>{item.subtitle}</strong>
                          {": "}
                          {item.text}
                        </>
                      ) : (
                        item.text
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {section.footer && (
              <p
                className="mt-2 text-sm italic"
                style={{ color: "var(--gray-500)", lineHeight: 1.7 }}
              >
                {section.footer}
              </p>
            )}
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
}
