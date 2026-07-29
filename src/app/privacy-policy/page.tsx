import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the ExamKlaar privacy policy to understand how we collect, use, and protect your personal data.",
  alternates: { canonical: "https://www.examklaar.nl/privacy-policy" },
};

const LAST_UPDATED = "29 July 2026";

const SECTIONS: LegalSection[] = [
  {
    title: "1. Who We Are",
    // TODO: restore business details (legal entity name, KvK number, registered address) once finalised:
    // content: `ExamKlaar (www.examklaar.nl) is an online platform that helps people prepare for the Dutch inburgering (civic integration) exam through realistic practice exams and AI-powered feedback. ExamKlaar is operated by [Legal Entity Name], registered at the Dutch Chamber of Commerce (KvK) under number [KvK Number], located at [Address, City, the Netherlands].`,
    content: `ExamKlaar (www.examklaar.nl) is an online platform that helps people prepare for the Dutch inburgering (civic integration) exam through realistic practice exams and AI-powered feedback. ExamKlaar is based in the Netherlands and is the data controller responsible for the personal data described in this policy.`,
    footer:
      "Contact: hallo@examklaar.nl. We have not appointed a Data Protection Officer, as we are not required to do so under Article 37 GDPR.",
  },
  {
    title: "2. What Personal Data We Collect",
    content: "We collect only the data necessary to provide our services:",
    items: [
      {
        subtitle: "Account data",
        text: "Your name and email address, collected when you register an account.",
      },
      {
        subtitle: "Exam results and progress",
        text: "Your answers, scores, AI-generated feedback, and exam history, so you can track your progress over time.",
      },
      {
        subtitle: "Audio recordings",
        text: "For speaking exercises, we collect the audio you submit. Recordings are transcribed on our own infrastructure, used solely to generate AI-powered feedback, and automatically deleted after 30 days.",
      },
      {
        subtitle: "Payment reference data",
        text: "We store a reference to your Paddle customer ID and subscription status. We do not receive, store, or process your payment card details. These are handled exclusively by Paddle as Merchant of Record.",
      },
      {
        subtitle: "Usage and analytics data",
        text: "If you accept analytics cookies, we use Google Analytics to collect data about how you use our website, including pages viewed, referral source, approximate (city or country level) location derived from your IP address, and general device and browser type. These cookies are set only after you give consent via our cookie banner. We do not enable advertising or remarketing features, and we do not use this data to identify you personally.",
      },
      {
        subtitle: "Technical logs",
        text: "Standard server logs may include your IP address, browser type, and request timestamps, retained for up to 90 days for security and debugging purposes.",
      },
    ],
  },
  {
    title: "3. How We Use Your Data",
    content: "We use your personal data only for the following purposes:",
    items: [
      { text: "To create and manage your account and authenticate your access" },
      { text: "To deliver our exam practice services and AI-generated feedback" },
      {
        text: "To send transactional emails via our email service provider (e.g. email confirmation, password reset, subscription updates)",
      },
      { text: "To manage your subscription status in coordination with Paddle" },
      { text: "To monitor for fraud, abuse, and security threats on the platform" },
      {
        text: "With your consent, to analyse how visitors use the platform so we can improve it",
      },
    ],
  },
  {
    title: "4. Legal Basis for Processing (GDPR)",
    content:
      "We process your personal data on the following legal grounds under the GDPR and the Dutch UAVG:",
    items: [
      {
        subtitle: "Contract performance (Art. 6(1)(b))",
        text: "Processing your account data, exam data, audio recordings, and subscription reference is necessary to deliver the services you signed up for.",
      },
      {
        subtitle: "Legitimate interest (Art. 6(1)(f))",
        text: "We process security logs to protect the platform and prevent abuse. We have assessed that this interest does not override your fundamental rights.",
      },
      {
        subtitle: "Legal obligation (Art. 6(1)(c))",
        text: "We retain financial reference records for 7 years as required under Dutch tax law (art. 52 AWR).",
      },
      {
        subtitle: "Consent (Art. 6(1)(a))",
        text: "We rely on your consent to place analytics cookies and to send optional marketing communications. You may withdraw analytics consent at any time via the 'Cookie Preferences' link in our footer, and marketing consent by contacting hallo@examklaar.nl or using the unsubscribe link in any email. Withdrawal does not affect the lawfulness of prior processing.",
      },
    ],
  },
  {
    title: "5. Data Sharing and Processors",
    content:
      "We do not sell your personal data. We share data only with the following service providers. Those acting as our processors are bound by a data processing agreement; where a party acts as an independent controller for its own purposes, that is stated below.",
    items: [
      {
        subtitle: "Hetzner Online GmbH (Germany), Data Processor",
        text: "Our hosting provider. The application and its database run on a server we control in a Hetzner data centre in the European Union. Your account data, exam results, and subscription reference are stored there and are not transferred outside the EU.",
      },
      {
        subtitle: "Cloudflare, Inc. (USA), Data Processor",
        text: "Our object storage provider. Your audio recordings are stored in Cloudflare R2 under its EU jurisdiction setting, which keeps the files in European data centres, and are deleted automatically 30 days after upload. Cloudflare, Inc. is a US company; any incidental access from outside the EEA is covered by the Standard Contractual Clauses in Cloudflare's data processing addendum.",
      },
      {
        subtitle: "Google LLC (USA), AI feedback",
        text: "We use Google AI models to generate feedback on your writing and speaking answers. What we send is the exam question together with the answer you wrote or the transcript of what you said. We never send your name, email address, or any account identifier, and your audio files are transcribed on our own infrastructure and never reach Google. Under the Google AI service tier we currently use, Google may retain the submitted text and use it to improve its models, so please do not include personal details about yourself or anyone else in an exam answer beyond what the question asks for. Transfers to the USA are covered by the EU-US Data Privacy Framework, with Standard Contractual Clauses as an additional safeguard.",
      },
      {
        subtitle: "Paddle.com Market Ltd (UK), Independent Data Controller",
        text: "Paddle acts as Merchant of Record for all payments. Paddle is independently responsible for processing your payment and billing data under their own privacy policy. Transfers from the EU to the UK are lawful under the EU adequacy decision for the UK.",
      },
      {
        subtitle: "Brevo SAS (France), Data Processor",
        text: "Our email service provider for transactional emails (account verification, password reset, subscription notifications) and optional marketing communications. Only your email address and name are shared. Brevo is based in the EU (Paris, France), so no international data transfer occurs.",
      },
      {
        subtitle: "Google LLC (USA), Data Processor (Google Analytics)",
        text: "If you accept analytics cookies, we use Google Analytics to understand how visitors use our website. Google processes usage and device data on our behalf and sets cookies to do so. Google Analytics 4 does not log or store full IP addresses, and we have disabled advertising, remarketing, and data-sharing (Google signals) features. Transfers to the USA are covered by the EU-US Data Privacy Framework. No analytics data is collected until you consent.",
      },
    ],
    footer:
      "We do not share your data with any other third parties, except where required by law (e.g. a court order or regulatory request from a competent authority).",
  },
  {
    title: "6. International Data Transfers",
    content:
      "Your account data and exam results are stored within the EU on our own server at Hetzner, and your audio recordings are stored within the EU in Cloudflare R2. Some of our service providers are based outside the EEA. Where transfers occur, we ensure appropriate safeguards are in place:",
    items: [
      {
        subtitle: "EU-US Data Privacy Framework",
        text: "For transfers to Google in the USA, covering both AI feedback and Google Analytics, we rely on the EU-US Data Privacy Framework, under which the European Commission has recognised certified US organisations as providing an adequate level of data protection. Standard Contractual Clauses under Article 46(2)(c) GDPR apply as an additional safeguard.",
      },
      {
        subtitle: "Adequacy decision",
        text: "For transfers to Paddle (United Kingdom), the European Commission has recognised the UK as providing an adequate level of data protection.",
      },
      {
        subtitle: "Standard Contractual Clauses",
        text: "For any incidental access by Cloudflare, Inc. (USA) to recordings hosted in the EU, Standard Contractual Clauses under Article 46(2)(c) GDPR apply.",
      },
    ],
    footer:
      "You may request more information about the applicable transfer safeguards by contacting hallo@examklaar.nl.",
  },
  {
    title: "7. Data Retention",
    content: "We retain personal data only for as long as necessary:",
    items: [
      {
        subtitle: "Account data (name, email)",
        text: "Retained for the duration of your account. Deleted within 30 days of account deletion.",
      },
      {
        subtitle: "Exam results and progress",
        text: "Retained for the duration of your account. Deleted within 30 days of account deletion.",
      },
      {
        subtitle: "Audio recordings",
        text: "Automatically deleted after 30 days, regardless of account status.",
      },
      {
        subtitle: "Subscription reference records",
        text: "Retained for 7 years as required under Dutch tax and accounting law.",
      },
      {
        subtitle: "Server logs",
        text: "Retained for up to 90 days for security purposes, then deleted.",
      },
      {
        subtitle: "Analytics data",
        text: "Collected only with your consent and retained in Google Analytics for up to 14 months, after which it is automatically deleted. Withdrawing consent stops further collection.",
      },
    ],
  },
  {
    title: "8. Your Rights Under the GDPR",
    content:
      "You have the following rights regarding your personal data. Contact us at hallo@examklaar.nl to exercise them. We will respond without undue delay and in any event within one month, extendable by a further two months for complex requests, in which case we will tell you within the first month:",
    items: [
      {
        subtitle: "Access (Art. 15)",
        text: "Request a copy of the personal data we hold about you.",
      },
      {
        subtitle: "Rectification (Art. 16)",
        text: "Ask us to correct inaccurate or incomplete data.",
      },
      {
        subtitle: "Erasure (Art. 17)",
        text: "Request deletion of your personal data, subject to legal retention obligations.",
      },
      {
        subtitle: "Portability (Art. 20)",
        text: "Receive your data in a structured, machine-readable format.",
      },
      {
        subtitle: "Objection (Art. 21)",
        text: "Object to processing based on our legitimate interest. We will stop unless we can demonstrate compelling grounds.",
      },
      {
        subtitle: "Restriction (Art. 18)",
        text: "Ask us to limit how we process your data in certain circumstances.",
      },
      {
        subtitle: "Withdraw consent (Art. 7(3))",
        text: "Where processing is based on consent, withdraw it at any time without affecting prior processing.",
      },
    ],
    footer:
      "If you are not satisfied with our response, you have the right to lodge a complaint with the Dutch Data Protection Authority (Autoriteit Persoonsgegevens), Postbus 93374, 2509 AJ Den Haag, at autoriteitpersoonsgegevens.nl, or by calling +31 70 888 8500.",
  },
  {
    title: "9. Cookies and Analytics",
    content:
      "When you first visit ExamKlaar, a cookie banner asks whether you accept analytics cookies. Analytics cookies are placed only if you accept; if you reject, none are set.",
    items: [
      {
        subtitle: "Essential cookies and storage",
        text: "We use a session cookie that is strictly necessary for authentication, and we store your cookie choice itself in your browser's local storage under the key 'examklaar-cookie-consent' so we can remember it and honour it on your next visit. Both are strictly necessary, so neither requires consent, and neither can be disabled without breaking the service. Nothing is stored for analytics until you accept.",
      },
      {
        subtitle: "Analytics cookies (Google Analytics)",
        text: "If you accept, Google Analytics sets cookies to measure traffic and understand how the platform is used. Google Analytics 4 does not log or store full IP addresses, and we have disabled advertising, remarketing, and data-sharing (Google signals) features. These cookies are placed only after consent and are not used to build advertising profiles.",
      },
      {
        subtitle: "Managing and withdrawing consent",
        text: "You can change or withdraw your consent at any time using the 'Cookie Preferences' link in the footer. Withdrawing consent stops further analytics collection. You can also block or delete cookies through your browser settings.",
      },
      {
        subtitle: "No advertising or tracking cookies",
        text: "We do not use Facebook Pixel or any third-party advertising or retargeting cookies, and we do not sell your data.",
      },
    ],
  },
  {
    title: "10. Security",
    content:
      "We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, loss, or disclosure, as required by Article 32 GDPR. These include encryption of data in transit, storing passwords only in hashed form, and access controls that limit personal data to the people who need it to operate the service, under confidentiality obligations. We review these measures periodically. In the unlikely event of a data breach that poses a risk to your rights, we will notify the Autoriteit Persoonsgegevens within 72 hours and inform affected users without undue delay.",
  },
  {
    title: "11. Children",
    content:
      "ExamKlaar is not directed at children under the age of 16. We do not knowingly collect personal data from anyone under 16. If you believe we have inadvertently collected such data, please contact us at hallo@examklaar.nl and we will delete it promptly.",
  },
  {
    title: "12. Changes to This Policy",
    content:
      "We may update this Privacy Policy from time to time. If we make significant changes, we will notify you by email or via a notice on the platform at least 14 days before they take effect. The date at the top of this page always reflects the latest version.",
  },
  {
    title: "13. Contact",
    content:
      "If you have questions about this Privacy Policy or our data practices, please contact us at hallo@examklaar.nl. We aim to respond within 30 days.",
    // TODO: restore business details (legal entity name, KvK number, registered address) once finalised:
    // footer: "[Legal Entity Name], [Address, City, the Netherlands]. KvK: [KvK Number].",
    footer: "ExamKlaar, the Netherlands. Contact: hallo@examklaar.nl.",
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated={LAST_UPDATED}
      intro="We respect your privacy. This policy explains what personal data we collect, why we collect it, and how we protect it."
      sections={SECTIONS}
    />
  );
}
