"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Timer } from "@/components/ui/Timer";
import { Button } from "@/components/ui/Button";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  MicrophoneIcon,
  StopIcon,
} from "@heroicons/react/24/outline";
import { ClockIcon } from "@heroicons/react/20/solid";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { createClient } from "@/utils/supabase/client";

export interface Question {
  id: string;
  type: string; // "multiple_choice" | "writing" | "speaking"
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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);
  const accumulatedRef = useRef("");

  const MAX_SECONDS = 60;

  function clearCountdown() {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }

  async function startRecording() {
    setPermissionError(false);
    accumulatedRef.current = "";

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // MediaRecorder — captures audio for upload
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        clearCountdown();
        setSecondsLeft(null);
        setRecording(false);
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        onRecorded(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };

      // SpeechRecognition — live transcription

      type SpeechRecognitionCtor = new () => {
        lang: string;
        continuous: boolean;
        interimResults: boolean;
        onresult:
          | ((e: {
              resultIndex: number;
              results: { isFinal: boolean; 0: { transcript: string } }[];
            }) => void)
          | null;
        onend: (() => void) | null;
        start: () => void;
        stop: () => void;
      };
      const win = window as Window & {
        SpeechRecognition?: SpeechRecognitionCtor;
        webkitSpeechRecognition?: SpeechRecognitionCtor;
      };
      const SpeechRecognitionAPI = win.SpeechRecognition ?? win.webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        const recognition = new SpeechRecognitionAPI();
        recognition.lang = "nl-NL";
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.onresult = (e) => {
          for (let i = e.resultIndex; i < e.results.length; i++) {
            if (e.results[i].isFinal) {
              accumulatedRef.current += e.results[i][0].transcript + " ";
            }
          }
        };
        recognition.onend = () => {
          const final = accumulatedRef.current.trim();
          if (final) onTranscribed(final);
        };
        recognition.start();
        recognitionRef.current = recognition;
      }

      mr.start();
      setRecording(true);
      setSecondsLeft(MAX_SECONDS);
      countdownRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s === null || s <= 1) {
            recognitionRef.current?.stop();
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
    recognitionRef.current?.stop();
    mediaRecorderRef.current?.stop();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4 flex-wrap">
        {!recording ? (
          <button
            key="record"
            onClick={startRecording}
            disabled={disabled}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm"
            style={{
              background: blobUrl ? "var(--gray-100)" : "var(--green-900)",
              color: blobUrl ? "var(--gray-700)" : "white",
              border: "none",
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.5 : 1,
            }}
          >
            <MicrophoneIcon style={{ width: 18, height: 18 }} />
            {blobUrl ? "Opnieuw opnemen" : "Begin met opnemen"}
          </button>
        ) : (
          <button
            key="stop"
            onClick={stopRecording}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm"
            style={{
              background: "var(--red)",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
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
          Geen toegang tot microfoon. Controleer uw browserinstellingen.
        </p>
      )}

      {blobUrl && !recording && (
        <div>
          <p className="text-xs mb-2" style={{ color: "var(--gray-500)" }}>
            Uw opname:
          </p>
          {}
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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [timeUp, setTimeUp] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);

  const blockNavRef = useRef(true);
  const attemptIdRef = useRef(crypto.randomUUID());
  const timeUpRef = useRef(false);

  const totalQuestions = exam.questions.length;
  const question = exam.questions[currentQ];

  // Compute which questions are "answered" (non-empty for writing, any value for others)
  const answeredIds = new Set<string>(
    exam.questions
      .filter((q) => {
        const a = answers[q.id];
        if (a === undefined) return false;
        if (q.type === "writing") return typeof a === "string" && a.trim().length > 0;
        return true; // MCQ (number) or speaking (blob URL string)
      })
      .map((q) => q.id)
  );
  const answeredCount = answeredIds.size;
  const unansweredCount = totalQuestions - answeredCount;

  // Block browser back button
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    function handlePopState() {
      if (!blockNavRef.current) return;
      window.history.pushState(null, "", window.location.href);
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

  function setWritingAnswer(text: string) {
    if (timeUp) return;
    setAnswers((prev) => ({ ...prev, [question.id]: text }));
  }

  function setSpeakingAnswer(blobUrl: string) {
    if (timeUp) return;
    setAnswers((prev) => ({ ...prev, [question.id]: blobUrl }));
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
      const isMcq = exam.skill !== "writing" && exam.skill !== "speaking";
      const score = isMcq
        ? exam.questions.filter((q) => answers[q.id] === q.correctAnswer).length
        : 0; // writing/speaking scored later by AI

      const answersJson: Record<string, number | string | { path: string; transcript: string }> =
        {};
      for (const q of exam.questions) {
        const a = answers[q.id];
        if (a === undefined) continue;

        if (q.type === "speaking" && typeof a === "string" && a.startsWith("blob:")) {
          // Upload audio blob to Supabase Storage
          const audioBlob = await fetch(a).then((r) => r.blob());
          const path = `${user.id}/${exam.id}/${attemptIdRef.current}/${q.id}.webm`;
          const { error } = await supabase.storage
            .from("speaking-recordings")
            .upload(path, audioBlob, { contentType: "audio/webm" });
          if (error) {
            setSubmitError("Het uploaden van uw opname is mislukt. Probeer het opnieuw.");
            setSubmitting(false);
            blockNavRef.current = true;
            return;
          }
          answersJson[q.id] = { path, transcript: transcripts[q.id] ?? "" };
        } else {
          answersJson[q.id] = a;
        }
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
