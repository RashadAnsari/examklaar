import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/layout/LegalPage";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Read the ExamKlaar terms and conditions. Understand your rights and responsibilities as a user of our exam preparation platform.",
  alternates: { canonical: `${site.url}/terms-and-conditions` },
};

const LAST_UPDATED = "2 October 2026";

const SECTIONS: LegalSection[] = [
  {
    title: "Article 1. General",
    // TODO: restore business details (legal entity name, KvK number, registered address) once finalised:
    // content: `ExamKlaar (www.examklaar.nl) is an online platform providing practice exams and AI-generated feedback for people preparing for the Dutch inburgering (civic integration) exam. ExamKlaar is operated by [Legal Entity Name], registered at the Dutch Chamber of Commerce (KvK) under number [KvK Number], located at [Address, City, the Netherlands].`,
    content: `ExamKlaar (www.examklaar.nl) is an online platform providing practice exams and AI-generated feedback for people preparing for the Dutch inburgering (civic integration) exam. ExamKlaar is operated from the Netherlands.`,
    footer:
      "These Terms & Conditions apply to all use of ExamKlaar. By creating an account or using the platform, you agree to them.",
  },
  {
    title: "Article 2. Your Account",
    items: [
      {
        text: "You must be at least 18 years old to create an account.",
      },
      {
        text: "You must give accurate information when you register, and create an account only for yourself.",
      },
      {
        text: "You are responsible for keeping your password secret and for activity under your account.",
      },
    ],
  },
  {
    title: "Article 3. Our Services",
    content: "ExamKlaar provides:",
    items: [
      {
        text: "Practice exams for the five components of the inburgering exam: KNM, reading, listening, speaking and writing",
      },
      { text: "AI-generated feedback on writing and speaking answers" },
      { text: "Progress tracking and exam history" },
      {
        text: "A monthly subscription that gives access to every exam. No subscriptions are sold during early access (Article 5).",
      },
    ],
    footer: "ExamKlaar is not affiliated with or endorsed by the Dutch government or DUO.",
  },
  {
    title: "Article 4. Changes to the Platform",
    content:
      "We may change the platform to add or improve exams and features, to fix problems, to keep it secure, or to follow the law. Changes never cost you extra.",
    items: [
      {
        subtitle: "Changes that affect a subscription",
        text: "If a change during a paid subscription has more than a minor negative effect on your access to or use of the platform, we tell you by email in advance what changes and when.",
      },
      {
        subtitle: "Your right to end the subscription",
        text: "You can then end your subscription free of charge within 30 days after that email, or after the change takes effect if that is later. We refund what you paid for the period after it ends.",
      },
    ],
  },
  {
    title: "Article 5. Free Access",
    content:
      "We offer free access in two forms. The pricing page shows which one applies at the moment.",
    items: [
      {
        subtitle: "One free exam per skill",
        text: "Every registered user can take the first exam of each skill for free, including its AI feedback. No payment method is needed, and this access does not expire and never turns into a subscription. Outside early access, the other exams require a paid subscription.",
      },
      {
        subtitle: "Early access",
        text: "While ExamKlaar is in early access, every registered user can use every exam for free, including its AI feedback, without a payment method. No subscriptions are sold during early access. Early access has no fixed end date. We will tell you by email at least 14 days before it ends. When it ends, nothing is charged automatically. You keep the free exam per skill described above, and the other exams, including their results and feedback, need a subscription that you choose to buy.",
      },
      {
        subtitle: "Changes to these offers",
        text: "We may change which exams are free. We tell you about such a change in the same way and with the same notice as a change to these Terms (Article 15).",
      },
    ],
  },
  {
    title: "Article 6. Subscriptions and Payments",
    content:
      "This article applies once paid subscriptions are sold, which is not the case during early access. Subscriptions are sold by Paddle.com Market Limited ('Paddle') as Merchant of Record. Paddle is the seller, processes your payment, and handles VAT and invoices. When you buy a subscription, Paddle's Buyer Terms also apply.",
    items: [
      {
        subtitle: "Billing",
        text: "The subscription renews and is billed every month until you cancel.",
      },
      {
        subtitle: "Cancellation",
        text: "You can cancel at any time in your account settings or by emailing hallo@examklaar.nl. You keep access until the end of the period you paid for, and after that you keep the free access in Article 5.",
      },
      {
        subtitle: "Price changes",
        text: "We will tell you about a price change by email at least 30 days before it applies to you. You can cancel free of charge before the new price takes effect. A price change never applies to a period you have already paid for.",
      },
      {
        subtitle: "Failed payments",
        text: "If a payment fails, Paddle will retry it and let you know. If payment cannot be collected, your subscription ends and you keep the free access in Article 5.",
      },
      {
        subtitle: "Refunds and withdrawal",
        text: "Your statutory 14-day right of withdrawal and refunds are handled by Paddle. Our Refund Policy explains how this works.",
      },
    ],
  },
  {
    title: "Article 7. Acceptable Use",
    content: "You may not:",
    items: [
      { text: "Share your account with others or resell access to the platform" },
      {
        text: "Copy, scrape or redistribute exam content or feedback",
      },
      {
        text: "Use bots or other automated tools to access the platform",
      },
      {
        text: "Submit offensive, illegal or infringing content in your answers or recordings",
      },
      {
        text: "Try to hack, disrupt or reverse-engineer the platform",
      },
      { text: "Pretend to be someone else" },
    ],
    footer:
      "We do not check answers or recordings in advance. We act when we find a breach ourselves or someone reports one to us, and a person makes every decision, not an automated tool. To report illegal content, email hallo@examklaar.nl with where it is and why you think it is illegal. If you break these rules, we may remove the content concerned, or suspend or close your account, as set out in Article 13. We may report illegal activity to the authorities.",
  },
  {
    title: "Article 8. Intellectual Property",
    content:
      "All content on ExamKlaar, including exam questions, audio, video, images, design and software, belongs to ExamKlaar or its licensors and is protected by copyright. You may use it only for your own exam preparation. You may not copy, share or publish it without our written permission.",
  },
  {
    title: "Article 9. AI Feedback",
    content:
      "Feedback on writing and speaking answers is generated by artificial intelligence. It is meant to help you practise, may contain mistakes, and is not an official assessment. We do not guarantee that your practice scores match your result in the official exam, or that using ExamKlaar means you will pass.",
  },
  {
    title: "Article 10. Availability",
    content:
      "We aim to keep ExamKlaar available at all times but cannot guarantee uninterrupted access. Maintenance, technical problems or events outside our control may cause interruptions. Where possible, we announce planned maintenance in advance.",
  },
  {
    title: "Article 11. Liability",
    content:
      "As far as the law allows, ExamKlaar is not liable for indirect or consequential damage, such as lost data, a missed exam appointment, or failing the official inburgering exam.",
    items: [
      {
        subtitle: "Liability cap",
        text: "Our total liability is limited to the amount you paid us in the 3 months before the event that caused the damage.",
      },
      {
        subtitle: "Exceptions",
        text: "These limits do not apply to damage caused by our intent or gross negligence, to death or personal injury, or to any liability that cannot be limited under mandatory consumer law.",
      },
    ],
  },
  {
    title: "Article 12. Force Majeure",
    content:
      "We are not liable for failing to perform our obligations because of circumstances outside our reasonable control, such as natural disasters, government measures, internet outages, failures of our suppliers, or cyberattacks. We will tell you as soon as possible and do what we reasonably can to restore the service.",
  },
  {
    title: "Article 13. Ending Your Account",
    items: [
      {
        subtitle: "By you",
        text: "You can ask us to delete your account at any time by emailing hallo@examklaar.nl. Deleting your account ends your access immediately and cancels any subscription, so cancel first if you want to use the rest of a paid period.",
      },
      {
        subtitle: "By us",
        text: "We may suspend or close your account if you break these Terms. For a minor first breach we give you a warning and a chance to fix it first. We act without notice only for serious or illegal breaches.",
      },
      {
        subtitle: "Our reasons and your objection",
        text: "If we remove your content or restrict your account, we email you what we did and for how long, the facts behind it, and the rule in these Terms or the law it is based on. You can object by replying to that email. A person reviews every objection, and we tell you the outcome.",
      },
      {
        subtitle: "Refunds on closure",
        text: "If we close your account because you broke these Terms, we do not refund the rest of the paid period. If we close it for any other reason, we refund the unused part. Your statutory rights are not affected.",
      },
    ],
  },
  {
    title: "Article 14. Complaints and Disputes",
    items: [
      {
        subtitle: "Contact us first",
        text: "Send complaints to hallo@examklaar.nl. We aim to resolve them within 30 days. Payment and billing complaints go to Paddle via paddle.net.",
      },
      {
        subtitle: "Dispute resolution",
        text: "If we cannot resolve your complaint, you can take it to a recognised alternative dispute resolution body in your country, or to court.",
      },
      {
        subtitle: "Competent court",
        // TODO: restore the city of the competent court once the registered address is finalised:
        // text: "Disputes are submitted to the competent court in [City], the Netherlands. If you are a consumer, you may also bring proceedings in the courts of the country where you live.",
        text: "Disputes are submitted to the competent Dutch court. If you are a consumer, you may also bring proceedings in the courts of the country where you live.",
      },
    ],
  },
  {
    title: "Article 15. Changes to These Terms",
    content:
      "We may update these Terms. We will tell you about material changes by email or with a notice on the platform at least 14 days before they take effect. If you do not agree, you can cancel your subscription and close your account before then. If you keep using ExamKlaar after that date, the new Terms apply.",
  },
  {
    title: "Article 16. Governing Law",
    content:
      "Dutch law applies to these Terms. If you are a consumer living in another country, you also keep the protection of the mandatory consumer law of that country.",
  },
  {
    title: "Article 17. Contact",
    content:
      "Questions about these Terms? Email us at hallo@examklaar.nl. This address is also our single point of contact under the EU Digital Services Act, for users and for authorities. You can write to us in Dutch or English.",
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
      intro="Please read these terms before using ExamKlaar. They explain your rights and responsibilities as a user of the platform."
      sections={SECTIONS}
    />
  );
}
