---
session: 008
date: 2026-04-22
title: MUSE 데이터 모델 정의 + 더미 데이터 중앙화 (src/data/muse/) + 스토리 연동
---

# 008. MUSE 데이터 모델 정의 + 더미 데이터 중앙화 (src/data/muse/) + 스토리 연동

## 🎯 의도 (User Goal)

> `02-ux-flow.md` 데이터 모델 섹션을 코드로 옮기고, 각 스토리에 흩어져 있던 ad-hoc 더미를 **하나의 중앙 위치**로 모은다. 이후 사용자가 실제 이미지만 교체하면 전체 페이지·컴포넌트가 자동으로 새 데이터로 렌더링되도록 준비.

## 🔑 주요 의사결정

- **`src/data/muse/` 전용 폴더 신설** — 기존 `src/data/`에 `componentTokenMap.js`, `ruleRelationships.js`가 있었지만 MUSE 프로젝트 데이터는 성격이 달라 하위 폴더로 분리. 스토리북·앱·향후 라우팅에서 공통으로 import 가능한 단일 진실 원천.
- **`schemas.js`에 JSDoc typedef만 정의**: TypeScript 없는 프로젝트라 런타임 스키마 검증보다 **IDE 자동완성/호버 정보** 확보가 더 가치 있음. `export {};` 빈 export로 ES module 취급시켜 런타임 비용 0.
- **Reference 36건, Project 4건을 "결정적(deterministic)" 패턴으로 생성**: `index * 37 % 240` 같은 결정적 식으로 높이/색상/태그 조합 — 같은 seed면 같은 결과 재현 가능해 교육생이 따라할 때 편차 없음.
- **Project 썸네일은 Reference에서 파생**: `projects.js`에 `projectsWithThumbnails`를 별도 export해서 `referenceIds` → `thumbnailUrl[]` 매핑을 자동 처리. 이미지 교체 시 Reference만 바꾸면 프로젝트 카드 썸네일까지 자동 전파.
- **KeyVisual도 Reference에서 파생**: `analysisResults.js`의 `buildKeyVisuals()`가 project.referenceIds를 참조해 키비주얼 보드를 조립. 프로젝트별로 별도 키비주얼 데이터를 관리하지 않음 — 교체 포인트 단일화.
- **프로젝트별 컬러/그라디언트는 수동 프리셋, 타이포/레이아웃은 유형별 공통 프리셋**: 컬러는 프로젝트 의도별로 완전히 달라야 의미있고, 타이포/레이아웃은 "landing/dashboard/mobile/brand" 유형만 공유하면 충분.
- **이미지 교체 가이드를 `src/data/muse/README.md`에 별도 문서화**: 교육생/사용자가 "어디만 고치면 되는지" 한 눈에 파악할 수 있게. 코드 주석만으로는 흐름을 설명하기 어려워 README로 분리.

## 💬 Claude의 핵심 반응

- 스토리 재작성 시 **스키마 그대로 노출 X, 컴포넌트 기대 형태로 변환**: Reference의 `thumbnailUrl`을 ImageCard가 기대하는 `src`로 매핑하는 `toPageItem(ref)` / `toPickerItem(ref)` 로컬 어댑터 함수 도입. 이로써 데이터 모델과 UI props는 느슨히 결합.
- 모든 스토리가 같은 패턴(`useState`로 편집 가능 + 중앙 데이터 import)을 따르도록 **표준화** — 교육생이 스토리 하나만 읽어도 나머지를 예측 가능.
- `analysisResults.js`의 `buildKeyVisuals()`를 프로젝트 루프 밖 **별도 함수**로 정의. 추후 "키비주얼 별도 편집" 요구가 오면 이 함수만 교체.
- 더미 데이터에 **의미있는 한글 타이틀/의도** 삽입(Editorial Minimal / Fintech Dashboard / Lifestyle App / Studio Brand) — 스토리북이 "데모"가 아니라 실제 사용 맥락을 체감하게 함.

## 📂 변경된 파일

### 신규 (7)

| 파일 | 요약 |
|------|------|
| `src/data/muse/schemas.js` | Reference/Project/AnalysisResult/Token/UserSettings JSDoc typedef |
| `src/data/muse/references.js` | 36개 Reference + id 맵 + `getReferenceThumbnails(ids, n)` 헬퍼 |
| `src/data/muse/projects.js` | 4개 Project + `projectsWithThumbnails` (Reference 파생) |
| `src/data/muse/analysisResults.js` | 프로젝트별 5-layer AnalysisResult. 컬러/그라디언트는 수동, 타이포/레이아웃은 유형별 공통 |
| `src/data/muse/userSettings.js` | `defaultUserSettings` 상수 |
| `src/data/muse/index.js` | barrel export |
| `src/data/muse/README.md` | 이미지 교체 가이드 (references.js 한 줄만 고치면 전파) |

### 수정 (6) — 스토리를 중앙 데이터 기반으로 재작성

| 파일 | 요약 |
|------|------|
| `src/components/templates/ArchivePage.stories.jsx` | 로컬 makeRefs 삭제 → `references` import, toPageItem 변환 |
| `src/components/templates/ProjectListPage.stories.jsx` | `projectsWithThumbnails` import |
| `src/components/templates/ProjectDetailPage.stories.jsx` | `projectsWithThumbnails[0]` + `getAnalysisResult()` 사용, `DashboardProject` 스토리 추가 |
| `src/components/templates/SettingsPage.stories.jsx` | `defaultUserSettings` import |
| `src/components/templates/ReferencePicker.stories.jsx` | 로컬 TAG_POOL/makeRefs 삭제 → 중앙 `references` 사용 |
| `src/components/templates/ProjectCreateWizard.stories.jsx` | 동일 |

## 🧩 컴포넌트 작업

코드 컴포넌트 자체 변경 없음. 스토리/데이터 레이어만 재구성.

- **중앙 데이터 import 시작점**: 모든 MUSE 스토리는 `../../data/muse`에서만 데이터를 가져오도록 통일.

## ✅ 최종 결과

- 스키마 5종 + 더미 데이터(References 36 / Projects 4 / AnalysisResults 4 / Settings 1) + 교체 가이드 확보.
- 스토리 6개 전부 중앙 더미와 연동 — Storybook에서 아카이브 36장, 프로젝트 4개, 프로젝트 상세에서 각 프로젝트별 분석 결과가 살아있는 상태로 렌더링.
- 사용자는 이제 `src/data/muse/references.js`의 `thumbnailUrl` 줄 한 곳만 교체하면 프로젝트 카드 썸네일 / 키비주얼 보드 / 아카이브 그리드 전체가 실제 이미지로 전파됨.

## 🔁 재현 가이드 (교육생용)

1. `docs/muse/02-ux-flow.md` 의 **데이터 모델 테이블**을 그대로 JSDoc typedef로 옮긴다 (`src/data/muse/schemas.js`). `export {};`로 ES module 취급.
2. `references.js` 먼저 생성:
   - 태그/컬러/제목 pool을 파일 상단 상수로
   - `Array.from({ length: 36 }, (_, i) => ...)` 결정적 생성 — 높이 `400 + ((i * 37) % 240)`, 태그 인덱스 `i * 3` `i * 7` 같은 패턴
   - `referencesById` 맵 + `getReferenceThumbnails(ids, maxCount)` 헬퍼 함께 export
3. `projects.js`:
   - 수동으로 4건 정의 (name/intent/type/referenceIds)
   - `projectsWithThumbnails`는 `getReferenceThumbnails`로 파생 — 이미지 교체 시 자동 전파의 핵심
4. `analysisResults.js`:
   - `COLOR_PRESETS`는 projectId별 수동 정의 (프로젝트 의도 반영)
   - `TYPO_PRESETS` / `LAYOUT_PRESETS`는 type별 공통
   - `buildKeyVisuals(project)`를 루프 외부 함수로 정의해 referenceIds에서 썸네일 파생
   - `analysisResultsByProjectId`를 `projects.reduce(...)`로 일괄 조립
5. `userSettings.js`, `index.js`, `README.md` 정리
6. 스토리 6개에서 기존 ad-hoc 더미 삭제, 중앙 데이터 import로 교체. 컴포넌트가 기대하는 prop 형태로 변환하는 작은 로컬 어댑터 함수 (`toPageItem`, `toPickerItem`) 사용.

> 💡 핵심 포인트:
> - **데이터는 한 곳에서, 파생은 자동화**: Reference 썸네일만 교체하면 Project 카드·KeyVisual 보드가 전부 따라온다. 동일 이미지를 여러 파일에 복사해서 관리하지 말 것.
> - **결정적 생성 패턴**: `index * prime % range` 같은 식은 seed 없이도 일관된 더미를 뽑아낸다. `Math.random`은 피할 것.
> - **JSDoc typedef만으로도 IDE DX 충분**: TypeScript 도입 없이 `@type {import('./schemas.js').Reference[]}` 한 줄이면 자동완성·호버 정보가 살아남.
> - **스키마 ↔ 컴포넌트 props 간 로컬 어댑터**를 두면 스토리 변경이 쉬워진다. Reference.thumbnailUrl을 ImageCard.src로 매핑하는 한 줄 함수만 있으면 스키마와 컴포넌트가 독립적으로 진화 가능.
