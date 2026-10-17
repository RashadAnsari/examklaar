-- ============================================================
-- Billing: removed
-- ============================================================
-- ExamKlaar is free and nothing is sold, so the payment code is gone and the
-- tables it wrote to go with it.
--
-- subscription_events was kept outside the user cascade as the financial
-- history for disputes and tax records (see 0004). Only rows from a payment
-- provider are that history, so if any exist this migration refuses to run
-- rather than drop them: export them first, then delete them by hand.

do $$
begin
  if exists (select 1 from subscription_events where payment_provider is not null) then
    raise exception 'subscription_events holds payment history; export and delete it before dropping billing';
  end if;
end $$;

drop table processed_webhook_events;
drop table subscription_events;
drop table subscriptions;
drop table payment_customers;
