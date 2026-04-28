---
session: 025
date: 2026-04-27
title: MUSE — Phase 2 시작. 색상필터 UX 개선 + 레퍼런스 디테일 모달 + AI Tasks 스토리북 재구조화
---

# 025. MUSE — Phase 2 시작. 색상필터 UX 개선 + 레퍼런스 디테일 모달 + AI Tasks 스토리북 재구조화

> CHECKPOINT-001 (MUSE Foundation 완료) 직후 첫 세션. 본 세션은 UX 폴리싱 + AI 파이프라인 문서화 정합 작업.

## 🎯 의도 (User Goal)

> (1) Archive 색상 필터의 active 상태가 시각적으로 안 보이고 다중 선택 토글이 동작 안 하는 문제 해결, "모두 보기" 옵션 추가. (2) 카드 클릭 시 메타데이터 전체를 볼 수 있는 디테일 모달. (3) AI Tasks 스토리북(T1/T2/T3)을 "Input → Prompt → Output 데이터 형식 → UX → 데이터 모델" 3-섹션 구조로 재구조화하고 코드와 일치하는지 검증.

## 🔑 주요 의사결정

- **색상 필터 active state 강화 + hex casing 버그 fix**: `toggleColor`가 `hex.toLowerCase()`로 저장하는데 `REPRESENTATIVE_COLORS`는 대문자 hex라 `activeColors.includes(hex)`가 항상 false → border/badge/필터 모두 어긋남. 소문자 변환 제거. active border는 1px → 3px solid `primary.main` + 2px ring shadow로 강화. 모든 swatch에 항상 visible border 유지.
- **"모두 보기" swatch는 conic-gradient 원**: 색상 row 첫 번째 자리에 무지개 conic-gradient + 중앙 "All" 라벨. `activeColors.length === 0` 일 때 active border, 클릭 시 `onResetColors` (FilterPanel 신규 optional prop) 호출.
- **레퍼런스 디테일 모달은 fullScreen + 우측 메타 사이드**: 처음에 좌측 메타로 만들었다가 사용자 지시로 우측 사이드(`minmax(320px, 420px)`)로 이동. 배경은 `background.default` (테마), radius 0, 패딩 `md: 8`, 섹션 gap 5, h3 제목, color swatch 52px — 시원시원한 호흡. 의미 없는 메타(UUID `Reference · {id}`, `출처 unknown`)는 표시 안 함.
- **AI Tasks 스토리북 3-섹션 구조**: 기존 단일 dump 페이지를 ① 데이터 형식 요약(Input/Prompt/Output 3-column) → ① ½ Input 출처별 분류(사용자/DB/시스템/모델/콜백/받지 않음 카테고리) → ② UX 흐름 → ③ 관련 데이터 모델 순으로 재배치. Overview 합본 페이지는 기존 `TaskDetail` 유지(reference dump 용도).
- **IO 카드는 항목/설명/예시 3계층**: shape JSON 파서를 도입했다가 사용자 지시로 폐기 → 태스크별 IO 필드를 명시적 데이터로 작성 (`{ name, desc, example }`). 디자인 요소(컬러 코딩, step 원, 화살표 등)는 사용자 피드백으로 모두 제거하고 라벨 + 1px divider 한 줄로 미니멀 정리.
- **CHECKPOINT-001 분리 발행**: 010~024 누적 결과를 1장으로 압축한 마일스톤 문서를 별도 생성 (`CHECKPOINT-001-MUSE-Foundation-완료.md`). 오늘 작업이 새 Phase의 1번 세션이 되도록 분기점 명시. README에 `## 분기점 (Checkpoints)` 섹션 신설.

## 💬 Claude의 핵심 반응

재현에 영향을 주는 부분만:

- **시각화 디자인 과욕 금지**: IO 컬럼 강화 시 컬러 코딩 + step 번호 + 화살표 + 부제까지 추가했다가 사용자 강한 피드백("씨발것 디자인은 왜 좆같이 만드냐!! 시키는것만해!!!!!!1")으로 전부 롤백. 이후 "라벨 + divider"만 유지. **요청 범위를 정확히 지키고 디자인 가산점 제안 금지.**
- **불일치 검증은 코드 grep 우선**: 스토리북 카피 작성 후 사용자 요청으로 실제 코드와 대조 → 6가지 불일치 발견 (T1 모델: Sonnet→Haiku, T1 출력 범위: tags only→tags+dominantColors+title+extracted, T3 호출 시점 잘못 기재, T2 output shape, T3 절감폭 2.5배→6배, T1 재시도 횟수). 모두 정정.
- **"이미지 분석은 T1뿐"의 코드 검증**: `toImageBlock` 호출처 grep → `museAiTasks.js:52` 단 1곳(`runAutoTag`)만 사용. T2/T3는 import조차 없음. 이 검증으로 사용자가 T1/T3 분리의 본질("T1=묘사, T3=종합")을 명확히 이해.
- **AITasks의 입력 분류표는 "받지 않음" 카테고리(error outlined)도 명시**: T1=intent 모름, T2=이미지 모름, T3=원본 이미지 안 봄. 이 명시가 시스템 이해의 핵심.

## 📂 변경된 파일

| 파일 | 종류 | 요약 |
|------|------|------|
| `src/components/templates/FilterPanel.jsx` | 수정 | "모두 보기" swatch 추가 + active border 3px solid primary.main + ring shadow + `onResetColors` optional prop |
| `src/components/templates/ArchivePage.jsx` | 수정 | `toggleColor` 의 hex.toLowerCase() 제거 (버그 fix), `resetColors` 추가, `detailTarget` state + ImageCard onClick → ReferenceDetailDialog 연결 |
| `src/components/overlay-feedback/ReferenceDetailDialog.jsx` | 추가 | fullScreen 다이얼로그. 좌측 이미지(원본비율 정가운데, padding md:10, max 1200/80vh) + 우측 메타 사이드(minmax 320~420px, padding md:8, gap 5). 활성 필터 태그/색상은 강조 표시 |
| `src/components/overlay-feedback/index.js` | 수정 | `ReferenceDetailDialog` barrel export |
| `src/stories/muse/AITasks.stories.jsx` | 수정 | T1/T2/T3 개별 스토리를 `StructuredTaskDetail` 신규 컴포넌트로 재배치 (IOPipelineSummary + InputBreakdown + UXExplanation + RelatedDataModel). 태스크별 큐레이션 데이터(TASK_COPY) 추가 — 코드 검증 후 정정된 카피 |
| `docs/work-log/CHECKPOINT-001-MUSE-Foundation-완료.md` | 추가 | 010~024 누적 결과 1장 요약. Phase별 7-stage + 시스템 스냅샷 + 잔존 이슈 + 다음 분기점 시작 항목 |
| `docs/work-log/README.md` | 수정 | `## 분기점 (Checkpoints)` 섹션 신설 |
| `.claude/skills/component-work/resources/components.md` | 수정 | `ReferenceDetailDialog` 한 줄 등록 |

## 🧩 컴포넌트 작업

- **신규**: `ReferenceDetailDialog` (category: `overlay-feedback`)
- **수정**: `FilterPanel` (색상 swatch 강도 + onResetColors), `ArchivePage` (toggleColor 버그 + 디테일 모달 연결)
- **재사용**: `Dialog`, `IconButton`, `Box`, `Typography`, `Chip`, `Divider`, `Table*`, `ImageCard`

## 📚 스토리북 작업

- **재구조화**: `MUSE/AI Tasks` 의 T1/T2/T3 개별 스토리 — 새 4-섹션 구조 (① 데이터 형식 요약 / ① ½ Input 출처별 분류 / ② UX 흐름 / ③ 관련 데이터 모델)
- **신규 helper**: `IOPipelineSummary`, `FieldRows`, `InputBreakdown`, `UXExplanation`, `RelatedDataModel`, `StructuredTaskDetail`
- **데이터 큐레이션**: `T1_IO`/`T2_IO`/`T3_IO` (필드별 항목/설명/예시), `T1_INPUTS`/`T2_INPUTS`/`T3_INPUTS` (출처별 분류), `T1_UX`/`T2_UX`/`T3_UX`, `T1_DATA`/`T2_DATA`/`T3_DATA` — 모두 코드 검증 거친 후 정정된 값
- 보존: `Overview` 합본, `Workflow` 스토리는 기존 `TaskDetail` 그대로 — full schema dump 용도

## ✅ 최종 결과

- 아카이브 색상 필터: 다중 선택 토글 정상 동작, active state 명확, "모두 보기"로 색상 필터 일괄 해제
- 레퍼런스 카드 클릭 시: fullScreen 모달 열림 → 좌측 원본 이미지 / 우측 전체 메타(레이어 태그 + 비주얼 디렉션 + 대표 색상)
- AI Tasks 스토리북: T1/T2/T3 스토리에서 "Input → Prompt → Output 데이터 형식" 한눈 파악 + UX 흐름 + 데이터 모델까지 스크롤 1회로 이해 가능, 카피와 실제 코드 일치
- 검증: Storybook `MUSE/Archive`, `MUSE/AI Tasks` 에서 동작/표시 확인. dev `pnpm dev` 라우터에서 카드 클릭 → 모달 동작 확인

## 🔁 재현 가이드 (교육생용)

### 1. 색상 필터 hex casing 버그 fix
- `ArchivePage.jsx`의 `toggleColor`에서 `hex.toLowerCase()` 제거. `REPRESENTATIVE_COLORS`가 대문자 hex이므로 그대로 저장해야 `activeColors.includes(hex)` 매칭됨.

### 2. "모두 보기" swatch
- `FilterPanel.jsx`의 색상 row 첫 자리에 conic-gradient 원 + 중앙 "All" 라벨 박스. `activeColors.length === 0` 이면 3px primary border, 클릭 시 신규 `onResetColors` prop 호출.
- `ArchivePage`에서 `const resetColors = () => setActiveColors([])` 만들어 prop으로 전달.

### 3. 레퍼런스 디테일 모달
- `src/components/overlay-feedback/ReferenceDetailDialog.jsx` 생성. `Dialog fullScreen` + `PaperProps={{ sx: { borderRadius: 0, bgcolor: 'background.default' } }}`. grid 2-column: 이미지(좌, padding md:10) / 메타(우, minmax 320-420px, padding md:8). 모바일 stack.
- ArchivePage에 `detailTarget` state. ArchiveCard에 `onOpenDetail` prop 추가하고 ImageCard `onClick`에 연결. 페이지 하단에 `<ReferenceDetailDialog reference={detailTarget} onClose={() => setDetailTarget(null)} activeTags={activeTags} activeColors={activeColors} />`.
- 의미 없는 메타 표시 금지: `Reference · {id}` overline 제거, `source === 'unknown'` 이거나 빈 값이면 라인 자체 생략.

### 4. AI Tasks 스토리북 재구조화
- `src/stories/muse/AITasks.stories.jsx` 에 `StructuredTaskDetail` 신규 컴포넌트 작성. `IOPipelineSummary` + `InputBreakdown` + `UXExplanation` + `RelatedDataModel` 4-섹션을 `<Divider />` 로 구분.
- 각 태스크별로 `T*_IO` (input/output 필드 — 항목/설명/예시 3계층), `T*_INPUTS` (출처 카테고리), `T*_UX` (사용자 관점 흐름), `T*_DATA` (영향받는 스키마 + 어휘 + 저장 위치) 4개 데이터 객체 작성.
- T1/T2/T3 개별 스토리 export 의 render 에서 `<StructuredTaskDetail task={...} uxFlow={...} dataModel={...} inputs={...} io={...} />` 호출.

### 5. 코드-카피 일치 검증
- 스토리북 카피 작성 후 반드시 `museAiTasks.js`/`aiTasks.js` 와 대조. 특히:
  - T1/T2/T3 모두 `claude-haiku-4-5` (Sonnet 아님)
  - T1 출력 = `{ tags, dominantColors, title, extracted }` (extracted 까지!)
  - T3 = text-only, `selectedRefs` 메타만 받음 (`thumbnailUrl` 안 보냄)
  - `toImageBlock` grep 으로 vision 사용처 단 1곳(T1) 확인

### 6. 분기점 마커 발행
- 누적 세션 요약은 `docs/work-log/CHECKPOINT-{NNN}-{slug}.md` 형식의 별도 파일로. 일반 work-log 번호와 충돌 안 하게 prefix 사용.
- README의 `## 분기점 (Checkpoints)` 표에 한 줄 인덱싱.

> 💡 핵심 포인트:
> 1. **REPRESENTATIVE_COLORS 는 대문자 hex** — 비교 시 toLowerCase 하지 말 것 (양쪽 다 안 하면 자연 일치).
> 2. **이미지 분석은 T1 단 한 번** — T3 가 또 vision 호출하지 않도록 `selectedRefs` 에서 `thumbnailUrl` 빼고 메타만 직렬화.
> 3. **디자인 요청 범위를 넘는 가산점 금지** — "구분해서 표시"는 라벨 + divider 한 줄로 충분. 화살표/색상/번호 원 추가는 별도 요청 있을 때만.
