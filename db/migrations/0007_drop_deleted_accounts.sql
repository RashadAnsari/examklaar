-- ============================================================
-- deleted_accounts: dropped
-- ============================================================
-- Erasing an account no longer leaves a fingerprint of the address behind, so
-- the table has no writer and no reader left and the rows are personal data we
-- have decided not to keep. Sign-up accepts an address that was erased before.
--
-- What goes with it, deliberately:
--   * the block itself, so someone who erases an account can register again on
--     the same address and be granted complimentary access a second time;
--   * the row that doubled as the record that an erasure was carried out. The
--     deletion script's output and the operator's own logs are what is left of
--     that trail.
--
-- BETTER_AUTH_SECRET keyed the digests. It is still the session secret, so it
-- must not be rotated casually, but nothing in this schema depends on it now.

drop table if exists deleted_accounts;
