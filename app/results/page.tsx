import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";

type TopicPerformance = {
  label: string;
  percentage: number;
  variant: "success" | "warning" | "danger" | "default";
};

const TOPICS: TopicPerformance[] = [
  { label: "Dutch Society & Culture", percentage: 90, variant: "success" },
  { label: "Healthcare & Insurance", percentage: 85, variant: "success" },
  { label: "Work & Education", percentage: 75, variant: "warning" },
  { label: "Housing & Transport", percentage: 88, variant: "success" },
  { label: "Laws & Regulations", percentage: 82, variant: "success" },
];

export default function ResultsPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--gray-50)" }}>
      <div className="mx-auto px-6 py-12" style={{ maxWidth: "900px" }}>
        {/* Results header */}
        <div className="text-center mb-12">
          <span
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold uppercase tracking-wider mb-6"
            style={{
              background: "var(--green-success-light)",
              color: "var(--green-success)",
            }}
          >
            <CheckCircleIcon />
            Passed
          </span>
          <h1 className="font-bold mb-2" style={{ fontSize: "2.5rem", color: "var(--gray-900)" }}>
            Excellent Work!
          </h1>
          <p style={{ fontSize: "1.125rem", color: "var(--gray-600)" }}>
            KNM Exam – Practice #4 &bull; Completed on April 3, 2026
          </p>
        </div>

        {/* Score card */}
        <div
          className="rounded-3xl p-12 border text-center mb-8"
          style={{ background: "white", borderColor: "var(--gray-200)" }}
        >
          <div
            className="font-bold mb-2"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "6rem",
              color: "var(--green-900)",
              lineHeight: 1,
            }}
          >
            8.5
          </div>
          <p className="mb-10" style={{ fontSize: "1.25rem", color: "var(--gray-600)" }}>
            Final Score (out of 10)
          </p>

          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8"
            style={{ borderTop: "1px solid var(--gray-200)" }}
          >
            <BreakdownItem value="34/40" label="Correct Answers" />
            <BreakdownItem value="85%" label="Accuracy" />
            <BreakdownItem value="43:22" label="Time Taken" />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <StatCard title="Personal Best" value="Yes! 🎉" />
          <StatCard title="Average Score" value="7.6" />
          <StatCard title="Attempts" value="4" />
        </div>

        {/* Performance by topic */}
        <div
          className="rounded-2xl p-8 border mb-8"
          style={{ background: "white", borderColor: "var(--gray-200)" }}
        >
          <h2
            className="font-semibold mb-6"
            style={{ fontSize: "1.25rem", color: "var(--gray-900)" }}
          >
            Performance by Topic
          </h2>
          <div className="flex flex-col gap-6">
            {TOPICS.map((topic) => (
              <div key={topic.label}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium" style={{ color: "var(--gray-700)" }}>
                    {topic.label}
                  </span>
                  <span
                    className="text-sm font-semibold"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--gray-900)" }}
                  >
                    {topic.percentage}%
                  </span>
                </div>
                <ProgressBar value={topic.percentage} variant={topic.variant} />
              </div>
            ))}
          </div>
        </div>

        {/* Action cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <ActionCard
            href="/review"
            icon={<EyeIcon />}
            title="Review Answers"
            description="See detailed explanations for all questions"
          />
          <ActionCard
            href="/exam"
            icon={<RefreshIcon />}
            title="Try Again"
            description="Practice with another exam to improve further"
          />
          <ActionCard
            href="/dashboard"
            icon={<ChartIcon />}
            title="View Progress"
            description="See your improvement over time"
          />
        </div>

        {/* Primary CTA buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button href="/review" variant="primary">
            Review All Answers
          </Button>
          <Button href="/dashboard" variant="secondary">
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ==================== SUB-COMPONENTS ==================== */

function BreakdownItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div
        className="font-bold mb-1"
        style={{ fontFamily: "var(--font-mono)", fontSize: "2rem", color: "var(--gray-900)" }}
      >
        {value}
      </div>
      <div className="text-sm" style={{ color: "var(--gray-600)" }}>
        {label}
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div
      className="rounded-2xl p-6 border"
      style={{ background: "white", borderColor: "var(--gray-200)" }}
    >
      <h3
        className="text-sm font-semibold uppercase tracking-wider mb-3"
        style={{ color: "var(--gray-600)" }}
      >
        {title}
      </h3>
      <div
        className="font-bold"
        style={{ fontFamily: "var(--font-mono)", fontSize: "1.5rem", color: "var(--gray-900)" }}
      >
        {value}
      </div>
    </div>
  );
}

function ActionCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <a href={href} className="card card-hover block" style={{ textDecoration: "none" }}>
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
        style={{ background: "var(--green-50)", color: "var(--green-900)" }}
      >
        {icon}
      </div>
      <h3 className="font-semibold mb-1" style={{ fontSize: "1.125rem", color: "var(--gray-900)" }}>
        {title}
      </h3>
      <p className="text-sm" style={{ color: "var(--gray-600)", lineHeight: 1.6 }}>
        {description}
      </p>
    </a>
  );
}

/* ==================== ICONS ==================== */

function CheckCircleIcon() {
  return (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
      <path
        fillRule="evenodd"
        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
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
