import fs from "fs/promises";
import path from "path";
import { cookies } from "next/headers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SKILL_TITLES, SKILL_DESCRIPTIONS } from "@/lib/exam-config";
import type { SkillGroup } from "@/lib/exam-config";
import { DashboardClient } from "./DashboardClient";
import { createClient } from "@/utils/supabase/server";
import { EXAMS_DIR } from "@/lib/exams";

async function loadSkillGroups(): Promise<SkillGroup[]> {
  const groups: SkillGroup[] = [];
  const skillDirs = await fs.readdir(EXAMS_DIR);

  for (const skill of skillDirs) {
    const skillPath = path.join(EXAMS_DIR, skill);
    if (!(await fs.stat(skillPath)).isDirectory()) {
      continue;
    }

    const entries = await fs.readdir(skillPath);
    const hasLevelDirs = (await fs.stat(path.join(skillPath, entries[0]))).isDirectory();

    if (hasLevelDirs) {
      for (const levelDir of entries) {
        const levelPath = path.join(skillPath, levelDir);
        if (!(await fs.stat(levelPath)).isDirectory()) {
          continue;
        }

        const examFiles = (await fs.readdir(levelPath)).filter((f) => f.endsWith(".json"));
        if (examFiles.length === 0) {
          continue;
        }

        const firstExam = JSON.parse(
          await fs.readFile(path.join(levelPath, examFiles[0]), "utf-8")
        );

        groups.push({
          id: `${skill}-${levelDir}`,
          skill,
          level: levelDir.toUpperCase(),
          title: SKILL_TITLES[skill] ?? skill,
          description: SKILL_DESCRIPTIONS[skill] ?? "",
          timeLimitMinutes: firstExam.timeLimitMinutes,
          examCount: examFiles.length,
          completedCount: 0,
        });
      }
    } else {
      const examFiles = entries.filter((f) => f.endsWith(".json"));
      if (examFiles.length === 0) {
        continue;
      }

      const firstExam = JSON.parse(await fs.readFile(path.join(skillPath, examFiles[0]), "utf-8"));

      groups.push({
        id: skill,
        skill,
        level: null,
        title: SKILL_TITLES[skill] ?? skill,
        description: SKILL_DESCRIPTIONS[skill] ?? "",
        timeLimitMinutes: firstExam.timeLimitMinutes,
        examCount: examFiles.length,
        completedCount: 0,
      });
    }
  }

  return groups;
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: results } = await supabase
    .from("exam_results")
    .select("exam_id")
    .eq("grading_status", "complete");

  const completedByGroup = new Map<string, Set<string>>();
  for (const r of results ?? []) {
    const match = r.exam_id.match(/^(.+)-exam-\d+$/);
    if (!match) {
      continue;
    }
    const groupId = match[1];
    if (!completedByGroup.has(groupId)) {
      completedByGroup.set(groupId, new Set());
    }
    completedByGroup.get(groupId)!.add(r.exam_id);
  }

  const skills = (await loadSkillGroups()).map((g) => ({
    ...g,
    completedCount: completedByGroup.get(g.id)?.size ?? 0,
  }));

  return (
    <div className="min-h-screen" style={{ background: "var(--gray-50)" }}>
      <Navbar />

      <div className="container py-8" style={{ maxWidth: "1280px" }}>
        <div className="mb-8">
          <h1 className="font-bold mb-1" style={{ fontSize: "2rem", color: "var(--gray-900)" }}>
            Welcome back, Rashad
          </h1>
          <p style={{ color: "var(--gray-600)" }}>Continue practicing for your inburgering exam</p>
        </div>

        <DashboardClient skills={skills} />
      </div>

      <Footer />
    </div>
  );
}
