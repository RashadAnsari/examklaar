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

## Deployment

The app reads the client IP from `X-Forwarded-For` for rate limiting. Behind a reverse proxy, set `TRUSTED_PROXY_COUNT` to the number of proxies in front of the app (default `1`, e.g. a single nginx or Traefik). This makes the app use the IP written by your trusted proxy instead of the spoofable client-supplied value. If you ever run the app with no proxy in front, leave it at `1`.
