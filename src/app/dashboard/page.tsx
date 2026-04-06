import fs from "fs/promises";
import path from "path";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SKILL_TITLES, SKILL_DESCRIPTIONS, LOCKED_SKILLS } from "@/lib/exam-config";
import type { SkillGroup } from "@/lib/exam-config";
import { DashboardClient } from "./DashboardClient";

const EXAMS_DIR = path.join(process.cwd(), "src/data/exams");

async function loadSkillGroups(): Promise<SkillGroup[]> {
  const groups: SkillGroup[] = [];
  const skillDirs = await fs.readdir(EXAMS_DIR);

  for (const skill of skillDirs) {
    const skillPath = path.join(EXAMS_DIR, skill);
    if (!(await fs.stat(skillPath)).isDirectory()) continue;

    const entries = await fs.readdir(skillPath);
    const hasLevelDirs = (await fs.stat(path.join(skillPath, entries[0]))).isDirectory();

    if (hasLevelDirs) {
      for (const levelDir of entries) {
        const levelPath = path.join(skillPath, levelDir);
        if (!(await fs.stat(levelPath)).isDirectory()) continue;

        const examFiles = (await fs.readdir(levelPath)).filter((f) => f.endsWith(".json"));
        if (examFiles.length === 0) continue;

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
          locked: LOCKED_SKILLS.has(skill),
        });
      }
    } else {
      const examFiles = entries.filter((f) => f.endsWith(".json"));
      if (examFiles.length === 0) continue;

      const firstExam = JSON.parse(await fs.readFile(path.join(skillPath, examFiles[0]), "utf-8"));

      groups.push({
        id: skill,
        skill,
        level: null,
        title: SKILL_TITLES[skill] ?? skill,
        description: SKILL_DESCRIPTIONS[skill] ?? "",
        timeLimitMinutes: firstExam.timeLimitMinutes,
        examCount: examFiles.length,
        locked: LOCKED_SKILLS.has(skill),
      });
    }
  }

  return groups;
}

export default async function DashboardPage() {
  const skills = await loadSkillGroups();

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
