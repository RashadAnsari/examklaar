import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { PricingCards } from "@/components/pricing/PricingCards";
import { site } from "@/config/site";
import { isEarlyAccess } from "@/lib/payment/subscription";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  SparklesIcon,
  ClipboardDocumentIcon,
  MicrophoneIcon,
  ChartBarIcon,
  ClockIcon,
  UserPlusIcon,
  AcademicCapIcon,
  BoltIcon,
} from "@heroicons/react/20/solid";

const FEATURES_SUMMARY =
  "Realistic practice tests for all 5 inburgering exam components: KNM, Reading, Listening, Writing, and Speaking. AI-powered feedback included.";

/** The free part of the offer: everything during early access, one exam per skill after. */
function freeOffer(earlyAccess: boolean) {
  return earlyAccess
    ? "Every exam is free during early access."
    : "The first exam of every skill is free.";
}

export async function generateMetadata(): Promise<Metadata> {
  const offer = freeOffer(isEarlyAccess());
  const title = `${site.name}: ${site.tagline}`;
  const description = `${FEATURES_SUMMARY} ${offer}`;
  return {
    title,
    description: `Prepare for your Dutch inburgering exam (A2/B1) with realistic practice tests for KNM, Reading, Listening, Writing, and Speaking. AI-powered feedback included. ${offer}`,
    alternates: { canonical: site.url },
    openGraph: { title, description, url: site.url },
    twitter: { card: "summary_large_image", title, description },
  };
}

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: site.name,
  url: site.url,
  description:
    "Realistic oefenexamens for all 5 Dutch inburgering exam components with AI-powered feedback.",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: site.url,
  logo: `${site.url}/examklaar-logo.svg`,
  contactPoint: {
    "@type": "ContactPoint",
    email: site.supportEmail,
    contactType: "customer support",
  },
};

export default function LandingPage() {
  const earlyAccess = isEarlyAccess();

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Navbar />

      {/* Hero Section */}
      <section className="py-14 sm:py-24 text-center">
        <div className="container">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
            style={{ background: "var(--green-50)", color: "var(--green-700)" }}
          >
            <ClockIcon style={{ width: 15, height: 15 }} />
            {earlyAccess
              ? "Early access: every exam is free for now"
              : "Have an exam deadline? Start with a free exam today."}
          </div>

          <h1
            className="font-bold mb-6"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              lineHeight: 1.2,
              color: "var(--gray-900)",
            }}
          >
            Pass Your <span style={{ color: "var(--green-900)" }}>Inburgering Exam</span>
            <br />
            With Confidence
          </h1>
          <p
            className="mx-auto mb-10"
            style={{
              fontSize: "1.25rem",
              color: "var(--gray-600)",
              maxWidth: "640px",
              lineHeight: 1.75,
            }}
          >
            Realistic mock exams for all 5 components: KNM, Reading, Listening, Writing, and
            Speaking. AI-powered feedback on every answer.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button href="/auth/signup" variant="primary" size="lg">
              Start Practicing Free
              <ArrowRightIcon style={{ width: 20, height: 20 }} />
            </Button>
            <Button href="#how-it-works" variant="secondary" size="lg">
              See How It Works
            </Button>
          </div>

          {/* Trust badges */}
          <div
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-10 sm:mt-12 pt-8"
            style={{ borderTop: "1px solid var(--gray-200)" }}
          >
            <TrustItem
              icon={<CheckCircleIcon style={{ width: 18, height: 18 }} />}
              text={
                earlyAccess ? "Every exam free in early access" : "First exam of every skill free"
              }
            />
            <TrustItem
              icon={<AcademicCapIcon style={{ width: 18, height: 18 }} />}
              text="All 5 exam skills"
            />
            <TrustItem
              icon={<SparklesIcon style={{ width: 18, height: 18 }} />}
              text="AI feedback"
            />
            <TrustItem
              icon={<CheckCircleIcon style={{ width: 18, height: 18 }} />}
              text="Official DUO format"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-14 sm:py-20" style={{ background: "white" }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Get started in minutes, practice at your own pace</p>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-auto"
            style={{ maxWidth: "900px" }}
          >
            <StepCard
              step="1"
              icon={<UserPlusIcon style={{ width: 22, height: 22 }} />}
              title="Create your free account"
              description={
                earlyAccess
                  ? "Sign up and take every exam for free while we are in early access. No payment method needed."
                  : "Sign up and take the first exam of any skill for free. No payment method needed."
              }
            />
            <StepCard
              step="2"
              icon={<ClipboardDocumentIcon style={{ width: 22, height: 22 }} />}
              title="Choose a skill and practice"
              description="Pick any of the 5 exam components and take a realistic timed practice exam."
            />
            <StepCard
              step="3"
              icon={<SparklesIcon style={{ width: 22, height: 22 }} />}
              title="Get feedback and improve"
              description="Review your results instantly. Get AI feedback on your writing and speaking answers."
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-14 sm:py-20" style={{ background: "var(--gray-50)" }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Everything You Need to Pass</h2>
            <p className="section-subtitle">Focused on exam practice, not overwhelming courses</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<ClipboardDocumentIcon style={{ width: 24, height: 24 }} />}
              title="Exam-Like Conditions"
              description="Timed, structured practice exams that mirror the real inburgering exam. No surprises on exam day."
              highlight
            />
            <FeatureCard
              icon={<SparklesIcon style={{ width: 24, height: 24 }} />}
              title="AI Writing Feedback"
              description="Get instant corrections on your written Dutch with clear explanations for every grammar and vocabulary mistake."
              highlight
            />
            <FeatureCard
              icon={<MicrophoneIcon style={{ width: 24, height: 24 }} />}
              title="Speaking Practice"
              description="Record your answers and receive AI feedback on fluency, clarity, and structure."
              highlight
            />
            <FeatureCard
              icon={<AcademicCapIcon style={{ width: 24, height: 24 }} />}
              title="All 5 Exam Skills"
              description="KNM, Reading, Listening, Writing, and Speaking. Everything covered in one place, at your own pace."
            />
            <FeatureCard
              icon={<BoltIcon style={{ width: 24, height: 24 }} />}
              title="Built to the Official Format"
              description="Question types, timing, and pass marks follow the real DUO inburgering exam at CEFR level A2."
            />
            <FeatureCard
              icon={<ChartBarIcon style={{ width: 24, height: 24 }} />}
              title="Progress Tracking"
              description="See your scores over time across every skill so you know exactly where to focus your preparation."
            />
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-14 sm:py-20" style={{ background: "white" }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Simple, Transparent Pricing</h2>
            <p className="section-subtitle">
              {earlyAccess
                ? "Free during early access. This is what full access will cost when it ends."
                : "Full access to every exam with AI feedback. Cancel anytime."}
            </p>
          </div>

          <PricingCards />
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-14 sm:py-20 text-center"
        style={{ background: "var(--green-900)", color: "white" }}
      >
        <div className="container" style={{ maxWidth: "700px" }}>
          <h2 className="font-bold mb-4" style={{ fontSize: "clamp(1.75rem, 6vw, 2.5rem)" }}>
            Start Preparing Today
          </h2>
          <p className="mb-8 opacity-90" style={{ fontSize: "1.25rem", lineHeight: 1.7 }}>
            {earlyAccess
              ? `Every exam on ${site.name} is free while we are in early access.`
              : `Take the first exam of every skill on ${site.name} for free.`}{" "}
            Practice at your own pace and walk into your exam with confidence.
          </p>
          <Button href="/auth/signup" variant="white" size="lg">
            Start Practicing Free
            <ArrowRightIcon style={{ width: 20, height: 20 }} />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ==================== SECTION COMPONENTS ==================== */

function TrustItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div
      className="flex items-center gap-2 text-sm font-medium"
      style={{ color: "var(--gray-600)" }}
    >
      <span style={{ color: "var(--green-700)" }}>{icon}</span>
      {text}
    </div>
  );
}

function StepCard({
  step,
  icon,
  title,
  description,
}: {
  step: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div
      className="flex flex-col items-center text-center p-5 sm:p-8 rounded-2xl border"
      style={{ background: "var(--gray-50)", borderColor: "var(--gray-200)" }}
    >
      <div className="relative mb-6">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: "var(--green-50)", color: "var(--green-900)" }}
        >
          {icon}
        </div>
        <span
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{ background: "var(--green-900)" }}
        >
          {step}
        </span>
      </div>
      <h3 className="font-semibold mb-2" style={{ fontSize: "1.05rem", color: "var(--gray-900)" }}>
        {title}
      </h3>
      <p className="text-sm" style={{ color: "var(--gray-500)", lineHeight: 1.7 }}>
        {description}
      </p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  highlight = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="p-5 sm:p-8 rounded-2xl border"
      style={{
        background: highlight ? "white" : "var(--gray-50)",
        borderColor: highlight ? "var(--gray-200)" : "var(--gray-150)",
        boxShadow: highlight ? "0 1px 6px rgba(0,0,0,0.06)" : "none",
      }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
        style={{ background: "var(--green-50)", color: "var(--green-900)" }}
      >
        {icon}
      </div>
      <h3 className="font-semibold mb-3" style={{ fontSize: "1.1rem", color: "var(--gray-900)" }}>
        {title}
      </h3>
      <p style={{ color: "var(--gray-600)", lineHeight: 1.7, fontSize: "0.95rem" }}>
        {description}
      </p>
    </div>
  );
}
