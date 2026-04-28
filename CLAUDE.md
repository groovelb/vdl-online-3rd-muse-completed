# Project Rules

## Workflow

- 기획 문서 작성 → `/project-planning` Skill이 워크플로우 담당
- 컴포넌트 작업 → `/component-work` Skill이 워크플로우 담당
- Supabase 연동 (DB / Auth / RLS / 클라이언트) → `/supabase-integration` Skill이 워크플로우 담당
- 리팩토링 → `refactoring-guide.md` 참조, 기존 스토리 통과 확인
- 룰 수정 시 → `pnpm generate-rules` 실행하여 Storybook 시각화 동기화

## Reporting Rules (CRITICAL — 위반 금지)

- **있는 그대로 보고**. 축소·은폐 금지. 미비된 건 미비된 그대로 명시.
- "준비됨 = 작동함"으로 절대 동치시키지 않기. 시스템 프롬프트/스키마/함수 시그니처가 갖춰졌어도 호출 흐름에서 안 쓰이면 **"미작동"**으로 보고.
- 작업 완료 보고 시 반드시 다음 형식:
  - ✅ 준비된 것 (코드 존재)
  - ⚠️ 부분 작동 (일부만 통합)
  - ❌ 안 된 것 (UX/실제 호출에서 누락)
- 중간 단계에서 "잘 됐다"고 한 뒤 사용자가 물어봐서야 "사실 미작동이었다"고 번복하지 않기.
- "X 반영했다"고 말하기 전에: 데이터 모델 / 시스템 프롬프트 / 호출 시점 / UI 노출 — 4계층 모두 통합됐는지 확인 후 보고.

## Current Status (2026-04-28)

### ✅ 작동 중
- **TP2 모드 선택** — ProjectCreateWizard Step 0
- **TP3 의도 시드** — Step 1 IntentSeedField
- **TP4 레이어 chip** — ReferencePicker 카드별 ReferenceLayerChipRow → T3 useLayers strict 전달
- **TP5 분석 직전 확인 박스** — Step 3 AnalysisConfirmBox
- **TP6 결정 추적 (컬러만)** — ColorSwatchList 펼침 → TokenDecisionTracePanel

### ❌ 폐기 결정 (2026-04-28)
- **TP1 userIntent (업로드 시 chip)**: 폐기. T1 시스템 프롬프트는 이미지를 정보 원천으로 함. 사용자 chip 답이 태깅 정확도를 의미 있게 향상시키지 않음을 검증·인정. TP4(레이어 chip)와 다운스트림 가치 중복. 화면 변화 없는 chip은 사용자 신뢰 손상. → 관련 코드·UI·문서 모두 제거.

### ⚠️ 미완료
- **TP6 펼침 UI가 ColorSwatchList에만 적용**: TypographyPreview / LayoutTokenPreview / GradientPreview 3개는 `TokenDecisionTracePanel` 통합 필요.
- **AITasks.stories.jsx 신규 변수 노출**: T1/T2/T3 IO 섹션에 mode / useLayers / decisionRationale 표시 안 됨.
- **TP2/TP4 실제 결과 차이 검증 안 됨**: 모드별 / useLayers 별로 정말 다른 결과가 나오는지 실제 호출로 검증 안 함. LLM 자율 분기에 의존.