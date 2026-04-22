---
session: 005
date: 2026-04-22
title: MUSE 컴포넌트 Phase 1~5 일괄 구현 (신규 12종 + ImageCard 확장)
---

# 005. MUSE 컴포넌트 Phase 1~5 일괄 구현 (신규 12종 + ImageCard 확장)

## 🎯 의도 (User Goal)

> `02-ux-flow.md`에 정의된 MUSE 컴포넌트들을 의존성 순(Phase 1 → 5)으로 실제 구현. 기반 수정 → 공통 primitive → 레이어별 프리뷰 → 프로젝트/분석 플로우 → Export까지 한 번에 완주.

## 🔑 주요 의사결정

- **의존성 순 Phase 1 → 5 빌드 순서**: 역할별 그룹 순이 아니라 "어느 컴포넌트가 어느 컴포넌트를 쓰는가"를 기준으로 정렬. 덕분에 위자드 단계에선 ReferencePicker가 이미 준비되어 80줄로 끝남.
- **`TokenListItem`을 primitive 슬롯 컴포넌트로**: 4개 레이어 프리뷰(Color/Typography/Layout/Gradient)가 동일 패턴 반복이라 공통 primitive를 먼저 만들고 좌측 `preview` 48×48 슬롯으로 시각만 주입. DRY 극대화 + 레이어 간 정렬 자동 일치.
- **`KeyVisualBoard`만 독립 구조**: 이미지 집합 성격이라 TokenListItem 행 UI 부적절. 카드 그리드 + pill 오버레이로 분리. emphasis도 3-button이 아닌 0→1→2 클릭 cycle로 단순화.
- **`InfiniteMasonry` sentinel을 Masonry 바깥에 배치**: CSS columns 기반 Masonry는 자식 요소의 high-level div도 컬럼 계산에 포함시키기 때문. sentinel은 Masonry sibling으로 내놓고 `isEnabled: !isLoading`으로 중복 호출 방지.
- **`ImageCard` 선택 링은 `outline`, `border`가 아님**: border는 레이아웃을 밀어내 grid에서 카드 크기가 흔들림. `outline`은 박스 바깥에 렌더되어 레이아웃 무영향.
- **`ProjectCreateWizard`는 `useReducer` + 경계면 콜백**: 단계/폼/선택/분석 상태가 엮여 있어 setState 여러 개보다 reducer가 명확. 외부엔 `onAnalyze(payload, updateLayers): Promise` 경계만 노출해 실제 AI 연동은 이 콜백 교체로 끝나게.
- **`serializeTheme`로 MUI createTheme JS 소스 직접 생성**: JSON.stringify는 `clamp()` 같은 CSS 함수 문자열과 JS 식별자 키 구분을 못함. 커스텀 직렬화로 function/Symbol/undefined 필터링 + 식별자 quoted 여부 판별.
- **기존 `templates/index.js` 깨진 export 정리**: `MediaGridGallery`, `UploadModal`이 barrel에 있는데 파일이 없어, 내 신규 barrel 추가 시 같이 깨질 위험. 범위 인접 작업이라 동시에 수정.
- **`data-display/` 폴더에 신규 barrel `index.js` 최초 생성**: 기존엔 Table.stories.jsx만 있는 빈 폴더였음. MUSE 토큰 프리뷰 5종 + primitive 1종을 모두 여기 배치해 카테고리 일관성 유지.

## 💬 Claude의 핵심 반응

- 구현 시작 전 **Phase별 의존성 순 계획서 제시** → "진행시켜" 한 마디로 일괄 진행 허가를 받음. 각 Phase 끝날 때마다 단순 완료 체크 + 다음 안내 + 중단 여지 제공.
- 신규 11개 컴포넌트라는 큰 범위지만 **코드 작업 중 시각 검증 요청 없이 일괄 진행**. 사용자 스타일이 단위 검증보다 "끝까지 일단 빌드"임을 반영.
- MUI 원시 컴포넌트로 대체 가능한 것은 **신규 생성 지양** — Masonry는 MUI를 wrapper, Dialog/Switch/ToggleButtonGroup/Checkbox 등은 그대로 사용.
- **파괴적 변경 회피**: `ImageCard` 기존 props 전부 유지하면서 `isSelectable`/`isSelected`/`onToggleSelect`만 추가. 기존 코드가 쓰던 호출부에 영향 없음.
- `components.md` 갱신을 phase마다 즉시 수행 — 다음 작업에서 신규 컴포넌트를 검색 가능하게.

## 📂 변경된 파일

### 신규 생성 (19건)

| 파일 | 요약 |
|------|------|
| `src/components/layout/useInfiniteScroll.js` | IntersectionObserver 기반 무한 스크롤 훅 |
| `src/components/layout/InfiniteMasonry.jsx` | MUI Masonry + sentinel + loading/empty/end 상태 |
| `src/components/layout/InfiniteMasonry.stories.jsx` | Default/InitiallyEmpty/EmptyState/ImageGallery |
| `src/components/data-display/TokenListItem.jsx` | 공통 primitive: preview/label/value/emphasis/on-off |
| `src/components/data-display/TokenListItem.stories.jsx` | Default/Disabled/ColorLayer/TypographyLayer/GradientLayer |
| `src/components/data-display/ColorSwatchList.jsx` | 컬러 레이어. `isGrouped` 옵션 |
| `src/components/data-display/ColorSwatchList.stories.jsx` | Default/Grouped |
| `src/components/data-display/TypographyPreview.jsx` | 실제 폰트 샘플 렌더 |
| `src/components/data-display/TypographyPreview.stories.jsx` | Default |
| `src/components/data-display/LayoutTokenPreview.jsx` | grid/spacing/container 3종 diagram |
| `src/components/data-display/LayoutTokenPreview.stories.jsx` | Default |
| `src/components/data-display/GradientPreview.jsx` | 실제 gradient 적용 스와치 |
| `src/components/data-display/GradientPreview.stories.jsx` | Default |
| `src/components/data-display/KeyVisualBoard.jsx` | 카드 그리드 + pill 오버레이 컨트롤 |
| `src/components/data-display/KeyVisualBoard.stories.jsx` | Default/Empty |
| `src/components/data-display/index.js` | barrel (신규, 6개 export) |
| `src/components/overlay-feedback/AnalysisProgress.jsx` | 레이어별 단계 + 전체 진행률 + 취소/재시도 |
| `src/components/overlay-feedback/AnalysisProgress.stories.jsx` | AllPending/InProgress/AllDone/WithError/Simulation |
| `src/components/overlay-feedback/ThemeExportDialog.jsx` | 복사 + 파일 다운로드 + 필수 토큰 경고 |
| `src/components/overlay-feedback/ThemeExportDialog.stories.jsx` | Default/Minimal/MissingRequired |
| `src/components/overlay-feedback/index.js` | barrel (신규, 2개 export) |
| `src/components/templates/ReferencePicker.jsx` | 탭 + 태그 필터 + 다중 선택 |
| `src/components/templates/ReferencePicker.stories.jsx` | Default/WithInfiniteScroll/ArchiveOnly/Empty |
| `src/components/templates/ProjectCreateWizard.jsx` | useReducer 기반 3-스텝 위자드 |
| `src/components/templates/ProjectCreateWizard.stories.jsx` | Default/ArchiveOnly |
| `src/utils/serializeTheme.js` | theme → `createTheme(...)` JS 소스 직렬화 유틸 |

### 수정 (6건)

| 파일 | 요약 |
|------|------|
| `src/components/card/ImageCard.jsx` | `isSelectable` / `isSelected` / `onToggleSelect` props 추가, 선택 링(outline) + Checkbox 오버레이 |
| `src/components/card/ImageCard.stories.jsx` | argTypes 정리 + Selectable/MultiSelectGrid/WithMediaPlaceholder 스토리 추가 |
| `src/components/layout/index.js` | InfiniteMasonry, useInfiniteScroll export 추가 |
| `src/components/templates/index.js` | 존재하지 않는 stale export(MediaGridGallery, UploadModal) 정리 + ReferencePicker, ProjectCreateWizard 추가 |
| `.claude/skills/component-work/resources/components.md` | 신규/수정 컴포넌트 9건 반영 (InfiniteMasonry, useInfiniteScroll, TokenListItem, ColorSwatchList, TypographyPreview, LayoutTokenPreview, GradientPreview, KeyVisualBoard, AnalysisProgress, ThemeExportDialog, ReferencePicker, ProjectCreateWizard, ImageCard 설명 확장) |

## 🧩 컴포넌트 작업

- **신규(11)**: `useInfiniteScroll` (훅), `InfiniteMasonry`, `TokenListItem`, `ColorSwatchList`, `TypographyPreview`, `LayoutTokenPreview`, `GradientPreview`, `KeyVisualBoard`, `AnalysisProgress`, `ReferencePicker`, `ProjectCreateWizard`, `ThemeExportDialog`
- **수정(1)**: `ImageCard` (props 확장, 기존 동작 유지)
- **재활용 (ux-flow에서 예정된 17)**: 실제 구현 단계에서 확인 — AppShell, GNB, PageContainer, SectionContainer, FileDropzone, SearchBar, FilterBar, TagInput, MoodboardCard, CardContainer, CategoryTab, SplitScreen, Dialog, Switch, TextField, Select, Button, Stepper, LinearProgress, CircularProgress, ToggleButtonGroup, Checkbox, Chip, Tabs, Alert, Grid 등이 내부에서 호출됨.

## ✅ 최종 결과

MUSE의 신규 컴포넌트 세트 12종 전부 구현 + 스토리 포함. 이제 Storybook 상에서 각 컴포넌트 단위 동작 확인 가능한 상태. 다음 단계는 이들을 조립한 페이지 템플릿(아카이브 / 프로젝트 상세) 생성 또는 `pnpm storybook` 실행 검증.

## 🔁 재현 가이드 (교육생용)

1. `02-ux-flow.md`의 컴포넌트 리스트를 **의존성 순**으로 정렬:
   Phase 1 (기반) → Phase 2 (primitive) → Phase 3 (레이어 프리뷰) → Phase 4 (플로우) → Phase 5 (export).
2. Claude에게 "진행시켜" 한 마디로 일괄 빌드 허가하면 각 Phase별로 연속 구현.
3. Phase 1: `useInfiniteScroll` 훅 → `InfiniteMasonry` (sentinel은 Masonry 바깥) → `ImageCard` 확장 (기존 props 유지 + `isSelectable`/`isSelected`/`onToggleSelect`, 선택 링은 `outline`).
4. Phase 2: `TokenListItem` = `[preview 48x48] [label+value] [Low/Mid/High] [Switch]` 한 행. `isEnabled` 시 preview/label만 opacity 0.4, emphasis는 항상 활성.
5. Phase 3: 4개 (Color/Typography/Layout/Gradient)는 `TokenListItem` 반복. `KeyVisualBoard`만 독립 카드 그리드 (토큰 아닌 이미지 집합).
6. Phase 4: `AnalysisProgress` (status 기반 카드) → `ReferencePicker` (Tabs + InfiniteMasonry + ImageCard selectable) → `ProjectCreateWizard` (useReducer + Step0 폼 / Step1 ReferencePicker / Step2 AnalysisProgress).
7. Phase 5: `serializeTheme` 유틸 먼저 → `ThemeExportDialog`에서 `useMemo`로 직렬화 + 클립보드/Blob 다운로드.
8. 각 Phase 직후 `.claude/skills/component-work/resources/components.md`에 즉시 반영 — 다음 Phase에서 검색 가능해짐.
9. 기존 `templates/index.js`처럼 **존재하지 않는 파일을 export하는 stale barrel**을 발견하면 신규 작업에 앞서 함께 정리해야 전체 import 그래프가 깨지지 않음.

> 💡 핵심 포인트:
> - **의존성 순 빌드** = 위에서부터 만들면 아래쪽 구현이 80% 줄어든다. 위자드에서 picker가 이미 있고, picker에서 masonry+card selectable이 이미 있으므로.
> - **신규 primitive는 "slot 패턴"으로 먼저 넓게 재사용 가능하게 설계**. TokenListItem의 `preview` ReactNode 슬롯 덕에 4개 레이어가 동일 primitive 위에서 변주만 달라짐.
> - **파괴적 변경 회피 체크리스트**: 기존 props 전부 유지 / 기존 기본 동작 재현 / 새 props는 default 값으로 모두 기존 행동 모사.
> - **선택/활성 상태 시각화는 `outline` 권장**: border는 레이아웃 밀림. outline은 박스 바깥.
> - **외부 API/AI 연동은 경계 콜백만 노출**: `onAnalyze`, `onLoadMore`처럼 컴포넌트 내부에 fetch/axios 직접 호출 넣지 않기 — 스토리북·테스트 편의 + 교체 용이성.
