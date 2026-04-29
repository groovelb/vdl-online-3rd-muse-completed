-- Admin: 어드민에게 다른 사용자의 references / projects / analysis 조회 허용
--
-- - role 은 auth.users.raw_app_meta_data.role 로 식별 (client SDK 변경 불가).
-- - JWT claim 'app_metadata.role' 을 RLS 에서 검사.
-- - 기존 owner-only 정책은 그대로 유지하고 admin select-only 정책을 추가.

-- ============================================================
-- Helper: is_admin()
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- ============================================================
-- Admin SELECT policies (read-only across users)
-- ============================================================

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
  on public.profiles for select
  to authenticated
  using (public.is_admin());

drop policy if exists "reference_items_select_admin" on public.reference_items;
create policy "reference_items_select_admin"
  on public.reference_items for select
  to authenticated
  using (public.is_admin());

drop policy if exists "projects_select_admin" on public.projects;
create policy "projects_select_admin"
  on public.projects for select
  to authenticated
  using (public.is_admin());

drop policy if exists "analysis_results_select_admin" on public.analysis_results;
create policy "analysis_results_select_admin"
  on public.analysis_results for select
  to authenticated
  using (public.is_admin());

drop policy if exists "project_references_select_admin" on public.project_references;
create policy "project_references_select_admin"
  on public.project_references for select
  to authenticated
  using (public.is_admin());

-- ============================================================
-- RPC: admin_list_users()
--   - profiles + auth.users 조인 (email 노출).
--   - security definer 로 auth.users 접근. 함수 본문에서 is_admin() 가드.
-- ============================================================

create or replace function public.admin_list_users()
returns table (
  id uuid,
  email text,
  nickname text,
  created_at timestamptz,
  project_count bigint,
  reference_count bigint
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden: admin only';
  end if;

  return query
    select
      p.id,
      u.email::text,
      p.nickname,
      p.created_at,
      (select count(*) from public.projects pr where pr.user_id = p.id) as project_count,
      (select count(*) from public.reference_items r where r.user_id = p.id) as reference_count
    from public.profiles p
    join auth.users u on u.id = p.id
    order by p.created_at desc;
end;
$$;

revoke all on function public.admin_list_users() from public;
grant execute on function public.admin_list_users() to authenticated;
