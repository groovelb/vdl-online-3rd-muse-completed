---
session: 013
date: 2026-04-22
title: MUSE — 프리셋 JSON 통합 + keyVisual 레이어 제거 + visualDirection(MD) 도입 (Phase 1~3 실행)
---

# 013. MUSE — 프리셋 JSON 통합 + keyVisual 레이어 제거 + visualDirection(MD) 도입 (Phase 1~3 실행)

## 🎯 User Goal

> 세션 012에서 합의한 재설계 계획 중 Phase 1~3을 일괄 실행: (1) `muse_tags_preset.json` 기반 preset helper 인프라 구축, (2) Reference 스키마를 레이어별 중첩 태그 구조로 마이그레이션, (3) `keyVisual` 이미지 보드 레이어를 시스템에서 완전 삭제하고 `visualDirection`(Markdown + 집계 태그) 레이어로 교체, (4) T1 자동 태깅 AI 태스크를 레이어별 enum 강제 tool schema로 재설계.

## 🔑 주요 의사결정

- **keyVisual 전면 삭제 (사용자 결정 #1)**: 파일·레이어·컴포넌트·더미·UI 모두에서 제거. `KeyVisualBoard.jsx`와 story를 rm, 모든 참조를 `visualDirection`으로 교체. 잔존 `keyVisual` 문자열은 schemas/aiTasks/analysisResults의 **변경 이력 주석**에만 남김 (의도적 히스토리 마커).
- **T3 = 단일 호출 + 2 tool (`submit_tokens` + `submit_visual_direction`)**: 두 산출물을 같은 컨텍스트에서 받도록 강제해 토큰 수치와 MD 서술 간 일관성 보장. 비용도 분리 호출 대비 절반. `toolSchema` 단수가 아닌 `toolSchemas` 배열로 바뀐 점을 Playground 구현부에서 기억.
- **`flattenTags(ref)` 어댑터 헬퍼 도입**: `tags: string[]` → `tags: { color, typography, layout, gradient, visualDirection{...} }` 스키마 변경으로 ArchivePage/ReferencePicker/References.stories 등 "flat 배열" 가정 코드가 모두 깨짐. 호출 측을 파괴적 변경 없이 연결하려고 호환 어댑터 제공. 레이어별 필터 UI는 별도 Phase로 분리.
- **`renderVocabularyPrompt(layers)`로 preset description을 시스템 프롬프트에 주입**: enum만으로는 Claude가 "Muted vs Faded" 뉘앙스를 구별 못 함. 각 태그의 한글 description을 prompt caching 대상 시스템 메시지에 통째로 넣음. T1 input token이 ~1.2k → 1.8k로 증가하지만 caching으로 상쇄.
- **Reference 27건 태그를 결정적 패턴(`pickDeterministic`)으로 재생성**: `Math.random` 배제, `idx * prime % pool.length` 기반. seed 없이도 매 빌드 동일 결과 → 스토리/Playground 재현성 확보. 색 3개/타이포 2개/레이아웃 2개/그라디언트 0~1개/visualDirection 카테고리별 1개로 샘플링.
- **flat 필터 UI는 유지, 레이어 탭 UI는 Phase 5로 유예**: 사용자 "자동 해결" 결정에 따라 가장 작은 변경 단위로 수렴. 아카이브/ReferencePicker의 기존 검색·Chip 필터는 `flattenTags`로 호환 유지되므로 UI 파급이 0이 되는 선택.
- **visualDirection 렌더는 `<Box component="pre">` + Chip 조합**: `react-markdown` 같은 외부 라이브러리 도입 회피. 단순 pre+white-space로 충분하고, 상단에 카테고리별 태그 칩을 얹어 정보 밀도 유지. 필요 시 추후 라이브러리 교체 포인트 명시.

## 💬 Claude의 핵심 반응

- **파일 파급 분석 선행**: `grep -rln "keyVisual\|KeyVisualBoard"`로 17건 위치 먼저 확정하고 작업 순서 설계. 최종 검증 grep까지 포함해 누락 0 보장.
- **`tag/index.js` 헬퍼가 preset 소비 단일 창구**: `getLayerTags`, `getLayerEnum`, `getVisualDirectionTags`, `getTagDescription`, `renderVocabularyPrompt` 다섯 함수만 export. 이후 T1/T2/T3 어디서든 이 파일만 보고 어휘에 접근 → preset 업데이트 시 소비 지점이 자동 전파.
- **`analysisResults.js`의 `buildKeyVisuals` 함수를 통째로 제거하고 `VISUAL_DIRECTION_MD` 프리셋 4건으로 교체**: 프로젝트 의도와 태그를 반영한 실제 MD 샘플을 직접 작성해 넣음. Storybook에서 `MUSE/Data/AnalysisResults` 보면 바로 비주얼 디렉션 문서 4개 감상 가능.
- **`flattenTags`를 references.js에 공개 export로 둠 (helper는 `tag/index.js`가 아니라 `references.js`에 있음)**: 호환 어댑터 성격이라 tag preset이 아닌 Reference 데이터 모델 쪽에 속한다는 판단. 구버전 flat 배열도 통과시키는 2단 fallback 포함 (`Array.isArray(t)`).
- **JSDoc 코멘트까지 업데이트**: `ProjectDetailPage.jsx`와 `AnalysisProgress.jsx`의 docstring에서 "keyVisual" 문자열을 "visualDirection"으로 교체. 남긴 것은 schemas/aiTasks/analysisResults의 **파일 상단 변경 이력**만 (의도적 히스토리).

## 📂 변경된 파일

### 삭제 (2)

| 파일 | 이유 |
|------|------|
| `src/components/data-display/KeyVisualBoard.jsx` | 레이어 자체 폐기 |
| `src/components/data-display/KeyVisualBoard.stories.jsx` | 동일 |

### 신규 (1)

| 파일 | 요약 |
|------|------|
| `src/data/muse/tag/index.js` | preset helper (`getLayerTags`, `getLayerEnum`, `getLayerTagObjects`, `getVisualDirectionTags`, `getVisualDirectionTagObjects`, `getTagDescription`, `renderVocabularyPrompt`, `TOKEN_LAYERS`, `VISUAL_DIRECTION_CATEGORIES`) |

### 수정 (18)

| 파일 | 요약 |
|------|------|
| `src/data/muse/schemas.js` | `ReferenceLayeredTags`, `VisualDirectionLayer` typedef 신설. `AnalysisLayers.keyVisual` → `visualDirection` |
| `src/data/muse/references.js` | 27건 태그 중첩 구조로 결정적 재생성. `pickDeterministic`, `flattenTags` 유틸 |
| `src/data/muse/projects.js` | 변경 없음 (referenceIds 그대로 유효) |
| `src/data/muse/analysisResults.js` | `buildKeyVisuals` 제거, 프로젝트 4건 `VISUAL_DIRECTION_MD` 샘플 추가, `layers.visualDirection` 교체 |
| `src/data/muse/aiTasks.js` | T1 = 레이어별 enum tool schema + preset description prompt. T3 = 2 tool 패턴 (`toolSchema` → `toolSchemas`). visualDirection output 스키마 추가. `AI_WORKFLOW_DIAGRAM` 업데이트 |
| `src/data/muse/index.js` | barrel 재정리: `TAG_VOCABULARY` 제거, preset helper + `flattenTags` 추가 |
| `src/components/data-display/index.js` | `KeyVisualBoard` export 제거 |
| `src/components/templates/ProjectDetailPage.jsx` | 탭 리스트에서 keyVisual → visualDirection. MD 렌더러(`pre`) + 카테고리 태그 칩 추가. JSDoc 업데이트 |
| `src/components/templates/ProjectDetailPage.stories.jsx` | Minimal 샘플 `keyVisual: []` → `visualDirection: { markdown, tags }` |
| `src/components/templates/ProjectCreateWizard.jsx` | MUSE_LAYERS 마지막 항목 교체 |
| `src/components/templates/ArchivePage.jsx` | `flattenTags` import로 필터·검색·ImageCard tags 호환 |
| `src/components/templates/ReferencePicker.jsx` | 동일 |
| `src/components/overlay-feedback/AnalysisProgress.stories.jsx` | MUSE_LAYERS 교체 |
| `src/components/overlay-feedback/AnalysisProgress.jsx` | JSDoc 코멘트 교체 |
| `src/stories/muse/References.stories.jsx` | `flattenTags` 사용, 스키마 표의 tags 타입 설명 중첩 구조로 |
| `src/stories/muse/AnalysisResults.stories.jsx` | keyVisual 이미지 썸네일 줄 → visualDirection MD 프리뷰 + 태그 칩 |
| `src/stories/muse/AIPlayground.stories.jsx` | T1 결과 UI를 5 레이어(color/typography/layout/gradient/vd.{genre,style,subject})별 Chip 그룹으로 |
| `docs/muse/02-ux-flow.md` | 레이어 리스트 "키비주얼" → "비주얼 디렉션(MD)", 컴포넌트 리스트 F 그룹의 `KeyVisualBoard` → `visualDirection 렌더러(내장)` |
| `.claude/skills/component-work/resources/components.md` | `KeyVisualBoard` 항목 삭제 |

## 🧩 컴포넌트 작업

- **삭제**: `KeyVisualBoard`
- **수정**: `ProjectDetailPage`(visualDirection 탭 + MD 렌더 내장), `ProjectCreateWizard`(레이어 라벨), `ArchivePage`·`ReferencePicker`(flattenTags 어댑터), `AnalysisProgress`(JSDoc)
- **신규(데이터·헬퍼만)**: 코드 컴포넌트 신규는 없음. `tag/index.js` helper + `flattenTags` 어댑터만 추가

## ✅ 최종 결과

- MUSE 5 레이어가 이제 `color / typography / layout / gradient / visualDirection` 으로 통일.
- Reference 27건 tags가 preset 어휘 기반 중첩 객체로 재생성되어 `MUSE/Data/References`에서 레이어별 태그 구조 확인 가능.
- T1 자동 태깅 tool schema가 레이어별 `enum` + `visualDirection` 중첩 서브카테고리를 강제 → Playground 재호출 시 어휘 위반이 원천 불가.
- T3 aiTasks 정의가 단일 호출 2 tool 패턴으로 전환. 실제 호출 코드(`museAi.js`)에서 `toolSchemas` 배열로 전달하도록 Playground 구현은 Phase 4에서.
- `keyVisual`·`KeyVisualBoard` 문자열 잔존은 history 주석뿐 (schemas/aiTasks/analysisResults 상단).

## 🔁 재현 가이드

1. **영향 범위 먼저 grep**: `grep -rln "oldName\|OldComponent" src docs .claude` — 파일 17건 확정 후 순서 설계.
2. **Preset helper부터**: `src/data/muse/tag/index.js`에 `getLayerTags/getLayerEnum/getVisualDirectionTags/getTagDescription/renderVocabularyPrompt` 5함수 + 상수 `TOKEN_LAYERS`, `VISUAL_DIRECTION_CATEGORIES`. preset 소비는 이 창구로만.
3. **Schema 변경 → Data 재생성 → AI 태스크 → UI 호환 → 문서 순서**. 역순으로 가면 중간에 깨짐.
4. **데이터 마이그레이션은 결정적 패턴**: `Math.random` 금지. `pickDeterministic(pool, idx, count, step)` 같은 헬퍼로 `idx * prime % pool.length` 방식. Storybook 재현성 보장.
5. **호출 측 호환 어댑터**로 파괴적 변경 최소화: `flattenTags(ref)` 같은 helper를 둬서 기존 flat 배열 가정 코드를 수정 없이 통과시키고, 새 UI(레이어 탭 필터 등)는 별도 Phase에서 추가.
6. **AI 태스크 정의 변경 시 3군데 동기화**: aiTasks.js (정의), `02-ux-flow.md` (시나리오·Mermaid 노드 라벨), Playground 스토리 (결과 렌더 UI). 한 군데라도 빠뜨리면 "프롬프트 vs 실제 동작" 이 어긋나 디버그 난이도 급상승.
7. **잔존 참조 grep으로 검증**: 작업 마지막에 다시 `grep`. `history comments`는 의도적으로 남기고, 라이브 코드/docstring만 교체.

> 💡 핵심 포인트:
> - **레이어 개수 보존이 우선, 성격 교체는 자유롭게**: 5 레이어 시스템을 유지하면서 마지막 레이어의 "이미지 집합 → Markdown 문서" 성격 교체. 레이어 개수 자체가 바뀌면 UI 탭·스토리·진행 인디케이터 모두 흔들림.
> - **Preset 어휘는 enum + description 조합으로 프롬프트에 주입**: enum은 기계 검증, description은 모델 이해. 둘 중 하나만 있으면 어휘 준수하되 의미 혼동 or 자유롭되 enum 위반.
> - **Tool use의 다중 tool 패턴**: `tools: [A, B]`로 주고 시스템 프롬프트에서 "둘 다 호출하라"고 명시. 단일 컨텍스트에서 두 산출물을 받아 **일관성**(수치 토큰과 서술 MD의 톤 매칭)을 유지. 분리 호출은 비용·컨텍스트 모두 손해.
> - **어댑터 헬퍼로 파괴적 변경 흡수**: 스키마가 변경될 때마다 모든 소비 지점을 수정하면 한 번에 너무 많은 변화가 코드에 섞인다. 한 turn에 "데이터 모델 변경 + 어댑터 제공"으로 묶고, 진짜 UI 업데이트는 별도 phase로 분리.
