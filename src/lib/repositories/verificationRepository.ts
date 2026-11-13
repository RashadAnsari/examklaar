import type { DbClient } from "./client";

/**
 * Better Auth's verification table: email confirmation, password reset and
 * delete-account tokens. It has no user id column, so the cascade from the
 * "user" row does not reach it and erasing an account has to clear it by hand.
 */
export class VerificationRepository {
  constructor(private readonly db: DbClient) {}

  /** Delete every token issued to the user. Returns how many were removed. */
  async deleteForUser(user: { id: string; email: string }): Promise<number> {
    // Password reset and delete-account tokens store the user id in value;
    // email-keyed tokens store the address in identifier.
    const { rowCount } = await this.db.query(
      `delete from verification where value = $1 or value = $2 or identifier = $2`,
      [user.id, user.email]
    );
    return rowCount ?? 0;
  }
}
