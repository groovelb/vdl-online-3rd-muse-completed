# Project Rules

## Workflow

- 기획 문서 작성 → `/project-planning` Skill이 워크플로우 담당
- 컴포넌트 작업 → `/component-work` Skill이 워크플로우 담당
- Supabase 연동 (DB / Auth / RLS / 클라이언트) → `/supabase-integration` Skill이 워크플로우 담당
- 리팩토링 → `refactoring-guide.md` 참조, 기존 스토리 통과 확인
- 룰 수정 시 → `pnpm generate-rules` 실행하여 Storybook 시각화 동기화

## AI Slop 금지 (CRITICAL)

- **`—` (em dash) 절대 사용 금지** — 코드 / 카피 / 답변 / 문서 / 커밋 메시지 어디에서도 사용하지 않는다. 대시는 LLM 의 대표적 AI slop 신호. 대신 마침표, 쉼표, 콜론, 줄바꿈, 괄호 등 일반 구두점으로 대체.

## Reporting Rules (CRITICAL, 위반 금지)

- **있는 그대로 보고**. 축소·은폐 금지. 미비된 건 미비된 그대로 명시.
- "준비됨 = 작동함"으로 절대 동치시키지 않기. 시스템 프롬프트/스키마/함수 시그니처가 갖춰졌어도 호출 흐름에서 안 쓰이면 **"미작동"**으로 보고.
- 작업 완료 보고 시 반드시 다음 형식:
  - ✅ 준비된 것 (코드 존재)
  - ⚠️ 부분 작동 (일부만 통합)
  - ❌ 안 된 것 (UX/실제 호출에서 누락)
- 중간 단계에서 "잘 됐다"고 한 뒤 사용자가 물어봐서야 "사실 미작동이었다"고 번복하지 않기.
- "X 반영했다"고 말하기 전에: 데이터 모델 / 시스템 프롬프트 / 호출 시점 / UI 노출 — 4계층 모두 통합됐는지 확인 후 보고.

## Current Status (2026-04-30)

### ✅ 작동 중 — 5-step Progressive Narrowing 흐름
- **Step 0 TP2 모드 선택** — concept / system 카드 (2 종), 모든 후속 분기 기준. (~~handoff~~ 는 2026-04-29 폐기)
- **Step 1 TP3 제목+한줄의도** — IntentGuideField (가이드 박스 제거, placeholder만)
- **Step 2 TP4 레퍼런스+layer chip** — ReferencePicker + ReferenceLayerChipRow → T3 useLayers strict. system 모드면 `components` chip 추가 노출.
- **Step 3 활용 노트 (NEW)** — RefinementNotesField. 모드별 minLength 차등 (concept=0 / system=30). placeholder 도 mode 별 (system: spacing/elevation/primary CTA 힌트). T3 합성 HIGHEST PRIORITY 입력.
- **Step 4 분석** — T3 호출, AnalysisProgress (system 면 spacing/rounded/components 진행도 추가).
- **TP6 결정 추적** — ColorSwatchList / TypographyPreview / LayoutTokenPreview / GradientPreview 4개 모두 ❓ 펼침 → TokenDecisionTracePanel (출처 + 의도 매칭 + ✋ appliedUserNotes 인용 + 탈락 후보).

### ✅ 작동 중 — DESIGN.md 호환 (2026-04-29 신규)
- **T3 system 의 8-axis 토큰 산출**: color/typography/layout/gradient + **spacing/rounded/elevation/components** (concept 영향 0).
- **Token reference 문법 강제**: components 의 모든 값은 `{colors.<id>}` / `{typography.<id>}` / `{rounded.<scale>}` / `{spacing.<scale>}` / `{elevation.<id>}`. dangling/리터럴 검출기 `validateTokenRefs`. system 은 2-phase split call (core + designmd) + 1회 retry 후 fallback (components={}).
- **Export: DESIGN.md (Google Labs alpha spec)** — `buildDesignMd` (YAML front-matter 8축 + prose 8 canonical sections, gradient/elevation 은 `x-` vendor extension). `buildDecisionTraceMd` 도 함께 생성. system → "DESIGN.md ZIP" (DESIGN.md + DTCG + decision-trace.md + refs/) — 기존 handoff 모드의 ZIP export 까지 흡수.
- **max_tokens 16384** (Haiku 4.5, system 만). concept 은 1024 그대로.
- **DB 마이그레이션 0**: `analysis_results.layers` jsonb 자유형식 그대로 — 신규 키 추가만.

### ❌ 폐기됨
- **2026-04-28 — TP1 userIntent (업로드 시 chip)**: T1 은 이미지가 정보 원천이라 사용자 chip 답이 정확도 향상에 기여 안 함. TP4 와 다운스트림 가치 중복. 화면 변화 없는 chip 은 신뢰 손상.
- **2026-04-28 — TP5 AnalysisConfirmBox**: Step 3 하단 "분석 시작 →" 버튼이 곧 confirm 으로 흡수. 별도 step 불필요.
- **2026-04-29 — 모드 3 (`handoff` / 🎯 코드 직행)**: system 모드와 실질 차이 부족. system 이 ZIP export (DESIGN.md + DTCG + decision-trace + refs) 까지 흡수. `runAnalyzeHandoff` / `TASK_ANALYZE_HANDOFF` / `exportHandoffBundle` / `buildCursorRules` / scripts/cli-test/handoff.mjs 모두 삭제.

### ⚠️ 미완료 / 검증 필요
- **WizardContextBar (단계 컨텍스트 누적 카드)**: 각 step 상단 이전 결정 표시. 현재 미구현.
- **TP2/TP4/Step 3 실제 결과 차이 검증 안 됨**: AI Playground 에서 mode 2종 / userNotes 3 케이스 호출 비교 검증 필요.
- **DESIGN.md 호환 실측 검증**: scripts/cli-test/system.mjs — 6 케이스 (mode 2종 × 의도 3개) baseline 캡처는 사용자 실행 필요.
- **ProjectDetailPage 신규 4 axis 시각화**: spacing/rounded/elevation/components 토큰 미리보기 컴포넌트 — showcase (DesignMdPreview variant=showcase) 에서 일부 시각화 (color/typography/spacing/gradient + sample card). 나머지(rounded/elevation/components) 는 export 만 가능, 결과 화면 옵셔널 fallback 으로 깨짐 0.