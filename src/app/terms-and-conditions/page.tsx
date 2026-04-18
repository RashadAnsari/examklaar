import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Read the ExamKlaar terms and conditions. Understand your rights and responsibilities as a user of our exam preparation platform.",
  alternates: { canonical: "https://www.examklaar.nl/terms-and-conditions" },
};

const LAST_UPDATED = "17 April 2026";

const SECTIONS = [
  {
    title: "Article 1. General",
    content: `ExamKlaar (www.examklaar.nl) is an online platform providing practice exams and AI-powered feedback for people preparing for the Dutch inburgering (civic integration) exam. ExamKlaar is operated by [Legal Entity Name], registered at the Dutch Chamber of Commerce (KvK) under number [KvK Number], located at [Address, City, the Netherlands].`,
    footer:
      "These Terms & Conditions apply to all use of the ExamKlaar platform. By creating an account or using our services, you agree to these terms. Dutch law governs these terms, though consumers may invoke mandatory provisions of their home country's law.",
  },
  {
    title: "Article 2. Eligibility",
    items: [
      {
        text: "You must be at least 16 years old to use ExamKlaar. By registering, you confirm that you meet this requirement.",
      },
      {
        text: "You must provide accurate and complete information when creating your account.",
      },
      {
        text: "You are responsible for the security of your account credentials and for all activity that occurs under your account.",
      },
      {
        text: "You may not register an account on behalf of another person without their explicit consent.",
      },
    ],
  },
  {
    title: "Article 3. Our Services",
    content: "ExamKlaar provides the following services:",
    items: [
      {
        text: "Practice exams for all five components of the inburgering exam: KNM, reading, listening, speaking, and writing",
      },
      { text: "AI-generated feedback on written answers and audio recordings" },
      { text: "Progress tracking and exam history" },
      { text: "Subscription plans for unlimited platform access" },
    ],
    footer:
      "We reserve the right to update, add, or remove features at any time. We will notify you of changes that materially affect a paid service. ExamKlaar is not a governmental organisation and is not affiliated with or endorsed by the Dutch government or DUO.",
  },
  {
    title: "Article 4. Free Access",
    content:
      "New users receive one free practice exam upon registration, without requiring a payment method. The free exam is provided as-is. We reserve the right to modify or withdraw the free tier at any time with reasonable notice to registered users.",
  },
  {
    title: "Article 5. Subscriptions and Payments",
    content:
      "All payments on ExamKlaar are processed by Paddle.com Market Ltd ('Paddle'), who acts as the Merchant of Record. This means Paddle is the legal seller for all transactions, handles VAT collection and remittance, and is responsible for payment processing and billing. By making a purchase, you also agree to Paddle's Terms of Service and Privacy Policy.",
    items: [
      {
        subtitle: "Billing",
        text: "Subscriptions are billed monthly on the same date each cycle, until you cancel. Paddle will charge the payment method you provided at checkout.",
      },
      {
        subtitle: "Cancellation",
        text: "You may cancel your subscription at any time via the account settings page or by contacting us at hallo@examklaar.nl. Access to paid features continues until the end of the current billing period.",
      },
      {
        subtitle: "Price changes",
        text: "We may change subscription prices with at least 30 days' written notice by email. If you do not cancel before the new price takes effect, your continued use constitutes acceptance.",
      },
      {
        subtitle: "Failed payments",
        text: "If a payment fails, Paddle will attempt to retry. If unsuccessful, we may suspend access to your account until the issue is resolved. We will notify you by email.",
      },
      {
        subtitle: "Refunds",
        text: "ExamKlaar does not offer discretionary refunds. Because Paddle acts as Merchant of Record, all refund requests and payment disputes must be directed to Paddle and are governed by Paddle's Buyer Terms. EU consumers retain any statutory rights of withdrawal that apply under Paddle's Buyer Terms. For full details, see our Refund Policy at examklaar.nl/refund-policy.",
      },
    ],
  },
  {
    title: "Article 6. Acceptable Use",
    content: "You agree not to:",
    items: [
      {
        text: "Share your account credentials with others or resell access to the platform",
      },
      {
        text: "Copy, scrape, download, or redistribute exam content, questions, or AI-generated feedback",
      },
      {
        text: "Use automated tools, bots, or scripts to interact with or extract data from the platform",
      },
      {
        text: "Upload, submit, or transmit offensive, illegal, harmful, or infringing content in your recordings or text inputs",
      },
      {
        text: "Attempt to reverse-engineer, decompile, hack, or otherwise disrupt the platform or its infrastructure",
      },
      {
        text: "Impersonate another person or entity, or misrepresent your identity or affiliation",
      },
    ],
    footer:
      "Violation of these rules may result in immediate suspension or permanent termination of your account, at our sole discretion. We may also report illegal activity to the relevant authorities. Terminated accounts are not eligible for a refund of any remaining subscription period.",
  },
  {
    title: "Article 7. Intellectual Property",
    content:
      "All content on ExamKlaar, including exam questions, explanations, audio, design, software code, and AI-generated content, is owned by ExamKlaar or its licensors and is protected by Dutch and international intellectual property law (Auteurswet). You are granted a limited, personal, non-transferable, non-sublicensable licence to access and use the platform for your own personal exam preparation only. You may not reproduce, distribute, publicly display, or create derivative works from our content without prior written permission.",
  },
  {
    title: "Article 8. AI Feedback Disclaimer",
    content:
      "ExamKlaar uses third-party artificial intelligence to generate feedback on exam responses and audio recordings. This feedback is for educational purposes only and does not constitute a guarantee of exam results. AI feedback may occasionally contain errors or inaccuracies. We make no warranty that the feedback is correct, complete, or suitable for any particular purpose, and we do not guarantee that using ExamKlaar will result in passing the official inburgering exam.",
  },
  {
    title: "Article 9. Availability",
    content:
      "We aim to keep ExamKlaar available at all times but cannot guarantee uninterrupted access. Planned maintenance, technical incidents, or circumstances beyond our reasonable control may cause temporary interruptions. We will endeavour to notify you in advance of planned downtime where possible.",
  },
  {
    title: "Article 10. Liability",
    content:
      "To the maximum extent permitted by mandatory Dutch and EU consumer law, ExamKlaar is not liable for indirect, incidental, special, or consequential damages arising from your use of or inability to use the platform, including loss of data, missed exam appointments, or failure to pass the official inburgering exam.",
    items: [
      {
        subtitle: "Liability cap",
        text: "Our total aggregate liability for any claim arising under or in connection with these Terms is limited to the total amount you paid to ExamKlaar in the 3 months immediately preceding the event giving rise to the claim.",
      },
      {
        subtitle: "Consumer protection",
        text: "Nothing in this article excludes or limits our liability for death or personal injury caused by our negligence, for fraud or fraudulent misrepresentation, or for any other liability that cannot be excluded under Dutch or EU mandatory consumer protection law.",
      },
      {
        subtitle: "Incorrect information",
        text: "ExamKlaar is not liable for damage caused by reliance on incorrect or incomplete information provided by users themselves.",
      },
    ],
  },
  {
    title: "Article 11. Force Majeure",
    content:
      "ExamKlaar is not liable for any failure or delay in performing its obligations where such failure results from circumstances beyond our reasonable control. This includes natural disasters, pandemics, government actions, internet or telecommunications failures, third-party service outages, or cyberattacks. We will notify you as soon as practicable and take all reasonable steps to resume normal service.",
  },
  {
    title: "Article 12. Account Termination",
    items: [
      {
        subtitle: "By you",
        text: "You may delete your account at any time from the account settings page. Your personal data will be permanently removed within 30 days, subject to legal retention obligations.",
      },
      {
        subtitle: "By us",
        text: "We reserve the right to suspend or permanently terminate accounts that violate these Terms, with or without prior notice depending on the severity of the breach. We will generally issue a warning for minor or first-time violations.",
      },
      {
        subtitle: "Effect of termination",
        text: "Upon termination, your right to access the platform ceases. Accounts terminated for breach of these Terms are not eligible for a refund of any remaining subscription period.",
      },
    ],
  },
  {
    title: "Article 13. Disputes",
    items: [
      {
        subtitle: "Contact us first",
        text: "If you have a complaint or dispute, contact us first at hallo@examklaar.nl. We aim to resolve all disputes amicably within 30 days.",
      },
      {
        subtitle: "Online Dispute Resolution (EU consumers)",
        text: "EU consumers who cannot resolve a complaint directly with us may submit their dispute to the European Online Dispute Resolution platform at https://ec.europa.eu/consumers/odr/. For payment-related disputes, please use the ODR platform in relation to Paddle as the Merchant of Record.",
      },
      {
        subtitle: "Competent court",
        text: "If a dispute cannot be resolved amicably, it will be submitted to the exclusive jurisdiction of the competent court in [City], the Netherlands, unless mandatory consumer law in your country of residence grants you the right to bring proceedings there.",
      },
    ],
  },
  {
    title: "Article 14. Changes to These Terms",
    content:
      "We may update these Terms from time to time. We will notify you of material changes by email or via a notice on the platform at least 14 days before they take effect. If you do not agree with the changes, you may terminate your account before they take effect. Continued use of ExamKlaar after the effective date constitutes your acceptance of the revised Terms.",
  },
  {
    title: "Article 15. Governing Law",
    content:
      "These Terms are governed exclusively by the laws of the Netherlands. Mandatory consumer protection provisions of your country of residence continue to apply where required by law.",
  },
  {
    title: "Article 16. Contact",
    content:
      "Questions about these Terms? Contact us at hallo@examklaar.nl. We aim to respond within 30 days.",
    footer: "[Legal Entity Name], [Address, City, the Netherlands]. KvK: [KvK Number].",
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
