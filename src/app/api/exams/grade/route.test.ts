import { beforeEach, describe, expect, mock, test } from "bun:test";
import * as nextServer from "next/server";
import { StubPool } from "../../../../../test/stubPool";

/**
 * Grading runs inside the request, so the response must only report complete once the grader has
 * finished, and must report a grader error instead of hiding it.
 */

const SELECT = /select [\s\S]* from exam_results/;

const pool = new StubPool();

let sessionUser: { id: string } | null = null;
let gradeCalls: string[] = [];
let gradeError: Error | null = null;

mock.module("@/lib/db", () => ({ pool }));
mock.module("@/lib/auth-session", () => ({ getSessionUser: () => Promise.resolve(sessionUser) }));
mock.module("@/lib/exam/grader", () => ({
  gradeExamResult: (resultId: string) => {
    gradeCalls.push(resultId);
    return gradeError ? Promise.reject(gradeError) : Promise.resolve();
  },
}));

const { POST } = await import("./route");

function withResult(grading_status: string) {
  pool.on(SELECT, () => ({
    rowCount: 1,
    rows: [{ id: "r1", skill: "writing", level: "A2", exam_id: "e1", answers: {}, grading_status }],
  }));
}

function post() {
  return POST(
    new nextServer.NextRequest("http://test/api/exams/grade", {
      method: "POST",
      body: JSON.stringify({ result_id: "r1" }),
    })
  );
}

beforeEach(() => {
  pool.reset();
  sessionUser = { id: "user_1" };
  gradeCalls = [];
  gradeError = null;
});

describe("POST /api/exams/grade", () => {
  test("grades a pending result before responding", async () => {
    withResult("pending");

    const res = await post();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "complete" });
    expect(gradeCalls).toEqual(["r1"]);
  });

  test("grades a failed result again", async () => {
    withResult("failed");

    expect(await (await post()).json()).toEqual({ status: "complete" });
    expect(gradeCalls).toEqual(["r1"]);
  });

  test("reports a grader error", async () => {
    withResult("pending");
    gradeError = new Error("model unavailable");

    const res = await post();
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Grading failed" });
  });

  test("does not grade a complete result", async () => {
    withResult("complete");

    expect(await (await post()).json()).toEqual({ status: "complete" });
    expect(gradeCalls).toEqual([]);
  });
});
