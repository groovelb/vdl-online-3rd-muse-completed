---
session: 015
date: 2026-04-22
title: MUSE — 문서 동기화 + 상태 관리 레이어 + ArchivePage 업로드→T1 실연결
---

# 015. MUSE — 문서 동기화 + 상태 관리 레이어 + ArchivePage 업로드→T1 실연결

## 🎯 User Goal

> 세션 014까지 완성된 AI Playground는 돌지만, 실제 페이지 템플릿은 전부 더미 데이터. "프론트 작업할 로직까지 차례대로" 진행 지시에 따라 (A) 02-ux-flow.md 잔존 불일치 정리, (D) localStorage persist 가능한 상태 관리 레이어 신설, (B-1) ArchivePage의 FileDropzone → T1 자동 태깅 → store 반영 flow를 실제로 구현.

## 🔑 주요 의사결정

- **Zustand 등 새 의존성 배제, Context + useReducer 채택**: 추후 DB 연동으로 state 레이어가 교체될 가능성 높음 → 신규 npm 의존성 추가의 lock-in 비용 회피. `react-19` + `use*Slice` 훅 패턴으로 Zustand-스러운 API 유지하되 내부는 순수 React.
- **`STORAGE_KEY = 'muse_store_v3'` 버전 포함 키**: Reference.tags 스키마가 중첩 구조로 바뀌고 keyVisual→visualDirection 교체까지 있어 기존 localStorage 캐시는 불호환. 키에 `_v3` 붙여 구버전을 무효화. 이후 스키마 변경 시 숫자만 bump.
- **슬라이스 훅 4개 분리 (`useReferencesSlice`/`useProjectsSlice`/`useAnalysesSlice`/`useSettingsSlice`)**: 한 훅에서 전체 state를 반환하면 쓸데없는 re-render 확산. 슬라이스별 훅으로 소비점 명확 + 테스트 용이.
- **ArchivePage `useStoreMode` prop으로 **듀얼 모드** 운영**: 기존 스토리(외부 references 주입)는 그대로 유지. 새 "StoreMode" 스토리에서만 store 사용. Rules of Hooks 준수 위해 훅은 항상 호출하고 값만 조건 소비.
- **업로드 flow는 Pending → T1 → Patch 3단계**: (1) 즉시 `_pending: true` Reference를 store에 push → 썸네일 2초 이내 노출, (2) 백그라운드 `runAutoTag()` 호출, (3) 성공 시 `updateReference({tags, dominantColors, title, _pending: false})`. 실패 시 `_tagError` 플래그만 달아 수동 폴백 여지.
- **Playground의 T1/T2/T3 호출 로직을 `src/utils/museAiTasks.js`로 승격**: 기존엔 `AIPlayground.stories.jsx`에 인라인으로 박혀 있었음. Archive/Wizard 등 페이지에서 재사용 필요 → 범용 래퍼 `runAutoTag` / `runRecommend` / `runAnalyzeTokens` 3 함수 추출. Playground 스토리도 이후 이 래퍼로 일원화 가능 (본 세션에선 페이지만 우선 사용).
- **이미지 리사이즈 헬퍼 `resizeDataUrl`를 `museAi.js`에 공개**: Playground T3 스토리에 로컬로 있던 canvas 리사이즈 로직을 상향 추출해 ArchivePage 업로드 pipeline에서도 동일 하게 사용. 긴 변 1024px + JPEG 0.85 품질.

## 💬 Claude의 핵심 반응

- **`require('../../store')`를 이용한 조건부 import 실수 발견 즉시 수정**: Vite ESM 환경에서 `require`는 런타임 에러. 훅은 최상위에서 무조건 호출하고 값 소비만 조건 분기로 전환. Rules of Hooks 준수.
- **업로드된 이미지도 `src/data/muse/dummyImage/` 가 아닌 data URL로 localStorage에 저장**: 리사이즈된 JPEG를 `thumbnailUrl`에 data URL로 직접 넣음. Vite bundle URL은 업로드 이미지에 적용 불가. Storage 용량은 리사이즈 덕에 장당 ~100~200KB, 수십 장까진 안전.
- **`saveToStorage` try/catch로 조용한 실패**: localStorage quota 초과(~5MB) 시 에러 대신 무시. 업로드가 많아져 용량 초과하면 "그냥 persist가 안 될 뿐" 앱은 계속 동작. 추후 IndexedDB 전환 검토 여지.
- **"Store 초기화 + 새로고침" 버튼을 StoreMode 스토리 하단 고정**: 테스트 중 상태를 리셋하고 싶을 때 DevTools 열지 않고 바로 클릭. `resetMuseStore()` + `window.location.reload()` 조합.
- **pending/error 상태 시각화를 ImageCard 외부 오버레이로**: `ImageCard` props에 state를 넣으면 API가 지저분해짐 → `<Box sx={position: absolute}>` 오버레이로 ArchivePage 안에서 처리. ImageCard는 순수 상태 유지.

## 📂 변경된 파일

### 신규 (3)

| 파일 | 요약 |
|------|------|
| `src/store/museStore.jsx` | Context + useReducer + localStorage persist. 4 슬라이스(references/projects/analyses/settings) + Provider + 슬라이스 훅 + `resetMuseStore` |
| `src/store/index.js` | barrel |
| `src/utils/museAiTasks.js` | `runAutoTag`/`runRecommend`/`runAnalyzeTokens` 태스크 실행 래퍼 — museAi.js 클라이언트 + aiTasks.js 정의 조합 |

### 수정 (6)

| 파일 | 요약 |
|------|------|
| `docs/muse/02-ux-flow.md` | AnalysisResult/AI 태스크 표/품질 평가 표/참조 블록/CategoryTab 설명의 `keyVisual` · `TAG_VOCABULARY` 잔존 문자열 6곳 교체 |
| `src/utils/museAi.js` | `fileToDataUrl(file)`, `resizeDataUrl(dataUrl, maxDim)` 공개 추가 |
| `src/App.jsx` | `<MuseStoreProvider>` 최상위 래핑 |
| `.storybook/preview.jsx` | decorator에 `<MuseStoreProvider>` 래핑 |
| `src/components/templates/ArchivePage.jsx` | `useStoreMode` prop 추가. 훅 항상 호출 + 값만 조건 소비. 업로드 flow: Pending → T1 → Patch. pending/error 오버레이 렌더 |
| `src/components/templates/ArchivePage.stories.jsx` | `StoreMode` 스토리 신규 (업로드+태깅 실동작 체험), Store 초기화 버튼 오버레이 |

## 🧩 컴포넌트 작업

- **수정**: `ArchivePage` — 듀얼 모드 운영, 업로드 pipeline 추가. 공통 컴포넌트(`FileDropzone`/`ImageCard`/`InfiniteMasonry`) API는 불변, 페이지 레이어에서만 조립.

## ✅ 최종 결과

- `Page/ArchivePage/StoreMode` 스토리 기준 end-to-end 검증 가능:
  - 기존 27장 더미가 store에 hydration되어 즉시 렌더
  - 이미지 드래그앤드롭 → 2초 이내 썸네일 → 백그라운드 T1 → tags/colors/title 자동 채움
  - 새로고침해도 업로드한 이미지·태그 유지 (localStorage)
  - "Store 초기화" 버튼으로 더미 상태 리셋
- 시나리오 1의 성공 조건(썸네일 2초 이내 + 태그 비동기 채움) 충족.
- 다음 턴 B-2/B-3/B-4 작업의 **데이터 계층 기반** 완비.

## 🔁 재현 가이드

1. **문서 동기화 먼저**: 스키마/데이터가 변경되었을 때 `grep -n` 으로 잔존 옛 문자열 검출 → 즉시 치환. 새 기능 추가 전에 문서-코드 일치.
2. **상태 레이어는 의존성 제로로**:
   - `createContext` + `useReducer` + `useEffect(persist)` 3종 세트로 충분
   - 슬라이스별 훅 분리 (`use*Slice`) — 한 훅에 몰아넣지 말 것
   - `STORAGE_KEY`에 버전 suffix → 스키마 변경 시 숫자만 bump
   - `saveToStorage`는 try/catch로 조용히 실패 (quota 초과 대비)
3. **듀얼 모드 패턴**: 기존 스토리 호환 유지하려면 페이지 컴포넌트에 `useStoreMode` boolean prop 추가. Hook은 항상 호출, 값만 조건 소비.
4. **업로드 → AI 3단계**:
   - `fileToDataUrl` → `resizeDataUrl(1024)` → 즉시 `addReference({ _pending: true })`
   - 백그라운드 `runAutoTag({ imageUrl })`
   - 성공 → `updateReference({ tags, dominantColors, title, _pending: false })`
   - 실패 → `updateReference({ _pending: false, _tagError: msg })`
5. **AI 태스크 래퍼는 utils로**: `museAiTasks.js` 에 `runAutoTag/runRecommend/runAnalyzeTokens` 3 함수 두고, 페이지·Playground 양쪽에서 이 래퍼 공유. 인라인 호출 금지.
6. **실험용 초기화 버튼 제공**: 상태 관리 도입하면 "의도된 리셋" 경로 필요. DevTools 의존 금지.

> 💡 핵심 포인트:
> - **상태 레이어 도입은 "의존성 vs 유지보수" 저울**: Zustand 같은 라이브러리는 편리하지만 DB 연동 등 앞으로 레이어가 크게 바뀔 예정이면 순수 React가 더 가벼움. Context + useReducer로도 슬라이스 훅만 잘 나누면 Zustand와 거의 동일한 개발 경험.
> - **업로드 UX는 "optimistic + background" 2단계 분리**: 즉시 썸네일 노출 → 백그라운드 태깅. 태깅을 기다리게 하지 않으면 2초 기준 달성.
> - **훅은 항상 호출, 값만 조건 소비**: `useStoreMode` 같은 flag로 훅 호출을 건너뛰면 Rules of Hooks 위반. 훅 반환값을 쓰지 않고 버리는 비용은 거의 0.
> - **persist 키의 버전 suffix는 무료 안전장치**: 스키마 변경마다 bump하면 구버전 캐시가 자동 무효화되어 "왜 앱이 이상하게 뜨지" 같은 debug 지옥 방지.
> - **AI 태스크 로직은 Playground 인라인에서 빼고 utils로**: 재사용 필요성이 가장 크다. 한 곳에서 관리하면 프롬프트 튜닝·모델 교체·재시도 정책이 한 군데 집중.
