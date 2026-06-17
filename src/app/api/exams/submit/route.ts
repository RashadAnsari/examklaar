import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { cookies } from "next/headers";
import { readExam } from "@/data/exams";
import type { Exam } from "@/app/exam/ExamClient";
import { getUserSubscription, hasPremiumAccess } from "@/lib/payment/subscription";

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
  const answersField = formData.get("answers") as string | null;
  const transcriptsField = (formData.get("transcripts") as string | null) ?? "{}";

  if (!answersField || answersField.length > 50_000) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (transcriptsField.length > 20_000) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  let answersRaw: Record<string, unknown>;
  let transcriptsRaw: Record<string, string>;
  try {
    answersRaw = JSON.parse(answersField);
    transcriptsRaw = JSON.parse(transcriptsField);
    if (typeof answersRaw !== "object" || Array.isArray(answersRaw)) {
      throw new Error();
    }
    if (typeof transcriptsRaw !== "object" || Array.isArray(transcriptsRaw)) {
      throw new Error();
    }
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!skillId || isNaN(n) || !attemptId || !UUID_RE.test(attemptId)) {
    console.warn(
      "[submit] Invalid request — skill_id=%s n=%s attempt_id=%s user=%s",
      skillId,
      n,
      attemptId,
      user.id
    );
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

  let examJson: Exam;
  try {
    examJson = await readExam(skillId, n);
  } catch {
    console.error("[submit] Exam file not found — skill_id=%s n=%s", skillId, n);
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }

  const sub = await getUserSubscription(user.id);
  if (!hasPremiumAccess(sub)) {
    console.warn("[submit] Exam blocked, no access — user=%s exam=%s-%s", user.id, skillId, n);
    return NextResponse.json({ error: "upgrade_required" }, { status: 403 });
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
        const MAX_TRANSCRIPT_CHARS = 2000;
        const rawTranscript = (transcriptsRaw[q.id] ?? "").slice(0, MAX_TRANSCRIPT_CHARS);
        answersJson[q.id] = { path: storagePath, transcript: rawTranscript };
      }
    } else {
      const val = answersRaw[q.id];
      if (q.type === "writing") {
        if (typeof val === "string") {
          answersJson[q.id] = val.slice(0, 10_000);
        }
      } else {
        // MCQ: must be a finite integer
        if (typeof val === "number" && Number.isFinite(val)) {
          answersJson[q.id] = val;
        }
      }
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
