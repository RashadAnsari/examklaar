import { redirect, notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth-session";
import { pool } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { ProgressBar, type ProgressVariant } from "@/components/ui/ProgressBar";
import { CriteriaScores } from "@/components/ui/CriteriaScores";
import {
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ArrowPathIcon,
  ArrowRightIcon,
} from "@heroicons/react/20/solid";
import { readExamOrNull, examFileExists } from "@/data/exams";
import { SKILL_TITLES, type QuestionFeedback } from "@/lib/exam/config";
import {
  getPassThreshold,
  scorePct,
  getPassContext,
  getStatus,
  computeHistoryStats,
} from "@/lib/exam/scoring";
import { BackGuard } from "./BackGuard";
import { userCanAccessExam } from "@/lib/payment/subscription";
import { ExamResultsRepository } from "@/lib/repositories/examResultsRepository";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function ResultsPage(props: {
  searchParams: Promise<{ skill?: string; n?: string }>;
}) {
  const { skill: skillId, n: nStr } = await props.searchParams;
  const n = parseInt(nStr ?? "");

  if (!skillId || isNaN(n)) {
    notFound();
  }

  const user = await getSessionUser();
  if (!user) {
    redirect("/auth/login");
  }

  if (!(await userCanAccessExam(user.id, n))) {
    redirect("/pricing");
  }

  const examId = `${skillId}-exam-${n}`;
  const examResults = new ExamResultsRepository(pool);

  // Most recent completed result for this exam
  const result = await examResults.findLatestCompletedByExam(examId, user.id);
  if (!result) {
    notFound();
  }

  // All completed results for this exam (for stats)
  const history = await examResults.listCompletedScoresByExam(examId, user.id);

  const [exam, hasNextExam] = await Promise.all([
    readExamOrNull(skillId, n),
    examFileExists(skillId, n + 1),
  ]);

  const skill = result.skill as string;
  const level = result.level as string | null;
  const allResults = history;
  const attempts = allResults.length;

  const status = getStatus(skill, level, result.score, result.total_score);
  const threshold = getPassThreshold(skill, level, result.total_score);
  const displayPct = scorePct(result.score, result.total_score);
  const passContext = getPassContext(skill, level);
  const { bestPct, avgPct, isPersonalBest } = computeHistoryStats(allResults, result.score);
  const isMcq = skill !== "writing" && skill !== "speaking";

  const skillTitle = SKILL_TITLES[skill] ?? skill;
  const levelLabel = level && skill !== "knm" ? ` (${level})` : "";
  const examTitle = exam?.title ?? `${skillTitle} Exam ${n}`;

  const heading =
    isPersonalBest && attempts > 1
      ? "New Personal Best!"
      : status.passed
        ? "Excellent Work!"
        : "Keep Practicing!";

  // MCQ question breakdown
  const userAnswers = result.answers as Record<string, number | undefined>;
  const questionBreakdown =
    isMcq && exam
      ? exam.questions.map((q, i) => ({
          n: i + 1,
          correct:
            userAnswers[q.id] !== undefined &&
            userAnswers[q.id] !== null &&
            userAnswers[q.id] === q.correctAnswer,
          skipped: userAnswers[q.id] === undefined || userAnswers[q.id] === null,
        }))
      : null;

  // Writing/speaking AI feedback
  const feedbackMap = result.feedback as Record<string, QuestionFeedback> | null;
  const feedbackEntries =
    !isMcq && feedbackMap && exam
      ? exam.questions
          .filter((q) => feedbackMap[q.id] !== undefined)
          .map((q, i) => ({ number: i + 1, id: q.id, ...feedbackMap[q.id] }))
      : null;

  return (
    <div className="min-h-screen" style={{ background: "var(--gray-50)" }}>
      <BackGuard href={`/exams/${skillId}`} />
      <div className="mx-auto px-6 py-8 sm:py-12" style={{ maxWidth: "900px" }}>
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <span
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold uppercase tracking-wider mb-6"
            style={{ background: status.bg, color: status.color }}
          >
            {status.passed ? (
              <CheckCircleIcon style={{ width: 16, height: 16 }} />
            ) : (
              <XCircleIcon style={{ width: 16, height: 16 }} />
            )}
            {status.label}
          </span>
          <h1
            className="font-bold mb-2"
            style={{ fontSize: "clamp(1.75rem, 6vw, 2.5rem)", color: "var(--gray-900)" }}
          >
            {heading}
          </h1>
          <p style={{ fontSize: "1.125rem", color: "var(--gray-600)" }}>
            {examTitle}
            {levelLabel} &bull; Completed on {formatDate(result.completed_at)}
          </p>
        </div>

        {/* Score card */}
        <div
          className="rounded-3xl p-6 sm:p-12 border text-center mb-8"
          style={{ background: "white", borderColor: "var(--gray-200)" }}
        >
          <div
            className="font-bold mb-2"
            style={{
              fontSize: "clamp(3rem, 16vw, 6rem)",
              color: status.passed ? "var(--green-900)" : "var(--red)",
              lineHeight: 1,
            }}
          >
            {displayPct}%
          </div>
          <p className="mb-10" style={{ fontSize: "1rem", color: "var(--gray-500)" }}>
            {passContext}
          </p>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8"
            style={{ borderTop: "1px solid var(--gray-200)" }}
          >
            <BreakdownItem
              value={
                isMcq
                  ? `${result.score} / ${result.total_score}`
                  : `${result.score} / ${result.total_score} pts`
              }
              label={isMcq ? "Correct Answers" : "Points Awarded"}
            />
            <BreakdownItem
              value={`${threshold}${isMcq ? ` / ${result.total_score}` : ""}`}
              label="Pass Threshold"
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <StatCard title="Attempts" value={String(attempts)} />
          <StatCard title="Personal Best" value={`${bestPct}%`} />
          <StatCard title="Average Score" value={`${avgPct}%`} />
        </div>

        {/* MCQ question grid */}
        {questionBreakdown && (
          <div
            className="rounded-2xl p-8 border mb-8"
            style={{ background: "white", borderColor: "var(--gray-200)" }}
          >
            <h2
              className="font-semibold mb-6"
              style={{ fontSize: "1.25rem", color: "var(--gray-900)" }}
            >
              Question Breakdown
            </h2>
            <div className="flex flex-wrap gap-2">
              {questionBreakdown.map((q) => (
                <div
                  key={q.n}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold"
                  style={{
                    background: q.skipped
                      ? "var(--gray-100)"
                      : q.correct
                        ? "var(--green-success-light)"
                        : "var(--red-light)",
                    color: q.skipped
                      ? "var(--gray-500)"
                      : q.correct
                        ? "var(--green-success)"
                        : "var(--red)",
                  }}
                  title={
                    q.skipped
                      ? `Q${q.n}: Skipped`
                      : q.correct
                        ? `Q${q.n}: Correct`
                        : `Q${q.n}: Incorrect`
                  }
                >
                  {q.n}
                </div>
              ))}
            </div>
            <div className="flex gap-6 mt-4 flex-wrap">
              <span
                className="flex items-center gap-2 text-xs"
                style={{ color: "var(--gray-500)" }}
              >
                <span
                  className="w-3 h-3 rounded-sm inline-block"
                  style={{ background: "var(--green-success-light)" }}
                />
                Correct ({questionBreakdown.filter((q) => q.correct).length})
              </span>
              <span
                className="flex items-center gap-2 text-xs"
                style={{ color: "var(--gray-500)" }}
              >
                <span
                  className="w-3 h-3 rounded-sm inline-block"
                  style={{ background: "var(--red-light)" }}
                />
                Incorrect ({questionBreakdown.filter((q) => !q.correct && !q.skipped).length})
              </span>
              {questionBreakdown.some((q) => q.skipped) && (
                <span
                  className="flex items-center gap-2 text-xs"
                  style={{ color: "var(--gray-500)" }}
                >
                  <span
                    className="w-3 h-3 rounded-sm inline-block"
                    style={{ background: "var(--gray-100)", border: "1.5px solid var(--gray-200)" }}
                  />
                  Skipped ({questionBreakdown.filter((q) => q.skipped).length})
                </span>
              )}
            </div>
          </div>
        )}

        {/* AI feedback (writing/speaking) */}
        {feedbackEntries && feedbackEntries.length > 0 && (
          <div
            className="rounded-2xl p-8 border mb-8"
            style={{ background: "white", borderColor: "var(--gray-200)" }}
          >
            <h2
              className="font-semibold mb-6"
              style={{ fontSize: "1.25rem", color: "var(--gray-900)" }}
            >
              AI Feedback by Question
            </h2>
            <div className="flex flex-col gap-6">
              {feedbackEntries.map((fb) => {
                const pct = fb.maxScore > 0 ? fb.score / fb.maxScore : 0;
                const variant: ProgressVariant =
                  pct >= 0.7 ? "success" : pct >= 0.5 ? "warning" : "danger";
                return (
                  <div key={fb.id}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium" style={{ color: "var(--gray-700)" }}>
                        Question {fb.number}
                      </span>
                      <span
                        className="text-sm font-semibold"
                        style={{
                          color: "var(--gray-900)",
                        }}
                      >
                        {fb.score}/{fb.maxScore} pts
                      </span>
                    </div>
                    <ProgressBar value={fb.score} max={fb.maxScore} variant={variant} />
                    <CriteriaScores criteria={fb.criteria} />
                    <p
                      className="text-sm mt-3"
                      style={{ color: "var(--gray-600)", lineHeight: 1.7 }}
                    >
                      {fb.feedback}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action cards */}
        <div
          className={`grid grid-cols-1 gap-6 mb-8 ${
            hasNextExam ? "sm:grid-cols-3" : "sm:grid-cols-2"
          }`}
        >
          <ActionCard
            href={`/exam/review?skill=${skillId}&n=${n}`}
            icon={<EyeIcon style={{ width: 24, height: 24 }} />}
            title="Review Answers"
            description="See detailed explanations for all questions"
          />
          <ActionCard
            href={`/exam?skill=${skillId}&n=${n}`}
            icon={<ArrowPathIcon style={{ width: 24, height: 24 }} />}
            title="Try Again"
            description="Practice with this exam again to improve"
          />
          {hasNextExam && (
            <ActionCard
              href={`/exam?skill=${skillId}&n=${n + 1}`}
              icon={<ArrowRightIcon style={{ width: 24, height: 24 }} />}
              title="Next Exam"
              description={`Continue with exam ${n + 1}`}
            />
          )}
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button href={`/exam/review?skill=${skillId}&n=${n}`} variant="primary">
            Review All Answers
          </Button>
          <Button href={`/exams/${skillId}`} variant="secondary">
            Back to Exam List
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
      <div className="font-bold mb-1" style={{ fontSize: "2rem", color: "var(--gray-900)" }}>
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
      <div className="font-bold" style={{ fontSize: "1.5rem", color: "var(--gray-900)" }}>
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
