import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { readExam } from "@/data/exams";
import { SKILL_TITLES } from "@/lib/exam/config";
import { scorePct, getPassThreshold } from "@/lib/exam/scoring";
import type { Exam } from "@/app/exam/ExamClient";
import { ReviewClient, type ReviewQuestion } from "./ReviewClient";

type QuestionFeedback = { score: number; maxScore: number; feedback: string };
type SpeakingAnswer = { path: string; transcript: string };

export default async function ReviewPage(props: {
  searchParams: Promise<{ skill?: string; n?: string }>;
}) {
  const { skill: skillId, n: nStr } = await props.searchParams;
  const n = parseInt(nStr ?? "");

  if (!skillId || isNaN(n)) {
    notFound();
  }

  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  const examId = `${skillId}-exam-${n}`;

  const { data: resultRows } = await supabase
    .from("exam_results")
    .select("skill, level, score, total_score, answers, feedback, completed_at")
    .eq("exam_id", examId)
    .eq("user_id", user.id)
    .eq("grading_status", "complete")
    .order("completed_at", { ascending: false })
    .limit(1);

  const result = resultRows?.[0];
  if (!result) {
    notFound();
  }

  let exam: Exam;
  try {
    exam = await readExam(skillId, n);
  } catch {
    notFound();
  }

  const skill = result.skill as string;
  const level = result.level as string | null;
  const isMcq = skill !== "writing" && skill !== "speaking";

  const userAnswers = result.answers as Record<
    string,
    number | string | SpeakingAnswer | undefined
  >;
  const feedbackMap = result.feedback as Record<string, QuestionFeedback> | null;

  const questions: ReviewQuestion[] = exam.questions.map((q) => ({
    id: q.id,
    type: q.type,
    content: q.content,
    options: q.options,
    correctAnswer: q.correctAnswer,
    userAnswer: userAnswers[q.id] ?? null,
    feedback: feedbackMap?.[q.id] ?? null,
  }));

  const skillTitle = SKILL_TITLES[skill] ?? skill;
  const levelLabel = level && skill !== "knm" ? ` (${level})` : "";
  const examTitle = `${exam.title ?? `${skillTitle} Exam ${n}`}${levelLabel}`;
  const displayPct = scorePct(result.score, result.total_score);
  const threshold = getPassThreshold(skill, level, result.total_score);
  const passed = result.score >= threshold;

  return (
    <ReviewClient
      questions={questions}
      isMcq={isMcq}
      skillId={skillId}
      n={n}
      examTitle={examTitle}
      displayPct={displayPct}
      score={result.score}
      totalScore={result.total_score}
      passed={passed}
    />
  );
}
