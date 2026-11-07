import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-session";
import { pool } from "@/lib/db";
import { readExam } from "@/data/exams";
import { MAX_SUBMISSION_BYTES } from "@/lib/exam/config";
import type { Exam } from "@/app/exam/ExamClient";
import { ExamResultsRepository } from "@/lib/repositories/examResultsRepository";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const examResults = new ExamResultsRepository(pool);

  // Reject an oversized submission before buffering it. Absent on a chunked
  // request, in which case the per-field checks below are the remaining guard.
  const declaredSize = Number(req.headers.get("content-length") ?? 0);
  if (declaredSize > MAX_SUBMISSION_BYTES) {
    console.warn("[submit] Submission too large — user=%s size=%d bytes", user.id, declaredSize);
    return NextResponse.json({ error: "Submission too large" }, { status: 413 });
  }

  // A truncated or malformed multipart body throws here. Answer with JSON so
  // the client shows a real message instead of failing to parse an HTML 500.
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch (err) {
    console.error("[submit] Could not parse request body — user=%s error=%o", user.id, err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const skillId = formData.get("skill_id") as string;
  const n = parseInt(formData.get("n") as string);
  const attemptId = formData.get("attempt_id") as string;
  const answersField = formData.get("answers") as string | null;
  const transcriptsField = (formData.get("transcripts") as string | null) ?? "{}";

  if (!answersField || answersField.length > 50_000) {
    console.warn(
      "[submit] Invalid request — missing or too large answers field, user=%s skill_id=%s n=%s",
      user.id,
      skillId,
      n
    );
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (transcriptsField.length > 20_000) {
    console.warn(
      "[submit] Invalid request — too large transcripts field, user=%s skill_id=%s n=%s",
      user.id,
      skillId,
      n
    );
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
    console.warn(
      "[submit] Invalid request — invalid JSON, user=%s skill_id=%s n=%s",
      user.id,
      skillId,
      n
    );
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
  const recentCount = await examResults.countForUserSince(user.id, oneHourAgo);
  if (recentCount >= 5) {
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

  const { id: examId, skill, level, questions } = examJson;
  const isMcq = skill !== "writing" && skill !== "speaking";
  const totalQuestions = questions.length;
  const score = isMcq ? questions.filter((q) => answersRaw[q.id] === q.correctAnswer).length : 0;

  const answersJson: Record<string, number | string | { transcript: string }> = {};

  for (const q of questions) {
    if (answersRaw[q.id] === undefined) {
      continue;
    }

    if (q.type === "speaking") {
      const MAX_TRANSCRIPT_CHARS = 2000;
      const transcript = transcriptsRaw[q.id];
      answersJson[q.id] = {
        transcript: typeof transcript === "string" ? transcript.slice(0, MAX_TRANSCRIPT_CHARS) : "",
      };
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

  const { data: inserted, error: insertError } = await examResults.create({
    user_id: user.id,
    exam_id: examId,
    skill,
    level: level ?? null,
    score,
    total_score: totalQuestions,
    answers: answersJson,
    grading_status: isMcq ? "complete" : "pending",
  });

  if (insertError || !inserted) {
    console.error("[submit-exam] Insert error:", insertError);
    return NextResponse.json({ error: "Failed to save result" }, { status: 500 });
  }

  return NextResponse.json({ id: inserted.id });
}
