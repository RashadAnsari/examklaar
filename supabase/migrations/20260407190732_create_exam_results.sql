drop table if exists public.exam_results cascade;

create table public.exam_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  exam_id text not null,
  skill text not null,
  level text,
  score integer not null,
  total_score integer not null,
  answers jsonb not null default '{}',
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

comment on column public.exam_results.exam_id is 'e.g. reading-a2-exam-1';
comment on column public.exam_results.skill is 'one of: reading, listening, writing, speaking, knm';
comment on column public.exam_results.level is 'one of: A2, B1, null (for knm)';
comment on column public.exam_results.score is 'points scored (correct answers for knm/reading/listening, points for writing/speaking)';
comment on column public.exam_results.total_score is 'maximum possible score (question count for knm/reading/listening, max points for writing/speaking)';
comment on column public.exam_results.answers is 'map of question id to user answer';

alter table public.exam_results enable row level security;

grant select, insert on public.exam_results to authenticated;

create policy "Users can view their own results"
  on public.exam_results for select
  using (auth.uid() = user_id);

create policy "Users can insert their own results"
  on public.exam_results for insert
  with check (auth.uid() = user_id);

create index exam_results_user_id_idx on public.exam_results (user_id);
create index exam_results_exam_id_idx on public.exam_results (exam_id);
