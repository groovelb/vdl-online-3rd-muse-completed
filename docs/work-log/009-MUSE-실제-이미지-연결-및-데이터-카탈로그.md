---
session: 009
date: 2026-04-22
title: MUSE 더미 이미지 28장 실제 연결 + 데이터 카탈로그 4종 스토리북 등록
---

# 009. MUSE 더미 이미지 28장 실제 연결 + 데이터 카탈로그 4종 스토리북 등록

## 🎯 의도 (User Goal)

> `src/data/muse/dummyImage/` 에 있는 실제 이미지 28장을 레퍼런스 데이터셋에 연결하고, 이 데이터셋을 Storybook에서 검증/탐색할 수 있도록 카탈로그 스토리를 등록한 뒤, 이미 만들어진 페이지 템플릿/컴포넌트들에 자동 반영되게 함.

## 🔑 주요 의사결정

- **Vite 정적 import로 이미지 URL을 안전하게 번들링**: `/public` 경로나 절대경로 문자열이 아닌, `import ref1 from './dummyImage/reference1.jpg'` 방식. 개발/빌드/Storybook 모두에서 경로 해결이 일관되고, 파일이 사라지면 빌드 시점에 바로 에러로 드러남.
- **확장자 불일치를 정면 처리**: reference18~21만 `.jpeg`, 나머지는 `.jpg`. 정규식으로 처리하지 않고 import 구문을 파일별로 명시 — 실수로 빠진 파일이 있으면 즉시 빌드 오류.
- **References는 28건으로 확정, projects referenceIds를 재배치**: 기존 36건 더미에서 28건으로 줄이며 프로젝트 4개가 중복 없이 ref-001~ref-023을 나눠 갖도록 재조정. 프로젝트별 레퍼런스 묶음이 현실적인 수준(5~7건)으로 정돈됨.
- **데이터 카탈로그 4종 스토리를 `src/stories/muse/`에 별도 배치**: 컴포넌트 스토리(`src/components/**`)와 섞이지 않도록 분리. Storybook sidebar `MUSE/Data/*` 섹션으로 묶여 "데이터 검사 도구"로 독립.
- **각 카탈로그는 스키마 표 + 실제 값 시각화 둘 다 제공**: 교육생이 스키마와 실 데이터를 동시에 보며 데이터 모델 이해도를 높이도록. 단순 JSON 덤프만으로는 체감이 떨어짐.
- **`.storybook/preview.jsx` sort order에 `Page`, `MUSE`, `['Data']` 추가**: 기존 `Overview / Style / Component / Interactive / Common / Template / Test Data` 순서를 유지하면서 신규 섹션이 알파벳 순이 아닌 의도된 위치에 들어가도록 명시적 지정.

## 💬 Claude의 핵심 반응

- `ls`로 이미지 파일명을 먼저 확인 → reference18~21의 `.jpeg` 혼합을 사전 감지. 파일 수(28)도 직접 세 `wc -l`로 확인 후 코드 반영.
- 카탈로그 스토리 4종을 **References/Projects/AnalysisResults/UserSettings 순**으로 작성 — 의존성 순서와 동일해 교육생이 차례대로 따라갈 때 맥락이 이어짐.
- 각 카탈로그의 첫 스토리는 `Docs`로 네이밍해 `src/components/storybookDocumentation` 규칙 준수. Style 스토리와 같은 `DocumentTitle / PageContainer / SectionTitle` 패턴 재활용.
- References 카탈로그만 3개 스토리(Docs/Grid/ById) 분리, 나머지 엔티티는 단일 `Docs` 스토리로 응축 — 데이터량 차이에 맞는 적절한 뷰 개수 선택.
- AnalysisResults 카탈로그에선 **프로젝트별로 컬러 pill + 그라디언트 스와치 + 키비주얼 썸네일까지 동시 시각화** — 5-레이어 전부 표로 나열하는 대신 의미 있는 요약.

## 📂 변경된 파일

### 수정 (3)

| 파일 | 요약 |
|------|------|
| `src/data/muse/references.js` | 28개 이미지 정적 import (18~21은 `.jpeg`), `IMAGES` 배열로 묶어 `references.map`에 연결. 기존 placeholderSvg 완전 제거 |
| `src/data/muse/projects.js` | 4개 프로젝트의 `referenceIds`를 ref-001~ref-023 범위에서 재배치 (중복 없는 분할) |
| `src/data/muse/README.md` | 이미지 교체 가이드를 "같은 파일명 유지 vs 추가" 2가지 시나리오로 재정리 + Storybook 경로 안내 |
| `.storybook/preview.jsx` | storySort order에 `Page`, `MUSE`, `['Data']` 추가 |

### 신규 (4)

| 파일 | 요약 |
|------|------|
| `src/stories/muse/References.stories.jsx` | `MUSE/Data/References` 하위 Docs/Grid/ById 3 스토리. 28건 썸네일 + 스키마 + id 조회 |
| `src/stories/muse/Projects.stories.jsx` | `MUSE/Data/Projects` 하위 Docs. 4개 프로젝트 스키마/목록 + 2x2 썸네일 카드 |
| `src/stories/muse/AnalysisResults.stories.jsx` | `MUSE/Data/AnalysisResults` 하위 Docs. 프로젝트별 컬러/그라디언트/키비주얼 시각 요약 |
| `src/stories/muse/UserSettings.stories.jsx` | `MUSE/Data/UserSettings` 하위 Docs. 스키마 표 + 기본값 JSON |

## 🧩 컴포넌트 작업

컴포넌트 코드 변경 없음. 데이터 레이어와 스토리만 확장.

- 모든 기존 MUSE 페이지 템플릿/컴포넌트가 **자동으로 실제 이미지 반영**됨: ArchivePage 그리드, ProjectListPage 카드 2x2 썸네일, ProjectDetailPage 키비주얼 보드, ReferencePicker, ProjectCreateWizard.

## ✅ 최종 결과

- Storybook 사이드바에 `MUSE/Data/` 카테고리 신설, 4개 엔티티 모두 스키마 + 실 데이터 탐색 가능.
- 페이지 템플릿 6개(`ArchivePage`, `ProjectListPage`, `ProjectDetailPage`, `SettingsPage`, `ReferencePicker`, `ProjectCreateWizard`)가 모두 실제 이미지로 렌더링.
- 이미지 교체는 `dummyImage/` 내 파일 바꿔치기로 충분 (코드 수정 불필요).

## 🔁 재현 가이드 (교육생용)

1. `src/data/muse/dummyImage/`에 있는 이미지 파일 확장자 목록을 `ls`로 먼저 확인 (확장자 혼합이 있으면 개별 처리 필요).
2. `references.js`에서 placeholderSvg 의존 제거하고 파일별로 `import ref1 from './dummyImage/reference1.jpg'` 방식으로 정적 import.
   - `.jpeg` 파일은 정확한 확장자 지정
   - `IMAGES` 배열로 묶어 `Array.map`에 연결
3. `projects.js`의 `referenceIds`를 실제 이미지 범위(ref-001 ~ ref-028) 안에서 중복 없이 재배치.
4. `src/stories/muse/` 폴더를 새로 만들고, 각 엔티티별 카탈로그 스토리를 추가.
   - 첫 스토리는 반드시 `Docs`로 네이밍 (`storybook-writing.md` 규칙)
   - `DocumentTitle` / `PageContainer` / `SectionTitle` 패턴 재활용
   - References처럼 많은 엔티티는 여러 뷰(Docs/Grid/ById) 분할, 단일값 엔티티는 Docs 하나로 응축
5. `.storybook/preview.jsx`의 `storySort.order`에 `Page`, `MUSE`, `['Data']` 추가해 사이드바 정렬을 의도한 순서로 고정.
6. README에서 이미지 교체 가이드를 "같은 파일명 유지" / "새 파일 추가" 두 시나리오로 분기해 문서화.

> 💡 핵심 포인트:
> - **Vite 정적 import = 빌드 시점 안정성**: 문자열 경로 대신 `import`로 연결하면 파일 누락 즉시 에러. `/public` 디렉토리보다 안전.
> - **파생 데이터 구조의 위력**: Reference 썸네일 한 곳 교체로 Project 카드, KeyVisual 보드, 아카이브 그리드까지 전파. 동일 자산을 여러 경로에 복사하지 말 것.
> - **데이터 카탈로그는 "스키마 + 실 데이터" 병기**: 표만 있으면 추상적이고, 데이터만 있으면 구조가 안 보임. 둘 다 한 페이지에.
> - **카탈로그 뷰 개수는 데이터 규모에 맞춰 조정**: References처럼 큰 엔티티는 Grid/List/ById 3뷰, singleton은 1뷰로. 과도한 뷰는 소음이다.
