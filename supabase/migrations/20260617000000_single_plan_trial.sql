-- ============================================================
-- Single monthly plan with a 7-day trial
-- ============================================================

-- plan_id: only 'monthly' now. Drop the old constraint first so the data
-- migration below is allowed to write the new value.
alter table public.subscriptions drop constraint subscriptions_plan_id_check;

-- Move any existing paid rows onto the single plan id.
update public.subscriptions
  set plan_id = 'monthly'
  where plan_id in ('premium', 'biannual');

alter table public.subscriptions
  add constraint subscriptions_plan_id_check check (plan_id in ('monthly'));

-- status: add 'trialing'.
alter table public.subscriptions drop constraint subscriptions_status_check;
alter table public.subscriptions
  add constraint subscriptions_status_check
  check (status in ('trialing', 'active', 'cancelled', 'past_due', 'expired'));

comment on column public.subscriptions.plan_id is 'monthly = the single paid plan';
comment on column public.subscriptions.status is 'trialing | active | cancelled | past_due | expired';
