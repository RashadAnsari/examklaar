import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/layout/LegalPage";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the ExamKlaar privacy policy to understand how we collect, use, and protect your personal data.",
  alternates: { canonical: `${site.url}/privacy-policy` },
};

const LAST_UPDATED = "17 October 2026";

const SECTIONS: LegalSection[] = [
  {
    title: "1. Who We Are",
    // TODO: restore business details (legal entity name, KvK number, registered address) once finalised:
    // content: `ExamKlaar (www.examklaar.nl) is an online platform that helps people prepare for the Dutch inburgering (civic integration) exam through practice exams and AI-generated feedback. ExamKlaar is operated by [Legal Entity Name], registered at the Dutch Chamber of Commerce (KvK) under number [KvK Number], located at [Address, City, the Netherlands], which is the controller of the personal data described in this policy.`,
    content: `ExamKlaar (www.examklaar.nl) is an online platform that helps people prepare for the Dutch inburgering (civic integration) exam through practice exams and AI-generated feedback. ExamKlaar is based in the Netherlands and is the controller of the personal data described in this policy.`,
    footer:
      "Contact: hallo@examklaar.nl. We have not appointed a Data Protection Officer, as we are not required to under Article 37 GDPR.",
  },
  {
    title: "2. What Personal Data We Collect",
    items: [
      {
        subtitle: "Account data",
        text: "Your name, email address and password when you register. Passwords are stored only in a form we cannot read.",
      },
      {
        subtitle: "Exam answers and results",
        text: "Your answers, scores, feedback and exam history, so you can track your progress.",
      },
      {
        subtitle: "Speaking recordings",
        text: "The audio you record in speaking exercises and a written transcript of it, which we use to give you feedback.",
      },
      {
        subtitle: "Usage data",
        text: "Only if you accept analytics cookies: which pages you visit, how you arrived, your approximate location (city or country), and your device and browser type.",
      },
      {
        subtitle: "Technical logs",
        text: "Your IP address, browser type and the time of each request, recorded by our servers.",
      },
    ],
    footer:
      "You need to give us your name and email address to create an account, and your answers to receive feedback. Without them we cannot provide the service. Accepting analytics cookies is optional.",
  },
  {
    title: "3. Why We Use Your Data and Our Legal Basis",
    content:
      "We use your personal data only for the purposes below, each with its legal basis under the GDPR:",
    items: [
      {
        subtitle: "Providing the service (contract, Art. 6(1)(b))",
        text: "Running your account, letting you take exams, giving you feedback, and sending emails the service needs, such as email confirmation and password reset.",
      },
      {
        subtitle: "Security (legitimate interest, Art. 6(1)(f))",
        text: "Keeping technical logs to protect the platform against fraud, abuse and attacks. We have weighed this interest against your privacy and limit it to what is needed.",
      },
      {
        subtitle: "Legal obligations (Art. 6(1)(c))",
        text: "Keeping billing records as Dutch tax law requires, and responding to lawful requests from authorities.",
      },
      {
        subtitle: "Consent (Art. 6(1)(a))",
        text: "Analytics cookies, and marketing emails if we ever send them. Marketing emails are sent only to people who opt in and always contain an unsubscribe link. You can withdraw consent at any time, which does not affect processing that took place before.",
      },
    ],
  },
  {
    title: "4. AI Feedback",
    content:
      "Feedback on writing and speaking answers is generated automatically by an AI model. It is practice feedback only: it has no legal effect on you, does not affect your official inburgering exam, and is not automated decision-making within the meaning of Article 22 GDPR. If you think feedback is wrong, you can contact us.",
  },
  {
    title: "5. Who We Share Your Data With",
    content:
      "We do not sell your personal data. We share it only with the service providers below. Those acting on our behalf (processors) may use it only on our instructions and under a data processing agreement.",
    items: [
      {
        subtitle: "Hetzner Online GmbH (Germany), processor",
        text: "Hosts the platform. Your account data and exam results are stored in its data centres in the EU.",
      },
      {
        subtitle: "Cloudflare, Inc. (USA), processor",
        text: "Stores speaking recordings and our backups in EU data centres, and delivers exam images, audio and video.",
      },
      {
        subtitle: "Google LLC (USA), processor, AI feedback",
        text: "Generates feedback on your writing and speaking answers. We send only the exam question and your written answer or the transcript of your recording. We never send your name, email address or audio. Google does not use this content to train its models, and keeps it for a limited period only to detect misuse of its service. Please do not include personal details in your answers beyond what the question asks for.",
      },
      {
        subtitle: "Google LLC (USA), processor, Google Analytics",
        text: "Measures how visitors use the website, only if you accept analytics cookies. We have turned off advertising and data-sharing features.",
      },
      {
        subtitle: "Brevo SAS (France), processor",
        text: "Sends the emails the service needs. Brevo receives only your email address.",
      },
    ],
    footer:
      "We share data with other parties only where the law requires it, for example under a court order.",
  },
  {
    title: "6. Transfers Outside the EU",
    content:
      "Some of these providers are based outside the European Economic Area. We transfer data to them only with a safeguard recognised by the GDPR:",
    items: [
      {
        subtitle: "Google (USA)",
        text: "The EU-US Data Privacy Framework, backed by the European Commission's adequacy decision, with Standard Contractual Clauses as an additional safeguard.",
      },
      {
        subtitle: "Cloudflare (USA)",
        text: "Standard Contractual Clauses, for any access from outside the EU to data stored in the EU.",
      },
    ],
    footer: "You can ask us for more information about these safeguards at hallo@examklaar.nl.",
  },
  {
    title: "7. How Long We Keep Your Data",
    items: [
      {
        subtitle: "Account data and exam results",
        text: "As long as you have an account. We delete them within 30 days after you ask us to delete your account. Our backups are kept for 30 days, so copies in them are gone 30 days after that.",
      },
      {
        subtitle: "Speaking recordings",
        text: "Deleted automatically 30 days after you record them, or sooner if you delete your account.",
      },
      {
        subtitle: "Billing records",
        text: "7 years, as Dutch tax law requires.",
      },
      {
        subtitle: "Technical logs",
        text: "Up to 90 days.",
      },
      {
        subtitle: "Analytics data",
        text: "Up to 14 months, after which Google Analytics deletes it automatically.",
      },
    ],
  },
  {
    title: "8. Your Rights",
    content:
      "You have the rights below. To use them, email hallo@examklaar.nl. We reply within one month. For complex requests we may need up to two more months, and if so we tell you within the first month.",
    items: [
      { subtitle: "Access", text: "Get a copy of the personal data we hold about you." },
      { subtitle: "Rectification", text: "Have incorrect or incomplete data corrected." },
      {
        subtitle: "Erasure",
        text: "Have your data deleted, except where the law requires us to keep it.",
      },
      {
        subtitle: "Restriction",
        text: "Have us limit how we use your data in certain situations.",
      },
      {
        subtitle: "Portability",
        text: "Receive the data you gave us in a structured, machine-readable format.",
      },
      {
        subtitle: "Objection",
        text: "Object to processing based on our legitimate interest. We then stop unless we have compelling grounds to continue.",
      },
      {
        subtitle: "Withdraw consent",
        text: "Withdraw consent you gave at any time.",
      },
    ],
    footer:
      "You also have the right to complain to the Dutch Data Protection Authority (Autoriteit Persoonsgegevens) at autoriteitpersoonsgegevens.nl, or to the data protection authority in the EU country where you live.",
  },
  {
    title: "9. Cookies",
    content:
      "When you first visit, we ask whether you accept analytics cookies. If you do not accept, none are placed.",
    items: [
      {
        subtitle: "Necessary",
        text: "A cookie that keeps you signed in, and a record of your cookie choice stored in your browser. These are needed for the website to work and do not require consent.",
      },
      {
        subtitle: "Analytics (with consent)",
        text: "Google Analytics cookies that measure how the website is used. They are not used for advertising.",
      },
    ],
    footer:
      "You can change or withdraw your choice at any time with the 'Cookie Preferences' link in the footer, or delete cookies in your browser settings. We do not use advertising or tracking cookies.",
  },
  {
    title: "10. Security",
    content:
      "We take appropriate technical and organisational measures to protect your personal data, as Article 32 GDPR requires. These include encryption in transit, storing passwords only in a form we cannot read, and limiting access to personal data to those who need it. If a data breach puts your rights at risk, we report it to the Autoriteit Persoonsgegevens within 72 hours and inform you without undue delay.",
  },
  {
    title: "11. Age",
    content:
      "ExamKlaar is intended for adults. You must be 18 or older to create an account. If you believe someone under 18 has given us personal data, contact us at hallo@examklaar.nl and we will delete it.",
  },
  {
    title: "12. Changes to This Policy",
    content:
      "We may update this policy. We will tell you about significant changes by email or with a notice on the platform before they take effect. The date at the top of this page shows the latest version.",
  },
  {
    title: "13. Contact",
    content: "Questions about this policy or your data? Email us at hallo@examklaar.nl.",
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
      intro="This policy explains what personal data we collect, why we collect it, and how we protect it."
      sections={SECTIONS}
    />
  );
}
