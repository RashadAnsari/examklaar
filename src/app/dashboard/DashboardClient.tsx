"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { UpgradeBanner } from "@/components/ui/UpgradeBanner";
import type { SkillGroup } from "@/lib/exam/config";

const LEVELS = ["A2", "B1"] as const;
type Level = (typeof LEVELS)[number];

export function DashboardClient({
  skills,
  isPaid,
  earlyAccess,
}: {
  skills: SkillGroup[];
  isPaid: boolean;
  earlyAccess: boolean;
}) {
  const [selected, setLevel] = useState<Level>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dashboard:level");
      if (saved === "A2" || saved === "B1") {
        return saved;
      }
    }
    return "A2";
  });

  function handleLevelChange(l: Level) {
    setLevel(l);
    localStorage.setItem("dashboard:level", l);
  }

  // Only levels that have exams are offered, so B1 appears once B1 exam files exist
  const levels = LEVELS.filter((l) => skills.some((s) => s.level === l));
  const level = levels.includes(selected) ? selected : (levels[0] ?? "A2");

  const knm = skills.find((s) => s.skill === "knm");
  const leveled = skills.filter((s) => s.level === level);
  const exams = [...(knm ? [knm] : []), ...leveled];

  return (
    <>
      {/* Upgrade banner: for users without access, and during early access to
          say that everything is free for now */}
      {(earlyAccess || !isPaid) && (
        <div className="mb-12">
          <UpgradeBanner earlyAccess={earlyAccess} />
        </div>
      )}

      {/* Practice Exams heading + level selector */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-semibold" style={{ fontSize: "1.5rem", color: "var(--gray-900)" }}>
          Practice Exams
        </h2>
        {levels.length > 1 && (
          <div className="flex rounded-lg p-1 gap-1" style={{ background: "var(--gray-200)" }}>
            {levels.map((l) => (
              <button
                key={l}
                aria-pressed={level === l}
                onClick={() => handleLevelChange(l)}
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
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {exams.map((exam) => (
          <ExamCard key={exam.id} skill={exam} isPaid={isPaid} />
        ))}
      </div>
    </>
  );
}

function ExamCard({ skill, isPaid }: { skill: SkillGroup; isPaid: boolean }) {
  const { id, title, level, description, examCount, completedCount } = skill;

  return (
    <div
      className="rounded-2xl p-5 sm:p-8 border-2 flex flex-col"
      style={{ background: "white", borderColor: "var(--gray-200)" }}
    >
      <h3
        className="font-semibold mb-3 flex items-center gap-2 flex-wrap"
        style={{ fontSize: "1.125rem", color: "var(--gray-900)" }}
      >
        <span>
          {title}
          {level ? ` ${level}` : ""}
        </span>
        {!isPaid && (
          <span
            className="rounded-full px-2 py-0.5 text-xs font-semibold"
            style={{ background: "var(--green-50)", color: "var(--green-700)" }}
          >
            1 free exam
          </span>
        )}
      </h3>

      <p className="text-sm mb-6" style={{ color: "var(--gray-600)", lineHeight: 1.6 }}>
        {description}
      </p>

      <div className="mb-6 flex-1">
        <div className="flex justify-between text-xs mb-2" style={{ color: "var(--gray-500)" }}>
          <span>
            {completedCount === 0 ? "Not started" : `${completedCount} of ${examCount} completed`}
          </span>
          <span>
            {examCount} {examCount === 1 ? "exam" : "exams"}
          </span>
        </div>
        <ProgressBar value={completedCount} max={examCount} thin />
      </div>

      <div className="flex gap-3">
        <Button href={`/exams/${id}`} variant="primary" fullWidth>
          View Exams
        </Button>
      </div>
    </div>
  );
}
