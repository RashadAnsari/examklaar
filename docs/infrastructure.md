# Infrastructure

[Documentation index](./README.md)

What the app needs to run, and how each piece is configured.

## Database

Any Postgres reachable through `DATABASE_URL`. Apply the schema with `make migrate`, which runs
`db/migrations/*.sql` in filename order and records what it applied in `schema_migrations`.
Re-running it is a no-op.

Run it on every release, before the new code serves traffic. The Docker image ships it as `node
scripts/migrate.js`.

`db/migrations/0001_auth.sql` holds Better Auth's own schema and is not hand-written. After changing
the Better Auth config or plugins, run this against a running database:

```bash
bunx @better-auth/cli generate --config src/lib/auth.ts
```

Add what it reports as a new migration rather than editing `0001_auth.sql`. The CLI introspects a
live database, so it needs one up, and pointed at an already-migrated database it emits only the
delta.

## Auth

Better Auth with email and password, mounted at `/api/auth`. Email verification is required, so a
new account is inactive until the confirmation link is clicked. Signup confirmation and password
reset emails go out through the Brevo HTTP API.

## Object storage

Two S3-compatible buckets:

| Bucket                | Access      | Holds                                                             |
| --------------------- | ----------- | ----------------------------------------------------------------- |
| `speaking-recordings` | Private     | Candidate recordings, uploaded server-side by `/api/exams/submit` |
| `exam-assets`         | Public read | The audio, images and video referenced by the exam JSON           |

Recordings are read back through 5-minute signed URLs. Set a lifecycle rule on that bucket to expire
objects after 30 days: the app deletes recordings only when an account is erased with
`scripts/delete-user.ts`, and the review page already handles a missing recording.

For `exam-assets`, point `EXAM_ASSETS_BASE_URL` at the public base URL, with no trailing slash.

The media for the exams in `src/data/exams` ships as `exam-assets.zip` on the
[GitHub releases page](https://github.com/RashadAnsari/examklaar/releases). Unzip it into the root of
the `exam-assets` bucket: its folders (`listening/a2/exam-1/…`) are the paths the exam JSON asks for.

The Content-Security-Policy in `next.config.ts` derives the allowed media origins from
`EXAM_ASSETS_BASE_URL` and `S3_ENDPOINT`, so there is nothing extra to configure when either host
changes.

## Media

Exam media is generated once at authoring time and uploaded to `exam-assets`. None of the generation
tooling ships in the app or runs at request time. The pipelines are local, free and offline:

- [Dutch text-to-speech](./dutch-text-to-speech.md) for listening fragments and spoken prompts
- [Image generation](./image-generation.md) for exam scene images
- [Video generation](./video-generation.md) for the speaking Part 1 presenter

## Environment

`.env.example` is the reference. Postgres, Brevo, S3 storage and Google AI each need values. The
file documents what every variable is for.
