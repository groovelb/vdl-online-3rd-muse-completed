-- MUSE — Storage bucket `references` (Phase 4)
--
-- Private bucket. 객체 경로 = {user_id}/{file_name}.
-- RLS 로 본인 폴더 내 파일만 접근 가능.

insert into storage.buckets (id, name, public)
values ('references', 'references', false)
on conflict (id) do nothing;

-- ============================================================
-- Storage RLS — 본인 user_id 폴더만 read/write/delete
-- storage.objects 테이블은 RLS 가 기본 ON. 정책만 추가.
-- path 첫 세그먼트(split_part(name, '/', 1)) 가 auth.uid() 와 일치해야 함
-- ============================================================

drop policy if exists "references_select_own" on storage.objects;
create policy "references_select_own"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'references'
    and auth.uid()::text = split_part(name, '/', 1)
  );

drop policy if exists "references_insert_own" on storage.objects;
create policy "references_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'references'
    and auth.uid()::text = split_part(name, '/', 1)
  );

drop policy if exists "references_delete_own" on storage.objects;
create policy "references_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'references'
    and auth.uid()::text = split_part(name, '/', 1)
  );
