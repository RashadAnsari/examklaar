import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/layout/LegalPage";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Read the ExamKlaar terms and conditions. Understand your rights and responsibilities as a user of our exam preparation platform.",
  alternates: { canonical: `${site.url}/terms-and-conditions` },
};

const LAST_UPDATED = "29 July 2026";

const SECTIONS: LegalSection[] = [
  {
    title: "Article 1. General",
    // TODO: restore business details (legal entity name, KvK number, registered address) once finalised:
    // content: `ExamKlaar (www.examklaar.nl) is an online platform providing practice exams and AI-powered feedback for people preparing for the Dutch inburgering (civic integration) exam. ExamKlaar is operated by [Legal Entity Name], registered at the Dutch Chamber of Commerce (KvK) under number [KvK Number], located at [Address, City, the Netherlands].`,
    content: `ExamKlaar (www.examklaar.nl) is an online platform providing practice exams and AI-powered feedback for people preparing for the Dutch inburgering (civic integration) exam. ExamKlaar is operated from the Netherlands.`,
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
    title: "Article 4. Free Trial and Complimentary Access",
    content:
      "We offer free access in two forms. Which one is available to you is shown on the pricing page before you claim it.",
    items: [
      {
        subtitle: "7-day free trial",
        text: "New users may start a 7-day free trial of the paid subscription. A valid payment method is required to begin the trial, but no charge is made during the trial period. Unless you cancel before the trial ends, your subscription renews automatically into a paid monthly subscription at the then-current price. If you cancel during the trial, your access ends immediately and no charge is made. Each user is eligible for one free trial.",
      },
      {
        subtitle: "Complimentary early access",
        text: "While the platform is in its early stages we may instead offer a period of complimentary access at no cost and without a payment method. The length of that period is set at the time you claim it and is confirmed to you when it is granted. Complimentary access is granted once per account, ends automatically when the period expires, and does not renew or convert into a paid subscription. No charge is ever made for it and you may stop using it at any time. Claiming complimentary access uses up your eligibility for the 7-day trial, so a later paid subscription starts billing immediately.",
      },
      {
        subtitle: "Changes to these offers",
        text: "We reserve the right to modify or withdraw either offer at any time with reasonable notice to registered users. Access already granted to you is not shortened by such a change.",
      },
    ],
  },
  {
    title: "Article 5. Subscriptions and Payments",
    content:
      "All payments on ExamKlaar are processed by Paddle.com Market Limited ('Paddle'), who acts as the Merchant of Record. This means Paddle is the legal seller for all transactions, handles VAT collection and remittance, and is responsible for payment processing and billing. By making a purchase, you also agree to Paddle's Terms of Service and Privacy Policy.",
    items: [
      {
        subtitle: "Billing",
        text: "Subscriptions are billed monthly on the same date each cycle, until you cancel. Paddle will charge the payment method you provided at checkout.",
      },
      {
        subtitle: "Cancellation",
        text: "You may cancel your subscription at any time via the account settings page or by contacting us at hallo@examklaar.nl. If you cancel a paid subscription, access continues until the end of the current billing period. If you cancel during the free trial, access ends immediately.",
      },
      {
        subtitle: "Price changes",
        text: "We may change subscription prices with at least 30 days' written notice by email. You may cancel free of charge at any point before the new price takes effect, and the change will not apply to a billing period you have already paid for. If you do not cancel before the new price takes effect, your continued use constitutes acceptance.",
      },
      {
        subtitle: "Failed payments",
        text: "If a payment fails, Paddle will attempt to retry. If unsuccessful, we may suspend access to your account until the issue is resolved. We will notify you by email.",
      },
      {
        subtitle: "Refunds",
        text: "EU and EEA consumers have a statutory 14-day right of withdrawal, which nothing in these Terms affects. Beyond that, ExamKlaar itself does not offer refunds. Because Paddle acts as Merchant of Record, all withdrawal requests, refund requests and payment disputes are handled by Paddle under its Buyer Terms and Refund Policy. Our Refund Policy at examklaar.nl/refund-policy sets out the full detail and governs in the event of any inconsistency with this article.",
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
      "Violation of these rules may result in suspension or termination of your account, proportionate to the seriousness of the breach. We will tell you why and, except where the breach is serious or unlawful, give you a chance to put it right first. We may report illegal activity to the relevant authorities. Where an account is terminated for a breach you caused, we do not refund the remaining subscription period, without prejudice to any statutory right of withdrawal or refund you have.",
  },
  {
    title: "Article 7. Intellectual Property",
    content:
      "All content on ExamKlaar, including exam questions, explanations, audio, design, software code, and AI-generated content, is owned by ExamKlaar or its licensors and is protected by Dutch and international intellectual property law (Auteurswet). You are granted a limited, personal, non-transferable, non-sublicensable licence to access and use the platform for your own personal exam preparation only. You may not reproduce, distribute, publicly display, or create derivative works from our content without prior written permission.",
  },
  {
    title: "Article 8. AI Feedback Disclaimer",
    content:
      "ExamKlaar uses third-party artificial intelligence to generate feedback on written exam responses and on transcripts of audio recordings. This feedback is for educational purposes only and does not constitute a guarantee of exam results. AI feedback may occasionally contain errors or inaccuracies. We make no warranty that the feedback is correct, complete, or suitable for any particular purpose, and we do not guarantee that using ExamKlaar will result in passing the official inburgering exam.",
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
        text: "Nothing in this article excludes or limits our liability for death or personal injury caused by our negligence, for damage caused by our intent or conscious recklessness (opzet of bewuste roekeloosheid), for fraud or fraudulent misrepresentation, or for any other liability that cannot be excluded under Dutch or EU mandatory consumer protection law. The cap above does not apply in those cases.",
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
        text: "You may request deletion of your account at any time by contacting us at hallo@examklaar.nl. Your personal data will be permanently removed within 30 days of your request, subject to legal retention obligations.",
      },
      {
        subtitle: "By us",
        text: "We may suspend or terminate an account that violates these Terms. We will give you notice and the reason, and for a minor or first-time violation we will issue a warning and a chance to put it right before terminating. We act without prior notice only where the breach is serious or unlawful and delay would cause harm.",
      },
      {
        subtitle: "Effect of termination",
        text: "Upon termination, your right to access the platform ceases. Where an account is terminated for a breach you caused, we do not refund the remaining subscription period, without prejudice to any statutory right of withdrawal or refund you have. If we terminate for any other reason, we refund the unused part of the period you paid for.",
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
        subtitle: "Alternative dispute resolution (EU consumers)",
        text: "EU consumers who cannot resolve a complaint directly with us may refer the dispute to a recognised alternative dispute resolution body in their country of residence. Payment and billing disputes should be directed to Paddle as the Merchant of Record via paddle.net.",
      },
      {
        subtitle: "Competent court",
        // TODO: restore the city of the competent court once the registered address is finalised:
        // text: "If a dispute cannot be resolved amicably, it will be submitted to the exclusive jurisdiction of the competent court in [City], the Netherlands, unless mandatory consumer law in your country of residence grants you the right to bring proceedings there.",
        text: "If a dispute cannot be resolved amicably, it will be submitted to the exclusive jurisdiction of the competent Dutch court, unless mandatory consumer law in your country of residence grants you the right to bring proceedings there.",
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
      "These Terms are governed by the laws of the Netherlands. This choice of law does not deprive you of the protection of the mandatory consumer provisions of the country where you habitually reside, which continue to apply.",
  },
  {
    title: "Article 16. Contact",
    content:
      "Questions about these Terms? Contact us at hallo@examklaar.nl. We aim to respond within 30 days.",
    // TODO: restore business details (legal entity name, KvK number, registered address) once finalised:
    // footer: "[Legal Entity Name], [Address, City, the Netherlands]. KvK: [KvK Number].",
    footer: "ExamKlaar, the Netherlands. Contact: hallo@examklaar.nl.",
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      lastUpdated={LAST_UPDATED}
      intro="Please read these terms carefully before using ExamKlaar. They explain your rights and responsibilities as a user of our platform."
      sections={SECTIONS}
    />
  );
}
