import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const EXAMS_DIR = path.join(/*turbopackIgnore: true*/ __dirname, "../data/exams");

export function getExamFilePath(skillId: string, n: number): string {
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
