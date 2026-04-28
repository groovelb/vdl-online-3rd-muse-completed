---
session: 029
date: 2026-04-28
title: MUSE — TP1 (레퍼런스 업로드 의도 chip) 폐기 + 관련 코드·문서 일괄 정리
---

# 029. MUSE — TP1 (레퍼런스 업로드 의도 chip) 폐기 + 관련 코드·문서 일괄 정리

> 028에서 일괄 구현된 TP1을 사용자와 깊이 논의 끝에 폐기 결정. 코드 4계층(데이터/프롬프트/호출/UI) + 문서 9개 모두 정리.

## 🎯 의도 (User Goal)

> 028 세션 종료 후 사용자가 "T1에서 사용자 의도 받는 거랑 자동 태깅이랑 어떻게 구분되는가" 질문. 디버깅 결과 **TP1 chip이 호출 시점에 userIntent를 못 받고 있음** (사후 표시 장식만 됨) 발견. 사용자가 "그럼 안 된 거잖아"로 분노. 단계적 수정 시도 → 완성 후 사용자가 "사용자 의도가 정말 태깅 정확도와 추후 활용도를 높이는가"라는 본질 질문. 검증 후 **TP1 자체를 폐기**하기로 결정 (A안). 관련 모든 잔재 제거.

## 🔑 주요 의사결정

- **T1은 이미지가 정보 원천**: vision LLM이 이미지에서 보이는 것만 추출 가능. userIntent는 메타라 "없는 정보를 만들어내지" 못함 → 태깅 정확도 향상 효과 미미. 양적 분포(palette 3~5 → 4~6)만 약간 변경, 정확도 X.
- **TP4 (레이어 chip)와 다운스트림 가치 중복**: T2 추천 / T3 합성에 영향 미치는 것은 TP4가 더 명시적·강제적으로 함. TP1은 같은 일을 두 번 묻는 셈.
- **사용자 신뢰 손상**: chip 답해도 카드 화면 변화 거의 0 → "이거 답해서 뭐 달라지나?" 도구 신뢰 떨어짐.
- **시점 자체가 틀림**: 의도는 "프로젝트 만들 때 (TP2 모드 + TP4 레이어)" 명확해지는 것. 레퍼런스 수집 시점에는 사용자가 "이걸 어디 쓸지" 모름.
- **A안 선택 (B안 거부)**: B안(개인 큐레이션 메타로 의미 재정의)은 검증 안 된 가설(아카이브 100장+ 단계에서 필터 가치). 27장 더미에선 가치 미미. 깨끗이 폐기하고 TP4/TP6 강화에 집중.
- **잔재 0 검증**: `grep -rln "userIntent\|UserIntentChipRow\|extractionRationale\|setUserIntent\|nextUploadIntent"` 결과 0건 확인.

## 💬 Claude의 핵심 반응

재현에 영향을 주는 부분만:

- **CLAUDE.md 에 Reporting Rules 신규 추가**: 사용자가 "축소·은폐 말고 그대로 보고하라"고 명시 요청 → CLAUDE.md 에 박힘. "준비됨 = 작동함"으로 동치시키지 말 것. 4계층(데이터/프롬프트/호출/UI) 통합 후 보고. 다음 세션부터 강제 준수.
- **검증 안 된 가설은 검증 후 폐기**: "사용자 의도가 태깅 정확도를 올린다"는 가설을 028에서 **검증 없이 코드로 옮긴 게 근본 실수**. 같은 패턴이 TP2 모드 분기 / TP4 useLayers strict 에도 잠재. 다음 세션에서 실제 호출로 검증 필요.
- **로드맵 문서 충실 ≠ 사용자 가치**: 04 로드맵 따라간 결과가 무가치 코드. 매 작업마다 "사용자가 답한 즉시 결과 차이를 보는가" 질문 선행.

## 📂 변경된 파일

### 🔧 코드 정리 (4계층)
| 파일 | 종류 | 변경 |
|------|------|------|
| `src/data/muse/aiTasks.js` | 수정 | T1 system prompt: USER INTENT 블록 + Extraction rationale 블록 제거. T1 tool schema: extractionRationale 필드 + rationale-presence quality 제거. T2 system prompt: userIntent 참조 모두 제거 (archive shape, system prompt 5단계 우선순위 정리) |
| `src/utils/museAiTasks.js` | 수정 | runAutoTag(userIntent) 인자 제거, intent suffix 로직 제거, max_tokens 768→512 원복. runRecommend compactArchive 에서 userIntent 제거 |
| `src/data/muse/schemas.js` | 수정 | UserIntentAspect / UserIntent typedef 제거, Reference.userIntent 필드 제거 |
| `src/data/muse/references.js` | 수정 | fixture userIntent 샘플 4건 제거 |
| `src/components/templates/useReferenceArchive.js` | 수정 | uploadOne userIntent 인자 제거, handleUploadFile/Files userIntent 제거, retryTagging userIntent 제거, setUserIntent 함수 export 제거 |
| `src/components/templates/ArchivePage.jsx` | 수정 | nextUploadIntent state 제거, dropzone 위 chip selector 제거, ArchiveCard 사후 chip 통합 제거, UserIntentChipRow import 제거 |
| `src/components/card/UserIntentChipRow.jsx` | 삭제 | TP1 chip 컴포넌트 |
| `src/components/card/UserIntentChipRow.stories.jsx` | 삭제 | 스토리 |
| `src/components/card/index.js` | 수정 | UserIntentChipRow barrel export 제거 |

### 📚 문서 정리 (9개)
| 파일 | 변경 |
|------|------|
| `CLAUDE.md` | Current Status 섹션 재구성: ✅ 작동 중 / ❌ 폐기 결정 / ⚠️ 미완료. Reporting Rules 신규 추가 (축소·은폐 금지) |
| `docs/research/04-ux-intervention-roadmap.md` | TP1 섹션 ❌ 폐기 + 사유 + 제거된 항목 명시. 작업 순서 표에서 TP1 제거 (총 6 → 5 TP). T1 시스템 프롬프트 명세 원복 |
| `docs/research/05-storybook-registration-plan.md` | TP1 행 폐기 표시 |
| `docs/muse/01-project-summary.md` | 핵심 기능 표에서 TP1 행 폐기 표시 (취소선) |
| `docs/muse/02-ux-flow.md` | 시나리오 1 원복 (chip 단계 제거), Mermaid 다이어그램 TP1 노드 + edge 제거, IA 트리에서 ★userIntent chip 제거, 데이터 모델 Reference 행에서 userIntent 제거, AI 태스크 인벤토리 T1 입력 정정 (TP1 폐기 명시), 핵심 설계 포인트 "6개 → 5개 입력 지점" |
| `src/stories/muse/References.stories.jsx` | schema 표에서 userIntent 행 제거 |
| `src/stories/overview/UXIntent.stories.jsx` | TOUCH_POINTS 첫 카드 폐기 표시 (취소선 + 사유) |
| `.claude/skills/component-work/resources/components.md` | UserIntentChipRow 한 줄 제거 |
| `docs/work-log/README.md` | 029 인덱스 추가 (이번 작업) |

## 🧩 컴포넌트 작업

- **삭제**: `UserIntentChipRow` (card)
- **수정**: `ArchivePage` (chip selector + 카드 사후 chip 모두 제거)
- 기타 컴포넌트는 영향 없음 (TP2 ModeSelectCard / TP4 ReferenceLayerChipRow / TP5 AnalysisConfirmBox / TP6 TokenDecisionTracePanel 그대로)

## ✅ 최종 결과

- `pnpm build` 통과
- `pnpm build-storybook` 통과
- 코드 잔재 grep 0건 (`userIntent / UserIntentChipRow / extractionRationale / setUserIntent / nextUploadIntent`)
- 4계층 모두 깨끗이 정리 — T1 은 이제 028 이전 원래 상태(자동 태깅만)
- 문서 9개 정정으로 "TP1 = 폐기"가 모든 진실 원천에 일관되게 박힘

## 🔁 재현 가이드 (교육생용)

### 1. 폐기 의사결정의 본질
- AI 의도 입력은 **"답한 즉시 결과 차이를 보는가"** 검증 후 도입
- 4가지 검증 질문:
  - (a) LLM이 입력 정보로 더 정확한 결과를 만드는가? (T1처럼 이미지가 원천이면 메타로는 한계)
  - (b) 다른 입력 지점과 가치가 중복되는가? (TP1↔TP4 중복)
  - (c) 사용자가 화면 변화로 효과를 인지하는가? (인지 못하면 신뢰 손상)
  - (d) 입력 시점이 사용자가 의도를 명확히 가질 수 있는 시점인가? (수집 시점은 X, 프로젝트 시점은 O)

### 2. 폐기 작업 체크리스트 (4계층 + 문서 + 검증)
- [ ] 데이터 모델: typedef + 스키마 필드 제거
- [ ] 시스템 프롬프트: 분기 블록 + 출력 필드 강제 + tool schema 제거
- [ ] 호출 함수: 인자 + 페이로드 주입 로직 제거
- [ ] UI 컴포넌트: 컴포넌트 + 스토리 파일 삭제, barrel export 제거, 사용처(페이지) 모두 정리
- [ ] fixture: 더미 샘플 제거
- [ ] 문서: 로드맵 / 스토리북 등록 plan / project-summary / ux-flow / 스토리북 schema 표 / Overview narrative / components.md / CLAUDE.md
- [ ] grep으로 잔재 0건 검증
- [ ] `pnpm build` + `pnpm build-storybook` 둘 다 통과

### 3. 재발 방지 — CLAUDE.md Reporting Rules 준수
- 작업 완료 보고 시 ✅ 준비 / ⚠️ 부분 작동 / ❌ 안 된 것 형식
- "준비됨 = 작동함" 동치 금지
- 4계층 통합 확인 후 보고

> 💡 핵심 포인트:
> 1. **검증 안 된 가설을 코드로 옮기지 말 것** — 028의 근본 실수
> 2. **AI 입력 지점 도입 전 4가지 검증 질문 적용** — 정확도 향상 / 중복 / 인지 / 시점
> 3. **폐기는 4계층 + 문서 + grep 검증까지** — 한 곳이라도 잔재 남으면 다음 세션에서 혼란
> 4. **CLAUDE.md Reporting Rules 가 다음 작업의 안전장치** — 이 작업의 가장 중요한 산출물
