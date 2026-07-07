import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "Read the ExamKlaar refund policy. Understand how refunds and cancellations are handled for subscriptions.",
  alternates: { canonical: "https://www.examklaar.nl/refund-policy" },
};

const LAST_UPDATED = "7 July 2026";

const SECTIONS = [
  {
    title: "1. Merchant of Record",
    content:
      "All payments on ExamKlaar are processed by Paddle.com Market Limited ('Paddle'), who acts as the Merchant of Record. Paddle is the legal seller for all transactions and is solely responsible for processing payments, issuing invoices, and handling refund requests. By making a purchase, you agree to Paddle's Buyer Terms of Service.",
  },
  {
    title: "2. Discretionary Refunds",
    content:
      "ExamKlaar itself does not offer refunds beyond your statutory rights. We do not issue refunds for partially used subscription periods, unused access time, or change-of-mind cancellations. Paddle, as Merchant of Record, may at its sole discretion issue a refund if a request is submitted within 14 days of the transaction date, in accordance with Paddle's Refund Policy. Submitting a request within this period does not guarantee a refund. When you cancel a paid subscription, access continues until the end of the current paid billing period and no further charges are made.",
  },
  {
    title: "3. Statutory Right of Withdrawal (EU/EEA Consumers)",
    content:
      "If you are a consumer in the European Union or European Economic Area, you have a statutory 14-day right of withdrawal under the EU Consumer Rights Directive (2011/83/EU). At checkout you expressly consent to delivery starting immediately and acknowledge that the right of withdrawal is lost once delivery of the digital content has begun, in accordance with Article 16(m) of the Directive and article 6:230p under (g) of the Dutch Civil Code (BW). Where the law treats your subscription as an ongoing digital service rather than digital content, a withdrawal within 14 days entitles you to a refund reduced by a proportionate amount for the service already provided (Article 14(3) of the Directive). New subscriptions start with a 7-day free trial: no charge is made during the trial, and cancelling during the trial is always free of charge. In line with Paddle's Refund Policy, when a free trial ends you again have 14 calendar days to exercise your right of withdrawal in respect of the first payment.",
    footer:
      "You may contact Paddle within 14 days of purchase, or within 14 days of the end of a free trial, to request a withdrawal. Paddle will assess such requests in accordance with their Buyer Terms and Refund Policy.",
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
        subtitle: "Email",
        text: "Contact Paddle's buyer support at help@paddle.com.",
      },
    ],
    footer:
      "If you believe a charge was unauthorised, contact Paddle first before disputing it with your bank or card provider: Paddle's Buyer Terms require this, and access to your purchase may be suspended while a chargeback is investigated. For general account questions (not payment disputes), contact ExamKlaar at hallo@examklaar.nl.",
  },
  {
    title: "5. Refund Processing Time",
    content:
      "Where a refund is approved by Paddle, it is processed within 14 days of approval and returned to the original payment method where possible. The exact timing may vary depending on your bank or card provider.",
  },
  {
    title: "6. Cancellation",
    content:
      "You may cancel your subscription at any time from the account settings page or by contacting hallo@examklaar.nl. Cancellation stops future billing. If you cancel during the free trial, your access ends immediately and no charge is made. If you cancel a paid subscription, you retain access to paid features until the end of the current billing period. Cancellation does not entitle you to a refund of the current period.",
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
