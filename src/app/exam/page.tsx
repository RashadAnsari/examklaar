import { notFound, redirect } from "next/navigation";
import { ExamClient, Exam } from "./ExamClient";
import { readExam } from "@/data/exams";
import { getSessionUser } from "@/lib/auth-session";
import { getUserSubscription } from "@/lib/payment/subscription";
import { canAccessExam } from "@/lib/payment/plans";

export default async function ExamPage(props: {
  searchParams: Promise<{ skill?: string; n?: string }>;
}) {
  const { skill, n: nStr } = await props.searchParams;
  const n = parseInt(nStr ?? "1");

  if (!skill || isNaN(n)) {
    notFound();
  }

  let json: Exam;
  try {
    json = await readExam(skill, n);
  } catch {
    notFound();
  }

  const user = await getSessionUser();
  if (!user) {
    redirect("/auth/login");
  }

  const sub = await getUserSubscription(user.id);
  if (!canAccessExam(sub, n)) {
    redirect("/pricing");
  }

  return <ExamClient exam={json} skillId={skill} n={n} />;
}
