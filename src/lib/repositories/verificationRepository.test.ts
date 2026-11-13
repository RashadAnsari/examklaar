import { describe, expect, test } from "bun:test";
import { StubPool } from "../../../test/stubPool";
import { VerificationRepository } from "./verificationRepository";

/**
 * The verification table is outside the "user" row's cascade, so this delete is
 * the only thing that removes a deleted account's tokens. It must match on both
 * the user id and the address, since different token kinds store different ones.
 */
describe("VerificationRepository.deleteForUser", () => {
  test("deletes tokens keyed by the user id and by the email", async () => {
    const pool = new StubPool();
    pool.on(/delete from verification/, () => ({ rowCount: 3, rows: [] }));

    const deleted = await new VerificationRepository(pool).deleteForUser({
      id: "user_1",
      email: "a@example.com",
    });

    expect(deleted).toBe(3);
    const [call] = pool.matched(/delete from verification/);
    expect(call.sql).toMatch(/value = \$1 or value = \$2 or identifier = \$2/);
    expect(call.params).toEqual(["user_1", "a@example.com"]);
  });
});
