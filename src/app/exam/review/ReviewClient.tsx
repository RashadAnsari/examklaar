"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CheckIcon, XMarkIcon } from "@heroicons/react/20/solid";

function sanitizeHtml(html: string): string {
  if (typeof window === "undefined") {
    return html;
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const DOMPurify = require("dompurify");
  return DOMPurify.sanitize(html);
}

export type ReviewQuestion = {
  id: string;
  type: string;
  content: string;
  options: string[] | null;
  correctAnswer: number | null;
  userAnswer: number | string | { path: string; transcript: string } | null;
  feedback: { score: number; maxScore: number; feedback: string } | null;
};

type FilterType = "all" | "correct" | "incorrect" | "skipped";
type WritingFilterType = "all" | "good" | "needs_work";

interface Props {
  questions: ReviewQuestion[];
  isMcq: boolean;
  skillId: string;
  n: number;
  examTitle: string;
  displayPct: number;
  score: number;
  totalScore: number;
  passed: boolean;
}

export function ReviewClient({
  questions,
  isMcq,
  skillId,
  n,
  examTitle,
  displayPct,
  score,
  totalScore,
  passed,
}: Props) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [writingFilter, setWritingFilter] = useState<WritingFilterType>("all");

  // MCQ counts
  const correctCount = isMcq ? questions.filter((q) => q.userAnswer === q.correctAnswer).length : 0;
  const skippedCount = isMcq
    ? questions.filter((q) => q.userAnswer === null || q.userAnswer === undefined).length
    : 0;
  const incorrectCount = isMcq ? questions.length - correctCount - skippedCount : 0;

  // Writing/speaking counts
  const goodCount = !isMcq
    ? questions.filter(
        (q) =>
          q.feedback && q.feedback.maxScore > 0 && q.feedback.score / q.feedback.maxScore >= 0.7
      ).length
    : 0;
  const needsWorkCount = !isMcq ? questions.length - goodCount : 0;

  const filteredQuestions = isMcq
    ? questions.filter((q) => {
        if (filter === "correct") {
          return q.userAnswer === q.correctAnswer;
        }
        if (filter === "skipped") {
          return q.userAnswer === null || q.userAnswer === undefined;
        }
        if (filter === "incorrect") {
          return (
            q.userAnswer !== null && q.userAnswer !== undefined && q.userAnswer !== q.correctAnswer
          );
        }
        return true;
      })
    : questions.filter((q) => {
        if (writingFilter === "good") {
          return (
            q.feedback && q.feedback.maxScore > 0 && q.feedback.score / q.feedback.maxScore >= 0.7
          );
        }
        if (writingFilter === "needs_work") {
          return (
            !q.feedback || q.feedback.maxScore === 0 || q.feedback.score / q.feedback.maxScore < 0.7
          );
        }
        return true;
      });

  const scoreColor = passed ? "var(--green-success)" : "var(--red)";
  const scoreBg = passed ? "var(--green-success-light)" : "var(--red-light)";

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--gray-50)" }}>
      {/* Sticky header */}
      <div
        className="sticky top-0 z-50 border-b"
        style={{ background: "white", borderColor: "var(--gray-200)" }}
      >
        <div
          className="mx-auto px-6 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
          style={{ maxWidth: "900px" }}
        >
          <h1 className="font-semibold" style={{ fontSize: "1.25rem", color: "var(--gray-900)" }}>
            {examTitle}: Review
          </h1>
          <span
            className="px-5 py-2 rounded-full font-bold"
            style={{ fontSize: "1rem", background: scoreBg, color: scoreColor }}
          >
            {isMcq ? `${score} / ${totalScore} correct` : `${displayPct}%`}
          </span>
        </div>
      </div>

      <div className="mx-auto px-6 py-8" style={{ maxWidth: "900px" }}>
        {/* Filter bar */}
        <div
          className="rounded-xl px-6 py-4 mb-8 flex flex-wrap gap-3 border"
          style={{ background: "white", borderColor: "var(--gray-200)" }}
        >
          {isMcq
            ? (["all", "correct", "incorrect", "skipped"] as FilterType[])
                .filter((f) => f !== "skipped" || skippedCount > 0)
                .map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className="px-4 py-2 text-sm font-medium rounded-lg transition-all"
                    style={{
                      background: filter === f ? "var(--green-900)" : "var(--gray-100)",
                      color: filter === f ? "white" : "var(--gray-700)",
                    }}
                  >
                    {f === "all"
                      ? `All (${questions.length})`
                      : f === "correct"
                        ? `Correct (${correctCount})`
                        : f === "skipped"
                          ? `Skipped (${skippedCount})`
                          : `Incorrect (${incorrectCount})`}
                  </button>
                ))
            : (["all", "good", "needs_work"] as WritingFilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setWritingFilter(f)}
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-all"
                  style={{
                    background: writingFilter === f ? "var(--green-900)" : "var(--gray-100)",
                    color: writingFilter === f ? "white" : "var(--gray-700)",
                  }}
                >
                  {f === "all"
                    ? `All (${questions.length})`
                    : f === "good"
                      ? `Good (${goodCount})`
                      : `Needs Work (${needsWorkCount})`}
                </button>
              ))}
        </div>

        {/* Questions */}
        <div className="flex flex-col gap-6">
          {filteredQuestions.length === 0 ? (
            <p className="text-center py-12" style={{ color: "var(--gray-400)" }}>
              No questions in this category
            </p>
          ) : (
            filteredQuestions.map((q, displayIndex) =>
              isMcq ? (
                <McqCard key={q.id} question={q} displayIndex={displayIndex} />
              ) : (
                <OpenCard key={q.id} question={q} displayIndex={displayIndex} />
              )
            )
          )}
        </div>
      </div>

      {/* Sticky bottom nav */}
      <div
        className="fixed bottom-0 left-0 right-0 flex justify-center gap-4 px-6 pt-5 border-t"
        style={{
          background: "white",
          borderColor: "var(--gray-200)",
          paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))",
        }}
      >
        <Button href={`/exam?skill=${skillId}&n=${n}`} variant="primary">
          Try Again
        </Button>
        <Button href={`/exam/results?skill=${skillId}&n=${n}`} variant="outline">
          Back to Results
        </Button>
      </div>
    </div>
  );
}

/* ─── MCQ Card ─── */

function McqCard({ question, displayIndex }: { question: ReviewQuestion; displayIndex: number }) {
  const isCorrect = question.userAnswer !== null && question.userAnswer === question.correctAnswer;
  const skipped = question.userAnswer === null || question.userAnswer === undefined;

  return (
    <div className={`review-card ${isCorrect ? "correct" : "incorrect"}`}>
      {/* Card header */}
      <div className="flex justify-between items-center mb-6">
        <span
          className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: "var(--green-900)" }}
        >
          Question {displayIndex + 1}
        </span>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
          style={{
            background: skipped
              ? "var(--gray-100)"
              : isCorrect
                ? "var(--green-success-light)"
                : "var(--red-light)",
            color: skipped ? "var(--gray-500)" : isCorrect ? "var(--green-success)" : "var(--red)",
          }}
        >
          {!skipped &&
            (isCorrect ? (
              <CheckIcon style={{ width: 14, height: 14 }} />
            ) : (
              <XMarkIcon style={{ width: 14, height: 14 }} />
            ))}
          {skipped ? "Skipped" : isCorrect ? "Correct" : "Incorrect"}
        </span>
      </div>

      {/* Question content (HTML) */}
      <div
        className="question-content mb-6"
        style={{ fontSize: "1rem", color: "var(--gray-900)", lineHeight: 1.7 }}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(question.content) }}
      />

      {/* Options */}
      {question.options && (
        <div className="flex flex-col gap-3">
          {question.options.map((opt, i) => {
            const isUserAnswer = i === question.userAnswer;
            const isCorrectAnswer = i === question.correctAnswer;
            const isWrongUser = isUserAnswer && !isCorrect;

            let cls = "review-option";
            if (isWrongUser) {
              cls += " user-wrong";
            } else if (isCorrectAnswer) {
              cls += " correct-answer";
            }

            return (
              <div key={i} className={cls}>
                <span className="inline-flex items-center gap-1.5 font-semibold mr-2">
                  {String.fromCharCode(65 + i)}.
                  {isCorrectAnswer && <CheckIcon style={{ width: 15, height: 15 }} />}
                  {isWrongUser && <XMarkIcon style={{ width: 15, height: 15 }} />}
                </span>
                {opt}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Writing / Speaking Card ─── */

function OpenCard({ question, displayIndex }: { question: ReviewQuestion; displayIndex: number }) {
  const feedback = question.feedback;
  const pct = feedback && feedback.maxScore > 0 ? feedback.score / feedback.maxScore : null;
  const variant =
    pct === null ? "default" : pct >= 0.7 ? "success" : pct >= 0.5 ? "warning" : "danger";

  const isSpeaking = question.type === "speaking";
  const speakingAnswer =
    isSpeaking &&
    question.userAnswer !== null &&
    typeof question.userAnswer === "object" &&
    "path" in question.userAnswer
      ? (question.userAnswer as { path: string; transcript: string })
      : null;
  const transcript = speakingAnswer?.transcript ?? null;

  const writtenAnswer =
    !isSpeaking && typeof question.userAnswer === "string" ? question.userAnswer : null;

  return (
    <div className="review-card">
      {/* Card header */}
      <div className="flex justify-between items-center mb-6">
        <span
          className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: "var(--green-900)" }}
        >
          Question {displayIndex + 1}
        </span>
        {feedback ? (
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              background:
                pct !== null && pct >= 0.7 ? "var(--green-success-light)" : "var(--amber-light)",
              color: pct !== null && pct >= 0.7 ? "var(--green-success)" : "var(--amber)",
            }}
          >
            {feedback.score} / {feedback.maxScore} pts
          </span>
        ) : (
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: "var(--gray-100)", color: "var(--gray-500)" }}
          >
            No feedback
          </span>
        )}
      </div>

      {/* Question content (HTML) */}
      <div
        className="question-content mb-6"
        style={{ fontSize: "1rem", color: "var(--gray-900)", lineHeight: 1.7 }}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(question.content) }}
      />

      {/* User's answer */}
      {(writtenAnswer || transcript || speakingAnswer) && (
        <div className="mb-6">
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: "var(--gray-500)" }}
          >
            {isSpeaking ? "Your recording" : "Your answer"}
          </p>
          {speakingAnswer && <AudioPlayer storagePath={speakingAnswer.path} />}
          {transcript && (
            <div
              className="rounded-xl px-5 py-4 text-sm mt-3"
              style={{
                background: "var(--gray-50)",
                border: "1.5px solid var(--gray-200)",
                color: "var(--gray-800)",
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
              }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: "var(--gray-500)" }}
              >
                Transcript
              </p>
              {transcript}
            </div>
          )}
          {writtenAnswer && (
            <div
              className="rounded-xl px-5 py-4 text-sm"
              style={{
                background: "var(--gray-50)",
                border: "1.5px solid var(--gray-200)",
                color: "var(--gray-800)",
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
              }}
            >
              {writtenAnswer}
            </div>
          )}
        </div>
      )}

      {!writtenAnswer && !transcript && (
        <p className="mb-6 text-sm italic" style={{ color: "var(--gray-400)" }}>
          {isSpeaking ? "No transcript recorded" : "No answer provided"}
        </p>
      )}

      {/* AI Feedback */}
      {feedback ? (
        <div className="explanation-box">
          <div className="flex justify-between items-center mb-3">
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--blue)" }}
            >
              AI Feedback
            </p>
            <span className="text-xs font-semibold" style={{ color: "var(--gray-600)" }}>
              {feedback.score}/{feedback.maxScore} pts
            </span>
          </div>
          <ProgressBar value={feedback.score} max={feedback.maxScore} variant={variant} />
          <p className="text-sm mt-3" style={{ color: "var(--gray-700)", lineHeight: 1.7 }}>
            {feedback.feedback}
          </p>
        </div>
      ) : (
        <div
          className="rounded-xl px-5 py-4 text-sm"
          style={{ background: "var(--gray-100)", color: "var(--gray-500)", lineHeight: 1.6 }}
        >
          Feedback is not available for this question.
        </div>
      )}
    </div>
  );
}

/* ─── Audio Player ─── */

function AudioPlayer({ storagePath }: { storagePath: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);
  const [error, setError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/recordings/signed-url?path=${encodeURIComponent(storagePath)}`)
      .then(async (r) => {
        const data = await r.json();
        if (cancelled) {
          return;
        }
        if (r.status === 404 && data.expired) {
          setExpired(true);
        } else if (data.url) {
          setUrl(data.url);
        } else {
          setError(true);
        }
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        setError(true);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [storagePath]);

  if (loading) {
    return (
      <p className="text-sm" style={{ color: "var(--gray-400)" }}>
        Loading recording…
      </p>
    );
  }
  if (expired) {
    return (
      <p className="text-sm italic" style={{ color: "var(--gray-400)" }}>
        Recording expired after 30 days.
      </p>
    );
  }
  if (error || !url) {
    return (
      <p className="text-sm italic" style={{ color: "var(--gray-400)" }}>
        Recording unavailable.
      </p>
    );
  }
  return (
    <audio
      ref={audioRef}
      src={url}
      controls
      style={{ width: "100%", borderRadius: "0.5rem" }}
      onError={() => setError(true)}
    />
  );
}
