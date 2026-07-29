# ExamKlaar

A web app for practicing the Dutch inburgering (civic integration) exams.

## What It Does

ExamKlaar lets users take timed, realistic practice exams across all 5 components of the inburgering exam:

- **KNM** — Civic knowledge (Kennis van de Nederlandse Maatschappij)
- **Reading** — Dutch reading comprehension
- **Listening** — Dutch listening comprehension
- **Writing** — Written Dutch with AI-graded feedback
- **Speaking** — Recorded answers with AI feedback

## Getting Started

```bash
bun install
make up         # local Postgres on port 5432
make migrate    # apply db/migrations
make dev
```

Requires environment variables for Postgres, S3 storage, SMTP, Google AI, and Paddle: see `.env.example`. `docker-compose.yml` at the repo root is the local development database only; the production stack lives in `deploy/`.

## Infrastructure

**Database.** Any Postgres reachable through `DATABASE_URL`. Apply the schema with `make migrate`, which runs `db/migrations/*.sql` in filename order and records what it applied in `schema_migrations`. Re-running it is a no-op. `db/migrations/0001_auth.sql` holds Better Auth's own schema and is not hand-written. After changing the Better Auth config or plugins, run `bunx @better-auth/cli generate --config src/lib/auth.ts` against a running database and add what it reports as a new migration, rather than editing that file. The CLI introspects a live database, so it needs one up, and pointed at an already-migrated database it emits only the delta.

**Auth.** Better Auth with email and password, mounted at `/api/auth`. Email verification is required, so a new account is inactive until the confirmation link is clicked. Signup confirmation and password reset emails go out over SMTP.

**Object storage.** Two S3-compatible buckets:

- `speaking-recordings` (private): uploaded server-side by `/api/exams/submit`, read back through 5-minute signed URLs. Set a lifecycle rule on this bucket to expire objects after 30 days. The app never deletes recordings itself, and the review page already handles a missing recording.
- `exam-assets` (public read): the audio, images, and video referenced by the exam JSON. Point `EXAM_ASSETS_BASE_URL` at its public base URL, with no trailing slash.

The Content-Security-Policy in `next.config.ts` derives the allowed media origins from `EXAM_ASSETS_BASE_URL` and `S3_ENDPOINT`, so there is nothing extra to configure when either host changes.

## Deployment

The app and the infra it depends on are two independent compose stacks on the same host, each with its own playbook, so redeploying the app never restarts Postgres.

| Stack | Playbook            | Template                            | Triggered by                                     |
| ----- | ------------------- | ----------------------------------- | ------------------------------------------------ |
| Infra | `deploy/infra.yaml` | `deploy/tmpls/infra-compose.yml.j2` | the **Infra** workflow, manually                 |
| App   | `deploy/app.yaml`   | `deploy/tmpls/app-compose.yml.j2`   | the deploy job in `build.yml`, on push to master |

The infra stack holds the stateful services, currently Postgres and its backup sidecar, and owns the `examklaar_network` Docker network. The app stack joins that network as an external network and reaches Postgres by hostname, so the database port is never published. Run the Infra workflow once before the first app deploy, and afterwards only to change the Postgres image or its settings. `deploy/app.yaml` fails early with a clear error if the network is missing.

Migrations run from `deploy/app.yaml` after the app container starts, since the schema belongs to the app version being deployed rather than to the infra stack.

### Backups

The infra stack includes a `db-backup` sidecar running `deploy/files/backup.sh`. Every 24 hours it takes a `pg_dump --format=custom` and uploads it to a private backups bucket under a `YYYY/MM/DD/` key. It runs on the same image as the server so `pg_dump` always matches the server's major version, and it uses its own storage credentials scoped to the backups bucket, so a compromised app container cannot reach a dump of the whole database.

Set up once:

- A private `examklaar-backups` bucket, with a lifecycle rule for however long you want to keep dumps. The script never deletes anything.
- A storage API token with object read and write, scoped to that bucket alone, supplied as `S3_BACKUP_ACCESS_KEY_ID` and `S3_BACKUP_SECRET_ACCESS_KEY`.

A dump smaller than 1 KB is refused rather than uploaded, so a failed or half-written dump cannot age out the good ones under the lifecycle rule. The container reports unhealthy if no backup has succeeded in 26 hours, which is the signal to watch: `docker ps` shows the status, and `docker logs examklaar_db_backup` shows why.

To restore, copy a dump down and feed it to `pg_restore`:

```bash
aws s3 cp s3://examklaar-backups/2026/07/29/examklaar-20260729T020000Z.dump . \
  --endpoint-url "$S3_ENDPOINT"
docker compose -f /etc/examklaar/infra-compose.yml cp \
  examklaar-20260729T020000Z.dump postgres:/tmp/restore.dump
docker compose -f /etc/examklaar/infra-compose.yml exec -T postgres \
  pg_restore -U examklaar -d examklaar --clean --if-exists /tmp/restore.dump
```

Stop the app stack first so nothing writes during the restore. Rehearse this at least once: an untested backup is not a backup.

## Documentation

- [Exam JSON format](docs/exam-format.md) — the schema, per-skill conventions, and asset rules for exam data files.
- [A2 exam generation runbook](docs/a2-exam-generation.md) — how to author a new A2 exam for any component in the app's format.
- [Reference example exams](docs/examples/README.md) — official A2 exams, one or more per component, for inspiration.
- [Dutch text-to-speech](docs/dutch-text-to-speech.md) — generating spoken Dutch audio locally for listening and speaking prompts.
- [Image generation](docs/image-generation.md) — generating exam scene images locally.
- [Video generation](docs/video-generation.md) — generating talking-head videos locally for speaking Part 1 prompts.
- [Testing payment webhooks](docs/testing-payment-webhooks.md) — receiving Paddle webhooks against a local dev server.

## Skills

Project skills live in `.claude/skills/` and are invoked with a slash command.

- **`/generate-a2-exam <reading|listening|writing|speaking|knm>`** — generates a new A2 exam for a component, writes the JSON into the exam data, and stages an assets folder to upload to the `exam-assets` bucket.
