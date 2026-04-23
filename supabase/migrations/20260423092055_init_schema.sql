-- MUSE — Initial schema (Phase 1)
--
-- 6 테이블: profiles / reference_items / projects / project_references / analysis_results / user_settings
-- 공통 컬럼: id uuid default gen_random_uuid(), created_at, updated_at
-- 트리거: set_updated_at (updated_at 보유 테이블 전부)
-- RLS: 이 마이그레이션에서 enable only, 정책은 Phase 3 에서 부착
--
-- 데이터 모델: docs/muse/02-ux-flow.md + src/data/muse/schemas.js
-- 계획: docs/muse/backend-integration-plan.md

-- ============================================================
-- Extensions
-- ============================================================

create extension if not exists "pgcrypto";   -- gen_random_uuid()

-- ============================================================
-- Helpers — updated_at 자동 갱신 트리거 함수
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- 1. profiles — auth.users 확장
-- ============================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null unique,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_nickname on public.profiles(nickname);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;

-- ============================================================
-- 2. reference_items — Reference 엔티티
--    (테이블명이 'references' 가 아닌 이유: PG 예약어 충돌 회피)
-- ============================================================

create table public.reference_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  source text not null check (source in ('file', 'url')),
  storage_path text,                            -- Supabase Storage 내 경로 (Phase 4)
  thumbnail_url text,                           -- 외부 URL 이면 여기 저장 (source='url')
  title text,
  tags jsonb not null default '{}'::jsonb,      -- ReferenceLayeredTags
  dominant_colors text[] not null default '{}', -- HEX 배열
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_reference_items_user_id on public.reference_items(user_id);
create index idx_reference_items_created_at on public.reference_items(created_at desc);
create index idx_reference_items_tags_gin on public.reference_items using gin (tags);

create trigger trg_reference_items_updated_at
  before update on public.reference_items
  for each row execute procedure public.set_updated_at();

alter table public.reference_items enable row level security;

-- ============================================================
-- 3. projects — Project 엔티티
-- ============================================================

create type public.project_type as enum ('landing', 'dashboard', 'mobile', 'brand');

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  intent text not null default '',
  type public.project_type not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_projects_user_id on public.projects(user_id);
create index idx_projects_created_at on public.projects(created_at desc);

create trigger trg_projects_updated_at
  before update on public.projects
  for each row execute procedure public.set_updated_at();

alter table public.projects enable row level security;

-- ============================================================
-- 4. project_references — Project ↔ Reference N:M junction
-- ============================================================

create table public.project_references (
  project_id uuid not null references public.projects(id) on delete cascade,
  reference_id uuid not null references public.reference_items(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (project_id, reference_id)
);

create index idx_project_references_reference_id on public.project_references(reference_id);

alter table public.project_references enable row level security;

-- ============================================================
-- 5. analysis_results — AnalysisResult 엔티티 (1:1 with project)
-- ============================================================

create type public.analysis_status as enum ('pending', 'running', 'done', 'error');

create table public.analysis_results (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects(id) on delete cascade,
  layers jsonb not null default '{}'::jsonb,    -- AnalysisLayers (color/typography/layout/gradient/visualDirection)
  status public.analysis_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_analysis_results_project_id on public.analysis_results(project_id);

create trigger trg_analysis_results_updated_at
  before update on public.analysis_results
  for each row execute procedure public.set_updated_at();

alter table public.analysis_results enable row level security;

-- ============================================================
-- 6. user_settings — UserSettings (singleton per user)
-- ============================================================

create type public.storage_mode as enum ('local', 'cloud');
create type public.theme_mode as enum ('light', 'dark', 'system');

create table public.user_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  ai_model text not null default 'claude-sonnet-4-6',
  storage_mode public.storage_mode not null default 'cloud',
  theme_mode public.theme_mode not null default 'system',
  is_auto_tag_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

create trigger trg_user_settings_updated_at
  before update on public.user_settings
  for each row execute procedure public.set_updated_at();

alter table public.user_settings enable row level security;

-- ============================================================
-- 검증 쿼리 (이 파일 실행 후 수동 확인 가능)
-- ============================================================

-- select tablename, rowsecurity from pg_tables where schemaname = 'public' order by tablename;
-- → 6개 테이블 전부 rowsecurity = true 여야 함
