---
session: 007
date: 2026-04-22
title: MUSE IA 완성 — ProjectListPage + SettingsPage 추가
---

# 007. MUSE IA 완성 — ProjectListPage + SettingsPage 추가

## 🎯 의도 (User Goal)

> `02-ux-flow.md` IA에 정의됐지만 실제 템플릿이 없던 두 화면(`/projects` 프로젝트 목록, `/settings` 설정)을 조립해, MUSE 5개 IA 엔트리 전부를 Storybook에서 확인 가능한 상태로 마감.

## 🔑 주요 의사결정

- **ProjectListPage는 기존 `MoodboardCard`를 100% 재활용**: 2x2 썸네일 + 이름 + 설명 + hover 애니메이션까지 이미 존재. 프로젝트의 `intent`를 `description`, `referenceThumbnails`를 `items`에 매핑. 신규 카드 타입 만들지 않음.
- **프로젝트 유형(Chip)을 카드 위에 오버레이**: MoodboardCard 내부에 type prop을 추가하는 대신, 페이지에서 `position: absolute`로 Chip을 얹음 → 기존 컴포넌트 API 불변 유지.
- **SettingsPage는 `Section` 내부 유틸 컴포넌트로 반복 패턴 정리**: 4섹션(AI 모델/자동 태깅/스토리지/테마)이 모두 "타이틀 + 설명 + 컨트롤" 구조라 같은 파일 내 작은 헬퍼로 DRY. 외부로 export할 필요가 없어 파일 내부 정의.
- **설정 값의 실제 적용 로직은 페이지 바깥**: `onChange(patch)`로 경계면만 제공. AI 모델 실제 전환, 테마 모드 실적용 등은 상위에서 처리.
- **Save 버튼은 `onSave` prop 있을 때만 노출 + `dirty` 플래그로 활성화**: 자동 저장 전제 앱이라면 prop 안 넘기면 버튼 자체가 안 보임. 바뀐 값이 없으면 disabled.
- **스토리는 "상태 포함 render" 함수로 작성**: 외부에서 useState로 감싸 실제 조작 가능. autodocs만으로는 토글/Select 동작 확인이 안 되므로.

## 💬 Claude의 핵심 반응

- 직전 대화에서 "IA엔 있으나 템플릿 없는 화면 2개"를 먼저 인벤토리로 짚어둔 덕에, 사용자 "맞어 만들어" 한 마디에 즉시 정확한 범위로 진입.
- `MoodboardCard` props를 `head -60`으로 짧게 확인만 하고 바로 적합성 판단 — 이미 `items`/`onClick`/`onEdit`/`onDelete` 시그니처가 맞아 매핑 레이어 최소화.
- SettingsPage에선 MUSE 특유의 AI 모델 옵션(Opus/Sonnet/Haiku)을 하드코딩된 상수로 포함하되, **실제 모델 호출 로직은 주석으로만 표시** — 컴포넌트는 UI에만 집중.
- "컴퍼넌트 다 만든거지?" 질문에 대해 단순 yes/no가 아니라 **ux-flow 기준 인벤토리 표**로 답변 → 놓친 화면을 정확히 끄집어내 후속 작업으로 이어짐.

## 📂 변경된 파일

| 파일 | 종류 | 요약 |
|------|------|------|
| `src/components/templates/ProjectListPage.jsx` | 추가 | AppShell + MoodboardCard Grid + 유형 Chip 오버레이 + 빈 상태 CTA |
| `src/components/templates/ProjectListPage.stories.jsx` | 추가 | Default(4 프로젝트) / EmptyState |
| `src/components/templates/SettingsPage.jsx` | 추가 | AI 모델 Select / 자동 태깅 Switch / 스토리지 RadioGroup / 테마 RadioGroup + 내부 `Section` 헬퍼 |
| `src/components/templates/SettingsPage.stories.jsx` | 추가 | Default(Sonnet + Local + System) / CloudStorage(Opus + Cloud) |
| `src/components/templates/index.js` | 수정 | ProjectListPage, SettingsPage barrel export 추가 |
| `.claude/skills/component-work/resources/components.md` | 수정 | ProjectListPage, SettingsPage 2건 반영 |

## 🧩 컴포넌트 작업

- **신규(2)**: `ProjectListPage`, `SettingsPage`
- **재활용**: `AppShell`, `PageContainer`, `MoodboardCard`, MUI `Grid`/`Chip`/`Button`/`Select`/`Switch`/`RadioGroup`/`FormControlLabel`/`Divider`

## ✅ 최종 결과

MUSE 5개 IA 엔트리 전부 페이지 템플릿 완비: `ArchivePage`, `ProjectListPage`, `ProjectCreateWizard` (템플릿 취급), `ProjectDetailPage`, `SettingsPage`. Storybook 사이드바 `Page/` 카테고리에서 네 화면이 모두 확인 가능하며, 프로젝트 생성은 `Template/ProjectCreateWizard`에 위치.

## 🔁 재현 가이드 (교육생용)

1. ux-flow IA 트리에서 **아직 페이지 템플릿이 없는 엔트리를 목록화**한다. MUSE의 경우 `/projects`, `/settings` 2개.
2. `ProjectListPage`:
   - `MoodboardCard` 기존 API 확인(`head -60`) → `id/name/description/items/createdAt/onClick/onEdit/onDelete` 모두 존재 → 그대로 매핑.
   - `project.type`은 MoodboardCard 내부에 넣지 않고 **페이지 레이어에서 Chip 오버레이**로 얹는다 (position: absolute, pointerEvents: none — 카드 클릭 막지 않게).
   - 빈 상태는 중앙 정렬 텍스트 + "첫 프로젝트 만들기" CTA.
3. `SettingsPage`:
   - 섹션이 반복 구조라면 같은 파일에 `Section` 내부 유틸 정의. 외부 export 불필요.
   - 4섹션: AI 모델(Select), 자동 태깅(Switch), 스토리지(Radio 2개), 테마 모드(Radio 3개).
   - 각 섹션 사이 `<Divider />`로 시각 구분. 마지막에 `onSave` prop 있을 때만 Save 버튼 렌더 + `dirty` 플래그 기반 disabled.
   - 옵션 리스트는 파일 상단 상수로 분리 (`AI_MODELS`, `STORAGE_MODES`, `THEME_MODES`).
4. 스토리는 반드시 `useState`로 감싸 실제 조작 가능 상태로 작성 — 설정 페이지는 값 변화를 눈으로 봐야 검증 가능.
5. `templates/index.js`와 `components.md` 즉시 갱신해 다음 작업에서 검색 가능하게.

> 💡 핵심 포인트:
> - **"IA 검수 → 누락 화면 인벤토리 → 생성" 순서**가 누락 없이 마감하는 가장 빠른 길. 화면 중심 점검이 컴포넌트 중심 점검보다 현실을 잘 반영한다.
> - **기존 컴포넌트 재활용 시 props 확장을 최소화**: MoodboardCard에 type prop을 추가하지 않고 페이지에서 오버레이하는 식. API 표면이 넓어지면 향후 수정 비용이 기하급수로 커진다.
> - **설정 같은 단순 폼 페이지는 "섹션 헬퍼 컴포넌트"로 시각/구조 DRY** — 같은 파일 내 정의라 외부에 노출되지도 않고 수정도 한 곳만.
> - **경계면은 `onChange(patch)` 같은 범용 시그니처로 통일**: AI 모델 바뀜 / 스토리지 바뀜을 각각 별도 콜백으로 두지 않고 patch 객체 하나로 전부 처리.
