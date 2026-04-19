import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { gradeExamResult } from "@/lib/grader";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { result_id } = await req.json();
  if (!result_id) {
    console.warn("[grade] Missing result_id — user=%s", user.id);
    return NextResponse.json({ error: "Missing result_id" }, { status: 400 });
  }

  const { data: result } = await supabase
    .from("exam_results")
    .select("id, skill, level, exam_id, answers, grading_status")
    .eq("id", result_id)
    .eq("user_id", user.id)
    .single();

  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (result.skill !== "writing" && result.skill !== "speaking") {
    return NextResponse.json({ ok: true, message: "No grading needed" });
  }
  if (result.grading_status === "in_progress" || result.grading_status === "complete") {
    return NextResponse.json({ ok: true, message: "Already grading or graded" });
  }

  try {
    await gradeExamResult(result_id, result);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`[grade] Failed to grade result ${result_id}:`, err);
    return NextResponse.json({ error: "Grading failed" }, { status: 500 });
  }
}
