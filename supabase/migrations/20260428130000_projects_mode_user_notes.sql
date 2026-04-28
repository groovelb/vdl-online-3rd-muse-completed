-- projects.mode + projects.user_notes + project_references.use_layers 추가
--
-- 배경: TP2 모드 선택 (concept/system/handoff), Step 3 활용 노트(userNotes),
--      TP4 레퍼런스별 레이어 큐레이션(selectedRefs[].useLayers) 가
--      프론트 데이터 모델에는 있으나 DB에는 컬럼이 없어 사일런트 손실 + insert 정합성 깨짐.
--
-- 4계층 정합성: schemas.js / mapProjectToDb / addProject / 위자드 payload

-- ============================================================
-- 1. project_mode enum + projects.mode 컬럼
-- ============================================================

create type public.project_mode as enum ('concept', 'system', 'handoff');

alter table public.projects
  add column if not exists mode public.project_mode not null default 'system';

-- ============================================================
-- 2. projects.user_notes (Step 3 활용 노트)
-- ============================================================

alter table public.projects
  add column if not exists user_notes text not null default '';

-- ============================================================
-- 3. project_references.use_layers (TP4 레퍼런스별 layer 큐레이션)
--    빈 배열 = 자동 (T2 referenceLayer 사용)
-- ============================================================

alter table public.project_references
  add column if not exists use_layers text[] not null default '{}';
