import fs from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";
import { ExamClient, Exam } from "./ExamClient";

const EXAMS_DIR = path.join(process.cwd(), "src/data/exams");

function getExamFilePath(skillId: string, n: number): string {
  const parts = skillId.split("-");
  const lastPart = parts[parts.length - 1];
  const isLevel = ["a2", "b1"].includes(lastPart);
  const skillBase = isLevel ? parts.slice(0, -1).join("-") : skillId;
  const level = isLevel ? lastPart : null;

  if (level) {
    return path.join(EXAMS_DIR, skillBase, level, `${skillBase}-${level}-exam-${n}.json`);
  }
  return path.join(EXAMS_DIR, skillBase, `${skillBase}-exam-${n}.json`);
}

export default async function ExamPage(props: {
  searchParams: Promise<{ skill?: string; n?: string }>;
}) {
  const { skill, n: nStr } = await props.searchParams;
  const n = parseInt(nStr ?? "1");

  if (!skill || isNaN(n)) notFound();

  const filePath = getExamFilePath(skill, n);

  let json: Exam;
  try {
    json = JSON.parse(await fs.readFile(filePath, "utf-8"));
  } catch {
    notFound();
  }

  return <ExamClient exam={json} skillId={skill} n={n} />;
}
