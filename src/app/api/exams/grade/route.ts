import { after, NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-session";
import { pool } from "@/lib/db";
import { gradeExamResult } from "@/lib/exam/grader";
import { ExamResultsRepository } from "@/lib/repositories/examResultsRepository";

/** Grading status of one of the user's results, polled by the exam page while grading runs. */
export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resultId = req.nextUrl.searchParams.get("result_id");
  if (!resultId) {
    return NextResponse.json({ error: "Missing result_id" }, { status: 400 });
  }

  const result = await new ExamResultsRepository(pool).getByIdForUser(resultId, user.id);
  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ status: result.grading_status });
}

/**
 * Start grading and answer at once. Grading can outlast the proxy's request timeout (Cloudflare
 * returns 524 after 125 s and only Enterprise plans can raise it), so it runs after the response and the client polls GET for the outcome.
 */
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

  const examResults = new ExamResultsRepository(pool);
  const result = await examResults.getByIdForUser(result_id, user.id);

  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (result.skill !== "writing" && result.skill !== "speaking") {
    console.warn("[grade] No grading needed for skill=%s — result_id=%s", result.skill, result_id);
    return NextResponse.json({ status: "complete" });
  }
  if (result.grading_status === "complete") {
    return NextResponse.json({ status: "complete" });
  }
  // A run that died with a server restart reads as failed here and is claimed again. Claiming
  // before responding means the first poll already sees in_progress.
  if (!(await examResults.claimGrading(result_id, user.id))) {
    return NextResponse.json({ status: "in_progress" });
  }
  after(async () => {
    try {
      await gradeExamResult(result_id, user.id, result);
    } catch (err) {
      console.error(`[grade] Failed to grade result ${result_id}:`, err);
    }
  });
  return NextResponse.json({ status: "in_progress" });
}
