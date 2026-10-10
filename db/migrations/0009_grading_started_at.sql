-- ============================================================
-- exam_results: record when grading started
-- ============================================================
-- Grading runs in the background after the grade request answers. A server
-- restart mid-grade kills it without moving the row out of 'in_progress', and
-- with no start time nothing could tell a running grade from a dead one, so the
-- attempt was stuck for good. The start time lets an 'in_progress' row that is
-- older than any real grade be treated as failed and claimed again.
--
-- Rows already 'in_progress' get no start time. The app treats a missing start
-- time as stale, so those stuck attempts become retryable right away.

alter table exam_results add column grading_started_at timestamptz;

comment on column exam_results.grading_started_at is 'when the current grading run claimed the row; an in_progress row older than the stale limit is treated as failed';
