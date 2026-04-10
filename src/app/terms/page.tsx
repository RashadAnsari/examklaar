import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const LAST_UPDATED = "10 April 2026";

const SECTIONS = [
  {
    title: "1. About ExamKlaar",
    content: `ExamKlaar is an online platform that provides practice exams and AI-powered feedback for people preparing for the Dutch inburgering (civic integration) exam. These Terms & Conditions govern your use of the platform. By creating an account or using our services, you agree to these terms.`,
  },
  {
    title: "2. Eligibility",
    items: [
      { text: "You must be at least 16 years old to use ExamKlaar." },
      { text: "You must provide accurate information when creating your account." },
      { text: "You are responsible for maintaining the security of your account credentials." },
    ],
  },
  {
    title: "3. Our Services",
    content: `ExamKlaar offers the following services:`,
    items: [
      {
        text: "Practice exams for all components of the inburgering exam (KNM, reading, listening, speaking, writing)",
      },
      { text: "AI-generated feedback on written answers and audio recordings" },
      { text: "Progress tracking and exam history" },
      { text: "Subscription and pay-per-use exam packs" },
    ],
    footer:
      "We reserve the right to update, add, or remove features at any time. We will notify you of significant changes.",
  },
  {
    title: "4. Subscriptions and Payments",
    items: [
      {
        subtitle: "Billing",
        text: "Subscriptions are billed monthly. You will be charged on the same date each month until you cancel.",
      },
      {
        subtitle: "Cancellation",
        text: "You may cancel your subscription at any time. Access continues until the end of the current billing period. No partial refunds are issued for unused days.",
      },
      {
        subtitle: "One-Time Packs",
        text: "Exam pack purchases are non-refundable once credits have been used.",
      },
      {
        subtitle: "Payment provider",
        text: "All payments are processed securely by our payment provider. ExamKlaar does not store your payment card details.",
      },
      {
        subtitle: "Price changes",
        text: "We may change subscription prices with at least 30 days' notice. Continued use after the notice period constitutes acceptance of the new price.",
      },
    ],
  },
  {
    title: "5. Acceptable Use",
    content: `You agree not to:`,
    items: [
      { text: "Share your account with others or resell access to the platform" },
      { text: "Attempt to copy, scrape, or redistribute exam content" },
      { text: "Use automated tools or bots to interact with the platform" },
      { text: "Upload offensive, illegal, or harmful content in your recordings or inputs" },
      { text: "Attempt to reverse-engineer, hack, or disrupt the platform" },
    ],
    footer:
      "Violation of these rules may result in immediate suspension or termination of your account without refund.",
  },
  {
    title: "6. Intellectual Property",
    content: `All content on ExamKlaar — including exam questions, explanations, audio, design, and software — is owned by ExamKlaar or its licensors. You are granted a limited, non-transferable licence to use the platform for personal exam preparation only. You may not reproduce, distribute, or create derivative works from our content without written permission.`,
  },
  {
    title: "7. AI Feedback Disclaimer",
    content: `ExamKlaar uses artificial intelligence to provide feedback on your exam responses and recordings. This feedback is provided for educational purposes and is not a guarantee of exam results. AI feedback may occasionally contain errors. We do not guarantee that following our feedback will result in passing the official inburgering exam.`,
  },
  {
    title: "8. Availability",
    content: `We aim to keep ExamKlaar available at all times, but we cannot guarantee uninterrupted access. Scheduled maintenance, technical issues, or circumstances beyond our control may cause temporary downtime. We are not liable for any loss resulting from unavailability.`,
  },
  {
    title: "9. Limitation of Liability",
    content: `To the maximum extent permitted by Dutch law, ExamKlaar is not liable for indirect, incidental, or consequential damages arising from your use of the platform, including loss of data, missed exam appointments, or failure to pass the official exam. Our total liability for any claim is limited to the amount you paid in the 3 months preceding the claim.`,
  },
  {
    title: "10. Account Termination",
    content: `You may delete your account at any time from the settings page. Upon deletion, your personal data is permanently removed within 30 days. We reserve the right to suspend or terminate accounts that violate these Terms, with or without prior notice.`,
  },
  {
    title: "11. Changes to These Terms",
    content: `We may update these Terms & Conditions from time to time. We will notify you of material changes by email or via a notice on the platform at least 14 days before they take effect. Continued use of ExamKlaar after changes take effect constitutes your acceptance.`,
  },
  {
    title: "12. Governing Law",
    content: `These Terms are governed by the laws of the Netherlands. Any disputes that cannot be resolved amicably will be submitted to the competent court in the Netherlands.`,
  },
  {
    title: "13. Contact",
    content: `If you have questions about these Terms, please contact us at hallo@examklaar.nl. We aim to respond within 30 days.`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--gray-50)" }}>
      <Navbar />

      {/* Header */}
      <div className="container py-16 text-center">
        <h1 className="font-bold mb-4" style={{ fontSize: "2.5rem", color: "var(--gray-900)" }}>
          Terms &amp; Conditions
        </h1>
        <p style={{ color: "var(--gray-500)", fontSize: "0.9rem" }}>Last updated: {LAST_UPDATED}</p>
        <p
          className="mx-auto mt-4"
          style={{ fontSize: "1.125rem", color: "var(--gray-600)", maxWidth: "680px" }}
        >
          Please read these terms carefully before using ExamKlaar. They explain your rights and
          responsibilities as a user of our platform.
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
                          {" — "}
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
