import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const LAST_UPDATED = "10 April 2026";

const SECTIONS = [
  {
    title: "1. Who We Are",
    content: `ExamKlaar is an online platform that helps people prepare for the Dutch inburgering (civic integration) exam through realistic practice exams and AI-powered feedback. ExamKlaar is operated by ExamKlaar and can be reached at hallo@examklaar.nl.`,
  },
  {
    title: "2. What Data We Collect",
    items: [
      {
        subtitle: "Account information",
        text: "When you create an account, we collect your name and email address. This is necessary to provide you with access to the platform.",
      },
      {
        subtitle: "Exam results and progress",
        text: "We store your answers, scores, and exam history so you can track your progress over time.",
      },
      {
        subtitle: "Audio recordings",
        text: "For speaking practice exercises, we collect audio recordings you submit. These are used to provide AI-powered pronunciation and language feedback.",
      },
      {
        subtitle: "Payment information",
        text: "If you purchase a subscription or exam pack, payment data is processed by our payment provider. We do not store your full card details.",
      },
    ],
  },
  {
    title: "3. How We Use Your Data",
    items: [
      { text: "To provide and improve our services" },
      { text: "To send account-related emails (e.g. email confirmation, password reset)" },
      { text: "To process payments and manage your subscription" },
      { text: "To generate AI feedback on your exam responses and recordings" },
      { text: "To monitor for fraud and ensure platform security" },
    ],
  },
  {
    title: "4. Legal Basis (GDPR)",
    content: `We process your personal data on the following legal grounds under the General Data Protection Regulation (GDPR):`,
    items: [
      { text: "Contract performance — to deliver the service you signed up for" },
      { text: "Legitimate interest — to improve the platform and prevent abuse" },
      { text: "Consent — for any optional communications you opt into" },
    ],
  },
  {
    title: "5. Data Sharing",
    content: `We do not sell your personal data. We share data only with trusted third-party service providers who help us operate ExamKlaar:`,
    items: [
      { text: "Database and authentication infrastructure providers" },
      { text: "Payment processing providers" },
      { text: "AI providers — for analysing exam responses and audio feedback" },
    ],
    footer:
      "All third parties are bound by data processing agreements and may only use your data to provide services on our behalf.",
  },
  {
    title: "6. Data Retention",
    content: `We retain your account data for as long as your account is active. If you delete your account, your personal data is permanently removed within 30 days, except where we are legally required to retain certain records (e.g. financial records for 7 years under Dutch law).`,
  },
  {
    title: "7. Your Rights",
    content: `Under the GDPR, you have the following rights:`,
    items: [
      { text: "Access — request a copy of the personal data we hold about you" },
      { text: "Correction — ask us to correct inaccurate or incomplete data" },
      { text: "Deletion — request the erasure of your personal data" },
      { text: "Portability — receive your data in a structured, machine-readable format" },
      { text: "Objection — object to processing based on legitimate interest" },
      { text: "Restriction — ask us to limit how we process your data" },
    ],
    footer:
      "To exercise any of these rights, contact us at hallo@examklaar.nl. We will respond within 30 days.",
  },
  {
    title: "8. Cookies",
    content: `We use only essential cookies required for authentication and session management. We do not use tracking or advertising cookies.`,
  },
  {
    title: "9. Security",
    content: `We take the security of your data seriously. All data is encrypted in transit (TLS) and at rest. Access to personal data is strictly limited to personnel who need it to operate the service.`,
  },
  {
    title: "10. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. If we make significant changes, we will notify you by email or via a notice on the platform. The date at the top of this page always reflects the latest version.`,
  },
  {
    title: "11. Contact",
    content: `If you have questions about this Privacy Policy or our data practices, please contact us at hallo@examklaar.nl. You also have the right to lodge a complaint with the Dutch Data Protection Authority (Autoriteit Persoonsgegevens) at autoriteitpersoonsgegevens.nl.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--gray-50)" }}>
      <Navbar />

      {/* Header */}
      <div className="container py-16 text-center">
        <h1 className="font-bold mb-4" style={{ fontSize: "2.5rem", color: "var(--gray-900)" }}>
          Privacy Policy
        </h1>
        <p style={{ color: "var(--gray-500)", fontSize: "0.9rem" }}>Last updated: {LAST_UPDATED}</p>
        <p
          className="mx-auto mt-4"
          style={{ fontSize: "1.125rem", color: "var(--gray-600)", maxWidth: "680px" }}
        >
          We respect your privacy. This policy explains what personal data we collect, why we
          collect it, and how we protect it.
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
