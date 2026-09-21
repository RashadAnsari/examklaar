-- ============================================================
-- subscriptions: drop the 'trialing' status
-- ============================================================
-- The 7-day free trial is gone. Its replacement, one free exam per skill, needs
-- no subscription row at all: access to the first exam of a skill is decided
-- from the exam number, not from a status here. That leaves 'trialing' with no
-- writer in the app, so the check constraint stops accepting it.
--
-- Any row still carrying it is a customer the provider considers subscribed, so
-- it is moved to 'active' rather than dropped: that is what a trialing row
-- already meant for access, and the provider's next webhook overwrites it.
--
-- subscription_events.status is deliberately left alone. It has no constraint
-- and it is the append-only history, so past 'trialing' events stay as they
-- were recorded.

update subscriptions set status = 'active' where status = 'trialing';

alter table subscriptions drop constraint if exists subscriptions_status_check;

alter table subscriptions add constraint subscriptions_status_check
  check (status in ('active', 'cancelled', 'past_due', 'expired'));

comment on column subscriptions.status is 'active | cancelled | past_due | expired';
