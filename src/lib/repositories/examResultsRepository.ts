import type { PostgrestError } from "@supabase/supabase-js";
import type { DbClient } from "./client";

const TABLE = "exam_results";

export interface NewExamResult {
  user_id: string;
  exam_id: string;
  skill: string;
  level: string | null;
  score: number;
  total_score: number;
  answers: Record<string, unknown>;
  grading_status: "pending" | "in_progress" | "complete" | "failed";
}

/**
 * All exam_results table access. Read methods rely on the caller's client for
 * scoping (the RLS server client limits rows to the current user); methods
 * that take a userId filter explicitly for use with the admin client.
 */
export class ExamResultsRepository {
  constructor(private readonly db: DbClient) {}

  /** Every completed result visible to the client (RLS-scoped to the user). */
  async listCompletedExamIds(): Promise<{ exam_id: string }[]> {
    const { data } = await this.db.from(TABLE).select("exam_id").eq("grading_status", "complete");
    return data ?? [];
  }

  /** A single result by id, scoped to its owner. */
  async getByIdForUser(resultId: string, userId: string) {
    const { data } = await this.db
      .from(TABLE)
      .select("id, skill, level, exam_id, answers, grading_status")
      .eq("id", resultId)
      .eq("user_id", userId)
      .single();
    return data;
  }

  /** Count of a user's results created at or after the given ISO timestamp. */
  async countForUserSince(userId: string, sinceIso: string): Promise<number> {
    const { count } = await this.db
      .from(TABLE)
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", sinceIso);
    return count ?? 0;
  }

  /** Insert a new result, returning its id. */
  async create(
    result: NewExamResult
  ): Promise<{ data: { id: string } | null; error: PostgrestError | null }> {
    return this.db.from(TABLE).insert(result).select("id").single();
  }

  /** Completed results for every exam whose id starts with the given prefix (RLS-scoped). */
  async listCompletedByExamPrefix(examIdPrefix: string) {
    const { data } = await this.db
      .from(TABLE)
      .select("exam_id, score, total_score, completed_at")
      .like("exam_id", `${examIdPrefix}-exam-%`)
      .eq("grading_status", "complete")
      .order("completed_at", { ascending: false });
    return data ?? [];
  }

  /** The most recent completed result for a user's exam, or null. */
  async findLatestCompletedByExam(examId: string, userId: string) {
    const { data } = await this.db
      .from(TABLE)
      .select("id, skill, level, score, total_score, answers, feedback, completed_at")
      .eq("exam_id", examId)
      .eq("user_id", userId)
      .eq("grading_status", "complete")
      .order("completed_at", { ascending: false })
      .limit(1);
    return data?.[0] ?? null;
  }

  /** Scores of all completed attempts for a user's exam (for stats). */
  async listCompletedScoresByExam(examId: string, userId: string) {
    const { data } = await this.db
      .from(TABLE)
      .select("score, total_score")
      .eq("exam_id", examId)
      .eq("user_id", userId)
      .eq("grading_status", "complete");
    return data ?? [];
  }

  /** Set the grading status of a result. */
  async updateGradingStatus(
    resultId: string,
    status: "pending" | "in_progress" | "complete" | "failed"
  ): Promise<{ error: PostgrestError | null }> {
    const { error } = await this.db
      .from(TABLE)
      .update({ grading_status: status })
      .eq("id", resultId);
    return { error };
  }

  /**
   * Persist AI grades. Guarded by ai_graded_at is null so a result is never
   * graded twice.
   */
  async saveGrades(
    resultId: string,
    grades: {
      score: number;
      total_score: number;
      feedback: Record<string, { score: number; maxScore: number; feedback: string }>;
    }
  ): Promise<{ error: PostgrestError | null }> {
    const { error } = await this.db
      .from(TABLE)
      .update({
        score: grades.score,
        total_score: grades.total_score,
        feedback: grades.feedback,
        ai_graded_at: new Date().toISOString(),
        grading_status: "complete",
      })
      .eq("id", resultId)
      .is("ai_graded_at", null);
    return { error };
  }
}
