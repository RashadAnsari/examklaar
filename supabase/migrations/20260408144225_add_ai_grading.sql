alter table public.exam_results
  add column feedback jsonb,
  add column ai_graded_at timestamptz;

comment on column public.exam_results.feedback is 'Map of question id to { score, maxScore, feedback } — populated by AI grader';
comment on column public.exam_results.ai_graded_at is 'When AI grading completed; null means pending for writing/speaking exams';

-- Allow server-side grader (using service role / admin client) to update rows.
-- Authenticated users should not be able to mutate scores themselves.
grant update (score, total_score, feedback, ai_graded_at) on public.exam_results to service_role;
