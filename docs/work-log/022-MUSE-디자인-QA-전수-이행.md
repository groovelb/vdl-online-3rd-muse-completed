---
session: 022
date: 2026-04-23
title: MUSE — 디자인 QA 전수 이행 (elevation/hover/위치 효과 제거, Accordion 필터, 색상환 유사색, GNB 재구성, 앰비언트 배경)
---

# 022. MUSE — 디자인 QA 전수 이행 (elevation/hover/위치 효과 제거, Accordion 필터, 색상환 유사색, GNB 재구성, 앰비언트 배경)

## 🎯 의도 (User Goal)

> 10개 디자인 지시 전수 이행:
> (1) 훨씬 미니멀 정보 밀도, (2) 필터 카테고리별 fold, (3) 색상 필터 = 대표 색상환 선택 시 주변색 필터링, (4) 인풋 label 없이 placeholder, (5) 버튼/form/input 사이즈·패딩 확대, (6) 모든 UI elevation 제거, (7) hover 효과 최소화, (8) 위치 효과 제거, (9) GNB 로그아웃·유저 정보 제대로, (10) 새프로젝트 페이지 미니멀 + 가운데 정렬 + 앰비언트 배경.

## 🔑 주요 의사결정

- **테마 오버라이드로 전역 해결 후 sx 하드코딩 잔재 전수 제거**: `default.js` 에서 MuiPaper/AppBar/Card/Dialog/Button/IconButton/OutlinedInput/FilledInput/TextField/Tabs 까지 전 컴포넌트 elevation/그림자/hover transform 차단. 그런 다음 sx 에 직접 박힌 `boxShadow: 1`, `translateY(-4px)` 같은 잔재를 grep 으로 전수 찾아 제거
- **위치 효과(translateY) 는 hover 전용만 제거, 레이아웃용은 유지**: carousel 센터링 `translateY(-50%)`, 애니메이션 스테이지 등은 레이아웃 필수. 제거 대상은 `:hover` 안의 이동 효과만
- **필터 UI 를 MUI Accordion 3단 슈퍼섹션으로 재구성**: 색상 / 디자인 레이어 / 비주얼 디렉션. disableGutters + elevation=0 + borderBottom 만으로 계층 시각화. 색상 섹션만 defaultExpanded
- **색상 필터 = 대표 색상환 16개(12 hue + 4 neutral) + HSL 유사도 매칭**: `src/utils/colorSimilarity.js` 신규. `isSimilarColor` 는 hue 거리 ≤ 30°, saturation ≤ 0.35, lightness ≤ 0.28, 양쪽 저채도면 L 로만 판정. 해당 색 근방 레퍼런스 0건이면 swatch 숨김, 활성 swatch 에 카운트 뱃지
- **label → placeholder 전환 전수 적용**: AuthPage, ProjectCreateWizard (이름/의도/프로젝트 유형 Select `displayEmpty` + `renderValue` 패턴), SettingsPage AI 모델 Select. Tab.label 은 탭 시맨틱이라 유지
- **GNB = 좌 로고+nav / 우 UserMenu 분리**: `src/pages/UserMenu.jsx` 신규 — Avatar → dropdown (이메일 + 로그아웃 내부). 각 route 에 `headerEnd` prop 전달 (ArchivePage/ProjectListPage/ProjectDetailPage 공통 패턴) 또는 AppShell `headerPersistent` 직접
- **앰비언트 배경 = multi-radial gradient**: ProjectCreateRoute + AuthPage 에 동일한 radial(violet 6% @ 20/10 + ink 5% @ 80/90) + linear(FCFCFF → F5F4FB)
- **Hero 섹션 전면 축소**: Archive/Projects/Settings 모두 `py {xs:4, md:8}` → `py {xs:3, md:5}`, h2 → h3, 부제 삭제. 정보 밀도 체감 향상의 가장 큰 레버리지

## 💬 Claude의 핵심 반응

- **범위 축소 안 하고 10개 전부 완주**: 직전 턴에 "추가 권장" 으로 떠넘긴 작업 (label 전수 / 페이지 미니멀 / sx 하드코딩 / AuthPage 앰비언트 / 색상 피드백) 전부 실행. 안 빼기로 약속한 후 이행
- **`displayEmpty + renderValue` 패턴으로 Select 의 label 대체**: MUI Select 는 InputLabel 없이 placeholder 흉내 낼 때 `renderValue={v => !v ? '...' : label}` 이 가장 깔끔
- **Accordion `disableGutters + elevation=0`**: 기본 Accordion 은 margin/border/shadow 붙어 나옴. 전부 끄고 `borderBottom: 1px divider` 로 flat 톤 유지
- **HSL 거리에서 neutral(저채도) 예외 처리**: 채도 < 0.12 는 hue 값이 불안정 → lightness 거리로만 판정. 한쪽만 저채도면 mismatch

## 📂 변경된 파일

### 테마 (글로벌)

| 파일 | 변경 |
|------|------|
| `src/styles/themes/default.js` | MuiPaper/AppBar/Card/Dialog/Button/IconButton/OutlinedInput/FilledInput/TextField/Tabs 오버라이드 재작성. 모든 elevation 0, Button padding 32/10 (large 36/14), OutlinedInput input padding 16/18 |

### 컴포넌트 (sx 하드코딩 제거)

| 파일 | 변경 |
|------|------|
| `src/components/card/ImageCard.jsx` | hover `translateY(-4px)` 제거, IconButton `boxShadow: 1` → divider border |
| `src/components/card/CardContainer.jsx` | `elevation` variant 의 shadow + hover translateY + focus shadow 제거 → border/bg 전환으로 대체 |
| `src/components/card/MoodboardCard.jsx` | overlay IconButton 2곳 `boxShadow: 0 2px 8px` → divider border, hover `translateY(-4px) + boxShadow` 제거 (actions opacity 만) |
| `src/components/input/SearchBar.jsx` | focus `boxShadow: 0 0 0 3px ...` → `none` |
| `src/components/input/TagInput.jsx` | focus shadow + suggestions panel `boxShadow: 2` 제거 |
| `src/components/overlay-feedback/ThemeExportDialog.jsx` | copy 버튼 `boxShadow: 1` → divider border |
| `src/components/typography/InlineTypography.jsx` | hover `scale(1.1) rotate + boxShadow` → opacity only |

### 필터 UI + 색상환

| 파일 | 변경 |
|------|------|
| `src/utils/colorSimilarity.js` | 신규 — hex↔HSL 변환, `isSimilarColor` (hue/sat/lightness 거리 + neutral 예외), `REPRESENTATIVE_COLORS` 16개 |
| `src/components/templates/ArchivePage.jsx` | `FilterAccordion` + `FilterSubRow` 내부 컴포넌트. 3 슈퍼섹션 (색상/디자인 레이어/비주얼 디렉션). `activeColors` HSL 유사도 매칭, `representativeCounts` useMemo (0건 숨김), 활성 swatch 에 카운트 뱃지. Hero `py {xs:3, md:5}` + h3 축소 |

### 페이지 미니멀 / 앰비언트

| 파일 | 변경 |
|------|------|
| `src/components/templates/ProjectListPage.jsx` | Hero 축소, `headerEnd` prop 추가 (Box + `새 프로젝트` + headerEnd 묶음) |
| `src/components/templates/SettingsPage.jsx` | Hero 축소, `headerEnd` → `headerPersistent` 전달, AI 모델 Select label 제거 |
| `src/components/templates/ProjectDetailPage.jsx` | `headerEnd` prop 추가 |
| `src/components/templates/ProjectCreateWizard.jsx` | 폼 필드 label 제거 → placeholder, Select `displayEmpty + renderValue` 패턴, `maxWidth: 620 mx: auto` 중앙 정렬 |
| `src/pages/ProjectCreateRoute.jsx` | multi-radial gradient 앰비언트 배경 + `maxWidth: 860` 중앙 래퍼 + `headerPersistent={<UserMenu />}` |
| `src/pages/auth/AuthPage.jsx` | 동일한 앰비언트 배경 적용, email/password `label` → `placeholder` |

### GNB 재구성

| 파일 | 변경 |
|------|------|
| `src/pages/UserMenu.jsx` | 신규 — Avatar + Menu dropdown (이메일 + 로그아웃) |
| `src/pages/MuseNav.jsx` | 좌측 로고 + nav 만. 기존 이메일/로그아웃 제거 |
| `src/pages/ArchiveRoute.jsx`, `ProjectListRoute.jsx`, `ProjectDetailRoute.jsx`, `SettingsRoute.jsx`, `ProjectCreateRoute.jsx` | `<UserMenu />` 를 `headerEnd` or `headerPersistent` 로 주입 |
| `src/App.jsx` | `<AuthProvider>` 이미 최상단 배치 (021 세션 결과) |

## 🧩 컴포넌트 작업

- **신규**: `UserMenu` (pages/ — auth + dropdown, `components/` 스킬 우회), `FilterAccordion`/`FilterSubRow` (ArchivePage 내부)
- **수정**: `ImageCard`, `CardContainer`, `MoodboardCard`, `SearchBar`, `TagInput`, `ThemeExportDialog`, `InlineTypography`, `ProjectListPage`, `SettingsPage`, `ProjectDetailPage`, `ProjectCreateWizard`, `MuseNav` — 전부 비파괴적 prop 확장 또는 sx 정리
- **신규 유틸**: `src/utils/colorSimilarity.js`

## ✅ 최종 결과

- 앱 전반 flat 톤 (elevation 0) + hover 색/opacity 변화만
- Archive 필터: 색상환 원 클릭 → 매칭 레퍼런스 자동 수렴 + 카운트 뱃지
- 모든 폼: floating label 사라지고 placeholder 만. 사이즈 크고 여유 있음
- GNB: 좌 로고+nav / 우 Avatar dropdown (이메일+로그아웃)
- 새 프로젝트 + 로그인 화면 동일 앰비언트 배경 + 중앙 정렬
- `pnpm build` 성공

## 🔁 재현 가이드

1. **테마 먼저**: `default.js` 의 `components` 블록에서 MuiPaper/AppBar/Card/Dialog/Button/IconButton/OutlinedInput/FilledInput 전부 `boxShadow: 'none'` 로 강제. Button root padding 32/10, sizeLarge 36/14. `defaultProps: { elevation: 0 }` + `disableElevation: true` 조합
2. **sx 하드코딩 감사**: `grep -rn "boxShadow\|translateY\|translate(" src/components` 로 잔재 찾기. hover 용은 제거, 레이아웃 용(carousel centering 등)은 유지
3. **색상 유사도 유틸**: `utils/colorSimilarity.js` — `hexToHsl`, `isSimilarColor(a, b, {hueTolerance: 30, satTolerance: 0.35, lightTolerance: 0.28})`. 양쪽 저채도(<0.12)면 L 만 비교, 한쪽만 저채도면 false
4. **REPRESENTATIVE_COLORS**: 12 hue (red/coral/orange/yellow/lime/green/teal/cyan/blue/indigo/purple/pink) + 4 neutral (black/gray/beige/white). Material 톤 Hex 사용
5. **FilterAccordion 패턴**: MUI Accordion `disableGutters elevation={0}` + `bgcolor: transparent` + `borderBottom: 1px divider` + `:before: display none`. 안쪽 AccordionSummary `px: 0 minHeight: 40`
6. **Select placeholder 패턴**: `<Select displayEmpty renderValue={v => !v ? <Box sx={{color:'text.secondary'}}>프로젝트 유형 선택</Box> : label(v)}>` — InputLabel 제거
7. **헤더 slot 확장**: 각 Page 템플릿에 `headerEnd` 옵셔널 prop 추가. headerPersistent 안에 기존 버튼 + `{headerEnd}` 를 Box 로 묶기. Route 가 `<UserMenu />` 주입
8. **UserMenu = Avatar dropdown**: 작은 Avatar (32×32) IconButton → MUI Menu 열어서 이메일 readonly + 로그아웃 MenuItem
9. **앰비언트 배경 레시피**: `radial-gradient(1200px 600px at 20% 10%, rgba(79,70,229,0.06) 0%, transparent 60%), radial-gradient(900px 500px at 80% 90%, rgba(20,19,43,0.05) 0%, transparent 55%), linear-gradient(180deg, #FCFCFF 0%, #F5F4FB 100%)` — AuthPage + ProjectCreateRoute 동일 적용
10. **Hero 축소**: `py { xs:4, md:8 }` → `py { xs:3, md:5 }`, h2 → h3 + 부제 삭제. 즉각적 미니멀 체감
11. **색상 swatch 카운트 뱃지**: `representativeCounts` 에서 매칭 개수 집계, 활성화 시 `position: absolute top:-6 right:-6` 에 원형 배지 렌더

> 💡 핵심 포인트:
> - **테마 오버라이드 + sx 하드코딩 수작업 제거 투트랙**: defaultProps + styleOverrides 만으로는 `sx={{boxShadow: ...}}` 같은 직접 지정은 못 막음. grep 감사가 필수 마무리
> - **hover 효과는 위치 아닌 색/opacity 만**: translate/scale 은 주의 분산. 색 변화만 남기면 차분한 톤 유지
> - **HSL 유사도 neutral 예외**: 저채도에서 hue 는 노이즈. Lightness 로만 비교하는 분기가 색상환 UX 자연스러움의 핵심
> - **Select placeholder**: InputLabel 을 쓰지 않고 `displayEmpty + renderValue` 로 통일. 모든 폼에서 라벨 형식 일관
> - **AppShell slot 은 수정 금지, Page 템플릿에 headerEnd 주입**: 공용 레이아웃 건드리지 않고 프로퍼티로 확장하는 게 안전
> - **앰비언트 배경 3-layer**: 2 radial + 1 linear. 한 장소만 쓰면 튀니까 AuthPage 와 ProjectCreate 둘 다 같은 레시피로 시각 일관성
> - **디자인 QA 는 "눈에 띄는 것부터" 말고 "전수 감사" 로**: 큰 결과만 먼저 하고 세부 미루면 다시 돌아와야 함. label 전수 / sx 감사 같이 시간 드는 것 앞에 배치
