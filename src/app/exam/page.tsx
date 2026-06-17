import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ExamClient, Exam } from "./ExamClient";
import { readExam } from "@/data/exams";
import { createClient } from "@/utils/supabase/server";
import { getUserSubscription, hasAccess } from "@/lib/payment/subscription";

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

  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }
  const sub = await getUserSubscription(user.id);
  if (!hasAccess(sub)) {
    redirect("/pricing");
  }

  return <ExamClient exam={json} skillId={skill} n={n} />;
}
