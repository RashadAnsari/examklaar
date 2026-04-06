import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import { SKILL_TITLES, SKILL_DESCRIPTIONS } from "@/lib/exam-config";

const EXAMS_DIR = path.join(process.cwd(), "src/data/exams");

interface ExamItem {
  n: number;
  timeLimitMinutes: number;
}

async function loadExams(
  id: string
): Promise<{ skill: string; level: string | null; exams: ExamItem[] } | null> {
  const parts = id.split("-");
  const lastPart = parts[parts.length - 1];
  const isLevel = ["a2", "b1"].includes(lastPart);
  const skill = isLevel ? parts.slice(0, -1).join("-") : id;
  const levelDir = isLevel ? lastPart : null;

  if (!(skill in SKILL_TITLES)) return null;

  const dir = levelDir ? path.join(EXAMS_DIR, skill, levelDir) : path.join(EXAMS_DIR, skill);

  try {
    const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".json")).sort();
    if (files.length === 0) return null;

    const exams: ExamItem[] = await Promise.all(
      files.map(async (filename) => {
        const json = JSON.parse(await fs.readFile(path.join(dir, filename), "utf-8"));
        const match = filename.match(/(\d+)\.json$/);
        return { n: match ? parseInt(match[1]) : 0, timeLimitMinutes: json.timeLimitMinutes };
      })
    );

    return { skill, level: levelDir ? levelDir.toUpperCase() : null, exams };
  } catch {
    return null;
  }
}

export default async function ExamsPage(props: PageProps<"/exams/[id]">) {
  const { id } = await props.params;
  const data = await loadExams(id);

  if (!data) notFound();

  const { skill, level, exams } = data;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--gray-50)" }}>
      <Navbar />

      <div className="flex-1 container py-8" style={{ maxWidth: "860px" }}>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm font-medium mb-8"
          style={{ color: "var(--gray-600)" }}
        >
          <ChevronLeftIcon style={{ width: 16, height: 16 }} />
          Dashboard
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-bold" style={{ fontSize: "2rem", color: "var(--gray-900)" }}>
              {SKILL_TITLES[skill]}
            </h1>
            {level && (
              <span
                className="rounded-md px-2.5 py-1 text-sm font-semibold"
                style={{ background: "var(--green-50)", color: "var(--green-900)" }}
              >
                {level}
              </span>
            )}
          </div>
          <p style={{ color: "var(--gray-600)" }}>
            {SKILL_DESCRIPTIONS[skill]} · {exams.length} {exams.length === 1 ? "exam" : "exams"}{" "}
            available
          </p>
        </div>

        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: "white", borderColor: "var(--gray-200)" }}
        >
          {exams.map((exam, i) => (
            <div
              key={exam.n}
              className="flex items-center gap-4 px-6 py-5"
              style={{
                borderBottom: i === exams.length - 1 ? "none" : "1px solid var(--gray-100)",
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-sm flex-shrink-0"
                style={{ background: "var(--gray-100)", color: "var(--gray-500)" }}
              >
                {exam.n}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm" style={{ color: "var(--gray-900)" }}>
                  Exam {exam.n}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--gray-500)" }}>
                  {exam.timeLimitMinutes} minutes · Not attempted yet
                </p>
              </div>

              <div className="flex-shrink-0">
                <Button href={`/exam?skill=${id}&n=${exam.n}`} variant="primary">
                  Start
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
