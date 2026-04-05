import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { PricingCards } from "@/components/pricing/PricingCards";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  SparklesIcon,
  ClipboardDocumentIcon,
  UsersIcon,
  CalendarIcon,
  InformationCircleIcon,
  MicrophoneIcon,
  ChartBarIcon,
} from "@heroicons/react/20/solid";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container">
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
            AI-powered feedback.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button href="/signup" variant="primary" size="lg">
              Start Free Practice
              <ArrowRightIcon style={{ width: 20, height: 20 }} />
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
            <TrustItem
              icon={<CheckCircleIcon style={{ width: 20, height: 20 }} />}
              text="2025 KNM Format"
            />
            <TrustItem
              icon={<SparklesIcon style={{ width: 20, height: 20 }} />}
              text="AI Feedback"
            />
          </div>
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
              icon={<ClipboardDocumentIcon style={{ width: 24, height: 24 }} />}
              title="Full Exam Simulations"
              description="Practice all five skills: KNM, Reading, Listening, Writing, and Speaking with real exam timing and conditions."
            />
            <FeatureCard
              icon={<UsersIcon style={{ width: 24, height: 24 }} />}
              title="Beginner Friendly"
              description="Clear instructions and step-by-step guidance so you can focus on practicing, not figuring out the platform."
            />
            <FeatureCard
              icon={<CalendarIcon style={{ width: 24, height: 24 }} />}
              title="2025 KNM Content"
              description="Updated for the new July 2025 exam format. Don't waste time on outdated materials."
            />
            <FeatureCard
              icon={<InformationCircleIcon style={{ width: 24, height: 24 }} />}
              title="AI Writing Corrections"
              description="Get instant feedback on your written Dutch with detailed grammar and vocabulary suggestions."
            />
            <FeatureCard
              icon={<MicrophoneIcon style={{ width: 24, height: 24 }} />}
              title="Speaking Practice"
              description="Record your answers and get AI transcription and pronunciation feedback for speaking tasks."
            />
            <FeatureCard
              icon={<ChartBarIcon style={{ width: 24, height: 24 }} />}
              title="Progress Tracking"
              description="Track your improvement over time with detailed analytics and personalized weak-spot identification."
            />
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-20" style={{ background: "var(--gray-50)" }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Simple, Transparent Pricing</h2>
            <p className="section-subtitle">Start for free, upgrade when you need more</p>
          </div>

          <PricingCards />
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
