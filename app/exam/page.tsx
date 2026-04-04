"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Timer } from "@/components/ui/Timer";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";

const TOTAL_QUESTIONS = 40;
const EXAM_DURATION_SECONDS = 45 * 60; // 45 minutes

const SAMPLE_QUESTIONS = [
  {
    id: 1,
    text: "Wat is de hoofdstad van Nederland?",
    options: ["Rotterdam", "Amsterdam", "Den Haag", "Utrecht"],
    correct: 1,
  },
  {
    id: 2,
    text: "Hoeveel verplichte feestdagen zijn er in Nederland?",
    options: ["7 dagen", "8 dagen", "9 dagen", "10 dagen"],
    correct: 1,
  },
  {
    id: 3,
    text: "Vanaf welke leeftijd ben je verplicht een basisverzekering af te sluiten?",
    options: ["16 jaar", "18 jaar", "21 jaar", "Geen leeftijdsgrens"],
    correct: 1,
  },
  {
    id: 4,
    text: "Welk orgaan maakt wetten in Nederland?",
    options: ["De Koning", "De Tweede Kamer", "Het Parlement", "De Minister-President"],
    correct: 2,
  },
  {
    id: 5,
    text: "Wat is de officiële taal van Nederland?",
    options: ["Fries", "Nederlands", "Duits", "Engels"],
    correct: 1,
  },
];

export default function ExamPage() {
  const router = useRouter();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showModal, setShowModal] = useState(false);

  const question = SAMPLE_QUESTIONS[currentQ % SAMPLE_QUESTIONS.length];
  const answeredCount = Object.keys(answers).length;
  const selectedOption = answers[currentQ];

  function selectOption(index: number) {
    setAnswers((prev) => ({ ...prev, [currentQ]: index }));
  }

  function goTo(index: number) {
    setCurrentQ(index);
  }

  const handleExpire = useCallback(() => {
    router.push("/results");
  }, [router]);

  function confirmSubmit() {
    router.push("/results");
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--gray-50)" }}>
      {/* Sticky exam header */}
      <div
        className="sticky top-0 z-50 border-b-2"
        style={{ background: "white", borderColor: "var(--gray-200)" }}
      >
        <div className="mx-auto px-6 py-5" style={{ maxWidth: "900px" }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h1 className="font-semibold" style={{ fontSize: "1.25rem", color: "var(--gray-900)" }}>
              KNM Exam – Practice #4
            </h1>
            <Timer initialSeconds={EXAM_DURATION_SECONDS} onExpire={handleExpire} />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2" style={{ color: "var(--gray-600)" }}>
              <span>
                Question {currentQ + 1} of {TOTAL_QUESTIONS}
              </span>
              <span>{answeredCount} answered</span>
            </div>
            <ProgressBar value={currentQ + 1} max={TOTAL_QUESTIONS} />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto px-6 py-8" style={{ maxWidth: "900px" }}>
        {/* Question card */}
        <div
          className="rounded-2xl p-12 border mb-8"
          style={{ background: "white", borderColor: "var(--gray-200)" }}
        >
          <p
            className="text-sm font-semibold uppercase tracking-wider mb-4"
            style={{ color: "var(--green-900)" }}
          >
            Question {currentQ + 1} of {TOTAL_QUESTIONS}
          </p>
          <h2
            className="font-semibold mb-8"
            style={{ fontSize: "1.25rem", color: "var(--gray-900)", lineHeight: 1.6 }}
          >
            {question.text}
          </h2>

          <div className="flex flex-col gap-4">
            {question.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => selectOption(i)}
                className={`exam-option text-left ${selectedOption === i ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="answer"
                  checked={selectedOption === i}
                  onChange={() => selectOption(i)}
                  className="flex-shrink-0"
                  style={{ accentColor: "var(--green-900)", width: "20px", height: "20px" }}
                />
                <span style={{ color: "var(--gray-900)", lineHeight: 1.6 }}>{opt}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Prev / Next */}
        <div className="flex justify-between gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
            disabled={currentQ === 0}
          >
            <ChevronLeftIcon />
            Previous
          </Button>
          <Button
            variant="primary"
            onClick={() => setCurrentQ((q) => Math.min(TOTAL_QUESTIONS - 1, q + 1))}
            disabled={currentQ === TOTAL_QUESTIONS - 1}
          >
            Next
            <ChevronRightIcon />
          </Button>
        </div>

        {/* Question navigator */}
        <div
          className="rounded-2xl p-8 border mb-8"
          style={{ background: "white", borderColor: "var(--gray-200)" }}
        >
          <p
            className="text-sm font-semibold uppercase tracking-wider mb-4"
            style={{ color: "var(--gray-700)" }}
          >
            All Questions
          </p>
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(44px, 1fr))" }}
          >
            {Array.from({ length: TOTAL_QUESTIONS }, (_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`question-btn ${
                  i === currentQ ? "current" : answers[i] !== undefined ? "answered" : ""
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="text-center">
          <Button variant="primary" size="lg" onClick={() => setShowModal(true)}>
            Submit Exam
          </Button>
        </div>
      </div>

      {/* Submit confirmation modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="font-bold mb-4" style={{ fontSize: "1.5rem", color: "var(--gray-900)" }}>
              Submit Exam?
            </h3>
            <p className="mb-8" style={{ color: "var(--gray-600)", lineHeight: 1.6 }}>
              You have answered{" "}
              <strong>
                {answeredCount} out of {TOTAL_QUESTIONS}
              </strong>{" "}
              questions. Are you sure you want to submit? You won&apos;t be able to change your
              answers after submission.
            </p>
            <div className="flex gap-4">
              <Button variant="outline" fullWidth onClick={() => setShowModal(false)}>
                Continue Exam
              </Button>
              <Button variant="primary" fullWidth onClick={confirmSubmit}>
                Submit Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==================== ICONS ==================== */

function ChevronLeftIcon() {
  return (
    <svg
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
