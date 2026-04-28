---
session: 031
date: 2026-04-28
title: MUSE 모드별 산출물 분리 — concept(웹프롬프트) + handoff(프레임워크 번들) 신설
---

# 031. MUSE 모드별 산출물 분리 — concept(웹프롬프트) + handoff(프레임워크 번들) 신설

## 🎯 의도 (User Goal)

T3 결과가 mode(concept/system/handoff) 와 무관하게 동일 schema(4 token + VD MD)였던 문제를 해결. 각 모드의 **목적·페르소나·산출물 형태**가 schema 차원에서부터 달라지도록 리팩토링. 예측 가능성 / 목적성 / 로직 안정성 확보.

## 🔑 주요 의사결정

- **mode = 사용 시나리오로 재정의**: concept = 웹챗(Claude/Gemini/ChatGPT)에 즉시 붙여넣을 800자 한글 프롬프트. handoff = 로컬 디자인 시스템 + 프레임워크 전환 가이드. system = 현행 유지(regression 0).
- **모드별 별도 task**: `TASK_ANALYZE_TOKENS` 는 system 전용으로 두고, `TASK_ANALYZE_CONCEPT` / `TASK_ANALYZE_HANDOFF` 신설. tool 이름·schema·system prompt 모두 분리.
- **단일 tool 강제**: 모든 신규 task 가 `tool_choice: { type: 'tool', name: ... }` 로 정확히 1번 호출 강제. 분할 호출 → merge 시 손실 위험 봉쇄.
- **자동 검증 + 1회 retry**: concept 은 길이 200-800 + HEX≥3 + 마크다운/토큰ID 부재. handoff 는 4 token 비어있지 않음 + 5 layerDetails 200자+. 실패 시 구체 에러 인스트럭션으로 재호출.
- **프레임워크 변환은 클라이언트 결정론적 함수**: Tailwind / MUI / DTCG / CSS vars / .cursorrules 를 LLM 이 코드로 작성하지 않음. tokens → 변환 함수로 생성 → 문법 오류 0 보장.
- **DB 스키마 변경 없이 layers jsonb 확장**: `layers.conceptPrompt` / `layers.layerDetails` 를 jsonb 자유 형식으로 추가. 마이그레이션 불필요.

## 💬 Claude의 핵심 반응

- 두 tool(`submit_tokens` + `submit_visual_direction`) → 단일 tool(`submit_design_system`/`submit_concept_prompt`/`submit_handoff_bundle`) 통합 권장. 모델 분할 호출에 의한 layer 누락 봉쇄.
- 변환 코드 LLM 생성 반대 — 결정론적 변환 함수가 안정성·검증 가능성에서 우월.
- system 모드는 동작 그대로 유지 권장. 4 layer + decisionRationale 가정 가진 기존 코드 surface 보호.

## 📂 변경된 파일

| 파일 | 종류 | 요약 |
|------|------|------|
| `src/data/muse/aiTasks.js` | 수정 | `TASK_ANALYZE_CONCEPT` / `TASK_ANALYZE_HANDOFF` 신규. 단일 tool schema. system prompt mode-specific. |
| `src/data/muse/index.js` | 수정 | barrel export 2개 추가 |
| `src/utils/museAiTasks.js` | 수정 | `runAnalyzeConcept` / `runAnalyzeHandoff` 추가. 검증 + retry 1회. |
| `src/utils/handoffConverters.js` | 추가 | DTCG/Tailwind/MUI/CSS-vars/.cursorrules/DESIGN_SYSTEM.md 결정론적 변환기 |
| `src/utils/museExport.js` | 수정 | `exportConceptPrompt` (.md) + `exportHandoffBundle` (ZIP) + `exportProjectAsZip` mode 분기 |
| `src/pages/ProjectCreateRoute.jsx` | 수정 | onAnalyze / onComplete mode 분기. layers 형태도 mode 별 |
| `src/components/templates/ProjectDetailPage.jsx` | 수정 | concept 단일 prompt 박스 + 복사/다운로드. handoff 5 layer 한글 상세 + 프레임워크 5 탭 미리보기 |

## 🧩 컴포넌트 작업

- **수정**: `ProjectDetailPage` — mode별 렌더 3분기 (concept / handoff / system).
- **재사용**: `CategoryTab`, `SplitScreen`, `Button`, `Dialog`, MUI 표준.
- **신규 유틸 모듈**: `handoffConverters.js` (컴포넌트 아님, 변환 함수 6개).

## 🧪 산출물 매트릭스

| Mode | Tool | 출력 | 상세 페이지 | Export |
|---|---|---|---|---|
| concept | `submit_concept_prompt` | `{ prompt: 200-800자 }` | 단일 박스 + 복사 / .md 다운로드 | `.md` 단일 |
| system | `submit_design_system` | `{ tokens, visualDirection }` | 4 layer 탭 + Split | ZIP (universal JSON) |
| handoff | `submit_handoff_bundle` | `{ tokens, visualDirection, layerDetails }` | 토큰 + layer 한글 상세 + 프레임워크 5탭 | ZIP (DTCG + 4 framework + .cursorrules + DESIGN_SYSTEM.md) |

## ✅ 최종 결과

3 모드 모두 빌드 통과 (1.09MB gzip). concept 모드 검증: 800자 prompt → 클립보드 복사 / .md 다운로드 동작. handoff 모드 검증: 미리보기 5 탭 즉시 전환 + ZIP 번들 6개 파일 + frameworks/ 3개 + references/ 동봉.

## 🔁 재현 가이드 (교육생용)

1. **`aiTasks.js` 에 새 task 추가**: `TASK_ANALYZE_CONCEPT` 정의 — id, model, systemPrompt(5 band 자연어 강제 + 마크다운 금지), userMessageTemplate, toolSchemas (단일 tool, schema { prompt: string minLength 200 maxLength 800 }), barrel export.
2. **`museAiTasks.js` 에 호출 함수 추가**: `runAnalyzeConcept({intent, selectedRefs, userNotes})` — `tool_choice: {type:'tool', name:...}` 강제, 검증(길이/HEX/마크다운부재), 실패 시 1회 retry.
3. **`ProjectCreateRoute` 의 onAnalyze / onComplete 에 mode 분기**: `if (mode==='concept') runAnalyzeConcept` / `if (mode==='handoff') runAnalyzeHandoff` / else system 기존 흐름. layers 저장 형태도 mode별 (concept→`{conceptPrompt}` / handoff→`{...tokens, layerDetails}`).
4. **변환 함수 작성** (`handoffConverters.js`): tokens 입력 → `buildDtcgTokens` / `buildTailwindConfig` / `buildMuiTheme` / `buildCssVariables` / `buildCursorRules` / `buildDesignSystemMd` 6개. 모두 순수 함수, 사이드이펙트 없음.
5. **`ProjectDetailPage` 에 mode 분기 렌더**: `isConceptMode` 면 단일 prompt 박스, `isHandoffMode` 면 layer 탭 + 한글 상세 + 프레임워크 5탭 + 복사 버튼.
6. **`museExport.js` 분기**: `exportProjectAsZip` 진입부에서 `project.mode` 검사 후 `exportConceptPrompt` (.md) / `exportHandoffBundle` (ZIP) / 기본 universal ZIP 으로 라우팅.

> 💡 핵심 포인트: **mode 분기는 system prompt 텍스트가 아니라 tool/schema/검증 차원에서.** LLM 자율 해석에 맡기지 말고 schema 가 강제. 변환 코드는 클라이언트 결정론적 함수로 → 형식 안정성·재현성 확보.
