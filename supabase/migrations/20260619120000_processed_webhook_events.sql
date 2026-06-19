-- ============================================================
-- processed_webhook_events: idempotency guard for payment webhooks
-- ============================================================
-- Payment providers retry webhooks and a captured valid request can be
-- replayed within its signature window. Signature verification proves
-- authenticity but not freshness, so without a dedupe a replayed older event
-- (e.g. an "active" event after a cancellation) could resurrect access.
-- We record a key per processed event (a hash of the raw, signature-verified
-- body) and skip any event whose key we have already seen.

create table public.processed_webhook_events (
  event_key    text        primary key,
  event_type   text        not null,
  processed_at timestamptz not null default now()
);

comment on table public.processed_webhook_events is 'Idempotency keys for already-processed payment webhooks; prevents replay/double-processing.';
comment on column public.processed_webhook_events.event_key is 'SHA-256 of the raw, signature-verified webhook body.';

alter table public.processed_webhook_events enable row level security;

-- Only the server (service role) reads and writes this table; no end-user access.
grant select, insert on public.processed_webhook_events to service_role;
