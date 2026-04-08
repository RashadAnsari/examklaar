"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CheckIcon, XMarkIcon } from "@heroicons/react/20/solid";

type FilterType = "all" | "correct" | "incorrect";

type ReviewQuestion = {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
  userIndex: number;
  explanation: string;
};

const QUESTIONS: ReviewQuestion[] = [
  {
    id: 1,
    text: "Hoeveel verplichte feestdagen zijn er in Nederland?",
    options: ["7 dagen", "8 dagen", "9 dagen", "10 dagen"],
    correctIndex: 1,
    userIndex: 1,
    explanation:
      "Nederland heeft 8 officiële feestdagen: Nieuwjaarsdag, Eerste en Tweede Paasdag, Koningsdag, Bevrijdingsdag (eens per 5 jaar), Hemelvaartsdag, Eerste en Tweede Pinksterdag, en Eerste en Tweede Kerstdag.",
  },
  {
    id: 2,
    text: "Wat is de hoofdstad van Nederland?",
    options: ["Rotterdam", "Amsterdam", "Den Haag", "Utrecht"],
    correctIndex: 1,
    userIndex: 2,
    explanation:
      "Amsterdam is de officiële hoofdstad van Nederland, volgens de grondwet. Hoewel de regering en koning in Den Haag (de Hofstad) zetelen, blijft Amsterdam de constitutionele hoofdstad.",
  },
  {
    id: 3,
    text: "Vanaf welke leeftijd ben je in Nederland verplicht om een basisverzekering af te sluiten?",
    options: ["16 jaar", "18 jaar", "21 jaar", "Geen leeftijdsgrens"],
    correctIndex: 1,
    userIndex: 1,
    explanation:
      "Vanaf 18 jaar ben je in Nederland wettelijk verplicht om een basisverzekering af te sluiten. Tot die leeftijd vallen kinderen onder de verzekering van hun ouders.",
  },
];

export default function ReviewPage() {
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = QUESTIONS.filter((q) => {
    if (filter === "correct") {
      return q.userIndex === q.correctIndex;
    }
    if (filter === "incorrect") {
      return q.userIndex !== q.correctIndex;
    }
    return true;
  });

  const correctCount = QUESTIONS.filter((q) => q.userIndex === q.correctIndex).length;
  const incorrectCount = QUESTIONS.length - correctCount;

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
            KNM Exam Review – Practice #4
          </h1>
          <span
            className="px-5 py-2 rounded-full font-bold"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "1rem",
              background: "var(--green-success-light)",
              color: "var(--green-success)",
            }}
          >
            8.5 / 10
          </span>
        </div>
      </div>

      <div className="mx-auto px-6 py-8" style={{ maxWidth: "900px" }}>
        {/* Filter bar */}
        <div
          className="rounded-xl px-6 py-4 mb-8 flex flex-wrap gap-3 border"
          style={{ background: "white", borderColor: "var(--gray-200)" }}
        >
          {(["all", "correct", "incorrect"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all"
              style={{
                background: filter === f ? "var(--green-900)" : "var(--gray-100)",
                color: filter === f ? "white" : "var(--gray-700)",
                border: "2px solid transparent",
              }}
            >
              {f === "all"
                ? `All (${QUESTIONS.length})`
                : f === "correct"
                  ? `Correct (${correctCount})`
                  : `Incorrect (${incorrectCount})`}
            </button>
          ))}
        </div>

        {/* Questions */}
        <div className="flex flex-col gap-6">
          {filtered.map((q, displayIndex) => (
            <ReviewQuestionCard key={q.id} question={q} displayIndex={displayIndex} />
          ))}
        </div>
      </div>

      {/* Sticky bottom nav */}
      <div
        className="fixed bottom-0 left-0 right-0 flex justify-center gap-4 px-6 py-5 border-t"
        style={{ background: "white", borderColor: "var(--gray-200)" }}
      >
        <Button href="/exam" variant="primary">
          Try Another Exam
        </Button>
        <Button href="/dashboard" variant="outline">
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}

function ReviewQuestionCard({
  question,
  displayIndex,
}: {
  question: ReviewQuestion;
  displayIndex: number;
}) {
  const isCorrect = question.userIndex === question.correctIndex;

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
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
          style={{
            background: isCorrect ? "var(--green-success-light)" : "var(--red-light)",
            color: isCorrect ? "var(--green-success)" : "var(--red)",
          }}
        >
          {isCorrect ? (
            <CheckIcon style={{ width: 16, height: 16 }} />
          ) : (
            <XMarkIcon style={{ width: 16, height: 16 }} />
          )}
          {isCorrect ? "Correct" : "Incorrect"}
        </span>
      </div>

      {/* Question text */}
      <h3
        className="font-semibold mb-6"
        style={{ fontSize: "1.125rem", color: "var(--gray-900)", lineHeight: 1.6 }}
      >
        {question.text}
      </h3>

      {/* Options */}
      <div className="flex flex-col gap-3 mb-6">
        {question.options.map((opt, i) => {
          const isUserAnswer = i === question.userIndex;
          const isCorrectAnswer = i === question.correctIndex;
          const isWrongUserAnswer = isUserAnswer && !isCorrect;

          let optionClass = "review-option";
          if (isWrongUserAnswer) {
            optionClass += " user-wrong";
          } else if (isCorrectAnswer) {
            optionClass += " correct-answer";
          }

          return (
            <div key={i} className={optionClass}>
              <span className="inline-flex items-center gap-2 font-semibold mr-2">
                {String.fromCharCode(65 + i)}.
                {isCorrectAnswer && <CheckIcon style={{ width: 16, height: 16 }} />}
                {isWrongUserAnswer && <XMarkIcon style={{ width: 16, height: 16 }} />}
              </span>
              {opt}
            </div>
          );
        })}
      </div>

      {/* Explanation */}
      <div className="explanation-box">
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-2"
          style={{ color: "var(--blue)" }}
        >
          Explanation
        </p>
        <p className="text-sm" style={{ color: "var(--gray-700)", lineHeight: 1.7 }}>
          {question.explanation}
        </p>
      </div>
    </div>
  );
}
