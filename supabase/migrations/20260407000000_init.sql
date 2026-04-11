-- ============================================================
-- exam_results
-- ============================================================

create table public.exam_results (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references auth.users (id) on delete cascade,
  exam_id        text        not null,
  skill          text        not null,
  level          text,
  score          integer     not null,
  total_score    integer     not null,
  answers        jsonb       not null default '{}',
  feedback       jsonb,
  ai_graded_at   timestamptz,
  grading_status text        not null default 'complete' check (grading_status in ('pending', 'in_progress', 'complete', 'failed')),
  completed_at   timestamptz not null default now(),
  created_at     timestamptz not null default now()
);

comment on column public.exam_results.exam_id        is 'e.g. reading-a2-exam-1';
comment on column public.exam_results.skill          is 'one of: reading, listening, writing, speaking, knm';
comment on column public.exam_results.level          is 'one of: A2, B1, null (for knm)';
comment on column public.exam_results.score          is 'points scored (correct answers for mcq, points for writing/speaking)';
comment on column public.exam_results.total_score    is 'maximum possible score (question count for mcq, max points for writing/speaking)';
comment on column public.exam_results.answers        is 'map of question id to user answer';
comment on column public.exam_results.feedback       is 'map of question id to { score, maxScore, feedback } — populated by AI grader';
comment on column public.exam_results.ai_graded_at   is 'when AI grading completed; null means pending for writing/speaking exams';
comment on column public.exam_results.grading_status is 'pending = waiting, in_progress = grader running, complete = done, failed = grader error. MCQ exams are always complete.';

alter table public.exam_results enable row level security;

-- Authenticated users can only read their own results.
-- All writes go through the server-side API (service role).
grant select on public.exam_results to authenticated;
grant select, insert, update on public.exam_results to service_role;

create policy "Users can view their own results"
  on public.exam_results for select
  using (auth.uid() = user_id);

create index exam_results_user_exam_idx on public.exam_results (user_id, exam_id);

-- ============================================================
-- speaking-recordings storage bucket
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'speaking-recordings',
  'speaking-recordings',
  false,
  2097152, -- 2 MB per file (sufficient for ~1 min of audio/webm)
  array['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav']
);

-- Uploads and signed URL generation go through the server-side API (service role) only.
create policy "Service role can upload recordings"
  on storage.objects for insert
  to service_role
  with check (bucket_id = 'speaking-recordings');

create policy "Service role can read recordings"
  on storage.objects for select
  to service_role
  using (bucket_id = 'speaking-recordings');
