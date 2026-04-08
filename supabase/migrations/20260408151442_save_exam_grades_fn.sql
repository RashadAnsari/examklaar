-- Runs as postgres (SECURITY DEFINER), bypassing any grant issues on exam_results.
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
    score         = p_score,
    total_score   = p_total_score,
    feedback      = p_feedback,
    ai_graded_at  = p_graded_at
  where id = p_result_id
    and ai_graded_at is null;  -- prevent overwriting an already-graded result
end;
$$;

-- Only the service role (server-side grader) may call this function.
revoke execute on function public.save_exam_grades from public, anon, authenticated;
grant  execute on function public.save_exam_grades to service_role;
