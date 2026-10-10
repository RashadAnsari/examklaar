import { beforeEach, describe, expect, mock, test } from "bun:test";
import * as nextServer from "next/server";
import { StubPool } from "../../../../../test/stubPool";

/**
 * Grading runs after the response, so a server restart mid-grade leaves the row in_progress with
 * nobody working on it. The route must only start grading when it wins the claim (no double
 * grading), and a run the claim refuses must be reported as still in progress.
 */

const SELECT = /select [\s\S]* from exam_results/;
const CLAIM = /update exam_results\s+set grading_status = 'in_progress'/;

const pool = new StubPool();

let sessionUser: { id: string } | null = null;
let scheduled: (() => Promise<void>)[] = [];
let gradeCalls: string[] = [];

mock.module("@/lib/db", () => ({ pool }));
mock.module("@/lib/auth-session", () => ({ getSessionUser: () => Promise.resolve(sessionUser) }));
mock.module("@/lib/exam/grader", () => ({
  gradeExamResult: (resultId: string) => {
    gradeCalls.push(resultId);
    return Promise.resolve();
  },
}));
mock.module("next/server", () => ({
  ...nextServer,
  after: (fn: () => Promise<void>) => scheduled.push(fn),
}));

const { GET, POST } = await import("./route");

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
  scheduled = [];
  gradeCalls = [];
});

describe("POST /api/exams/grade", () => {
  test("claims a pending result and grades it after responding", async () => {
    withResult("pending");
    pool.on(CLAIM, () => ({ rowCount: 1, rows: [] }));

    const res = await post();
    expect(await res.json()).toEqual({ status: "in_progress" });
    expect(pool.matched(CLAIM)).toHaveLength(1);
    expect(gradeCalls).toEqual([]);

    await Promise.all(scheduled.map((fn) => fn()));
    expect(gradeCalls).toEqual(["r1"]);
  });

  test("does not grade when another run holds the claim", async () => {
    withResult("in_progress");
    pool.on(CLAIM, () => ({ rowCount: 0, rows: [] }));

    expect(await (await post()).json()).toEqual({ status: "in_progress" });
    expect(scheduled).toHaveLength(0);
  });

  test("does not claim a complete result", async () => {
    withResult("complete");

    expect(await (await post()).json()).toEqual({ status: "complete" });
    expect(pool.matched(CLAIM)).toHaveLength(0);
  });
});

describe("GET /api/exams/grade", () => {
  test("reports a dead in_progress run as failed through the stale check in the select", async () => {
    withResult("failed");

    const res = await GET(new nextServer.NextRequest("http://test/api/exams/grade?result_id=r1"));
    expect(await res.json()).toEqual({ status: "failed" });
    expect(pool.calls[0].sql).toContain("interval '10 minutes'");
  });
});
