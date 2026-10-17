<div align="center">

<img src="public/examklaar-logo.svg" alt="ExamKlaar" width="96" height="96" />

# ExamKlaar

**Pass your Dutch inburgering exam with confidence**

Realistic, timed mock exams for all five components of the Dutch civic integration exam,
with AI feedback on every written and spoken answer.

[![Build](https://github.com/RashadAnsari/examklaar/actions/workflows/build.yml/badge.svg?branch=master)](https://github.com/RashadAnsari/examklaar/actions/workflows/build.yml)
[![Exams](https://img.shields.io/badge/practice_exams-25-1b6b4a)](src/data/exams)
[![Level](https://img.shields.io/badge/level-A2-1b6b4a)](docs/a2-exam-generation.md)
[![License](https://img.shields.io/badge/license-AGPL--3.0-1b6b4a)](LICENSE)

[![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2-087ea4?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Bun](https://img.shields.io/badge/Bun-1.3-fbf0df?logo=bun&logoColor=black)](https://bun.sh)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169e1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

[**Live site**](https://www.examklaar.nl) · [**Documentation**](docs/) · [**Exam format**](docs/exam-format.md) · [**Contributing rules**](AGENTS.md)

</div>

---

<div align="center">
  <img src="public/og-image.png" alt="ExamKlaar practice exams for the Dutch inburgering exam" width="640" />
</div>

## What it is

Everyone who settles in the Netherlands has to pass the _inburgeringsexamen_, five separate exams
administered by DUO. Candidates get no official practice material and only a pass or fail back, so
the first realistic attempt is usually the real one.

ExamKlaar closes that gap. It reproduces the real exam: the same structure, the same timer, the same
question types, the same media. Reading, listening and KNM are scored instantly. Writing and
speaking are graded by an AI examiner applying the official DUO assessment model, so a candidate
finds out where they stand before paying €250 to find out at DUO.

ExamKlaar is free and open source. There is no paid plan and no payment code.

## The five components

| Component                                   | What the candidate does                                              | How it is scored                   |
| ------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------- |
| **KNM** (_Kennis Nederlandse Maatschappij_) | Answers questions on Dutch society, history, culture and civic rules | Instantly, per answer key          |
| **Lezen** (Reading)                         | Reads Dutch texts and answers comprehension questions                | Instantly, per answer key          |
| **Luisteren** (Listening)                   | Listens to Dutch audio fragments and answers questions on them       | Instantly, per answer key          |
| **Schrijven** (Writing)                     | Writes short Dutch texts to a prompt                                 | AI examiner, DUO assessment models |
| **Spreken** (Speaking)                      | Records spoken answers to a video or audio prompt                    | AI examiner, DUO assessment model  |

Five exams per component, 25 in total, all at A2 level. KNM has no level, matching DUO.

## How it works

1. **Sign up** and confirm the email address. Every exam is free.
2. **Pick a component and an exam.** The exam opens with the real timer and no way to pause.
3. **Submit.** Closed questions score immediately, written and spoken answers go to the AI examiner.
4. **Review.** Every question is replayable next to the correct answer, the candidate's own answer,
   and the examiner's feedback, including the original recording for speaking.

## Tech stack

| Layer          | Choice                                                             |
| -------------- | ------------------------------------------------------------------ |
| Framework      | Next.js 16 (App Router), React 19, TypeScript                      |
| Styling        | Tailwind CSS 4, design tokens in `src/app/globals.css`             |
| Runtime, tests | Bun, `bun test`                                                    |
| Database       | PostgreSQL 17, plain SQL migrations, `pg` pool                     |
| Auth           | Better Auth, email and password with mandatory verification        |
| AI grading     | Google AI via the Vercel AI SDK                                    |
| Speech         | Transcription on the server with Transformers.js, no external call |
| Storage        | Any S3-compatible object storage, two buckets                      |
| Email          | Brevo HTTP API                                                     |
| Deployment     | Docker image built from `Dockerfile`                               |

## Quick start

```bash
bun install
make up         # local Postgres on port 5432
make migrate    # apply db/migrations
make dev        # http://localhost:3000
```

Copy `.env.example` to `.env.local` and fill it in. Postgres, Brevo, S3 storage and Google AI each
need values. The file documents what every variable is for.

The exam audio, images and video are not in git. Download `exam-assets.zip` from the
[latest release](https://github.com/RashadAnsari/examklaar/releases/latest), upload its contents to a
public bucket, and point `EXAM_ASSETS_BASE_URL` at it. See [Object storage](docs/infrastructure.md#object-storage).

`docker-compose.yml` at the repo root is the local development database only. To self-host, build
the `Dockerfile`, give the container the variables from `.env.example`, and run `node
scripts/migrate.js` in it after each deploy. Production deployment of examklaar.nl lives in a
separate private repository.

### Everyday commands

| Command          | What it does                                          |
| ---------------- | ----------------------------------------------------- |
| `make dev`       | Start the dev server                                  |
| `make local`     | Format, lint, typecheck and test, the full local gate |
| `make test`      | Run `bun test`                                        |
| `make coverage`  | Run the tests with coverage                           |
| `make build`     | Production build                                      |
| `make migrate`   | Apply `db/migrations` in order                        |
| `make db-shell`  | `psql` into the local database                        |
| `make up`/`down` | Start or stop the local database                      |

Run `make local` before every commit. CI runs the same targets, so a check that passes locally
passes there too.

## Project structure

```
src/
  app/              routes, API handlers and page components (App Router)
  components/       ui/ primitives, layout/, analytics/
  config/           site.ts, everything that identifies the product
  data/             exams/ the exam JSON, grading/ the DUO assessment models
  hooks/            shared client hooks
  lib/              db, auth, exam scoring and grading, storage, email
db/migrations/      numbered SQL migrations, applied by scripts/migrate.ts
docs/               authoring, generation and operations documentation
scripts/            migrate, delete-user
test/               test setup and the stub Postgres pool
```

## Documentation

The full index lives in [`docs/`](docs/README.md).

| Guide                                                    | What it covers                                                    |
| -------------------------------------------------------- | ----------------------------------------------------------------- |
| [Exam JSON format](docs/exam-format.md)                  | The schema, per-skill conventions and asset rules for exam data   |
| [A2 exam generation runbook](docs/a2-exam-generation.md) | How to author a new A2 exam for any component                     |
| [Reference example exams](docs/examples/README.md)       | Official DUO A2 exams used as a calibration reference, kept local |
| [Dutch text-to-speech](docs/dutch-text-to-speech.md)     | Generating spoken Dutch audio locally for listening and speaking  |
| [Image generation](docs/image-generation.md)             | Generating exam scene images locally                              |
| [Video generation](docs/video-generation.md)             | Generating talking-head video for speaking Part 1 prompts         |
| [Infrastructure](docs/infrastructure.md)                 | Database, auth, object storage and the media policy               |

[`AGENTS.md`](AGENTS.md) holds the conventions every change in this repository follows, for people
and for coding agents alike. Read it before touching code.

## Project skills

Project skills are Codex skills in `.agents/skills/`, invoked with `$`. The skill hands its result
to the `exam_reviewer` agent in `.codex/agents/`.

| Skill                                                            | What it does                                                                                                                              |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `$generate-a2-exam <reading\|listening\|writing\|speaking\|knm>` | Generates a new A2 exam for a component, writes the JSON into the exam data, and stages its assets folder (images via Codex, video local) |

## License

[GNU Affero General Public License v3.0](LICENSE). If you run a modified version as a public
service, you must publish its source to its users.

The license covers the code and the exam content in this repository. It does not cover the
ExamKlaar name or logo.
