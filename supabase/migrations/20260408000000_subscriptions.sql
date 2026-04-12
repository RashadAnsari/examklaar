-- ============================================================
-- payment_customers
-- ============================================================

create table public.payment_customers (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users (id) on delete cascade,
  provider    text        not null,
  customer_id text        not null,
  created_at  timestamptz not null default now()
);

comment on column public.payment_customers.provider     is 'stub | mollie';
comment on column public.payment_customers.customer_id  is 'customer ID at the named payment provider';

alter table public.payment_customers enable row level security;

grant select on public.payment_customers to authenticated;
grant select, insert, update on public.payment_customers to service_role;

create policy "Users can view their own payment customers"
  on public.payment_customers for select
  using (auth.uid() = user_id);

-- One customer per provider per user.
create unique index payment_customers_user_provider_idx
  on public.payment_customers (user_id, provider);

-- ============================================================
-- subscriptions
-- ============================================================

create table public.subscriptions (
  id                       uuid        primary key default gen_random_uuid(),
  user_id                  uuid        not null references auth.users (id) on delete cascade,
  plan_id                  text        not null check (plan_id in ('premium', 'biannual')),
  status                   text        not null check (status in ('active', 'cancelled', 'past_due', 'expired')),
  payment_provider         text,
  provider_customer_id     text,
  provider_subscription_id text,
  current_period_start     timestamptz,
  current_period_end       timestamptz not null,
  cancel_at_period_end     boolean     not null default false,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

comment on column public.subscriptions.plan_id                  is 'premium = monthly, biannual = 6-month';
comment on column public.subscriptions.status                   is 'active | cancelled | past_due | expired';
comment on column public.subscriptions.payment_provider         is 'stripe | mollie | stub';
comment on column public.subscriptions.provider_customer_id     is 'customer ID at the payment provider';
comment on column public.subscriptions.provider_subscription_id is 'subscription ID at the payment provider';
comment on column public.subscriptions.cancel_at_period_end     is 'true when user requested cancellation; access continues until current_period_end';

alter table public.subscriptions enable row level security;

grant select on public.subscriptions to authenticated;
grant select, insert, update on public.subscriptions to service_role;

create policy "Users can view their own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- One active subscription row per user at most.
create unique index subscriptions_user_id_idx on public.subscriptions (user_id);
