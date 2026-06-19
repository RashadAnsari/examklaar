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

## Testing payment webhooks

Paddle delivers webhooks server-to-server, so to receive them locally you expose your dev server through a tunnel and point a Paddle notification destination at it. See Paddle's [webhook docs](https://developer.paddle.com/webhooks/test-webhooks) for details.

1. Start a tunnel to your dev server and copy the public URL it prints:

   ```bash
   ngrok http 3000
   ```

2. In the Paddle sandbox dashboard, create a notification destination of type **URL** pointing at `<tunnel-url>/api/payments/webhook`.
3. Trigger a real event in the sandbox (e.g. start or cancel a subscription). Paddle delivers it to your destination, and the tunnel forwards it to your local endpoint. Paddle's destination view shows each delivery's payload, request, and your handler's response, so you can confirm it returned `200`.

Events carry a real `paddle-signature` header signed with your endpoint secret, so signature verification runs exactly as it does in production. No CORS or signing workarounds are needed.

**Idempotency caveat**: the handler dedupes on a hash of the raw signature-verified body, so redelivering an identical event is ignored the second time (it returns `ok` early). Clear the matching `processed_webhook_events` row to process the same event again.
