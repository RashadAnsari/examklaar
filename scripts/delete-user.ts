#!/usr/bin/env bun
/**
 * Permanently erase a user and everything the app stores about them.
 *
 * Usage:
 *   bun scripts/delete-user.ts <email|userId> [--yes]
 *
 * The order is deliberate. Recordings come first, because object storage takes
 * no part in the database cascade and the keys are only reachable through the
 * user id. The "user" row goes last, and its cascade removes sessions, accounts
 * and exam results in one transaction.
 *
 * Every step is safe to repeat, so a run that fails halfway can be run again.
 *
 * Flags:
 *   --yes   skip the interactive confirmation (for scripted runs)
 */
import { pool } from "@/lib/db";
import { deleteUserRecordings } from "@/lib/storage/recordings";
import { createInterface } from "node:readline/promises";

const KNOWN_FLAGS = new Set(["--yes"]);

interface UserRow {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

function usage(msg: string): never {
  console.error(`Error: ${msg}\n`);
  console.error("Usage: bun scripts/delete-user.ts <email|userId> [--yes]");
  process.exit(1);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const flags = args.filter((arg) => arg.startsWith("--"));
  const [identifier, ...extra] = args.filter((arg) => !arg.startsWith("--"));

  const unknownFlag = flags.find((flag) => !KNOWN_FLAGS.has(flag));
  if (unknownFlag) {
    usage(`unknown flag ${unknownFlag}`);
  }
  if (!identifier) {
    usage("missing <email|userId>");
  }
  if (extra.length > 0) {
    usage("expected a single email or user id");
  }

  return {
    identifier,
    skipConfirmation: flags.includes("--yes"),
  };
}

async function findUser(identifier: string): Promise<UserRow> {
  // Better Auth lowercases emails on sign-up; compare case-insensitively
  // anyway so an address typed with capitals still resolves.
  const { rows } = await pool.query<UserRow>(
    `select id, email, name, "createdAt" from "user" where id = $1 or lower(email) = lower($1)`,
    [identifier]
  );
  const user = rows[0];
  if (!user) {
    throw new Error(`no user matches "${identifier}"`);
  }
  return user;
}

/** Print who is about to be deleted and how many rows hang off them. */
async function printSummary(user: UserRow): Promise<void> {
  const { rows } = await pool.query<Record<string, string>>(
    `select
       (select count(*) from exam_results        where user_id = $1) as exam_results,
       (select count(*) from "session"           where "userId" = $1) as sessions,
       (select count(*) from "account"           where "userId" = $1) as accounts`,
    [user.id]
  );

  console.log(`User:    ${user.name} <${user.email}>`);
  console.log(`Id:      ${user.id}`);
  console.log(`Joined:  ${user.createdAt.toISOString()}`);
  console.log("Rows to delete:");
  for (const [table, count] of Object.entries(rows[0])) {
    console.log(`  ${table.padEnd(20)} ${count}`);
  }
}

async function confirm(user: UserRow): Promise<void> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(
    `\nThis cannot be undone.\n` + `Type ${user.email} to confirm: `
  );
  rl.close();
  if (answer.trim() !== user.email) {
    throw new Error("confirmation did not match, nothing was deleted");
  }
}

/**
 * Delete the user row, whose cascade takes the rest of the tables with it, plus
 * the verification tokens, which have no user_id column and so are outside it.
 */
async function eraseFromDatabase(user: UserRow): Promise<number> {
  const client = await pool.connect();
  try {
    await client.query("begin");
    // Password reset and delete-account tokens store the user id in value;
    // email-keyed tokens store the address in identifier.
    const verifications = await client.query(
      `delete from verification where value = $1 or value = $2 or identifier = $2`,
      [user.id, user.email]
    );
    // Cascades to session, account and exam_results.
    await client.query(`delete from "user" where id = $1`, [user.id]);
    await client.query("commit");
    return verifications.rowCount ?? 0;
  } catch (error) {
    await client.query("rollback");
    throw new Error(
      `database delete rolled back: ${error instanceof Error ? error.message : error}`
    );
  } finally {
    client.release();
  }
}

async function deleteUser(): Promise<void> {
  const { identifier, skipConfirmation } = parseArgs();
  const user = await findUser(identifier);

  await printSummary(user);
  if (!skipConfirmation) {
    await confirm(user);
  }

  try {
    const deleted = await deleteUserRecordings(user.id);
    console.log(`Deleted ${deleted} recording(s) from object storage`);
  } catch (error) {
    throw new Error(
      `could not delete recordings: ${error instanceof Error ? error.message : error}\n` +
        "The database rows are untouched, so re-running the script is safe."
    );
  }

  const verificationsDeleted = await eraseFromDatabase(user);
  console.log(`Deleted ${verificationsDeleted} verification token(s)`);

  console.log(`\nDeleted user ${user.email} (${user.id})`);
}

try {
  await deleteUser();
} catch (error) {
  console.error(`\nFailed: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
} finally {
  await pool.end();
}
