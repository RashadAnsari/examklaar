"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Timer } from "@/components/ui/Timer";
import { Button } from "@/components/ui/Button";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { ClockIcon } from "@heroicons/react/20/solid";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { createClient } from "@/utils/supabase/client";

export interface Question {
  id: string;
  type: string;
  content: string;
  options: string[];
  correctAnswer: number;
}

export interface Exam {
  id: string;
  skill: string;
  level: string | null;
  title: string;
  timeLimitMinutes: number;
  questions: Question[];
}

interface NavigatorPanelProps {
  questions: Question[];
  currentQ: number;
  answers: Record<string, number>;
  answeredCount: number;
  totalQuestions: number;
  unansweredCount: number;
  disabled: boolean;
  onGoTo: (i: number) => void;
  onSubmit: () => void;
}

function NavigatorPanel({
  questions,
  currentQ,
  answers,
  answeredCount,
  totalQuestions,
  unansweredCount,
  disabled,
  onGoTo,
  onSubmit,
}: NavigatorPanelProps) {
  return (
    <div
      className="rounded-2xl border"
      style={{ background: "white", borderColor: "var(--gray-200)" }}
    >
      <div className="px-5 pt-5 pb-4">
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-4"
          style={{ color: "var(--gray-500)" }}
        >
          Vraagnavigator
        </p>
        <div
          className="grid gap-1.5"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(38px, 1fr))" }}
        >
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => onGoTo(i)}
              disabled={disabled}
              className={`question-btn ${
                i === currentQ ? "current" : answers[q.id] !== undefined ? "answered" : ""
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4">
          <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--gray-500)" }}>
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ background: "var(--green-900)" }}
            />
            Huidig
          </span>
          <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--gray-500)" }}>
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ background: "var(--green-50)", border: "1.5px solid var(--green-900)" }}
            />
            Beantwoord
          </span>
          <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--gray-500)" }}>
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ background: "var(--gray-100)", border: "1.5px solid var(--gray-200)" }}
            />
            Niet beantwoord
          </span>
        </div>
      </div>

      <div className="px-5 pb-5 pt-4" style={{ borderTop: "1px solid var(--gray-100)" }}>
        <div className="text-sm mb-4" style={{ color: "var(--gray-600)" }}>
          <span className="font-semibold" style={{ color: "var(--gray-900)" }}>
            {answeredCount}
          </span>{" "}
          van {totalQuestions} beantwoord
          {unansweredCount > 0 && (
            <span style={{ color: "var(--amber)" }}> · {unansweredCount} resterend</span>
          )}
        </div>
        <Button variant="primary" fullWidth onClick={onSubmit} disabled={disabled}>
          Examen inleveren
        </Button>
      </div>
    </div>
  );
}

interface Props {
  exam: Exam;
  skillId: string;
  n: number;
}

export function ExamClient({ exam, skillId, n }: Props) {
  const router = useRouter();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showModal, setShowModal] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);

  // Refs so event handlers always read the latest values without re-registering
  const blockNavRef = useRef(true);
  const timeUpRef = useRef(false);

  const totalQuestions = exam.questions.length;
  const question = exam.questions[currentQ];
  const answeredCount = Object.keys(answers).length;
  const selectedOption = answers[question?.id];
  const unansweredCount = totalQuestions - answeredCount;

  // Block browser back button
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    function handlePopState() {
      if (!blockNavRef.current) return;
      // Push state again to undo the back navigation
      window.history.pushState(null, "", window.location.href);
      // If time is up, the submit overlay is already shown — don't stack dialogs
      if (!timeUpRef.current) setShowExitDialog(true);
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Block browser refresh / tab close
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (!blockNavRef.current) return;
      e.preventDefault();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  function selectOption(index: number) {
    if (timeUp) return;
    setAnswers((prev) => ({ ...prev, [question.id]: index }));
  }

  function handleExpire() {
    timeUpRef.current = true;
    setTimeUp(true);
  }

  useEffect(() => {
    if (!showTimeWarning) return;
    const id = setTimeout(() => setShowTimeWarning(false), 8000);
    return () => clearTimeout(id);
  }, [showTimeWarning]);

  async function submitExam() {
    if (submitting) return;
    setSubmitting(true);
    blockNavRef.current = false;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const score = exam.questions.filter((q) => answers[q.id] === q.correctAnswer).length;
      const answersJson: Record<string, number> = {};
      for (const q of exam.questions) {
        if (answers[q.id] !== undefined) answersJson[q.id] = answers[q.id];
      }
      await supabase.from("exam_results").insert({
        user_id: user.id,
        exam_id: exam.id,
        skill: exam.skill,
        level: exam.level ?? null,
        score,
        total_score: totalQuestions,
        answers: answersJson,
      });
    }

    router.push(`/results?skill=${skillId}&n=${n}`);
  }

  function confirmExit() {
    blockNavRef.current = false;
    router.push(`/exams/${skillId}`);
  }

  const navigatorProps: NavigatorPanelProps = {
    questions: exam.questions,
    currentQ,
    answers,
    answeredCount,
    totalQuestions,
    unansweredCount,
    disabled: timeUp,
    onGoTo: setCurrentQ,
    onSubmit: () => setShowModal(true),
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--gray-50)" }}>
      {/* Sticky exam header */}
      <div
        className="sticky top-0 z-50"
        style={{ background: "white", boxShadow: "var(--shadow-md)" }}
      >
        <div className="mx-auto px-6 py-5" style={{ maxWidth: "860px" }}>
          {/* Title + timer */}
          <div className="flex items-center justify-between gap-6 mb-4">
            <h1
              className="font-bold truncate"
              style={{ fontSize: "1.125rem", color: "var(--gray-900)" }}
            >
              {exam.title}
            </h1>
            <div className="flex-shrink-0">
              <Timer
                initialSeconds={exam.timeLimitMinutes * 60}
                onExpire={handleExpire}
                warningAt={[900]}
                onWarning={() => setShowTimeWarning(true)}
              />
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm" style={{ color: "var(--gray-500)" }}>
                Vraag{" "}
                <span className="font-semibold" style={{ color: "var(--gray-900)" }}>
                  {currentQ + 1}
                </span>{" "}
                van {totalQuestions}
              </span>
              <span
                className="text-sm font-semibold"
                style={{
                  color:
                    answeredCount === totalQuestions
                      ? "var(--green-700)"
                      : answeredCount > 0
                        ? "var(--gray-700)"
                        : "var(--gray-400)",
                }}
              >
                {answeredCount} / {totalQuestions} beantwoord
              </span>
            </div>
            <ProgressBar
              value={answeredCount}
              max={totalQuestions}
              variant={answeredCount === totalQuestions ? "success" : "default"}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto px-6 py-8" style={{ maxWidth: "860px" }}>
        {/* Question card */}
        <div
          className="rounded-2xl border mb-4"
          style={{ background: "white", borderColor: "var(--gray-200)" }}
        >
          <div className="p-6 sm:p-10">
            <div
              className="question-content mb-8"
              dangerouslySetInnerHTML={{ __html: question.content }}
            />
            <div className="flex flex-col gap-3">
              {question.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => selectOption(i)}
                  disabled={timeUp}
                  className={`exam-option ${selectedOption === i ? "selected" : ""}`}
                >
                  <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                  <span
                    style={{ color: "var(--gray-800)", lineHeight: 1.6, fontSize: "0.9375rem" }}
                  >
                    {opt}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Prev / Next */}
        <div className="flex justify-between gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
            disabled={currentQ === 0 || timeUp}
          >
            <ChevronLeftIcon style={{ width: 18, height: 18 }} />
            Vorige
          </Button>
          {currentQ < totalQuestions - 1 ? (
            <Button variant="primary" onClick={() => setCurrentQ((q) => q + 1)} disabled={timeUp}>
              Volgende
              <ChevronRightIcon style={{ width: 18, height: 18 }} />
            </Button>
          ) : (
            <Button variant="primary" onClick={() => setShowModal(true)} disabled={timeUp}>
              Examen inleveren
            </Button>
          )}
        </div>

        {/* Question navigator */}
        <NavigatorPanel {...navigatorProps} />
      </div>

      {/* 15-minute warning dialog */}
      {showTimeWarning && !timeUp && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-5"
              style={{ background: "var(--amber-light)" }}
            >
              <ClockIcon style={{ width: 24, height: 24, color: "var(--amber)" }} />
            </div>
            <h3
              className="font-bold mb-2"
              style={{ fontSize: "1.25rem", color: "var(--gray-900)" }}
            >
              Nog 15 minuten!
            </h3>
            <p className="mb-6" style={{ color: "var(--gray-600)", lineHeight: 1.6 }}>
              U heeft nog 15 minuten de tijd. Zorg dat u alle vragen beantwoordt voordat de tijd om
              is.
            </p>
            <Button variant="primary" fullWidth onClick={() => setShowTimeWarning(false)}>
              Doorgaan
            </Button>
          </div>
        </div>
      )}

      {/* Time's up overlay */}
      {timeUp && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: "center" }}>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: "var(--red-light)" }}
            >
              <ClockIcon style={{ width: 32, height: 32, color: "var(--red)" }} />
            </div>
            <h3 className="font-bold mb-2" style={{ fontSize: "1.5rem", color: "var(--gray-900)" }}>
              Tijd is om!
            </h3>
            <p className="mb-2" style={{ color: "var(--gray-600)", lineHeight: 1.6 }}>
              Uw tijd is verstreken. U heeft{" "}
              <strong style={{ color: "var(--gray-900)" }}>{answeredCount}</strong> van de{" "}
              {totalQuestions} vragen beantwoord.
            </p>
            <p className="mb-8" style={{ fontSize: "0.875rem", color: "var(--gray-500)" }}>
              Lever nu in om uw resultaten op te slaan.
            </p>
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={submitExam}
              disabled={submitting}
            >
              {submitting ? "Bezig met inleveren…" : "Examen inleveren"}
            </Button>
          </div>
        </div>
      )}

      {/* Submit confirmation modal */}
      {showModal && !timeUp && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3
              className="font-bold mb-2"
              style={{ fontSize: "1.25rem", color: "var(--gray-900)" }}
            >
              Examen inleveren?
            </h3>
            {unansweredCount > 0 ? (
              <p className="mb-6" style={{ color: "var(--gray-600)", lineHeight: 1.6 }}>
                U heeft nog{" "}
                <strong style={{ color: "var(--amber)" }}>
                  {unansweredCount} onbeantwoorde {unansweredCount === 1 ? "vraag" : "vragen"}
                </strong>
                . Onbeantwoorde vragen tellen als fout.
              </p>
            ) : (
              <p className="mb-6" style={{ color: "var(--gray-600)", lineHeight: 1.6 }}>
                U heeft alle {totalQuestions} vragen beantwoord. Na het inleveren kunt u uw
                antwoorden niet meer wijzigen.
              </p>
            )}
            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowModal(false)}
                disabled={submitting}
              >
                Doorgaan
              </Button>
              <Button variant="primary" fullWidth onClick={submitExam} disabled={submitting}>
                {submitting ? "Bezig met inleveren…" : "Nu inleveren"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Exit confirmation dialog */}
      {showExitDialog && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-5"
              style={{ background: "var(--amber-light)" }}
            >
              <ExclamationTriangleIcon style={{ width: 24, height: 24, color: "var(--amber)" }} />
            </div>
            <h3
              className="font-bold mb-2"
              style={{ fontSize: "1.25rem", color: "var(--gray-900)" }}
            >
              Examen verlaten?
            </h3>
            <p className="mb-6" style={{ color: "var(--gray-600)", lineHeight: 1.6 }}>
              Uw voortgang wordt niet opgeslagen. Als u vertrekt, gaan uw antwoorden verloren en
              moet u opnieuw beginnen.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setShowExitDialog(false)}>
                Blijven
              </Button>
              <Button variant="danger" fullWidth onClick={confirmExit}>
                Verlaten
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
