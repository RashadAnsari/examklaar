-- service_role bypasses RLS but still needs explicit GRANT for UPDATE.
grant update on public.exam_results to service_role;
