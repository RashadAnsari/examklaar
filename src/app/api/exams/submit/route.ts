import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { cookies } from "next/headers";
import fs from "fs/promises";
import { getExamFilePath } from "@/lib/exams";
import { getUserSubscription, canAccessPremium } from "@/lib/payment/subscription";

interface ExamQuestion {
  id: string;
  type: string;
  correctAnswer: number | null;
}

export async function POST(req: NextRequest) {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const formData = await req.formData();
  const skillId = formData.get("skill_id") as string;
  const n = parseInt(formData.get("n") as string);
  const attemptId = formData.get("attempt_id") as string;
  const answersRaw = JSON.parse(formData.get("answers") as string) as Record<
    string,
    number | string
  >;
  const transcriptsRaw = JSON.parse((formData.get("transcripts") as string) ?? "{}") as Record<
    string,
    string
  >;

  if (!skillId || isNaN(n)) {
    console.warn("[submit] Invalid request — skill_id=%s n=%s user=%s", skillId, n, user.id);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: recentCount } = await admin
    .from("exam_results")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", oneHourAgo);
  if ((recentCount ?? 0) >= 5) {
    console.warn("[submit] Rate limit exceeded — user=%s", user.id);
    return NextResponse.json({ error: "Too many submissions. Try again later." }, { status: 429 });
  }

  let examJson: {
    id: string;
    skill: string;
    level?: string;
    premiumOnly: boolean;
    questions: ExamQuestion[];
  };
  try {
    examJson = JSON.parse(await fs.readFile(getExamFilePath(skillId, n), "utf-8"));
  } catch {
    console.error("[submit] Exam file not found — skill_id=%s n=%s", skillId, n);
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }

  if (examJson.premiumOnly) {
    const sub = await getUserSubscription(user.id);
    if (!canAccessPremium(sub)) {
      console.warn("[submit] Premium exam blocked — user=%s exam=%s-%s", user.id, skillId, n);
      return NextResponse.json({ error: "upgrade_required" }, { status: 403 });
    }
  }

  const { id: examId, skill, level, questions } = examJson;
  const isMcq = skill !== "writing" && skill !== "speaking";
  const totalQuestions = questions.length;
  const score = isMcq ? questions.filter((q) => answersRaw[q.id] === q.correctAnswer).length : 0;

  const answersJson: Record<string, number | string | { path: string; transcript: string }> = {};

  for (const q of questions) {
    if (answersRaw[q.id] === undefined) {
      continue;
    }

    if (q.type === "speaking") {
      const audioFile = formData.get(`audio_${q.id}`) as File | null;
      if (audioFile) {
        const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
        if (audioFile.size > MAX_BYTES) {
          return NextResponse.json({ error: "Audio file too large" }, { status: 413 });
        }
        const storagePath = `${user.id}/${examId}/${attemptId}/${q.id}.webm`;
        const { error } = await admin.storage
          .from("speaking-recordings")
          .upload(storagePath, await audioFile.arrayBuffer(), { contentType: "audio/webm" });
        if (error) {
          console.error(
            "[submit] Storage upload failed — path=%s error=%s",
            storagePath,
            error.message
          );
          return NextResponse.json({ error: "upload_failed" }, { status: 500 });
        }
        answersJson[q.id] = { path: storagePath, transcript: transcriptsRaw[q.id] ?? "" };
      }
    } else {
      answersJson[q.id] = answersRaw[q.id];
    }
  }

  const { data: inserted, error: insertError } = await admin
    .from("exam_results")
    .insert({
      user_id: user.id,
      exam_id: examId,
      skill,
      level: level ?? null,
      score,
      total_score: totalQuestions,
      answers: answersJson,
      grading_status: isMcq ? "complete" : "pending",
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    console.error("[submit-exam] Insert error:", insertError);
    return NextResponse.json({ error: "Failed to save result" }, { status: 500 });
  }

  return NextResponse.json({ id: inserted.id });
}
