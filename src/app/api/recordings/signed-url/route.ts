import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-session";
import { pool } from "@/lib/db";
import { ExamResultsRepository } from "@/lib/repositories/examResultsRepository";
import { recordingExists, recordingSignedUrl } from "@/lib/storage/recordings";

/**
 * Issues a short-lived URL for one of the caller's own speaking recordings.
 *
 * The object key is never taken from the request. It is read back out of the
 * result row, which getByIdForUser already scopes to the session user, so a
 * caller cannot name a key at all, let alone one belonging to someone else.
 */
export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resultId = req.nextUrl.searchParams.get("resultId");
  const questionId = req.nextUrl.searchParams.get("questionId");
  if (!resultId || !questionId) {
    console.warn("[signed-url] Missing resultId or questionId — user=%s", user.id);
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const result = await new ExamResultsRepository(pool).getByIdForUser(resultId, user.id);
  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const answer = result.answers[questionId];
  const path =
    answer && typeof answer === "object" && "path" in answer
      ? (answer as { path: string }).path
      : null;
  if (!path) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Recordings are deleted after 30 days, so a miss here is expected.
  if (!(await recordingExists(path))) {
    console.warn(
      "[signed-url] Recording no longer exists — user=%s result=%s question=%s",
      user.id,
      resultId,
      questionId
    );
    return NextResponse.json({ expired: true }, { status: 404 });
  }

  try {
    const url = await recordingSignedUrl(path, 300); // 5 minutes
    return NextResponse.json({ url });
  } catch (error) {
    console.error(
      "[signed-url] Failed to create signed URL — user=%s result=%s question=%s error=%o",
      user.id,
      resultId,
      questionId,
      error
    );
    return NextResponse.json({ error: "Failed to create signed URL" }, { status: 500 });
  }
}
