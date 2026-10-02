import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/layout/LegalPage";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "Read the ExamKlaar refund policy. Understand how refunds and cancellations are handled for subscriptions.",
  alternates: { canonical: `${site.url}/refund-policy` },
};

const LAST_UPDATED = "2 October 2026";

const SECTIONS: LegalSection[] = [
  {
    title: "1. Who Handles Refunds",
    content:
      "Subscriptions are sold by Paddle.com Market Limited ('Paddle') as Merchant of Record. Paddle is the seller, processes your payment, and handles all withdrawal and refund requests under its Buyer Terms and Refund Policy.",
  },
  {
    title: "2. Your 14-Day Right of Withdrawal",
    content:
      "If you are a consumer in the EU, EEA, Switzerland or the UK, you have a statutory right to withdraw from your purchase within 14 days. At checkout you can agree that your access starts immediately. If you do and you then use the paid exams, you lose the right of withdrawal, as EU and Dutch consumer law allow for digital content (article 6:230p under g of the Dutch Civil Code). Where the law treats your subscription as a service instead, you can still withdraw within 14 days and receive a refund minus the part you already used. Nothing in this policy limits your statutory rights.",
    footer: "Free access never involves a payment, so there is nothing to withdraw from or refund.",
  },
  {
    title: "3. Other Refunds",
    content:
      "ExamKlaar does not offer refunds beyond your statutory rights, including for unused time in a billing period. Paddle may, at its own discretion, approve a refund requested within 14 days of the payment. A request does not guarantee a refund.",
  },
  {
    title: "4. How to Request a Refund",
    content: "Send withdrawal and refund requests to Paddle, not to ExamKlaar:",
    items: [
      {
        subtitle: "Online",
        text: "Go to paddle.net and choose 'Request refund'.",
      },
      {
        subtitle: "Your receipt",
        text: "Use the support link in the receipt email Paddle sent you.",
      },
      {
        subtitle: "Withdrawal button",
        text: "EU consumers can also withdraw with the button in the Paddle customer portal during the 14-day period.",
      },
    ],
    footer:
      "If you do not recognise a charge, contact Paddle before disputing it with your bank. Access may be paused while a dispute is investigated. This does not affect your legal rights.",
  },
  {
    title: "5. Refund Processing Time",
    content:
      "Paddle processes approved refunds within 14 days of approval, to your original payment method where possible. Your bank may take a few extra days to show it.",
  },
  {
    title: "6. Cancellation",
    content:
      "You can cancel your subscription at any time in your account settings or by emailing hallo@examklaar.nl. Cancelling stops future payments. You keep access until the end of the period you paid for, and after that you keep the free access that needs no subscription. Cancelling on its own does not give a refund for the current period, without affecting your right of withdrawal in section 2.",
  },
  {
    title: "7. Changes to This Policy",
    content:
      "We may update this policy. We will tell you about material changes by email or with a notice on the platform. The date at the top of this page shows the latest version.",
  },
  {
    title: "8. Contact",
    content:
      "For payment and refund questions, contact Paddle via paddle.net. For anything else, email ExamKlaar at hallo@examklaar.nl.",
  },
];

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund Policy"
      lastUpdated={LAST_UPDATED}
      intro="Payments for ExamKlaar are processed by Paddle, which acts as Merchant of Record and handles refund requests."
      sections={SECTIONS}
    />
  );
}
