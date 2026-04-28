---
session: 030
date: 2026-04-28
title: MUSE — Step 3 활용 노트 + Progressive Narrowing + TP5 폐기 + TP6 4 layer 통합
---

# 030. MUSE — Step 3 활용 노트 + Progressive Narrowing + TP5 폐기 + TP6 4 layer 통합

## 🎯 의도 (User Goal)

> 029 (TP1 폐기) 이후 사용자가 5-step 흐름 재설계 제안 — "모드 → 제목+의도 → 레퍼런스 → **상세 설명(레퍼런스 본 후 활용)** → 분석". Step 3 가 핵심. 레퍼런스 본 후의 명시 지시가 T3 합성에 직접 영향. TP1 실패 패턴(이미지가 정보 원천이라 메타 효과 X) 과 정반대 — Step 3 는 사용자 답이 결과에 직접 반영됨. 모드별 minLength 차등으로 P1 비디자이너 마찰 ↓ + P2~P4 정밀.

## 🔑 주요 의사결정

- **Step 3 신규 도입 (Progressive Narrowing 핵심)**: 모드(L1) → 의도(L2) → 레이어 큐레이션(L3) → 활용 노트(L4) 4단계 narrowing. L4 가 가장 늦고 가장 구체적이라 T3 합성 HIGHEST PRIORITY. T3 system prompt 에 "L4 > L3 > L2 > L1" 우선순위 명시.
- **모드별 minLength 차등**: concept=0(스킵 가능, P1 진입 마찰 ↓), system=30, handoff=50+ref-id 권장. 단일 강제 흐름 → 페르소나별 자연 분기.
- **TP5 폐기**: Step 3 하단 [분석 시작 →] 버튼이 confirm 역할 흡수. 별도 step 불필요. AnalysisConfirmBox 컴포넌트 + 스토리 + barrel export + `COST_BY_MODE` 상수 모두 제거.
- **TP6 펼침 4 layer 통합**: ColorSwatchList 만 적용되어 있던 결정 추적 펼침 패턴을 Typography / Layout / Gradient Preview 3개에 추가. ProjectDetailPage 가 모든 preview 에 references prop 전달.
- **DecisionRationale.appliedUserNotes 신규**: optional 필드. L4 가 직접 영향 미친 토큰만 fragment 인용. TokenDecisionTracePanel 에 ✋ 줄 추가 (primary.50 배경 + border-left).
- **IntentGuideField 가이드 박스 제거**: Step 1 은 placeholder + helperText 만 유지 (maxLength 120). 가이드 박스는 Step 3 RefinementNotesField 로 집중 — 사용자 인지 부담 분산.
- **검증 우선순위 재정렬**: 사용자가 "디테일은 나중에 refine, 흐름·로직부터" 명시. Phase 0 검증(AI Playground 실호출 비교) 건너뛰고 흐름·로직 직진. CLAUDE.md Known Gaps 에 "TP2/TP4/Step3 실 결과 차이 검증 안 됨" 명시.

## 💬 Claude의 핵심 반응

재현에 영향을 주는 부분만:

- **TP1 폐기 패턴과 정반대 검증**: TP1 실패의 4가지 사유(이미지 원천 / TP4 중복 / 화면 변화 0 / 시점 모호) 를 Step 3 에 모두 적용해보면 4 가지 다 통과 — Step 3 는 사용자 답이 토큰에 박힘 (TP6 펼침에 ✋ 표시), 시점이 "본 다음" 이라 의도 명확.
- **AnalysisConfirmBox 의 자연 흡수**: Step 3 하단 [분석 시작 →] 버튼이 곧 사용자 입력 마지막 검증 + 분석 트리거. 별도 step + 별도 컴포넌트 불필요. 사용자 인지 부담 ↓.
- **모드별 차등이 가장 큰 단순화**: 5-step 보편 강제 → 페르소나별 자연 분기. P1 은 Step 3 스킵해 4-step처럼 작동, P2~P4 는 풀 활용. 단일 도구로 모든 페르소나 cover.

## 📂 변경된 파일

### 데이터 모델
| 파일 | 변경 |
|------|------|
| `src/data/muse/schemas.js` | `Project.userNotes` 추가, `DecisionRationale.appliedUserNotes` 추가 |

### AI 시스템
| 파일 | 변경 |
|------|------|
| `src/data/muse/aiTasks.js` | T3 input shape 에 `userNotes?` 추가, system prompt 에 "User Notes (Step 3, HIGHEST PRIORITY)" 블록 추가 + L4>L3>L2>L1 priority 명시 + decisionRationale 에 appliedUserNotes 출력 규칙 |
| `src/utils/museAiTasks.js` | `runAnalyzeTokens({userNotes})` 인자 추가, content payload 에 userNotes 동적 블록 주입 (10자 미만 시 fallback) |

### 컴포넌트
| 파일 | 종류 | 변경 |
|------|------|------|
| `src/components/input/RefinementNotesField.jsx` | 신규 | Step 3 활용 노트 textarea + 선택 ref 썸네일 + 가이드 박스. 모드별 minLength + placeholder 차등 |
| `src/components/input/RefinementNotesField.stories.jsx` | 신규 | 6 케이스 (Empty_Concept/Empty_System/Filled_System/Filled_Handoff/NoRefs/Disabled) |
| `src/components/input/IntentGuideField.jsx` | 수정 | 가이드 박스 제거, placeholder + helperText 만 (maxLength 120) |
| `src/components/input/index.js` | 수정 | RefinementNotesField barrel export |
| `src/components/data-display/TokenDecisionTracePanel.jsx` | 수정 | appliedUserNotes 줄 추가 (primary.50 배경 + ✋ + border-left) |
| `src/components/data-display/TypographyPreview.jsx` | 수정 | TP6 펼침 통합 (❓ + Collapse + TokenDecisionTracePanel + references prop) |
| `src/components/data-display/LayoutTokenPreview.jsx` | 수정 | TP6 펼침 통합 (동일 패턴) |
| `src/components/data-display/GradientPreview.jsx` | 수정 | TP6 펼침 통합 (동일 패턴) |
| `src/components/templates/ProjectCreateWizard.jsx` | 수정 | STEPS 라벨 변경 (확인→활용 노트), reducer SET_USER_NOTES 추가, isStep3Valid 모드별, Step 3 가 RefinementNotesField, [분석 시작 →] 버튼이 confirm 흡수, AnalysisConfirmBox import 제거, COST_BY_MODE 상수 제거 |
| `src/components/templates/ProjectDetailPage.jsx` | 수정 | 4개 token preview 에 references prop 전달 |
| `src/components/overlay-feedback/AnalysisConfirmBox.jsx` | 삭제 | TP5 폐기 |
| `src/components/overlay-feedback/AnalysisConfirmBox.stories.jsx` | 삭제 | 스토리 폐기 |
| `src/components/overlay-feedback/index.js` | 수정 | AnalysisConfirmBox barrel export 제거 |

### 라우트
| 파일 | 변경 |
|------|------|
| `src/pages/ProjectCreateRoute.jsx` | onAnalyze 가 `runAnalyzeTokens({userNotes})` 전달, addProject 에 userNotes 영속화 |

### 스토리북·문서
| 파일 | 변경 |
|------|------|
| `src/stories/overview/UXIntent.stories.jsx` | TOUCH_POINTS 재구성 — TP1/TP5 폐기 명시, Step 3 신규 카드, TP6 4-layer 통합 명시 |
| `docs/muse/01-project-summary.md` | 핵심 기능 표 13개 정리 — Step 3 행 신규, TP5 폐기 행, 구현 완료 상태 명시 |
| `docs/muse/02-ux-flow.md` | 시나리오 2 5-step 재구성, mermaid 다이어그램 갱신, 데이터 모델 Project.userNotes + appliedUserNotes 추가, AI 태스크 표 T3 입력 정정 |
| `docs/research/04-ux-intervention-roadmap.md` | TP5 폐기 표시, Step 3 (NEW) 섹션 추가 (모드별 minLength + T3 system prompt 추가) |
| `CLAUDE.md` | Current Status 재구성 — 5-step 작동 중 / TP1·TP5 폐기됨 / 미완료 (ThemeExportDialog 모드별, WizardContextBar, AITasks 스토리, 검증) |
| `.claude/skills/component-work/resources/components.md` | RefinementNotesField 등록, IntentGuideField 설명 갱신, AnalysisConfirmBox 한 줄 제거 |

## 🧩 컴포넌트 작업

- **신규**: `RefinementNotesField` (input)
- **수정**: `IntentGuideField` (가이드 박스 제거), `TokenDecisionTracePanel` (appliedUserNotes), `TypographyPreview`/`LayoutTokenPreview`/`GradientPreview` (TP6 펼침 통합), `ProjectCreateWizard` (5-step 재구성), `ProjectDetailPage` (references prop 전달)
- **삭제**: `AnalysisConfirmBox` (TP5 폐기)

## ✅ 최종 결과

- `pnpm build` 통과
- `pnpm build-storybook` 통과
- 4계층(데이터/시스템 프롬프트/호출/UI) 모두 Step 3 통합
- TP1·TP5 폐기 후 잔재 grep 0건
- 사용자가 wizard 완주: 모드 → 제목+의도 → 레퍼런스+layer → **활용 노트 (모드별 차등)** → 분석 → 토큰 카드 펼침에서 ✋ appliedUserNotes 인용 확인 가능

## 🔁 재현 가이드 (교육생용)

### 1. 데이터 모델
- `Project.userNotes` (string, optional) — Step 3 입력
- `DecisionRationale.appliedUserNotes` (string, optional) — L4 직접 영향 토큰의 fragment 인용 (10~30자)

### 2. T3 system prompt 핵심
```
Priority order: userNotes (L4) > useLayers (L3) > intent (L2) > mode (L1).
L4 conflicts with L2 → L4 wins.
appliedUserNotes: ONLY for tokens directly driven by L4. Do NOT echo across all tokens.
```

### 3. RefinementNotesField 모드별 minLength
- concept = 0 (스킵 가능)
- system = 30
- handoff = 50

### 4. 5-step Wizard
- Step 0: ModeSelectCard 3개
- Step 1: 제목 TextField + IntentGuideField (가이드 박스 없음)
- Step 2: ReferencePicker + ReferenceLayerChipRow
- Step 3: RefinementNotesField + [분석 시작 →] 버튼 (TP5 흡수)
- Step 4: AnalysisProgress

### 5. TP6 펼침 4 layer
- 같은 패턴 4개 컴포넌트 — useState + IconButton + Collapse + TokenDecisionTracePanel
- references prop 흐름: ProjectDetailPage → 각 Preview → TokenDecisionTracePanel (썸네일 inline)

### 6. AnalysisConfirmBox 폐기 시 처리
- 컴포넌트 + 스토리 파일 삭제
- overlay-feedback/index.js 의 export 제거
- ProjectCreateWizard 의 import + 사용처 제거
- COST_BY_MODE 같은 unused 상수도 함께 정리

> 💡 핵심 포인트:
> 1. **Step 3 = TP1 실패 패턴 정반대** — 사용자 답이 결과에 직접 반영, 시점이 "본 다음" 이라 의도 명확
> 2. **모드별 차등이 페르소나 cover** — concept(P1) / system(P2) / handoff(P3·P4) 자연 분기
> 3. **TP5 흡수 정당화** — Step 3 의 [분석 시작 →] 버튼이 곧 confirm. 별도 step 인지 부담 ↓
> 4. **TP6 4-layer 동일 패턴 반복** — TokenDecisionTracePanel 공유 컴포넌트 활용
> 5. **검증은 다음 단계** — AI Playground 에서 mode 3종 / userNotes 3 케이스 비교 검증 필요. 현재는 LLM 자율 분기에 의존
