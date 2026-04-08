insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'speaking-recordings',
  'speaking-recordings',
  false,
  2097152, -- 2 MB per file (sufficient for ~1 min of audio/webm)
  array['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav']
);

create policy "Users can upload their own recordings"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'speaking-recordings'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can read their own recordings"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'speaking-recordings'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
