-- projects.reference_notes 추가
--
-- 배경: ProjectDetailPage 에서 ref 별 자유 텍스트 노트 ("ref-001 의 hero 색감만 차용")
--      입력. T3 재호출 없이 paste block 생성 시 결정론적 반영.
--
-- 형태: jsonb { [refId: string]: string(≤100자) }

alter table public.projects
  add column if not exists reference_notes jsonb not null default '{}'::jsonb;
