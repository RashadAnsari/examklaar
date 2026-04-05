import { Navbar } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  CheckCircleIcon,
  ChartBarIcon,
  FireIcon,
  ClockIcon,
  ClipboardDocumentIcon,
  BookOpenIcon,
  MicrophoneIcon,
} from "@heroicons/react/20/solid";
import { ProgressBar } from "@/components/ui/ProgressBar";

const STATS = [
  {
    label: "Exams Completed",
    value: "12",
    trend: "+3 this week",
    icon: <CheckCircleIcon style={{ width: 20, height: 20 }} />,
  },
  {
    label: "Average Score",
    value: "7.2",
    trend: "Improving steadily",
    icon: <ChartBarIcon style={{ width: 20, height: 20 }} />,
  },
  {
    label: "Study Streak",
    value: "5",
    trend: "days in a row",
    icon: <FireIcon style={{ width: 20, height: 20 }} />,
  },
  {
    label: "Time Practiced",
    value: "8.5h",
    trend: "+2.3h this week",
    icon: <ClockIcon style={{ width: 20, height: 20 }} />,
  },
];

const EXAMS = [
  {
    id: "knm",
    title: "KNM (Knowledge)",
    description:
      "Test your knowledge about Dutch society, culture, and laws. 40 questions, 45 minutes",
    badge: <Badge variant="free">Free</Badge>,
    bestScore: "8.5",
    attempts: "3/5",
    progress: 60,
    locked: false,
  },
  {
    id: "lezen",
    title: "Lezen (Reading)",
    description: "Practice reading comprehension with Dutch texts. 30 questions, 65 minutes",
    badge: <Badge variant="free">Free</Badge>,
    bestScore: "7.0",
    attempts: "2/5",
    progress: 40,
    locked: false,
  },
  {
    id: "luisteren",
    title: "Luisteren (Listening)",
    description: "Listen to Dutch audio clips and answer questions. 30 questions, 60 minutes",
    badge: <Badge variant="free">Free</Badge>,
    bestScore: "6.5",
    attempts: "1/5",
    progress: 20,
    locked: false,
  },
  {
    id: "schrijven",
    title: "Schrijven (Writing)",
    description:
      "Write in Dutch and get AI-powered grammar and vocabulary feedback. 4 tasks, 45 minutes",
    badge: <Badge variant="premium">Premium</Badge>,
    bestScore: "Locked",
    attempts: "0/0",
    progress: 0,
    locked: true,
  },
  {
    id: "spreken",
    title: "Spreken (Speaking)",
    description: "Practice speaking and get pronunciation feedback. 12 tasks, 30 minutes",
    badge: <Badge variant="premium">Premium</Badge>,
    bestScore: "Locked",
    attempts: "0/0",
    progress: 0,
    locked: true,
  },
];

const ACTIVITY = [
  {
    title: "Completed KNM Exam #3",
    time: "2 hours ago • 45 minutes",
    score: "8.5",
    icon: <ClipboardDocumentIcon style={{ width: 20, height: 20 }} />,
  },
  {
    title: "Completed Lezen Exam #2",
    time: "1 day ago • 65 minutes",
    score: "7.0",
    icon: <BookOpenIcon style={{ width: 20, height: 20 }} />,
  },
  {
    title: "Completed Luisteren Exam #1",
    time: "2 days ago • 60 minutes",
    score: "6.5",
    icon: <MicrophoneIcon style={{ width: 20, height: 20 }} />,
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--gray-50)" }}>
      <Navbar />

      <div className="container py-8" style={{ maxWidth: "1280px" }}>
        {/* Page header */}
        <div className="mb-8">
          <h1 className="font-bold mb-1" style={{ fontSize: "2rem", color: "var(--gray-900)" }}>
            Welcome back, Rashad
          </h1>
          <p style={{ color: "var(--gray-600)" }}>Continue practicing for your inburgering exam</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {STATS.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* Upgrade banner */}
        <div
          className="rounded-2xl p-8 mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
          style={{
            background: "linear-gradient(135deg, var(--green-900) 0%, var(--green-700) 100%)",
            color: "white",
          }}
        >
          <div>
            <h3 className="font-bold mb-1" style={{ fontSize: "1.5rem" }}>
              Unlock AI Feedback
            </h3>
            <p style={{ opacity: 0.9 }}>
              Get instant corrections for Writing and Speaking with Premium
            </p>
          </div>
          <Button href="/pricing" variant="white" className="flex-shrink-0">
            Upgrade Now
          </Button>
        </div>

        {/* Exam skills */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-semibold" style={{ fontSize: "1.5rem", color: "var(--gray-900)" }}>
            Practice Exams
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
          {EXAMS.map((exam) => (
            <ExamCard key={exam.id} {...exam} />
          ))}
        </div>

        {/* Recent activity */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-semibold" style={{ fontSize: "1.5rem", color: "var(--gray-900)" }}>
            Recent Activity
          </h2>
        </div>

        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: "white", borderColor: "var(--gray-200)" }}
        >
          {ACTIVITY.map((item, i) => (
            <ActivityItem key={i} {...item} isLast={i === ACTIVITY.length - 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ==================== SUB-COMPONENTS ==================== */

function StatCard({
  label,
  value,
  trend,
  icon,
}: {
  label: string;
  value: string;
  trend: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-6 border"
      style={{ background: "white", borderColor: "var(--gray-200)" }}
    >
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-medium" style={{ color: "var(--gray-600)" }}>
          {label}
        </span>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: "var(--green-50)", color: "var(--green-900)" }}
        >
          {icon}
        </div>
      </div>
      <div
        className="font-bold mb-1"
        style={{
          fontSize: "2rem",
          fontFamily: "var(--font-mono)",
          color: "var(--gray-900)",
        }}
      >
        {value}
      </div>
      <div className="text-sm" style={{ color: "var(--green-900)" }}>
        {trend}
      </div>
    </div>
  );
}

function ExamCard({
  title,
  description,
  badge,
  bestScore,
  attempts,
  progress,
  locked,
}: (typeof EXAMS)[number]) {
  return (
    <div
      className="rounded-2xl p-8 border-2 transition-all"
      style={{
        background: "white",
        borderColor: "var(--gray-200)",
        opacity: locked ? 0.65 : 1,
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold" style={{ fontSize: "1.25rem", color: "var(--gray-900)" }}>
          {title}
        </h3>
        {badge}
      </div>
      <p className="text-sm mb-6" style={{ color: "var(--gray-600)", lineHeight: 1.6 }}>
        {description}
      </p>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2" style={{ color: "var(--gray-600)" }}>
          <span>Best score: {bestScore}</span>
          <span>{attempts} attempts</span>
        </div>
        <ProgressBar value={progress} thin />
      </div>

      <div className="flex gap-3">
        {locked ? (
          <Button href="/pricing" variant="primary" fullWidth>
            Upgrade to Unlock
          </Button>
        ) : (
          <>
            <Button href="/exam" variant="primary" fullWidth>
              Start Exam
            </Button>
            <Button href="/review" variant="outline" fullWidth>
              Review
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function ActivityItem({
  title,
  time,
  score,
  icon,
  isLast,
}: {
  title: string;
  time: string;
  score: string;
  icon: React.ReactNode;
  isLast: boolean;
}) {
  return (
    <div
      className="flex items-center gap-4 p-6"
      style={{ borderBottom: isLast ? "none" : "1px solid var(--gray-100)" }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: "var(--gray-100)", color: "var(--gray-600)" }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm" style={{ color: "var(--gray-900)" }}>
          {title}
        </p>
        <p className="text-sm" style={{ color: "var(--gray-600)" }}>
          {time}
        </p>
      </div>
      <div
        className="font-bold flex-shrink-0"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "1.25rem",
          color: "var(--green-900)",
        }}
      >
        {score}
      </div>
    </div>
  );
}
