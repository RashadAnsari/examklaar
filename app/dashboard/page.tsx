import { DashboardNav } from "@/components/layout/DashboardNav";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";

const STATS = [
  {
    label: "Exams Completed",
    value: "12",
    trend: "+3 this week",
    icon: <CheckCircleIcon />,
  },
  {
    label: "Average Score",
    value: "7.2",
    trend: "Improving steadily",
    icon: <ChartIcon />,
  },
  {
    label: "Study Streak",
    value: "5",
    trend: "days in a row",
    icon: <FireIcon />,
  },
  {
    label: "Time Practiced",
    value: "8.5h",
    trend: "+2.3h this week",
    icon: <ClockIcon />,
  },
];

const EXAMS = [
  {
    id: "knm",
    title: "KNM (Knowledge)",
    description:
      "Test your knowledge about Dutch society, culture, and laws. 40 questions, 45 minutes.",
    badge: <Badge variant="free">Free</Badge>,
    bestScore: "8.5",
    attempts: "3/5",
    progress: 60,
    locked: false,
  },
  {
    id: "lezen",
    title: "Lezen (Reading)",
    description: "Practice reading comprehension with Dutch texts. 30 questions, 65 minutes.",
    badge: <Badge variant="free">Free</Badge>,
    bestScore: "7.0",
    attempts: "2/5",
    progress: 40,
    locked: false,
  },
  {
    id: "luisteren",
    title: "Luisteren (Listening)",
    description: "Listen to Dutch audio clips and answer questions. 30 questions, 60 minutes.",
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
      "Write in Dutch and get AI-powered grammar and vocabulary feedback. 4 tasks, 45 minutes.",
    badge: <Badge variant="premium">Premium</Badge>,
    bestScore: "Locked",
    attempts: "0/0",
    progress: 0,
    locked: true,
  },
  {
    id: "spreken",
    title: "Spreken (Speaking)",
    description: "Practice speaking and get pronunciation feedback. 12 tasks, 30 minutes.",
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
    icon: <ClipboardIcon />,
  },
  {
    title: "Completed Lezen Exam #2",
    time: "1 day ago • 65 minutes",
    score: "7.0",
    icon: <BookIcon />,
  },
  {
    title: "Completed Luisteren Exam #1",
    time: "2 days ago • 60 minutes",
    score: "6.5",
    icon: <MicrophoneIcon />,
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--gray-50)" }}>
      <DashboardNav userName="Rashad" userInitials="RA" />

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

/* ==================== ICONS ==================== */

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

function ChartIcon() {
  return (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function FireIcon() {
  return (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
      <path
        fillRule="evenodd"
        d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
    </svg>
  );
}

function MicrophoneIcon() {
  return (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
        clipRule="evenodd"
      />
    </svg>
  );
}
