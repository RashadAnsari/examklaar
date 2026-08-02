import { Pool } from "pg";

// Single connection pool shared by the repositories and by Better Auth, so the
// whole app uses one set of connections against DATABASE_URL.
//
// This module and the repositories deliberately do not import "server-only":
// the scripts in scripts/ import them under plain bun, where that package
// throws. Modules holding secrets that no script reaches carry the guard, so a
// client import fails at build time.
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// The pool emits "error" when an idle client hits a backend or network error,
// e.g. Postgres restarting. Without a listener that is an unhandled "error"
// event, which kills the process: a routine database blip must not crash the
// app. Requests using the broken client still fail individually and are
// handled at their call sites.
pool.on("error", (err) => {
  console.error("[db] Idle client error:", err);
});
