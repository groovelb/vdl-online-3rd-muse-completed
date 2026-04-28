-- Project.type 필드 폐기
-- 이유: mode 가 동일한 분기 역할(concept/system/handoff)을 수행하며,
-- T2/T3 시스템 프롬프트에서 type 의 영향력이 약하다고 검증됨.
-- 데이터 모델/시스템 프롬프트/호출 함수/UI 4계층 모두 type 제거 완료.

ALTER TABLE projects DROP COLUMN IF EXISTS type;
