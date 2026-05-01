# appendix. Screen ↔ Component Map

> [02-ux-flow.md](./02-ux-flow.md) 본문에서 분리된 부록. 화면 그룹별 컴포넌트 상세 매핑.

---

## A. 앱 골격 (글로벌 레이아웃 · 네비게이션)

| 컴포넌트 | 용도 | 구분 | 기존 경로 / 비고 |
|----------|------|------|-----------------|
| `AppShell` | 전역 레이아웃 (GNB + 메인 영역) | 재활용 | `components/layout/AppShell.jsx` |
| `GNB` | 글로벌 네비게이션 바 | 재활용 | `components/navigation/GNB.jsx` |
| `PageContainer` | 반응형 페이지 컨테이너 | 재활용 | `components/layout/PageContainer.jsx` |
| `SectionContainer` | 섹션 단위 컨테이너 | 재활용 | `components/container/SectionContainer.jsx` |

## B. Archive (레퍼런스 수집 · 탐색)

| 컴포넌트 | 용도 | 구분 | 기존 경로 / 비고 |
|----------|------|------|-----------------|
| `FileDropzone` | 드래그앤드롭 / URL 업로드 | 재활용 | `components/input/FileDropzone.jsx` |
| `Masonry` (MUI) | 인피니트 그리드 베이스 | 수정 | 인피니트 스크롤 훅 연결 |
| `ImageCard` | 레퍼런스 썸네일 + 태그 배지 + 선택 체크박스 | 수정 | `components/card/ImageCard.jsx` 확장 |
| `SearchBar` | 아카이브 검색 | 재활용 | `components/input/SearchBar.jsx` |
| `FilterBar` | 태그/컬러톤 필터 | 재활용 | `components/templates/FilterBar.jsx` |
| `TagInput` | 개별 레퍼런스 태그 편집 | 재활용 | `components/input/TagInput.jsx` |

## C. Project (목록 · 5-step Wizard)

| 컴포넌트 | 용도 | 구분 | 기존 경로 / 비고 |
|----------|------|------|-----------------|
| `MoodboardCard` | 프로젝트 목록 카드 (2x2 썸네일) | 재활용 | `components/card/MoodboardCard.jsx` |
| `CardContainer` | 카드 기본 컨테이너 | 재활용 | `components/card/CardContainer.jsx` |
| `TextField` / `Select` / `Button` | 폼 입력 | 재활용 | MUI |
| `ProjectCreateWizard` | 5-step 위자드 (Step 0~4) | 신규 | 카테고리: `templates` |
| `ReferencePicker` | 추천 + 아카이브 다중 선택 패널 | 신규 | 카테고리: `templates` |
| `ModeSelectCard` | Step 0 모드 카드 (concept / system) | 재활용 | `components/card/ModeSelectCard.jsx` |
| `IntentGuideField` | Step 1 의도 입력 | 재활용 | `components/input/IntentGuideField.jsx` |
| `ReferenceLayerChipRow` | Step 2 카드별 layer chip | 재활용 | `components/card/ReferenceLayerChipRow.jsx` |
| `RefinementNotesField` | Step 3 활용 노트 | 재활용 | `components/input/RefinementNotesField.jsx` |

## D. 분석 피드백 (진행 상태 · 경고)

| 컴포넌트 | 용도 | 구분 | 기존 경로 / 비고 |
|----------|------|------|-----------------|
| `Dialog` (MUI) | 경고/확인 모달 | 재활용 | MUI |
| `AnalysisProgress` | 분석 진행 (레이어별 인디케이터) | 신규 | 카테고리: `overlay-feedback` |

## E. ProjectDetail (토큰 편집 셸)

| 컴포넌트 | 용도 | 구분 | 기존 경로 / 비고 |
|----------|------|------|-----------------|
| `CategoryTab` | 레이어 탭 (color / typography / layout / gradient / VD) | 재활용 | `components/in-page-navigation/CategoryTab.jsx` |
| `SplitScreen` | 토큰 편집 패널 + 프리뷰 좌우 분할 | 재활용 | `components/layout/SplitScreen.jsx` |
| `Switch` | 토큰 on/off 토글 | 재활용 | MUI |
| `TokenListItem` | 레이어 공통 토큰 행 (on/off + emphasis 슬라이더) | 신규 | 카테고리: `data-display` |

## F. 레이어별 프리뷰 (토큰 시각화)

| 컴포넌트 | 용도 | 구분 | 기존 경로 / 비고 |
|----------|------|------|-----------------|
| `ColorSwatchList` | 컬러 토큰 스와치 + HEX + 토글 | 신규 | 카테고리: `data-display` |
| `TypographyPreview` | 타이포 샘플 텍스트 + 속성 | 신규 | 카테고리: `data-display` |
| `LayoutTokenPreview` | 그리드/스페이싱 다이어그램 | 신규 | 카테고리: `data-display` |
| `GradientPreview` | 그라디언트 토큰 스와치 | 신규 | 카테고리: `data-display` |
| `TokenDecisionTracePanel` | TP6 펼침 (출처 + 이유 + appliedUserNotes + 탈락 후보) | 신규 | 카테고리: `data-display` |
| `DesignMdPreview` | DESIGN.md alpha spec 결과 화면 | 신규 | 카테고리: `data-display` |

## G. Export

| 컴포넌트 | 용도 | 구분 | 기존 경로 / 비고 |
|----------|------|------|-----------------|
| `ThemeExportDialog` | Universal JSON / ZIP 번들 / 단독 JSON 다운로드 | 신규 | 카테고리: `overlay-feedback` |

## H. Auth (가입 · 로그인)

| 컴포넌트 | 용도 | 구분 | 기존 경로 / 비고 |
|----------|------|------|-----------------|
| `AuthHero` | 가입/로그인 진입 화면 | 재활용 | `components/templates/AuthHero.jsx` |
| `LoginForm` | 이메일 + 비밀번호 입력 | 신규 | 카테고리: `input` (component-work 위임) |
| `SignUpForm` | 회원가입 입력 | 신규 | 카테고리: `input` (component-work 위임) |
| `AuthGuard` | 로그인 가드 라우트 | 신규 | 카테고리: `layout` (component-work 위임) |

---

## 그룹별 합계 (재활용 / 수정 / 신규)

| 그룹 | 재활용 | 수정 | 신규 |
|------|-------|------|------|
| A. 앱 골격 | 4 | 0 | 0 |
| B. Archive | 4 | 2 | 0 |
| C. Project | 7 | 0 | 2 |
| D. 분석 피드백 | 1 | 0 | 1 |
| E. ProjectDetail | 3 | 0 | 1 |
| F. 레이어 프리뷰 | 0 | 0 | 6 |
| G. Export | 0 | 0 | 1 |
| H. Auth | 1 | 0 | 3 |
| **합계** | **20** | **2** | **14** |

> 본문 (02-ux-flow.md § 컴포넌트 리스트) 의 카운트 (재활용 17 / 수정 2 / 신규 10) 는 H 그룹 (Auth) + ProjectDetail 의 일부를 누락한 구버전. 본 부록이 최신 truth.
