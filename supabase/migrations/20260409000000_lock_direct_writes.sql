-- Inserts into exam_results now go through the server-side API (service role).
-- Remove the ability for authenticated users to insert directly.
revoke insert on public.exam_results from authenticated;
drop policy "Users can insert their own results" on public.exam_results;

-- Audio uploads now go through the server-side API (service role).
-- Remove the ability for authenticated users to upload directly.
drop policy "Users can upload their own recordings" on storage.objects;
