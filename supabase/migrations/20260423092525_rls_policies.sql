-- MUSE — RLS Policies (Phase 3)
--
-- 모든 테이블 owner-only. 단일 사용자 계정 서비스 (공유/팀 없음).
-- Junction / analysis_results 는 is_project_owner() helper 로 간접 소유 체크.

-- ============================================================
-- Helper: is_project_owner
-- ============================================================

create or replace function public.is_project_owner(p_project_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.projects
    where id = p_project_id and user_id = auth.uid()
  );
$$;

-- ============================================================
-- 1. profiles — 본인 프로필만 읽기/수정
-- ============================================================

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- INSERT: handle_new_user 트리거 (security definer) 가 처리 → 정책 불필요
-- DELETE: auth.users cascade 로 삭제 → 정책 불필요

-- ============================================================
-- 2. reference_items — owner-only
-- ============================================================

drop policy if exists "reference_items_select_own" on public.reference_items;
create policy "reference_items_select_own"
  on public.reference_items for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "reference_items_insert_own" on public.reference_items;
create policy "reference_items_insert_own"
  on public.reference_items for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "reference_items_update_own" on public.reference_items;
create policy "reference_items_update_own"
  on public.reference_items for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "reference_items_delete_own" on public.reference_items;
create policy "reference_items_delete_own"
  on public.reference_items for delete
  to authenticated
  using (auth.uid() = user_id);

-- ============================================================
-- 3. projects — owner-only
-- ============================================================

drop policy if exists "projects_select_own" on public.projects;
create policy "projects_select_own"
  on public.projects for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "projects_insert_own" on public.projects;
create policy "projects_insert_own"
  on public.projects for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "projects_update_own" on public.projects;
create policy "projects_update_own"
  on public.projects for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "projects_delete_own" on public.projects;
create policy "projects_delete_own"
  on public.projects for delete
  to authenticated
  using (auth.uid() = user_id);

-- ============================================================
-- 4. project_references — project owner 검증
-- ============================================================

drop policy if exists "project_references_select" on public.project_references;
create policy "project_references_select"
  on public.project_references for select
  to authenticated
  using (public.is_project_owner(project_id));

drop policy if exists "project_references_insert" on public.project_references;
create policy "project_references_insert"
  on public.project_references for insert
  to authenticated
  with check (public.is_project_owner(project_id));

drop policy if exists "project_references_delete" on public.project_references;
create policy "project_references_delete"
  on public.project_references for delete
  to authenticated
  using (public.is_project_owner(project_id));

-- UPDATE 정책 없음 → junction row 수정 불가 (의도된 동작: DELETE + INSERT 로 교체)

-- ============================================================
-- 5. analysis_results — project owner 검증
-- ============================================================

drop policy if exists "analysis_results_select" on public.analysis_results;
create policy "analysis_results_select"
  on public.analysis_results for select
  to authenticated
  using (public.is_project_owner(project_id));

drop policy if exists "analysis_results_insert" on public.analysis_results;
create policy "analysis_results_insert"
  on public.analysis_results for insert
  to authenticated
  with check (public.is_project_owner(project_id));

drop policy if exists "analysis_results_update" on public.analysis_results;
create policy "analysis_results_update"
  on public.analysis_results for update
  to authenticated
  using (public.is_project_owner(project_id))
  with check (public.is_project_owner(project_id));

drop policy if exists "analysis_results_delete" on public.analysis_results;
create policy "analysis_results_delete"
  on public.analysis_results for delete
  to authenticated
  using (public.is_project_owner(project_id));

-- ============================================================
-- 6. user_settings — owner-only
-- ============================================================

drop policy if exists "user_settings_select_own" on public.user_settings;
create policy "user_settings_select_own"
  on public.user_settings for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "user_settings_update_own" on public.user_settings;
create policy "user_settings_update_own"
  on public.user_settings for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- INSERT: handle_new_user 트리거 처리
-- DELETE: auth.users cascade
