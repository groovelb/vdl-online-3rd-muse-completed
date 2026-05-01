# appendix. RLS Policies (MUSE)

> 행 수준 보안 정책 부록. 디자이너 미열람 전제.

## 개요

- 모든 테이블 `ENABLE ROW LEVEL SECURITY` 적용
- 기본 원칙: **DENY by default, 명시적 ALLOW 만 허용**
- 소유자 기준: `auth.uid() = user_id` (또는 project 경유 join)

## 정책 매트릭스

| 테이블 | SELECT | INSERT | UPDATE | DELETE | 패턴 |
|--------|--------|--------|--------|--------|------|
| `profiles` | 모두 | 자동 (트리거) | 본인만 | 본인만 | public-read-owner-write |
| `reference_items` | 본인만 | 본인만 | 본인만 | 본인만 | owner-only |
| `projects` | 본인만 | 본인만 | 본인만 | 본인만 | owner-only |
| `project_references` | project owner | project owner | project owner | project owner | owner-via-join |
| `analysis_results` | project owner | project owner | project owner | project owner | owner-via-join |
| `user_settings` | 본인만 | 자동 (트리거) | 본인만 | 본인만 | owner-only |

## 테이블별 상세

### `profiles` (public-read-owner-write)

```sql
alter table profiles enable row level security;

create policy "profiles_select_all"
  on profiles for select
  using (true);

create policy "profiles_update_own"
  on profiles for update
  using (auth.uid() = id);
```

### `reference_items` (owner-only)

```sql
alter table reference_items enable row level security;

create policy "reference_items_select_own"
  on reference_items for select
  using (auth.uid() = user_id);

create policy "reference_items_insert_own"
  on reference_items for insert
  with check (auth.uid() = user_id);

create policy "reference_items_update_own"
  on reference_items for update
  using (auth.uid() = user_id);

create policy "reference_items_delete_own"
  on reference_items for delete
  using (auth.uid() = user_id);
```

### `projects` (owner-only). 동일 패턴

`reference_items` 와 동일. `auth.uid() = user_id` 4종 정책.

### `project_references` (owner-via-join)

`project_id` 의 owner 만 접근.

```sql
alter table project_references enable row level security;

create policy "project_references_select_via_project"
  on project_references for select
  using (
    exists (
      select 1 from projects
      where projects.id = project_references.project_id
        and projects.user_id = auth.uid()
    )
  );

-- INSERT / UPDATE / DELETE 도 동일한 EXISTS 조건
```

### `analysis_results` (owner-via-join). 동일 패턴

`project_references` 와 동일. project 경유 join.

### `user_settings` (owner-only). 동일 패턴

`reference_items` 와 동일. `auth.uid() = user_id` 4종 정책.

## 검증 (프로그래밍적 게이트)

```sql
-- RLS 미활성 public 테이블 0건
SELECT tablename FROM pg_tables
WHERE schemaname='public' AND rowsecurity=false;

-- 정책 없는 RLS 활성 테이블 0건
SELECT c.relname FROM pg_class c LEFT JOIN pg_policy p ON p.polrelid=c.oid
WHERE c.relnamespace='public'::regnamespace AND c.relkind='r'
  AND c.relrowsecurity=true AND p.polname IS NULL;
```

## 검증 결과 (Phase 5 스모크 테스트)

| 테스트 | 결과 |
|--------|------|
| 비로그인 SELECT projects | ✅ 차단 |
| 사용자 A 가 사용자 B 의 projects UPDATE | ✅ 차단 |
| 사용자 A 가 본인 projects INSERT | ✅ 허용 |
| `project_references` 접근 시 project owner 검증 | ✅ 차단 (다른 사용자) |
| 위 SQL 검증 1: RLS 미활성 테이블 | ✅ 0건 |
| 위 SQL 검증 2: 정책 없는 RLS 테이블 | ✅ 0건 |
