import fs from "fs/promises";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ExamClient, Exam } from "./ExamClient";
import { getExamFilePath } from "@/lib/exams";
import { createClient } from "@/utils/supabase/server";
import { getUserSubscription, canAccessPremium } from "@/lib/payment/subscription";

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

  if (json.premiumOnly) {
    const supabase = createClient(await cookies());
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      redirect("/login");
    }
    const sub = await getUserSubscription(user.id);
    if (!canAccessPremium(sub)) {
      redirect("/pricing");
    }
  }

  return <ExamClient exam={json} skillId={skill} n={n} />;
}
