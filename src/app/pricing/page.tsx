import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PricingCards } from "@/components/pricing/PricingCards";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Try ExamKlaar free for 7 days, then €9.99/month. Get unlimited access to all 5 inburgering exam components (KNM, Reading, Listening, Writing, and Speaking) with AI-powered feedback.",
  alternates: { canonical: "https://www.examklaar.nl/pricing" },
  openGraph: {
    title: "Pricing: Inburgering Exam Practice Plans | ExamKlaar",
    description:
      "Try ExamKlaar free for 7 days, then €9.99/month. Unlimited access to all 5 inburgering exam components with AI-powered feedback.",
    url: "https://www.examklaar.nl/pricing",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing: Inburgering Exam Practice Plans | ExamKlaar",
    description:
      "Try ExamKlaar free for 7 days, then €9.99/month. Unlimited access to all 5 inburgering exam components with AI-powered feedback.",
  },
};

const FAQS = [
  {
    question: "What is the inburgering exam and which parts does ExamKlaar cover?",
    answer:
      "The inburgering exam is a Dutch civic integration exam required for most people immigrating to the Netherlands. It tests your knowledge of Dutch society (KNM) and your Dutch language skills across four components: Reading, Listening, Writing, and Speaking. ExamKlaar covers all five of these components with realistic practice exams.",
  },
  {
    question: "Is ExamKlaar officially affiliated with DUO or the Dutch government?",
    answer:
      "No. ExamKlaar is an independent practice platform. We are not affiliated with DUO or the Dutch government. Our content is designed to closely reflect the official exam format and CEFR A2/B1 standards, but we cannot guarantee exam results.",
  },
  {
    question: "How does the 7-day free trial work?",
    answer:
      "When you start your trial you get full access to every exam and all AI feedback for 7 days. You add a payment method at signup, but you are not charged during the trial. After 7 days your subscription renews automatically at €9.99/month unless you cancel before the trial ends.",
  },
  {
    question: "What happens if I cancel during the trial?",
    answer:
      "If you cancel during the 7-day trial, your access ends immediately and you are never charged. If you cancel after the trial while on a paid subscription, you keep access until the end of your current billing period.",
  },
  {
    question: "How does the AI feedback work?",
    answer:
      "For writing exercises, our AI reviews your Dutch text and highlights grammar, vocabulary, and sentence structure errors with explanations. For speaking exercises, you record your answer and receive feedback on fluency and language use. All feedback is in plain language so you know exactly what to improve.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes. You can cancel your subscription at any time from your account settings. If you cancel a paid subscription, you keep access until the end of the current billing period and won't be charged again. If you cancel during the free trial, access ends immediately.",
  },
  {
    question: "What is your refund policy?",
    answer:
      "ExamKlaar does not offer discretionary refunds. All payments are processed by Paddle, who acts as Merchant of Record and handles all refund requests. For full details, see our Refund Policy at examklaar.nl/refund-policy.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept cards (Visa, Mastercard) and iDEAL. All payments are secure and encrypted.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default function PricingPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--gray-50)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Navbar />

      {/* Header */}
      <div className="container pt-12 pb-10 sm:pt-16 sm:pb-12 text-center">
        <h1
          className="font-bold mb-4"
          style={{ fontSize: "clamp(1.75rem, 6vw, 2.5rem)", color: "var(--gray-900)" }}
        >
          Everything you need to pass
        </h1>
        <p
          className="mx-auto"
          style={{ fontSize: "1.25rem", color: "var(--gray-600)", maxWidth: "640px" }}
        >
          Full access to every exam with AI feedback. €9.99 / month, cancel anytime.
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
              className="rounded-xl p-4 sm:p-6 border"
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
