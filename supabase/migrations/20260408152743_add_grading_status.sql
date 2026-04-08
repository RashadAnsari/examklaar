-- Add grading_status to track AI grading lifecycle
alter table public.exam_results
  add column grading_status text not null default 'complete'
    check (grading_status in ('pending', 'in_progress', 'complete', 'failed'));

comment on column public.exam_results.grading_status is
  'pending = waiting to be graded, in_progress = grader running, complete = done, failed = grader error. MCQ exams are always complete.';

-- Backfill existing rows
update public.exam_results
set grading_status = case
  when skill in ('writing', 'speaking') and ai_graded_at is not null then 'complete'
  when skill in ('writing', 'speaking') then 'pending'
  else 'complete'
end;

-- Function to update grading_status only (used to mark in_progress / failed)
create or replace function public.set_grading_status(
  p_result_id uuid,
  p_status    text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update exam_results
  set grading_status = p_status
  where id = p_result_id;
end;
$$;

revoke execute on function public.set_grading_status from public, anon, authenticated;
grant  execute on function public.set_grading_status to service_role;

-- Update save_exam_grades to also mark grading_status = 'complete'
create or replace function public.save_exam_grades(
  p_result_id   uuid,
  p_score       integer,
  p_total_score integer,
  p_feedback    jsonb,
  p_graded_at   timestamptz
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update exam_results
  set
    score          = p_score,
    total_score    = p_total_score,
    feedback       = p_feedback,
    ai_graded_at   = p_graded_at,
    grading_status = 'complete'
  where id = p_result_id
    and ai_graded_at is null;
end;
$$;
