# ExamKlaar

A web app for practicing the Dutch inburgering (civic integration) exam — required for residency in the Netherlands.

## What It Does

ExamKlaar lets users take timed, realistic practice exams across all 5 components of the inburgering exam:

- **KNM** — Civic knowledge (Kennis van de Nederlandse Maatschappij)
- **Reading** — Dutch reading comprehension
- **Listening** — Dutch listening comprehension
- **Writing** — Written Dutch with AI-graded feedback
- **Speaking** — Recorded answers with AI feedback

Users get one free exam, then subscribe for unlimited access.

## Getting Started

```bash
bun install
bun dev
```

Requires environment variables for Supabase, Google AI, and Paddle: see `.env.example`.

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

- **`/generate-a2-exam <reading|listening|writing|speaking|knm>`** — generates a new A2 exam for a component, writes the JSON into the exam data, and stages an assets folder to upload to Supabase.
