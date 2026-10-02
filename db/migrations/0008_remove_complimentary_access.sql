-- ============================================================
-- Complimentary access: removed
-- ============================================================
-- The "Claim free access" offer granted a provider-less subscription row for a
-- few months. It is replaced by early access, which opens every exam while no
-- payment provider is configured and needs no row at all, so the grants are
-- removed together with the offer.
--
-- A grant is identified by its complimentary_grant event rather than by a null
-- payment_provider alone: scripts/grant-subscription.ts writes provider-less
-- rows too, and those are deliberate manual grants that must stay. The row goes
-- only when the grant is still the user's latest event, so a manual grant made
-- on top of a claim is kept.
--
-- The grant events go as well. They are the only part of subscription_events
-- that never involved a payment, so the financial history that table keeps for
-- disputes and tax records is untouched.

delete from subscriptions s
 where s.payment_provider is null
   and (
     select e.event_type
       from subscription_events e
      where e.user_id = s.user_id
      order by e.occurred_at desc, e.created_at desc
      limit 1
   ) = 'complimentary_grant';

delete from subscription_events
 where event_type = 'complimentary_grant';

comment on column subscription_events.event_type is 'e.g. manual_grant, cancelled, cancel_scheduled, payment_failed, or a provider event type like subscription.renewed';
