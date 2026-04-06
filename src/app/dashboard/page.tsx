"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
type Level = "A2" | "B1";

interface ExamCardData {
  id: string;
  title: string;
  level: Level | null;
  description: string;
  locked: boolean;
  completions: number;
  totalExams: number;
}

const KNM_EXAM: ExamCardData = {
  id: "knm",
  title: "KNM (Knowledge)",
  level: null,
  description: "Dutch society, culture, and laws. 40 questions, 45 minutes",
  locked: false,
  completions: 3,
  totalExams: 5,
};

const EXAMS_BY_LEVEL: Record<Level, ExamCardData[]> = {
  A2: [
    {
      id: "reading-a2",
      title: "Lezen (Reading)",
      level: "A2",
      description: "Reading comprehension with Dutch texts. 30 questions, 65 minutes",
      locked: false,
      completions: 2,
      totalExams: 5,
    },
    {
      id: "listening-a2",
      title: "Luisteren (Listening)",
      level: "A2",
      description: "Dutch audio clips and questions. 30 questions, 60 minutes",
      locked: false,
      completions: 1,
      totalExams: 5,
    },
    {
      id: "writing-a2",
      title: "Schrijven (Writing)",
      level: "A2",
      description: "Write in Dutch and get AI-powered feedback. 4 tasks, 45 minutes",
      locked: true,
      completions: 0,
      totalExams: 5,
    },
    {
      id: "speaking-a2",
      title: "Spreken (Speaking)",
      level: "A2",
      description: "Practice speaking and get pronunciation feedback. 12 tasks, 30 minutes",
      locked: true,
      completions: 0,
      totalExams: 5,
    },
  ],
  B1: [
    {
      id: "reading-b1",
      title: "Lezen (Reading)",
      level: "B1",
      description: "Reading comprehension with Dutch texts. 30 questions, 65 minutes",
      locked: false,
      completions: 0,
      totalExams: 5,
    },
    {
      id: "listening-b1",
      title: "Luisteren (Listening)",
      level: "B1",
      description: "Dutch audio clips and questions. 30 questions, 60 minutes",
      locked: false,
      completions: 0,
      totalExams: 5,
    },
    {
      id: "writing-b1",
      title: "Schrijven (Writing)",
      level: "B1",
      description: "Write in Dutch and get AI-powered feedback. 4 tasks, 45 minutes",
      locked: true,
      completions: 0,
      totalExams: 5,
    },
    {
      id: "speaking-b1",
      title: "Spreken (Speaking)",
      level: "B1",
      description: "Practice speaking and get pronunciation feedback. 12 tasks, 30 minutes",
      locked: true,
      completions: 0,
      totalExams: 5,
    },
  ],
};

export default function DashboardPage() {
  const [level, setLevel] = useState<Level>("A2");
  const exams = [KNM_EXAM, ...EXAMS_BY_LEVEL[level]];

  return (
    <div className="min-h-screen" style={{ background: "var(--gray-50)" }}>
      <Navbar />

      <div className="container py-8" style={{ maxWidth: "1280px" }}>
        {/* Page header */}
        <div className="mb-8">
          <h1 className="font-bold mb-1" style={{ fontSize: "2rem", color: "var(--gray-900)" }}>
            Welcome back, Rashad
          </h1>
          <p style={{ color: "var(--gray-600)" }}>Continue practicing for your inburgering exam</p>
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

        {/* Practice Exams heading + level selector */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-semibold" style={{ fontSize: "1.5rem", color: "var(--gray-900)" }}>
            Practice Exams
          </h2>
          <div className="flex rounded-lg p-1 gap-1" style={{ background: "var(--gray-200)" }}>
            {(["A2", "B1"] as Level[]).map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className="rounded-md px-4 py-1.5 text-sm font-semibold transition-all"
                style={{
                  background: level === l ? "white" : "transparent",
                  color: level === l ? "var(--gray-900)" : "var(--gray-600)",
                  boxShadow: level === l ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <ExamCard key={exam.id} {...exam} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

/* ==================== SUB-COMPONENTS ==================== */

function ExamCard({
  id,
  title,
  level,
  description,
  locked,
  completions,
  totalExams,
}: ExamCardData) {
  return (
    <div
      className="rounded-2xl p-8 border-2 flex flex-col"
      style={{
        background: "white",
        borderColor: "var(--gray-200)",
        opacity: locked ? 0.65 : 1,
      }}
    >
      <h3 className="font-semibold mb-3" style={{ fontSize: "1.125rem", color: "var(--gray-900)" }}>
        {title}
        {level ? ` ${level}` : ""}
      </h3>

      <p className="text-sm mb-6" style={{ color: "var(--gray-600)", lineHeight: 1.6 }}>
        {description}
      </p>

      <div className="mb-6 flex-1">
        {locked ? (
          <p className="text-sm" style={{ color: "var(--gray-500)" }}>
            Available with Premium
          </p>
        ) : (
          <>
            <div className="flex justify-between text-xs mb-2" style={{ color: "var(--gray-500)" }}>
              <span>
                {completions === 0 ? "Not started" : `${completions} of ${totalExams} completed`}
              </span>
              <span>{totalExams} exams</span>
            </div>
            <ProgressBar value={completions} max={totalExams} thin />
          </>
        )}
      </div>

      <div className="flex gap-3">
        {locked ? (
          <Button href="/pricing" variant="primary" fullWidth>
            Upgrade to Unlock
          </Button>
        ) : (
          <Button href={`/exams/${id}`} variant="primary" fullWidth>
            View Exams
          </Button>
        )}
      </div>
    </div>
  );
}
