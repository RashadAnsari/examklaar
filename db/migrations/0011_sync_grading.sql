-- ============================================================
-- exam_results: grade within the request
-- ============================================================
-- Grading now runs inside the grade request instead of in the background, so
-- no row waits in 'in_progress' and no start time is needed to spot a dead
-- run. A row still 'in_progress' belongs to a background run that will never
-- finish, so it becomes 'failed' and the user can retry it.

update exam_results set grading_status = 'failed' where grading_status = 'in_progress';

alter table exam_results drop column grading_started_at;

alter table exam_results drop constraint exam_results_grading_status_check;
alter table exam_results add constraint exam_results_grading_status_check
  check (grading_status in ('pending', 'complete', 'failed'));

comment on column exam_results.grading_status is 'pending = not graded yet, complete = done, failed = grader error. MCQ exams are always complete.';
