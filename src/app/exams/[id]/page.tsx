import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { ChevronLeftIcon, LockClosedIcon } from "@heroicons/react/20/solid";
import { SKILL_TITLES, SKILL_DESCRIPTIONS } from "@/lib/exam/config";
import { getSessionUser } from "@/lib/auth-session";
import { pool } from "@/lib/db";
import { listSkillExams } from "@/data/exams";
import { getScoreFeedback } from "@/lib/exam/scoring";
import { getUserSubscription, hasFullAccess, isEarlyAccess } from "@/lib/payment/subscription";
import { canAccessExam, isFreeExam, NO_SUBSCRIPTION } from "@/lib/payment/plans";
import { ExamResultsRepository } from "@/lib/repositories/examResultsRepository";

interface ExamResult {
  score: number | null;
  total_score: number;
  completed_at: Date;
}

interface ExamItem {
  n: number;
  timeLimitMinutes: number;
  result: ExamResult | null;
}

async function loadExams(
  id: string,
  userId: string | null
): Promise<{ skill: string; level: string | null; exams: ExamItem[] } | null> {
  const fileData = await listSkillExams(id);
  if (!fileData) {
    return null;
  }

  const results = userId
    ? await new ExamResultsRepository(pool).listCompletedByExamPrefix(id, userId)
    : [];

  const resultsByExamId = new Map<string, ExamResult>();
  for (const r of results) {
    if (!resultsByExamId.has(r.exam_id)) {
      resultsByExamId.set(r.exam_id, {
        score: r.score,
        total_score: r.total_score,
        completed_at: r.completed_at,
      });
    }
  }

  const exams: ExamItem[] = fileData.exams.map(({ n, timeLimitMinutes }) => ({
    n,
    timeLimitMinutes,
    result: resultsByExamId.get(`${id}-exam-${n}`) ?? null,
  }));

  return { skill: fileData.skill, level: fileData.level, exams };
}

export default async function ExamsPage(props: PageProps<"/exams/[id]">) {
  const { id } = await props.params;
  const user = await getSessionUser();
  const data = await loadExams(id, user?.id ?? null);

  if (!data) {
    notFound();
  }

  const { skill, level, exams } = data;

  const sub = user ? await getUserSubscription(user.id) : NO_SUBSCRIPTION;
  const earlyAccess = isEarlyAccess();
  const isPaid = hasFullAccess(sub);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--gray-50)" }}>
      <Navbar />

      <div className="flex-1 container py-8" style={{ maxWidth: "860px" }}>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm font-medium mb-8"
          style={{ color: "var(--gray-600)" }}
        >
          <ChevronLeftIcon style={{ width: 16, height: 16 }} />
          Dashboard
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-bold" style={{ fontSize: "2rem", color: "var(--gray-900)" }}>
              {SKILL_TITLES[skill]}
            </h1>
            {level && (
              <span
                className="rounded-md px-2.5 py-1 text-sm font-semibold"
                style={{ background: "var(--green-50)", color: "var(--green-900)" }}
              >
                {level}
              </span>
            )}
          </div>
          <p style={{ color: "var(--gray-600)" }}>
            {SKILL_DESCRIPTIONS[skill]} · {exams.length} {exams.length === 1 ? "exam" : "exams"}{" "}
            available
          </p>
          {(earlyAccess || !isPaid) && (
            <p className="mt-2 text-sm" style={{ color: "var(--green-700)" }}>
              {earlyAccess
                ? "Every exam is free while we are in early access."
                : "The first exam is free. Subscribe to unlock the rest."}
            </p>
          )}
        </div>

        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: "white", borderColor: "var(--gray-200)" }}
        >
          {exams.map((exam, i) => {
            const unlocked = earlyAccess || canAccessExam(sub, exam.n);
            return (
              <div
                key={exam.n}
                className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 sm:px-6 py-4 sm:py-5"
                style={{
                  borderBottom: i === exams.length - 1 ? "none" : "1px solid var(--gray-100)",
                  opacity: unlocked ? 1 : 0.6,
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-sm flex-shrink-0"
                  style={{ background: "var(--gray-100)", color: "var(--gray-500)" }}
                >
                  {exam.n}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold text-sm flex items-center gap-2"
                    style={{ color: "var(--gray-900)" }}
                  >
                    Exam {exam.n}
                    {!isPaid && isFreeExam(exam.n) && (
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{ background: "var(--green-50)", color: "var(--green-700)" }}
                      >
                        Free
                      </span>
                    )}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--gray-500)" }}>
                    {exam.timeLimitMinutes} minutes
                    {exam.result
                      ? exam.result.score !== null
                        ? ` · ${exam.result.score}/${exam.result.total_score} correct`
                        : " · Completed"
                      : " · Not attempted yet"}
                  </p>
                  {exam.result?.score !== null &&
                    exam.result?.score !== undefined &&
                    (() => {
                      const feedback = getScoreFeedback(
                        skill,
                        level,
                        exam.result!.score!,
                        exam.result!.total_score
                      );
                      return feedback ? (
                        <p className="text-xs mt-1" style={{ color: feedback.color }}>
                          {feedback.label}
                        </p>
                      ) : null;
                    })()}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {!unlocked ? (
                    <Button href="/pricing" variant="outline">
                      <LockClosedIcon style={{ width: 14, height: 14 }} />
                      Subscribe
                    </Button>
                  ) : exam.result ? (
                    <>
                      <Button href={`/exam/results?skill=${id}&n=${exam.n}`} variant="outline">
                        Review
                      </Button>
                      <Button href={`/exam?skill=${id}&n=${exam.n}`} variant="primary">
                        Retake
                      </Button>
                    </>
                  ) : (
                    <Button href={`/exam?skill=${id}&n=${exam.n}`} variant="primary">
                      Start
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Footer />
    </div>
  );
}
