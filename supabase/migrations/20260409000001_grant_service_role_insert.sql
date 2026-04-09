-- Ensure service_role can insert exam results (used by server-side API route).
-- Authenticated users no longer insert directly — the API calculates scores server-side.
grant select, insert on public.exam_results to service_role;
