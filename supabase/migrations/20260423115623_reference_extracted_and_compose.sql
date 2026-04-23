-- MUSE — T1 extended (upload-time full extraction) + T3 compose (text-only)
--
-- T1 이 이제 레퍼런스 1장에서 T3 수준 값(palette/typography/layout/gradient) 까지 전부 추출.
-- T3 는 이미지 없이 pre-extracted 값들을 의도 기반으로 조합만.

alter table public.reference_items
  add column if not exists extracted jsonb not null default '{}'::jsonb;

comment on column public.reference_items.extracted is
  'Per-image extracted values (palette/typography/layout/gradient). No role/emphasis (project-level).';

-- 기존 레퍼런스 전체 삭제 — 새 스키마에 맞게 재업로드 전제
-- analysis_results 와 project_references 는 FK cascade 로 자동 정리
truncate table public.reference_items cascade;
