import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-session";
import { pool } from "@/lib/db";
import { gradeExamResult } from "@/lib/exam/grader";
import { ExamResultsRepository } from "@/lib/repositories/examResultsRepository";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { result_id } = await req.json();
  if (!result_id) {
    console.warn("[grade] Missing result_id — user=%s", user.id);
    return NextResponse.json({ error: "Missing result_id" }, { status: 400 });
  }

  const result = await new ExamResultsRepository(pool).getByIdForUser(result_id, user.id);

  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (result.skill !== "writing" && result.skill !== "speaking") {
    console.warn("[grade] No grading needed for skill=%s — result_id=%s", result.skill, result_id);
    return NextResponse.json({ ok: true, message: "No grading needed" });
  }
  if (result.grading_status === "in_progress" || result.grading_status === "complete") {
    console.warn(
      "[grade] Grading already in progress or complete for result_id=%s, status=%s",
      result_id,
      result.grading_status
    );
    return NextResponse.json({ ok: true, message: "Already grading or graded" });
  }

  try {
    await gradeExamResult(result_id, user.id, result);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`[grade] Failed to grade result ${result_id}:`, err);
    return NextResponse.json({ error: "Grading failed" }, { status: 500 });
  }
}
