import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PricingCards } from "@/components/pricing/PricingCards";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "The first exam of every skill is free, then €9.99/month for unlimited access to all 5 inburgering exam components (KNM, Reading, Listening, Writing, and Speaking) with AI-powered feedback.",
  alternates: { canonical: "https://www.examklaar.nl/pricing" },
  openGraph: {
    title: "Pricing: Inburgering Exam Practice Plans | ExamKlaar",
    description:
      "The first exam of every skill is free, then €9.99/month for unlimited access to all 5 inburgering exam components with AI-powered feedback.",
    url: "https://www.examklaar.nl/pricing",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing: Inburgering Exam Practice Plans | ExamKlaar",
    description:
      "The first exam of every skill is free, then €9.99/month for unlimited access to all 5 inburgering exam components with AI-powered feedback.",
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
    question: "Which exams can I take for free?",
    answer:
      "The first exam of every skill is free. Create an account and you can take exam 1 of KNM, Reading, Listening, Writing, and Speaking at no cost, including the AI feedback on your writing and speaking answers. No payment method is needed. The remaining exams of each skill need a subscription.",
  },
  {
    question: "What do I get when I subscribe?",
    answer:
      "A subscription unlocks every exam of every skill, unlimited practice attempts, AI feedback on all your writing and speaking answers, and full progress tracking. It costs €9.99 per month and you can cancel at any time.",
  },
  {
    question: "How does the AI feedback work?",
    answer:
      "For writing exercises, our AI reviews your Dutch text and highlights grammar, vocabulary, and sentence structure errors with explanations. For speaking exercises, you record your answer and receive feedback on fluency and language use. All feedback is in plain language so you know exactly what to improve.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes. You can cancel your subscription at any time from your account settings. You keep access until the end of the current billing period and won't be charged again. After that you can still take the free first exam of every skill.",
  },
  {
    question: "What is your refund policy?",
    answer:
      "Payments are processed by Paddle, which acts as Merchant of Record and handles all refund requests, including your statutory 14-day right of withdrawal. ExamKlaar does not offer refunds beyond your statutory rights. For full details, see our Refund Policy at examklaar.nl/refund-policy.",
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
          The first exam of every skill is free. Unlock all the rest for €9.99 / month, cancel
          anytime.
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
