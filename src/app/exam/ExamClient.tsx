"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Timer } from "@/components/ui/Timer";
import { Button } from "@/components/ui/Button";
import { useWhisperTranscriber } from "@/hooks/useWhisperTranscriber";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  MicrophoneIcon,
  StopIcon,
} from "@heroicons/react/24/outline";
import { ClockIcon } from "@heroicons/react/20/solid";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { analytics } from "@/lib/analytics";
import { sanitizeHtml } from "@/lib/sanitize";

export interface Question {
  id: string;
  type: "multiple_choice" | "writing" | "speaking";
  content: string;
  options: string[] | null;
  correctAnswer: number | null;
}

export interface Exam {
  id: string;
  skill: string;
  level: string | null;
  title: string;
  timeLimitMinutes: number;
  premiumOnly: boolean;
  questions: Question[];
}

// --- WritingInput ---

function WritingInput({
  value,
  disabled,
  onChange,
}: {
  value: string;
  disabled: boolean;
  onChange: (text: string) => void;
}) {
  return (
    <div>
      <textarea
        aria-label="Your answer"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={8}
        className="w-full rounded-xl border p-4 resize-y"
        style={{
          borderColor: value.trim() ? "var(--green-900)" : "var(--gray-200)",
          color: "var(--gray-800)",
          lineHeight: 1.7,
          fontSize: "0.9375rem",
          outline: "none",
          transition: "border-color 0.15s",
        }}
        placeholder="Schrijf hier uw antwoord…"
      />
      {value.length > 0 && (
        <p className="text-xs mt-1 text-right" style={{ color: "var(--gray-400)" }}>
          {value.length} tekens
        </p>
      )}
    </div>
  );
}

// --- SpeakingRecorder ---

function SpeakingRecorder({
  disabled,
  blobUrl,
  onRecorded,
  onTranscribed,
}: {
  disabled: boolean;
  blobUrl: string | null;
  onRecorded: (url: string) => void;
  onTranscribed: (text: string) => void;
}) {
  const [recording, setRecording] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  const {
    status: transcribeStatus,
    transcript,
    error: transcribeError,
    transcribe,
  } = useWhisperTranscriber();
  const processing = transcribeStatus === "transcribing";
  const onTranscribedRef = useRef(onTranscribed);
  useEffect(() => {
    onTranscribedRef.current = onTranscribed;
  });
  useEffect(() => {
    if (transcribeStatus === "done" && transcript) {
      onTranscribedRef.current?.(transcript);
    }
  }, [transcribeStatus, transcript]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const MAX_SECONDS = 60;

  function clearCountdown() {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }

  async function startRecording() {
    setPermissionError(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });

      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      mr.onstop = () => {
        clearCountdown();
        setSecondsLeft(null);
        setRecording(false);
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        onRecorded(url);
        stream.getTracks().forEach((t) => t.stop());
        transcribe(blob, "nl");
      };

      mr.start();
      setRecording(true);
      setSecondsLeft(MAX_SECONDS);
      countdownRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s === null || s <= 1) {
            mr.stop();
            return null;
          }
          return s - 1;
        });
      }, 1000);
    } catch {
      setPermissionError(true);
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4 flex-wrap">
        {!recording ? (
          <button
            key="record"
            onClick={startRecording}
            disabled={disabled || processing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm"
            style={{
              background: processing
                ? "var(--gray-200)"
                : blobUrl
                  ? "var(--gray-100)"
                  : "var(--green-900)",
              color: processing ? "var(--gray-500)" : blobUrl ? "var(--gray-700)" : "white",
              border: "none",
              cursor: disabled || processing ? "not-allowed" : "pointer",
              opacity: disabled ? 0.5 : 1,
            }}
          >
            {processing ? (
              <>
                <svg
                  className="animate-spin"
                  style={{ width: 18, height: 18 }}
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Verwerken…
              </>
            ) : (
              <>
                <MicrophoneIcon style={{ width: 18, height: 18 }} />
                {blobUrl ? "Opnieuw opnemen" : "Begin met opnemen"}
              </>
            )}
          </button>
        ) : (
          <button
            key="stop"
            onClick={stopRecording}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm"
            style={{ background: "var(--red)", color: "white", border: "none", cursor: "pointer" }}
          >
            <StopIcon style={{ width: 18, height: 18 }} />
            Stop opname
          </button>
        )}

        {recording && (
          <span className="flex items-center gap-2 text-sm" style={{ color: "var(--red)" }}>
            <span
              className="inline-block w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ background: "var(--red)" }}
            />
            Opname bezig… {secondsLeft !== null && `(${secondsLeft}s)`}
          </span>
        )}
      </div>

      {permissionError && (
        <p className="text-sm" style={{ color: "var(--red)" }}>
          No microphone access. Check your browser settings.
        </p>
      )}

      {transcribeError && (
        <p className="text-sm" style={{ color: "var(--red)" }}>
          There was a problem processing your recording. Please try again.
        </p>
      )}

      {blobUrl && !recording && !processing && (
        <div>
          <p className="text-xs mb-2" style={{ color: "var(--gray-500)" }}>
            Uw opname:
          </p>
          <audio src={blobUrl} controls className="w-full" style={{ maxWidth: "420px" }} />
        </div>
      )}
    </div>
  );
}

// --- NavigatorPanel ---

interface NavigatorPanelProps {
  questions: Question[];
  currentQ: number;
  answeredIds: Set<string>;
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
  answeredIds,
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
                i === currentQ ? "current" : answeredIds.has(q.id) ? "answered" : ""
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

// --- ExamClient ---

interface Props {
  exam: Exam;
  skillId: string;
  n: number;
}

export function ExamClient({ exam, skillId, n }: Props) {
  const router = useRouter();
  const [currentQ, setCurrentQ] = useState(0);
  // number for MCQ, string for writing (text) or speaking (blob URL)
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [transcripts, setTranscripts] = useState<Record<string, string>>({});
  const [showModal, setShowModal] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [grading, setGrading] = useState(false);
  const [gradingFailed, setGradingFailed] = useState(false);
  const [gradingResultId, setGradingResultId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [timeUp, setTimeUp] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);

  const blockNavRef = useRef(true);
  const gradingRef = useRef(false);
  const gradingInFlightRef = useRef(false);
  const attemptIdRef = useRef(crypto.randomUUID());
  const timeUpRef = useRef(false);

  const totalQuestions = exam.questions.length;
  const question = exam.questions[currentQ];

  // Compute which questions are "answered" (non-empty for writing, any value for others)
  const answeredIds = new Set<string>(
    exam.questions
      .filter((q) => {
        const a = answers[q.id];
        if (a === undefined) {
          return false;
        }
        if (q.type === "writing") {
          return typeof a === "string" && a.trim().length > 0;
        }
        return true; // MCQ (number) or speaking (blob URL string)
      })
      .map((q) => q.id)
  );
  const answeredCount = answeredIds.size;
  const unansweredCount = totalQuestions - answeredCount;

  const didTrackRef = useRef(false);
  useEffect(() => {
    if (didTrackRef.current) {
      return;
    }
    didTrackRef.current = true;
    analytics.examStarted(`${skillId}-${n}`);
  }, [skillId, n]);

  // Block browser back button
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    function handlePopState() {
      if (!blockNavRef.current && !gradingRef.current) {
        return;
      }
      window.history.pushState(null, "", window.location.href);
      if (!timeUpRef.current && !gradingRef.current) {
        setShowExitDialog(true);
      }
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Block browser refresh / tab close
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (!blockNavRef.current && !gradingRef.current) {
        return;
      }
      e.preventDefault();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  function selectOption(index: number) {
    if (timeUp) {
      return;
    }
    setAnswers((prev) => ({ ...prev, [question.id]: index }));
  }

  function setWritingAnswer(text: string) {
    if (timeUp) {
      return;
    }
    setAnswers((prev) => ({ ...prev, [question.id]: text }));
  }

  function setSpeakingAnswer(blobUrl: string) {
    if (timeUp) {
      return;
    }
    setAnswers((prev) => ({ ...prev, [question.id]: blobUrl }));
  }

  function handleExpire() {
    timeUpRef.current = true;
    setTimeUp(true);
  }

  useEffect(() => {
    if (!showTimeWarning) {
      return;
    }
    const id = setTimeout(() => setShowTimeWarning(false), 8000);
    return () => clearTimeout(id);
  }, [showTimeWarning]);

  async function callGradeApi(resultId: string): Promise<void> {
    if (gradingInFlightRef.current) {
      return;
    }
    gradingInFlightRef.current = true;
    setGradingFailed(false);
    try {
      const res = await fetch("/api/exams/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result_id: resultId }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setGradingFailed(true);
        gradingInFlightRef.current = false;
        return;
      }
      gradingRef.current = false;
      router.replace(`/exam/results?skill=${skillId}&n=${n}`);
    } catch {
      setGradingFailed(true);
      gradingInFlightRef.current = false;
    }
  }

  async function submitExam() {
    if (submitting || grading) {
      return;
    }
    setSubmitting(true);
    blockNavRef.current = false;

    try {
      const formData = new FormData();
      formData.append("skill_id", skillId);
      formData.append("n", String(n));
      formData.append("attempt_id", attemptIdRef.current);

      const answersPayload: Record<string, number | string> = {};
      const transcriptsPayload: Record<string, string> = {};

      for (const q of exam.questions) {
        const a = answers[q.id];
        if (a === undefined) {
          continue;
        }

        if (q.type === "speaking" && typeof a === "string" && a.startsWith("blob:")) {
          const audioBlob = await fetch(a).then((r) => r.blob());
          formData.append(`audio_${q.id}`, audioBlob, `${q.id}.webm`);
          transcriptsPayload[q.id] = transcripts[q.id] ?? "";
          answersPayload[q.id] = "AUDIO";
        } else {
          answersPayload[q.id] = a as number | string;
        }
      }

      formData.append("answers", JSON.stringify(answersPayload));
      formData.append("transcripts", JSON.stringify(transcriptsPayload));

      const res = await fetch("/api/exams/submit", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok || data.error) {
        setSubmitError(
          data.error === "upload_failed"
            ? "Failed to upload your recording. Please try again."
            : "Something went wrong. Please try again."
        );
        setSubmitting(false);
        blockNavRef.current = true;
        return;
      }

      analytics.examCompleted(`${skillId}-${n}`);

      const isMcq = exam.skill !== "writing" && exam.skill !== "speaking";
      if (!isMcq) {
        setGradingResultId(data.id);
        setSubmitting(false);
        setShowModal(false);
        setGrading(true);
        gradingRef.current = true;
        await callGradeApi(data.id);
        return;
      }

      router.replace(`/exam/results?skill=${skillId}&n=${n}`);
    } catch {
      setSubmitError("Something went wrong. Check your connection and try again.");
      setSubmitting(false);
      blockNavRef.current = true;
    }
  }

  function confirmExit() {
    analytics.examAbandoned(`${skillId}-${n}`);
    blockNavRef.current = false;
    router.push(`/exams/${skillId}`);
  }

  const navigatorProps: NavigatorPanelProps = {
    questions: exam.questions,
    currentQ,
    answeredIds,
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
          <div className="flex items-center justify-center gap-2">
            <Timer
              initialSeconds={exam.timeLimitMinutes * 60}
              onExpire={handleExpire}
              warningAt={[900]}
              onWarning={() => setShowTimeWarning(true)}
            />
            <h1
              className="font-bold truncate"
              style={{ fontSize: "1.125rem", color: "var(--gray-900)" }}
            >
              {exam.title}
            </h1>
          </div>

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
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(question.content) }}
            />

            {question.type === "writing" && (
              <WritingInput
                value={
                  typeof answers[question.id] === "string" ? (answers[question.id] as string) : ""
                }
                disabled={timeUp}
                onChange={setWritingAnswer}
              />
            )}

            {question.type === "speaking" && (
              <SpeakingRecorder
                disabled={timeUp}
                blobUrl={
                  typeof answers[question.id] === "string" ? (answers[question.id] as string) : null
                }
                onRecorded={setSpeakingAnswer}
                onTranscribed={(text) =>
                  setTranscripts((prev) => ({ ...prev, [question.id]: text }))
                }
              />
            )}

            {question.type === "multiple_choice" && (
              <div className="flex flex-col gap-3">
                {(question.options ?? []).map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => selectOption(i)}
                    disabled={timeUp}
                    className={`exam-option ${answers[question.id] === i ? "selected" : ""}`}
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
            )}
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
          <div
            className="modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-time-warning-title"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-5"
              style={{ background: "var(--amber-light)" }}
            >
              <ClockIcon style={{ width: 24, height: 24, color: "var(--amber)" }} />
            </div>
            <h3
              id="modal-time-warning-title"
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
          <div
            className="modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-times-up-title"
            style={{ textAlign: "center" }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: "var(--red-light)" }}
            >
              <ClockIcon style={{ width: 32, height: 32, color: "var(--red)" }} />
            </div>
            <h3
              id="modal-times-up-title"
              className="font-bold mb-2"
              style={{ fontSize: "1.5rem", color: "var(--gray-900)" }}
            >
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
            {submitError && (
              <p
                className="mb-4 text-sm rounded-xl px-4 py-3"
                style={{ background: "var(--red-light)", color: "var(--red)" }}
              >
                {submitError}
              </p>
            )}
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

      {/* AI grading overlay — in-progress or failed */}
      {grading && (
        <div className="modal-overlay">
          <div
            className="modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-grading-title"
            style={{ textAlign: "center" }}
          >
            {gradingFailed ? (
              <>
                <h3
                  id="modal-grading-title"
                  className="font-bold mb-2"
                  style={{ fontSize: "1.25rem", color: "var(--gray-900)" }}
                >
                  Grading failed
                </h3>
                <p style={{ color: "var(--gray-600)", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                  Something went wrong while grading your answers. You can try again or go back to
                  the dashboard.
                </p>
                <div className="flex gap-6 justify-center">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      gradingRef.current = false;
                      setGrading(false);
                      router.push(`/exams/${skillId}`);
                    }}
                  >
                    Back to dashboard
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (gradingResultId) {
                        callGradeApi(gradingResultId);
                      }
                    }}
                  >
                    Retry grading
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Spinner */}
                <div className="flex justify-center mb-6">
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      border: "4px solid var(--gray-200)",
                      borderTopColor: "var(--green-900)",
                      animation: "spin 0.9s linear infinite",
                    }}
                  />
                </div>
                <h3
                  id="modal-grading-title"
                  className="font-bold mb-2"
                  style={{ fontSize: "1.25rem", color: "var(--gray-900)" }}
                >
                  Grading your answers…
                </h3>
                <p style={{ color: "var(--gray-600)", lineHeight: 1.6, marginBottom: "0.75rem" }}>
                  The AI is reviewing your answers. This may take several minutes.
                </p>
                <p className="text-sm" style={{ color: "var(--gray-400)" }}>
                  Please do not close this window.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Submit confirmation modal */}
      {showModal && !timeUp && !grading && (
        <div className="modal-overlay">
          <div
            className="modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-submit-title"
          >
            <h3
              id="modal-submit-title"
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
            {submitError && (
              <p
                className="mb-4 text-sm rounded-xl px-4 py-3"
                style={{ background: "var(--red-light)", color: "var(--red)" }}
              >
                {submitError}
              </p>
            )}
            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setShowModal(false);
                  setSubmitError(null);
                }}
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
          <div
            className="modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-exit-title"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-5"
              style={{ background: "var(--amber-light)" }}
            >
              <ExclamationTriangleIcon style={{ width: 24, height: 24, color: "var(--amber)" }} />
            </div>
            <h3
              id="modal-exit-title"
              className="font-bold mb-2"
              style={{ fontSize: "1.25rem", color: "var(--gray-900)" }}
            >
              Leave Exam?
            </h3>
            <p className="mb-6" style={{ color: "var(--gray-600)", lineHeight: 1.6 }}>
              Your progress will not be saved. If you leave, your answers will be lost and you will
              need to start over.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setShowExitDialog(false)}>
                Stay
              </Button>
              <Button variant="danger" fullWidth onClick={confirmExit}>
                Leave
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
