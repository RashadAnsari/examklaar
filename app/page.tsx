import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="container py-20 text-center">
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
            maxWidth: "700px",
            lineHeight: 1.75,
          }}
        >
          Realistic mock exams for KNM, Reading, Listening, Writing, and Speaking. Practice with
          AI-powered feedback in your native language.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Button href="/signup" variant="primary" size="lg">
            Start Free Practice
            <ArrowRightIcon />
          </Button>
          <Button href="/pricing" variant="secondary" size="lg">
            View Pricing
          </Button>
        </div>

        {/* Trust badges */}
        <div
          className="flex flex-wrap items-center justify-center gap-8 mt-12 pt-8"
          style={{ borderTop: "1px solid var(--gray-200)" }}
        >
          <TrustItem icon={<CheckCircleIcon />} text="2025 KNM Format" />
          <TrustItem icon={<GlobeIcon />} text="Multi-language UI" />
          <TrustItem icon={<SparklesIcon />} text="AI Feedback" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20" style={{ background: "white" }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Everything You Need to Pass</h2>
            <p className="section-subtitle">Focused on exam practice, not overwhelming courses</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<ClipboardIcon />}
              title="Full Exam Simulations"
              description="Practice all five skills: KNM, Reading, Listening, Writing, and Speaking with real exam timing and conditions."
            />
            <FeatureCard
              icon={<UsersIcon />}
              title="Native Language Support"
              description="UI available in Dutch, English, Farsi, Arabic, and Turkish. Practice in your comfort zone."
            />
            <FeatureCard
              icon={<CalendarIcon />}
              title="2025 KNM Content"
              description="Updated for the new July 2025 exam format. Don't waste time on outdated materials."
            />
            <FeatureCard
              icon={<InfoIcon />}
              title="AI Writing Corrections"
              description="Get instant feedback on your written Dutch with detailed grammar and vocabulary suggestions."
            />
            <FeatureCard
              icon={<MicrophoneIcon />}
              title="Speaking Practice"
              description="Record your answers and get AI transcription and pronunciation feedback for speaking tasks."
            />
            <FeatureCard
              icon={<ChartIcon />}
              title="Progress Tracking"
              description="Track your improvement over time with detailed analytics and personalized weak-spot identification."
            />
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-20" style={{ background: "var(--gray-50)" }}>
        <div className="container" style={{ maxWidth: "1000px" }}>
          <div className="section-header">
            <h2 className="section-title">Simple, Transparent Pricing</h2>
            <p className="section-subtitle">Start for free, upgrade when you need more</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingPreviewCard
              name="Free"
              price="€0"
              period="forever"
              features={["1 exam per skill", "Basic results", "Multi-language UI"]}
              cta="Get Started"
              href="/signup"
              variant="outline"
            />
            <PricingPreviewCard
              name="Premium"
              price="€8"
              period="/month"
              features={["Unlimited exams", "AI feedback", "All 5 skills", "Progress tracking"]}
              cta="Upgrade Now"
              href="/pricing"
              variant="primary"
              featured
            />
            <PricingPreviewCard
              name="One-Time"
              price="€25"
              period="once"
              features={["20 full exams", "AI feedback", "All 5 skills", "No subscription"]}
              cta="Buy Pack"
              href="/pricing"
              variant="outline"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-20 text-center"
        style={{ background: "var(--green-900)", color: "white" }}
      >
        <div className="container" style={{ maxWidth: "700px" }}>
          <h2 className="font-bold mb-4" style={{ fontSize: "2.5rem" }}>
            Ready to Pass Your Exam?
          </h2>
          <p className="mb-8 opacity-90" style={{ fontSize: "1.25rem" }}>
            Join thousands of people who have passed their inburgering exam with ExamKlaar.
          </p>
          <Button href="/signup" variant="white" size="lg">
            Start Practicing for Free
            <ArrowRightIcon />
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
    <div className="flex items-center gap-2 text-sm" style={{ color: "var(--gray-600)" }}>
      {icon}
      {text}
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div
      className="p-8 rounded-2xl border"
      style={{ background: "var(--gray-50)", borderColor: "var(--gray-200)" }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
        style={{ background: "var(--green-50)", color: "var(--green-900)" }}
      >
        {icon}
      </div>
      <h3 className="font-semibold mb-3" style={{ fontSize: "1.25rem", color: "var(--gray-900)" }}>
        {title}
      </h3>
      <p style={{ color: "var(--gray-600)", lineHeight: 1.7 }}>{description}</p>
    </div>
  );
}

function PricingPreviewCard({
  name,
  price,
  period,
  features,
  cta,
  href,
  variant,
  featured = false,
}: {
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  href: string;
  variant: "primary" | "outline";
  featured?: boolean;
}) {
  return (
    <div
      className="relative bg-white rounded-2xl p-10 border-2"
      style={{
        borderColor: featured ? "var(--green-900)" : "var(--gray-200)",
        boxShadow: featured ? "0 10px 25px rgba(27,107,74,0.1)" : "none",
      }}
    >
      {featured && (
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full"
          style={{ background: "var(--green-900)" }}
        >
          Most Popular
        </span>
      )}
      <h3 className="font-semibold mb-2" style={{ fontSize: "1.5rem" }}>
        {name}
      </h3>
      <div className="mb-6">
        <span
          className="font-bold"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "2.5rem",
            color: "var(--green-900)",
          }}
        >
          {price}
        </span>
        <span className="ml-1" style={{ color: "var(--gray-500)" }}>
          {period}
        </span>
      </div>
      <ul className="mb-8 flex flex-col gap-3">
        {features.map((f) => (
          <li
            key={f}
            className="flex items-center gap-2 text-sm"
            style={{ color: "var(--gray-700)" }}
          >
            <CheckIcon />
            {f}
          </li>
        ))}
      </ul>
      <Button href={href} variant={variant} fullWidth>
        {cta}
      </Button>
    </div>
  );
}

/* ==================== ICONS ==================== */

function ArrowRightIcon() {
  return (
    <svg
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 7l5 5m0 0l-5 5m5-5H6"
      />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
      <path
        fillRule="evenodd"
        d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function MicrophoneIcon() {
  return (
    <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden="true"
      style={{ color: "var(--green-900)", flexShrink: 0 }}
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}
