import { runWrite, type DbClient } from "./client";

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

type GradingStatus = NewExamResult["grading_status"];

/**
 * All exam_results table access. Every read filters on user_id explicitly:
 * there is no database-side row scoping, so a missing filter would expose
 * another user's results.
 */
export class ExamResultsRepository {
  constructor(private readonly db: DbClient) {}

  /** Ids of every exam the user has completed. */
  async listCompletedExamIds(userId: string): Promise<{ exam_id: string }[]> {
    const { rows } = await this.db.query<{ exam_id: string }>(
      `select exam_id from exam_results
        where user_id = $1 and grading_status = 'complete'`,
      [userId]
    );
    return rows;
  }

  /** A single result by id, scoped to its owner. */
  async getByIdForUser(resultId: string, userId: string) {
    const { rows } = await this.db.query<{
      id: string;
      skill: string;
      level: string | null;
      exam_id: string;
      answers: Record<string, unknown>;
      grading_status: GradingStatus;
    }>(
      `select id, skill, level, exam_id, answers, grading_status from exam_results
        where id = $1 and user_id = $2`,
      [resultId, userId]
    );
    return rows[0] ?? null;
  }

  /** Count of a user's results created at or after the given ISO timestamp. */
  async countForUserSince(userId: string, sinceIso: string): Promise<number> {
    const { rows } = await this.db.query<{ count: string }>(
      `select count(*) from exam_results where user_id = $1 and created_at >= $2`,
      [userId, sinceIso]
    );
    return Number(rows[0]?.count ?? 0);
  }

  /** Insert a new result, returning its id. */
  async create(result: NewExamResult) {
    return runWrite(async () => {
      const { rows } = await this.db.query<{ id: string }>(
        `insert into exam_results
           (user_id, exam_id, skill, level, score, total_score, answers, grading_status)
         values ($1, $2, $3, $4, $5, $6, $7, $8)
         returning id`,
        [
          result.user_id,
          result.exam_id,
          result.skill,
          result.level,
          result.score,
          result.total_score,
          result.answers,
          result.grading_status,
        ]
      );
      return rows[0];
    });
  }

  /** A user's completed results for every exam whose id starts with the given prefix. */
  async listCompletedByExamPrefix(examIdPrefix: string, userId: string) {
    const { rows } = await this.db.query<{
      exam_id: string;
      score: number;
      total_score: number;
      completed_at: Date;
    }>(
      `select exam_id, score, total_score, completed_at from exam_results
        where user_id = $1 and exam_id like $2 and grading_status = 'complete'
        order by completed_at desc`,
      [userId, `${examIdPrefix}-exam-%`]
    );
    return rows;
  }

  /** The most recent completed result for a user's exam, or null. */
  async findLatestCompletedByExam(examId: string, userId: string) {
    const { rows } = await this.db.query<{
      id: string;
      skill: string;
      level: string | null;
      score: number;
      total_score: number;
      answers: Record<string, unknown>;
      feedback: Record<string, { score: number; maxScore: number; feedback: string }> | null;
      completed_at: Date;
    }>(
      `select id, skill, level, score, total_score, answers, feedback, completed_at
         from exam_results
        where exam_id = $1 and user_id = $2 and grading_status = 'complete'
        order by completed_at desc
        limit 1`,
      [examId, userId]
    );
    return rows[0] ?? null;
  }

  /** Scores of all completed attempts for a user's exam (for stats). */
  async listCompletedScoresByExam(examId: string, userId: string) {
    const { rows } = await this.db.query<{ score: number; total_score: number }>(
      `select score, total_score from exam_results
        where exam_id = $1 and user_id = $2 and grading_status = 'complete'`,
      [examId, userId]
    );
    return rows;
  }

  /** Set the grading status of one of the user's results. */
  async updateGradingStatus(resultId: string, userId: string, status: GradingStatus) {
    return runWrite(() =>
      this.db.query(`update exam_results set grading_status = $1 where id = $2 and user_id = $3`, [
        status,
        resultId,
        userId,
      ])
    );
  }

  /**
   * Persist AI grades for one of the user's results. Guarded by ai_graded_at
   * is null so a result is never graded twice.
   */
  async saveGrades(
    resultId: string,
    userId: string,
    grades: {
      score: number;
      total_score: number;
      feedback: Record<string, { score: number; maxScore: number; feedback: string }>;
    }
  ) {
    return runWrite(() =>
      this.db.query(
        `update exam_results
            set score = $1,
                total_score = $2,
                feedback = $3,
                ai_graded_at = now(),
                grading_status = 'complete'
          where id = $4 and user_id = $5 and ai_graded_at is null`,
        [grades.score, grades.total_score, grades.feedback, resultId, userId]
      )
    );
  }
}
