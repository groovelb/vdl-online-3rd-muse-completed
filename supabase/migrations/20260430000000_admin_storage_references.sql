-- Admin: storage.objects (references 버킷) cross-user SELECT 허용
--
-- 기존 정책은 본인 폴더(auth.uid() = split_part(name,'/',1))만 SELECT 허용.
-- AdminRoute 가 다른 유저의 reference / project 썸네일 signed URL 을 만들려면
-- admin 에게 SELECT 권한이 필요. is_admin() 가드로 추가.

drop policy if exists "references_select_admin" on storage.objects;
create policy "references_select_admin"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'references'
    and public.is_admin()
  );
