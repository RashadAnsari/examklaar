import { Button } from "@/components/ui/Button";
import { CheckCircleIcon, EyeIcon, ArrowPathIcon, ChartBarIcon } from "@heroicons/react/20/solid";
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
            <CheckCircleIcon style={{ width: 16, height: 16 }} />
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
            icon={<EyeIcon style={{ width: 24, height: 24 }} />}
            title="Review Answers"
            description="See detailed explanations for all questions"
          />
          <ActionCard
            href="/exam"
            icon={<ArrowPathIcon style={{ width: 24, height: 24 }} />}
            title="Try Again"
            description="Practice with another exam to improve further"
          />
          <ActionCard
            href="/dashboard"
            icon={<ChartBarIcon style={{ width: 24, height: 24 }} />}
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
