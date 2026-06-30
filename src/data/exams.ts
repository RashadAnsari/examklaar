import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import type { Exam } from "@/app/exam/ExamClient";
import { SKILL_TITLES, SKILL_DESCRIPTIONS } from "@/lib/exam/config";
import type { SkillGroup } from "@/lib/exam/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXAMS_DIR = path.join(/*turbopackIgnore: true*/ __dirname, "exams");

const ASSET_BASE_URL_PLACEHOLDER = "{{EXAM_ASSETS_BASE_URL}}";

// Exam JSON stores asset (image/audio/video) URLs with a placeholder so the
// storage host is configurable per environment. Substitute it at read time.
function resolveAssetUrls(content: string): string {
  const base = process.env.EXAM_ASSETS_BASE_URL ?? "";
  return content.split(ASSET_BASE_URL_PLACEHOLDER).join(base);
}

function buildExamPath(skillId: string, n: number): string {
  const parts = skillId.split("-");
  const lastPart = parts[parts.length - 1];
  const isLevel = ["a2", "b1"].includes(lastPart);
  const skillBase = isLevel ? parts.slice(0, -1).join("-") : skillId;
  const level = isLevel ? lastPart : null;

  let filePath: string;
  if (level) {
    filePath = path.join(
      /*turbopackIgnore: true*/ EXAMS_DIR,
      skillBase,
      level,
      `${skillBase}-${level}-exam-${n}.json`
    );
  } else {
    filePath = path.join(
      /*turbopackIgnore: true*/ EXAMS_DIR,
      skillBase,
      `${skillBase}-exam-${n}.json`
    );
  }

  const resolved = path.resolve(/*turbopackIgnore: true*/ filePath);
  const base = path.resolve(/*turbopackIgnore: true*/ EXAMS_DIR);
  if (!resolved.startsWith(base + path.sep)) {
    throw new Error(`Path traversal attempt blocked for skill: ${skillId}`);
  }
  return resolved;
}

function buildExamPathById(examId: string): string {
  const parts = examId.split("-");
  const examIdx = parts.indexOf("exam");
  if (examIdx === -1) {
    throw new Error(`Cannot resolve path for exam id: ${examId}`);
  }

  const skillParts = parts.slice(0, examIdx);
  const lastPart = skillParts[skillParts.length - 1];
  const isLevel = lastPart === "a2" || lastPart === "b1";

  let filePath: string;
  if (isLevel) {
    const skillBase = skillParts.slice(0, -1).join("-");
    const level = lastPart;
    filePath = path.join(/*turbopackIgnore: true*/ EXAMS_DIR, skillBase, level, `${examId}.json`);
  } else {
    filePath = path.join(
      /*turbopackIgnore: true*/ EXAMS_DIR,
      skillParts.join("-"),
      `${examId}.json`
    );
  }

  const resolved = path.resolve(/*turbopackIgnore: true*/ filePath);
  const base = path.resolve(/*turbopackIgnore: true*/ EXAMS_DIR);
  if (!resolved.startsWith(base + path.sep)) {
    throw new Error(`Path traversal attempt blocked for exam id: ${examId}`);
  }
  return resolved;
}

export async function readExam(skillId: string, n: number): Promise<Exam> {
  const content = await fs.readFile(buildExamPath(skillId, n), "utf-8");
  return JSON.parse(resolveAssetUrls(content)) as Exam;
}

export async function readExamOrNull(skillId: string, n: number): Promise<Exam | null> {
  try {
    return await readExam(skillId, n);
  } catch {
    return null;
  }
}

export async function examFileExists(skillId: string, n: number): Promise<boolean> {
  try {
    await fs.access(buildExamPath(skillId, n));
    return true;
  } catch {
    return false;
  }
}

export async function readExamById(examId: string): Promise<Exam> {
  const content = await fs.readFile(buildExamPathById(examId), "utf-8");
  return JSON.parse(resolveAssetUrls(content)) as Exam;
}

export async function listSkillGroups(): Promise<SkillGroup[]> {
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

        groups.push({
          id: `${skill}-${levelDir}`,
          skill,
          level: levelDir.toUpperCase(),
          title: SKILL_TITLES[skill] ?? skill,
          description: SKILL_DESCRIPTIONS[skill] ?? "",
          examCount: examFiles.length,
          completedCount: 0,
        });
      }
    } else {
      const examFiles = entries.filter((f) => f.endsWith(".json"));
      if (examFiles.length === 0) {
        continue;
      }

      groups.push({
        id: skill,
        skill,
        level: null,
        title: SKILL_TITLES[skill] ?? skill,
        description: SKILL_DESCRIPTIONS[skill] ?? "",
        examCount: examFiles.length,
        completedCount: 0,
      });
    }
  }

  return groups;
}

export async function listSkillExams(id: string): Promise<{
  skill: string;
  level: string | null;
  exams: Array<{ n: number; timeLimitMinutes: number }>;
} | null> {
  const parts = id.split("-");
  const lastPart = parts[parts.length - 1];
  const isLevel = ["a2", "b1"].includes(lastPart);
  const skill = isLevel ? parts.slice(0, -1).join("-") : id;
  const levelDir = isLevel ? lastPart : null;

  if (!(skill in SKILL_TITLES)) {
    return null;
  }

  const dir = levelDir ? path.join(EXAMS_DIR, skill, levelDir) : path.join(EXAMS_DIR, skill);

  try {
    const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".json")).sort();
    if (files.length === 0) {
      return null;
    }

    const exams = await Promise.all(
      files.map(async (filename) => {
        const json = JSON.parse(await fs.readFile(path.join(dir, filename), "utf-8"));
        const match = filename.match(/(\d+)\.json$/);
        const n = match ? parseInt(match[1]) : 0;
        return {
          n,
          timeLimitMinutes: json.timeLimitMinutes as number,
        };
      })
    );

    return { skill, level: levelDir ? levelDir.toUpperCase() : null, exams };
  } catch {
    return null;
  }
}
