---
session: 006
date: 2026-04-22
title: MUSE 페이지 템플릿 조립 (ArchivePage + ProjectDetailPage)
---

# 006. MUSE 페이지 템플릿 조립 (ArchivePage + ProjectDetailPage)

## 🎯 의도 (User Goal)

> Phase 1~5에서 만든 MUSE 신규 컴포넌트 12종과 기존 starter-kit 컴포넌트들을 조합해, 실제 사용 흐름을 Storybook에서 바로 확인할 수 있는 **페이지 수준 템플릿** 2종을 조립.

## 🔑 주요 의사결정

- **페이지 템플릿은 새 카테고리가 아닌 기존 `templates/` 폴더에 배치**: directory-structure.md의 `templates/`가 이미 "페이지 템플릿" 역할로 정의됨. 신규 폴더 생성 불필요.
- **Storybook title은 `Page/`로 구분**: 기존 `Template/` 접두사는 ReferencePicker/ProjectCreateWizard처럼 "재사용되는 조합 컴포넌트"에 두고, Page 수준은 `Page/ArchivePage`·`Page/ProjectDetailPage`로 사이드바에서 한눈에 구분되게. Storybook 전역 sort에 이미 `Page` 엔트리가 있어 정렬에도 자연스럽게 낌.
- **ArchivePage = 풀 조립, ProjectDetailPage = 편집 + 프리뷰 split**: 아카이브는 업로드→필터→무한 그리드의 선형 흐름이라 세로 스택 구성. 프로젝트 상세는 "편집과 결과"가 동시에 필요해 `SplitScreen` 60:40 (md 이하에서 스택).
- **`ProjectDetailPage.buildThemeObject()`가 활성 토큰만 `createTheme` 객체로 환원**: emphasis는 MUI theme에 직접 매핑되지 않으므로 export 시점에 무시, `emphasis=2`를 primary 후보로만 참조. 이로써 활성/비활성 편집이 Export 결과에 즉시 반영.
- **KeyVisual 제거는 `_removed: true` 플래그 패턴**: 실제 배열 삭제 대신 patch로 마킹 후 상위 상태에서 filter. `onUpdateToken` 경계 시그니처를 `(layer, id, patch)`로 통일하기 위함 (따로 `onRemove` 콜백을 페이지 레벨에 노출하지 않음).
- **Sticky 검색 바를 아카이브 상단에 배치**: 무한 스크롤 중에도 필터 접근성을 유지하되 업로드 영역 위에는 아님 — 페이지 스크롤 시 업로드 영역은 자연스럽게 화면 밖으로 빠지고 검색/필터만 고정.
- **필터 활성 시 `hasMore`를 무시**: 검색어·태그가 있으면 InfiniteMasonry의 `hasMore`를 false로 막아 서버 재요청과 필터 충돌 방지. 필터 초기화 시 다시 무한 스크롤 재개.

## 💬 Claude의 핵심 반응

- 페이지 템플릿 생성 전에 **기존 조립 컴포넌트들(SearchBar, FileDropzone, FilterBar, CategoryTab, SplitScreen, AppShell)의 props 시그니처부터 확인** — `head -60`로 주석만 읽어 적합성 빠르게 판단. 재활용이 실제로 깔끔한지 점검.
- `ProjectDetailPage`의 Export 경로는 **페이지 내부에서 theme object 직렬화**까지 포함: 에디터 상태 → `buildThemeObject` → `ThemeExportDialog`. `serializeTheme`는 유틸이므로 페이지에서 import하지 않고, Dialog 내부에서 처리.
- `ArchivePage`의 업로드 영역은 FileDropzone의 `variant="compact"`로 축소해 메인 그리드를 가리지 않게. 풀사이즈는 "처음 사용자 온보딩" 상황이 아닐 때 과함.
- 페이지 컴포넌트 자체는 **상태/로직 최소화**. 외부 API는 콜백 경계(onLoadMore, onUploadFile, onUpdateToken 등)로만 노출해 스토리/실사용 양쪽에서 교체 가능.

## 📂 변경된 파일

| 파일 | 종류 | 요약 |
|------|------|------|
| `src/components/templates/ArchivePage.jsx` | 추가 | AppShell + FileDropzone + SearchBar + 태그 Chip 필터 + InfiniteMasonry 조립 |
| `src/components/templates/ArchivePage.stories.jsx` | 추가 | Default(점진 로드) / EmptyState |
| `src/components/templates/ProjectDetailPage.jsx` | 추가 | AppShell + CategoryTab(레이어) + SplitScreen(편집/프리뷰) + 5개 레이어 프리뷰 + ThemeExportDialog |
| `src/components/templates/ProjectDetailPage.stories.jsx` | 추가 | Default(풀 샘플) / Minimal(Primary 1개) |
| `src/components/templates/index.js` | 수정 | ArchivePage, ProjectDetailPage barrel export 추가 |
| `.claude/skills/component-work/resources/components.md` | 수정 | 2건 추가 (ArchivePage, ProjectDetailPage) |

## 🧩 컴포넌트 작업

- **신규 (2)**: `ArchivePage`, `ProjectDetailPage` — 둘 다 `components/templates/`
- **재활용된 MUSE 신규 컴포넌트 (12)**: InfiniteMasonry, ImageCard(확장), TokenListItem(간접), ColorSwatchList, TypographyPreview, LayoutTokenPreview, GradientPreview, KeyVisualBoard, ThemeExportDialog
- **재활용된 기존 starter-kit 컴포넌트 (8)**: AppShell, GNB(간접), PageContainer, SplitScreen, CategoryTab, SearchBar, FileDropzone, MUI 기본(Button/Chip/Typography/IconButton)

## ✅ 최종 결과

Storybook에서 `Page/ArchivePage`, `Page/ProjectDetailPage`, `Template/ProjectCreateWizard` 세 가지만 열면 MUSE end-to-end 사용자 흐름(아카이브 수집 → 프로젝트 생성 → 토큰 편집 → Export)이 브라우저에서 클릭만으로 체험 가능.

## 🔁 재현 가이드 (교육생용)

1. 페이지 템플릿 생성 전, 조립에 쓸 **기존 컴포넌트 props 시그니처부터 한 번 스캔**:
   `head -60 AppShell.jsx PageContainer.jsx SplitScreen.jsx CategoryTab.jsx SearchBar.jsx FileDropzone.jsx`.
2. ArchivePage 작성:
   - AppShell `logo` + `headerPersistent`(+ 새 프로젝트 버튼) 세팅
   - PageContainer 내부에 Hero(h2 타이틀 + 설명), FileDropzone(compact), Sticky SearchBar + 태그 Chip filter, InfiniteMasonry 배치
   - `useMemo`로 `allTags`, `filtered` 계산 — AND 방식 다중 태그 필터
   - 필터/검색 활성일 때 `hasMore`를 강제로 false 처리
3. ProjectDetailPage 작성:
   - AppShell `headerPersistent`에 Export 버튼 → ThemeExportDialog (state: isExportOpen)
   - CategoryTab 5개 레이어(color/typography/layout/gradient/keyVisual), 선택된 레이어에 따라 switch로 에디터 렌더
   - SplitScreen ratio="60:40", stackAt="md". left=에디터, right=프리뷰(활성 타이포 실시간 렌더 + 활성 컬러 pill 목록)
   - `buildThemeObject(analysis)`: 활성 토큰만 MUI theme 구조로 환원 (palette.primary/secondary/info + typography[variant])
   - `onUpdateToken(layer, id, patch)` 단일 시그니처 — 제거는 `{ _removed: true }` 플래그로
4. 스토리는 **내부 상태 포함 render 함수** 사용:
   - Default: 풀 샘플 데이터 + useState로 편집 라이브
   - Minimal/Empty: 빈 배열 또는 최소 데이터로 엣지 케이스 확인
5. `templates/index.js`에 barrel 추가, `components.md`에 항목 기재.

> 💡 핵심 포인트:
> - **페이지 수준 템플릿은 상태 최소 + 콜백 경계**. API fetch나 store dispatch를 페이지 내부에 두지 말고, 외부에서 주입받게 하면 Storybook도 실제 앱도 그대로 쓸 수 있다.
> - **활성 토큰만 Export 대상**: `isEnabled=false`는 편집 상태 보존용이지 결과물 아님. `buildThemeObject`는 filter 먼저, 매핑 나중.
> - **Sticky 검색 바 + 무한 스크롤 + 필터**의 상호작용: 필터 활성 시 hasMore 차단해서 검색/페이지네이션 충돌을 원천 차단.
> - **Storybook sidebar에서 `Page/` vs `Template/` 구분**: 재사용 단위(Template)와 최종 화면(Page)을 분리해 교육생이 어디서부터 시작해야 할지 한눈에 파악 가능.
