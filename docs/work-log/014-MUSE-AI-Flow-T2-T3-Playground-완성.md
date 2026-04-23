---
session: 014
date: 2026-04-22
title: MUSE — AI Flow 완성 (T2 Recommend + T3 Analyze 2-tool Playground + TAG_VOCABULARY 잔존 버그 수정)
---

# 014. MUSE — AI Flow 완성 (T2 Recommend + T3 Analyze 2-tool Playground + TAG_VOCABULARY 잔존 버그 수정)

## 🎯 User Goal

> Phase 1~3 완료 이후 "flow 완성에 집중" 지시에 따라 T2 · Recommend와 T3 · Analyze Tokens + Visual Direction Playground를 일괄 구현. 실제 Claude API 라이브 호출로 **end-to-end 파이프라인(T1 → T2 → T3)이 Storybook에서 클릭만으로 돌아가는 상태** 목표. 도중 발견된 `TAG_VOCABULARY` 잔존 import 런타임 에러도 함께 해결.

## 🔑 주요 의사결정

- **Flow 완성 우선, 품질 튜닝·골든셋은 후순위**: 자동 검증 래퍼, 골든 비교, 배치 태깅 등은 "완성된 flow 위에서" 반복 가능. 먼저 3 스토리가 한 턴에 돌아가는 가시성부터 확보.
- **T3는 `tool_choice: { type: 'any' }` + 2 tool 단일 호출**: 시스템 프롬프트에서 "두 tool 모두 호출하라" 명시 + `any` 로 강제하지 않고 자유 선택 허용. 그래도 Claude가 둘 다 호출하도록 유도하는 게 `tool`(단일) 지정보다 유연. 응답 파싱은 `extractAllToolInputs(response)` 새 헬퍼가 content blocks를 훑어 `{ submit_tokens, submit_visual_direction }` map으로 반환.
- **T3 이미지는 클라이언트에서 1024px 리사이즈**: `resizeDataUrl(dataUrl, 1024)` canvas 기반. Payload 크기 2~5배 절감 → 비용/레이턴시 개선, token 한도 안정. 원본 크기 유지는 품질 체감 차이가 거의 없고 비용만 커짐.
- **T3 최대 4장 UI 강제**: `toggleSelect`에서 `size < 4` 체크. Sonnet × 이미지 5장 이상이면 단일 호출 토큰 한도 근접 + 비용 급증. 초기 테스트 스코프 고정.
- **T3 결과를 기존 MUSE 프리뷰 컴포넌트에 직접 바인딩**: `submit_tokens` output(`{color, typography, layout, gradient}`)을 `ColorSwatchList` / `TypographyPreview` / `LayoutTokenPreview` / `GradientPreview` 에 그대로 넣음. 토큰 스키마가 이미 이 컴포넌트 props와 일치하도록 설계된 덕 — preset 통합 과정에서 typography 토큰의 `variant` 필드를 의도적으로 포함시킨 설계가 여기서 값을 함.
- **`tool_choice: { type: 'tool', name }` (T2) vs `{ type: 'any' }` (T3)**: T2는 tool이 하나뿐이라 강제, T3는 두 tool을 모두 받고 싶어서 any. T3에서 `{ type: 'any' }`를 써도 실제로는 Claude가 둘 다 호출하는 경향이 강하고, 하나라도 오면 partial 결과로 렌더 가능하게 했음.
- **`TAG_VOCABULARY` stale import는 에러 메시지의 경로/심볼을 기준으로 grep 1회로 바로 위치 확정**: 장황한 로그 해석 대신 `grep -rln "TAG_VOCABULARY" src` 로 위치 찾아 즉시 교체. `AITasks.stories.jsx`의 "공유 어휘" 섹션을 레이어별 어휘 블록(4 토큰 + 3 visualDirection 서브카테고리) 으로 자연스럽게 확장.

## 💬 Claude의 핵심 반응

- **T2 Playground UI를 인피니트 그리드가 아닌 **정적 auto-fill grid**로 유지**: 추천 결과는 5~10장 한정이라 무한 스크롤 불필요. `InfiniteMasonry` 재사용보다 단순 grid 한 덩어리가 디버그 용이 + 순위 배지(`#1`, `#2`) 오버레이 깔끔.
- **T3에서 사용자 메시지 구성을 "이미지 + 텍스트 힌트" 반복 패턴으로**: 각 이미지 block 바로 뒤에 `id + T1 tags + dominantColors` 텍스트 block을 교대로 삽입. Claude가 어떤 이미지가 어떤 id인지 혼동하지 않게 "이미지 ↔ 메타"를 물리적으로 인접 배치.
- **Playground의 프리뷰 컴포넌트 바인딩 onChange는 빈 함수**: T3 결과는 읽기 전용 시각화이므로 `onChange={() => {}}`. 실제 편집 UI는 `ProjectDetailPage`에서 이미 제공되므로 Playground에서는 시각 검증만.
- **Raw API response 블록을 여전히 접을 수 있게 제공**: 디버그 시 tool_use 블록 indexing·이름 확인에 필수. 성공 결과와 관계없이 항상 하단 노출.

## 📂 변경된 파일

### 수정 (3)

| 파일 | 요약 |
|------|------|
| `src/utils/museAi.js` | `extractAllToolInputs(response)` 헬퍼 추가 — content blocks에서 모든 tool_use 블록을 `{ [name]: input }` map으로 수집 |
| `src/stories/muse/AIPlayground.stories.jsx` | T2 · Recommend 스토리 신규 (intent/type/n/model + top-N 썸네일 그리드 + reason). T3 · Analyze Tokens + VD 스토리 신규 (reference multi-select 최대 4장 + 이미지 리사이즈 + 2 tool 파싱 + 프리뷰 컴포넌트 바인딩 + MD 렌더) |
| `src/stories/muse/AITasks.stories.jsx` | 구 `TAG_VOCABULARY` import 제거 → `TOKEN_LAYERS`, `VISUAL_DIRECTION_CATEGORIES`, `getLayerTags`, `getVisualDirectionTags` 로 교체. "공유 어휘" flat 섹션 → 레이어별 어휘 7개 블록(4 token + 3 vd 카테고리)으로 확장 |

## 🧩 컴포넌트 작업

코드 컴포넌트 변경 없음. 재사용:

- **재사용**: `ColorSwatchList`, `TypographyPreview`, `LayoutTokenPreview`, `GradientPreview` — T3 결과에 onChange 빈 함수로 바인딩
- **재사용(MUI)**: `TextField`, `Slider`, `Checkbox`, `Chip`, `Select`, `Alert`, `CircularProgress`

## ✅ 최종 결과

- `MUSE/AI Playground/` 사이드바에 `Health Check / T1 · Auto Tag / T2 · Recommend / T3 · Analyze Tokens + VD` 4 스토리 완비.
- T1 → T2 → T3 end-to-end 파이프라인이 Storybook에서 클릭만으로 돌아가는 상태. **사용자 테스트 완료 확인.**
- T3의 2 tool 동시 응답 파싱 안정. 결과 JSON이 그대로 MUSE 프리뷰 컴포넌트에 바인딩되어 토큰 레이어 4종을 시각적으로 즉시 확인 + visualDirection MD 본문 렌더.

## 🔁 재현 가이드

1. **stale import는 grep으로 즉시 확정**: 에러 메시지의 심볼(`TAG_VOCABULARY`)을 그대로 `grep -rln` — 5초 안에 위치 확정. 긴 로그 읽지 말 것.
2. **다중 tool 파싱 헬퍼는 단일 tool 헬퍼와 분리**: `extractToolInput(response, name)`(단일) + `extractAllToolInputs(response)`(전체 map). 둘 다 유지해 호출 측이 용도 선택.
3. **T2 Playground 패턴**:
   - archive를 `{ id, title, tags, dominantColors }` 로 압축 (이미지 없음)
   - `userMessageTemplate` placeholder 치환 후 `JSON.stringify(archive, null, 2)` 삽입
   - 결과는 `recommendedIds[rank]` + `reasons.find(r=>r.id===id)` 매칭으로 한 줄 근거 표시
4. **T3 Playground 패턴**:
   - 이미지 multi-select UI (최대 N 제한 `Set.size < 4`)
   - 각 이미지 → `imageUrlToBase64DataUrl` → `resizeDataUrl(_, 1024)` → `toImageBlock`
   - `content` 배열은 `[img, textHint, img, textHint, ..., finalInstruction]` 교대 배치
   - `tools: toolSchemas` + `tool_choice: { type: 'any' }`
   - `extractAllToolInputs(response)` 로 `{ submit_tokens, submit_visual_direction }` 분기
   - 각 output을 기존 프리뷰 컴포넌트 props에 그대로 바인딩 (onChange는 no-op)
5. **이미지 리사이즈는 canvas 기반 dataURL 재생성**: Image onload → canvas.drawImage → `toDataURL('image/jpeg', 0.85)`. JPEG 85% 품질로 충분.
6. **Flow 완성 후에 튜닝**: 자동 검증/골든셋/배치 태깅은 "3 스토리가 돌아가는" 기반 위에 추가. 순서 뒤집으면 뭐가 고장났는지 디버그 불가.

> 💡 핵심 포인트:
> - **Multi-tool response는 `extractAllToolInputs`로 map 형태 정규화**: 인덱스 순서에 의존하지 말고 tool name을 키로. Claude가 tool 호출 순서를 바꿔도 영향 없음.
> - **`tool_choice: 'any'` + 시스템 프롬프트 지시 조합**: 강제(`tool`)보다 유연하고, 실제로 모델이 양쪽 다 호출하는 경향이 강함. 하나만 와도 partial 결과 렌더 가능하게 UI 설계.
> - **이미지 API 호출 = 항상 리사이즈 먼저**: 원본 5~10MB 이미지를 그대로 보내면 토큰 한도 + 비용 + 레이턴시 3중고. 1024px/JPEG 85% 가 품질/비용 sweet spot.
> - **Playground는 읽기 전용 시각화로**: 편집 UX는 이미 ProjectDetailPage에 있음. Playground에서 편집까지 지원하면 두 군데 상태 동기화 문제가 생김. 역할 분리.
> - **Flow를 먼저, 평가는 나중**: MVP 단계에서 flow 완성이 평가 인프라보다 훨씬 가치가 큼. 평가 없이 눈으로 여러 번 돌려봐도 초기 품질 감은 충분히 잡힘.
