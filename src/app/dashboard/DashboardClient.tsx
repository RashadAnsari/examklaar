"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { SkillGroup } from "@/lib/exam-config";

type Level = "A2" | "B1";

export function DashboardClient({ skills }: { skills: SkillGroup[] }) {
  const [level, setLevel] = useState<Level>("A2");

  const knm = skills.find((s) => s.skill === "knm");
  const leveled = skills.filter((s) => s.level === level);
  const exams = [...(knm ? [knm] : []), ...leveled];

  return (
    <>
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
          <ExamCard key={exam.id} skill={exam} />
        ))}
      </div>
    </>
  );
}

function ExamCard({ skill }: { skill: SkillGroup }) {
  const { id, title, level, description, locked, examCount, timeLimitMinutes } = skill;

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
        {description} {timeLimitMinutes} minutes
      </p>

      <div className="mb-6 flex-1">
        {locked ? (
          <p className="text-sm" style={{ color: "var(--gray-500)" }}>
            Available with Premium
          </p>
        ) : (
          <>
            <div className="flex justify-between text-xs mb-2" style={{ color: "var(--gray-500)" }}>
              <span>Not started</span>
              <span>
                {examCount} {examCount === 1 ? "exam" : "exams"}
              </span>
            </div>
            <ProgressBar value={0} max={examCount} thin />
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
