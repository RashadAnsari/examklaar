-- ============================================================
-- subscription_events: append-only history of subscription changes
-- ============================================================
-- The subscriptions table holds only the current state (one row per user,
-- overwritten on every change). This table records every change as an
-- immutable event so we keep a full audit trail: manual grants, provider
-- webhooks, and cancellations. Rows are never updated or deleted by the app.

create table public.subscription_events (
  id                       uuid        primary key default gen_random_uuid(),
  user_id                  uuid        not null references auth.users (id) on delete cascade,
  event_type               text        not null,
  plan_id                  text,
  status                   text,
  payment_provider         text,
  provider_customer_id     text,
  provider_subscription_id text,
  current_period_start     timestamptz,
  current_period_end       timestamptz,
  cancel_at_period_end     boolean,
  raw_event                jsonb,
  occurred_at              timestamptz not null default now(),
  created_at               timestamptz not null default now()
);

comment on table  public.subscription_events                          is 'Append-only log of every subscription state change; subscriptions holds the current snapshot.';
comment on column public.subscription_events.event_type               is 'e.g. complimentary_grant, cancelled, cancel_scheduled, payment_failed, or a provider event type like subscription.renewed';
comment on column public.subscription_events.raw_event                is 'normalised snapshot of the source event for debugging';
comment on column public.subscription_events.occurred_at              is 'when the change happened (provider event time when known, else now)';

alter table public.subscription_events enable row level security;

-- Users can read their own history; all writes go through the server (service role).
grant select on public.subscription_events to authenticated;
grant select, insert on public.subscription_events to service_role;

create policy "Users can view their own subscription events"
  on public.subscription_events for select
  using (auth.uid() = user_id);

create index subscription_events_user_occurred_idx
  on public.subscription_events (user_id, occurred_at desc);
