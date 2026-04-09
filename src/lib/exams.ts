import path from "path";

export const EXAMS_DIR = path.join(process.cwd(), "src/data/exams");

export function getExamFilePath(skillId: string, n: number): string {
  const parts = skillId.split("-");
  const lastPart = parts[parts.length - 1];
  const isLevel = ["a2", "b1"].includes(lastPart);
  const skillBase = isLevel ? parts.slice(0, -1).join("-") : skillId;
  const level = isLevel ? lastPart : null;

  let filePath: string;
  if (level) {
    filePath = path.join(EXAMS_DIR, skillBase, level, `${skillBase}-${level}-exam-${n}.json`);
  } else {
    filePath = path.join(EXAMS_DIR, skillBase, `${skillBase}-exam-${n}.json`);
  }

  const resolved = path.resolve(filePath);
  const base = path.resolve(EXAMS_DIR);
  if (!resolved.startsWith(base + path.sep)) {
    throw new Error(`Path traversal attempt blocked for skill: ${skillId}`);
  }
  return resolved;
}
