import fs from "fs/promises";
import { notFound } from "next/navigation";
import { ExamClient, Exam } from "./ExamClient";
import { getExamFilePath } from "@/lib/exams";

export default async function ExamPage(props: {
  searchParams: Promise<{ skill?: string; n?: string }>;
}) {
  const { skill, n: nStr } = await props.searchParams;
  const n = parseInt(nStr ?? "1");

  if (!skill || isNaN(n)) {
    notFound();
  }

  const filePath = getExamFilePath(skill, n);

  let json: Exam;
  try {
    json = JSON.parse(await fs.readFile(filePath, "utf-8"));
  } catch {
    notFound();
  }

  return <ExamClient exam={json} skillId={skill} n={n} />;
}
