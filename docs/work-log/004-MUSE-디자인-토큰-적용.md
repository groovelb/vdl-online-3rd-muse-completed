---
session: 004
date: 2026-04-22
title: MUSE 비주얼 디렉션 기반 디자인 토큰 적용 (theme + Storybook 스토리 동기화)
---

# 004. MUSE 비주얼 디렉션 기반 디자인 토큰 적용 (theme + Storybook 스토리 동기화)

## 🎯 의도 (User Goal)

> Phase 3 visual-direction 승인 후 실제 디자인 토큰 최적화 작업 시작. 먼저 디자인 시스템 구조 파악 → `src/styles/themes/default.js` 전면 수정 → Storybook 스타일 스토리들도 MUSE 토큰 기준으로 맞춤.

## 🔑 주요 의사결정

- **토큰은 `default.js` 단일 파일에서만 관리**: 별도 토큰 json이나 신규 파일 만들지 않고 기존 9개 섹션(palette/typography/spacing/shape/shadows/breakpoints/zIndex/transitions/components) 구조 그대로 유지하며 값만 교체 — 시스템 구조 파악 시 단일 진실 원천이 이미 잘 잡혀있다고 판단.
- **전역 `shape.borderRadius: 0` 유지 + 컴포넌트 오버라이드로만 radius 확장**: "누를 수 있는 것만 둥글다" 원칙을 코드 구조에도 반영. `MuiButton/IconButton/Chip=999px`(pill), `MuiOutlinedInput/FilledInput=16px`, `MuiCard/MuiDialog=24px`. 신규 오버라이드 5개 추가.
- **near-black은 `#14132B` 단일 값으로 ink 개념**: `primary.main`과 `text.primary`를 같은 값으로 묶어 "UI 잉크" 하나의 축으로 통일. hover는 `#2D2B5A`.
- **MUI 기본 grey 스케일 → MUSE 커스텀 바이올렛 틴트 스케일 전면 교체**: `50=#FAFAFD`부터 `900=#14132B`까지 직접 지정. 기존 `grey[50]`/`blueGrey[900]` import 제거해 드리프트 방지.
- **바이올렛 `#4F46E5`를 `info.main` (Accent) 슬롯에 둠**: Primary에서 밀려난 바이올렛을 별도 커스텀 키가 아닌 MUI 표준 `info` 슬롯에 배치 — 기존 컴포넌트가 color="info"로 참조 가능하게 해서 API 호환성 유지.
- **Shadow 색상도 near-black 틴트로 동기화**: `rgba(0,0,0,...)` → `rgba(20,19,43,...)`. 색 하나 바꾸는 게 아니라 shadow·divider·action까지 같은 축으로 당겨야 톤이 진짜 바뀐다.
- **`defaultTheme.dashboard` 커스텀 확장도 함께 손봄**: 하드코딩된 `#FFFFFF` 카드 그라디언트, 검정 rgba divider/shadow를 전부 MUSE 톤으로 교체. 단순 theme 수정이 아니라 **프로젝트 전역 전파**.
- **Storybook 스토리는 useTheme 기반은 자동 반영, 하드코딩된 `Colors.stories.jsx` Palette 섹션만 수정**: 스토리 4개(Overview/Typography/Spacing/ComponentTokens)는 `useTheme()` 패턴이라 토큰 변경만으로 자동 갱신. Colors.stories의 `Palette` 스토리가 유일하게 MUI 원시 색상(`blue, blueGrey, grey, lightBlue`) 직접 import 해 MUSE와 무관한 옛 레퍼런스를 그리고 있어서 해당 부분만 재작성.

## 💬 Claude의 핵심 반응

- **Step 시작 전 구조 파악 보고서 먼저 제시**: 파일 위치(`src/styles/themes/default.js`), 9개 섹션, `defaultTheme.dashboard` 커스텀 확장의 존재, `.storybook/preview.jsx`가 defaultTheme을 주입하는 경로, story sort 구조까지 정리. 바로 수정 들어가지 않고 "작업 범위 합의 게이트"로 사용.
- **Step A vs Step B 분리 제안**: theme 수정과 Storybook 검증을 단계 분리해 한 번에 너무 많은 변화가 들어가지 않게. 승인 후 Step A 진행.
- **"등록됨?" 질문에 대한 정확한 해석**: 사용자가 Storybook 반영 여부를 묻자 자동 반영 경로(decorator → ThemeProvider → useTheme)를 먼저 설명하고, 자동 반영되지 않는 1건(MUI 원시 import)만 콕 짚어 후속 수정 제안 → 이후 "다 바꿔야 해" 지시 수령.
- **값 하드코딩 대신 theme 참조로 수렴**: `Colors.stories.jsx`의 `#f5f5f5` 코드 블록 배경을 `grey.100`으로, `rgba(0,0,0,*)` 텍스트 오버레이를 `rgba(20,19,43,*)`로 교체해 토큰이 또 한 번 드리프트하더라도 자동 반영되게.
- **MUI 원시 색상 import를 아예 제거**: `blue/blueGrey/grey/lightBlue`를 지워 "MUSE 원시 스케일"로 바뀐 스토리의 정체성을 명확히 함 (`red/orange/green`만 Error/Warning/Success 상태 기본값 참고용으로 남김).

## 📂 변경된 파일

| 파일 | 종류 | 요약 |
|------|------|------|
| `src/styles/themes/default.js` | 수정 | palette/typography/shadows 전면 재정의 + components 오버라이드 확장(MuiIconButton/MuiOutlinedInput/MuiFilledInput/MuiDialog 신규) + dashboard 커스텀 확장 톤 동기화 + 파일 상단 철학 주석 갱신 |
| `src/stories/style/Colors.stories.jsx` | 수정 | MUI 원시 blue/blueGrey/grey/lightBlue import 제거, `museNeutralScale`/`museAccentScale` 모듈 상수 추가, `Palette` 스토리 MUSE 기준으로 재작성, 내부 블록의 `rgba(0,0,0,*)` + `#f5f5f5` 하드코딩을 theme 참조로 교체 |

## 🧩 컴포넌트 작업

신규 컴포넌트 생성 없음. 토큰 오버라이드로만 MUI 기본 컴포넌트 모양을 MUSE 방향으로 당김.

- **MUI 컴포넌트 오버라이드 확장**: `MuiButton`(pill + padding), `MuiIconButton`(pill, 신규), `MuiChip`(4 → 999), `MuiOutlinedInput`(16, 신규), `MuiFilledInput`(16, 신규), `MuiCard`(0 → 24), `MuiDialog.paper`(24, 신규), `MuiPaper`(backgroundImage:none 추가)
- 기존 재활용 컴포넌트(`ImageCard`, `MoodboardCard`, `CardContainer`, `FileDropzone` 등)는 내부에서 `theme.palette.*` / MUI variant API를 참조 중일 것이므로 theme 교체만으로 새 톤 반영 (실제 확인은 Step B에서 Storybook로).

## ✅ 최종 결과

MUSE 비주얼 디렉션이 theme 레벨로 구현되어 앱/Storybook 모두에 반영. `pnpm storybook` 띄우면 Style/Colors·Typography·Spacing·Overview·Component Tokens 전부 새 토큰 기준으로 그려짐. Step B(실행 검증)는 미진행 상태.

## 🔁 재현 가이드 (교육생용)

1. Phase 3 visual-direction 승인 후 Claude에게 "디자인 토큰 최적화 작업 시작, 지금 디자인 시스템 구조 파악" 지시.
2. Claude가 먼저 `src/styles/` 디렉토리 구조, `default.js` 9섹션, `defaultTheme.dashboard` 커스텀 확장, `.storybook/preview.jsx` 경로, `src/stories/style/` 목록을 스캔해 **작업 범위 보고서**를 제시하고 Step A/B 분리 제안. 승인 후에만 편집 착수.
3. `src/styles/themes/default.js` 섹션별로 `Edit` 도구 사용:
   - 파일 상단 주석 철학 문구 교체 ("Sharp Corners / Pure White / Brand Blue" → "Image-First Neutral / Subtle Tint / Sharp by default, Round on clickables")
   - `import { blueGrey, grey }` 제거
   - palette 전체 교체: primary=`#14132B` (hover `#2D2B5A`), secondary=`#5A586E`, text.primary=`#14132B`, text.secondary=`#7A798E`, background=`#FCFCFF`/`#F8F8FC`, divider=`rgba(20,19,43,0.08)`, action rgba 틴트, grey 10단계 직접 지정, info=`#4F46E5`(Accent)
   - typography: h1 `clamp(3rem,6vw,6rem)` weight 700, h2 `clamp(2rem,4vw,3.5rem)`, h3 `clamp(1.5rem,2.5vw,2rem)`, body line-height 1.7, button weight 500 non-uppercase 15px
   - customShadows: `rgba(0,0,0,*)` → `rgba(20,19,43,*)`
   - components: MuiButton pill, MuiIconButton pill (신규), MuiChip 999, MuiOutlinedInput 16 (신규), MuiFilledInput 16 (신규), MuiCard 24, MuiDialog.paper 24 (신규), MuiPaper backgroundImage:none
   - `defaultTheme.dashboard`: `#FFFFFF`·`#FAFAFA` 그라디언트 → `#F8F8FC`/`#F3F3F9`, 검정 rgba → near-black rgba, cardBorderRadius 0 → 24, subBorderRadius 0 → 16, progressBorderRadius 0 → 999, accentColor → `#4F46E5`
4. `src/stories/style/Colors.stories.jsx` 수정:
   - `import { blue, blueGrey, grey, lightBlue }` 제거 (red/orange/green만 유지)
   - 파일 상단에 `museNeutralScale` / `museAccentScale` 상수 10단계 정의
   - `PaletteScale`/`SemanticColorBlock`/`SingleColorBlock` 내부의 `rgba(0,0,0,*)` 텍스트 오버레이와 `rgba(0,0,0,0.1)` 보더를 `rgba(20,19,43,*)` + `'divider'` theme 참조로 교체. `borderRadius: 1` → `3`.
   - `Palette` 스토리 본체 재작성: "Blue = Primary 기반" 설명 삭제, `museNeutralScale`/`museAccentScale` + MUI red/orange/green 3섹션. 명도 가이드를 MUSE 실제 토큰값과 직접 연결된 설명으로.
   - 하단 `Usage` 스토리 내 코드 블록 `backgroundColor: '#f5f5f5'` 2곳 → `'grey.100'`, `borderRadius: 2`.
5. 검증: `grep -rn "rgba(0, 0, 0\|rgba(0,0,0\|#f5f5f5\|blueGrey\|grey\["` 로 잔존 하드코딩/Import 없음 확인.

> 💡 핵심 포인트:
> - **토큰 변경 = 색 하나 바꾸는 게 아니라 축 전체 재정렬**. primary를 바꿨으면 shadow/divider/action/grey 스케일도 같은 축으로 같이 끌어와야 톤이 진짜 변한다.
> - **전역 `shape.borderRadius: 0` 유지 + 컴포넌트 오버라이드로만 radius 확장**이 "어포던스 대비" 원칙을 코드 구조에까지 반영하는 방법. 전역 값을 바꾸면 원칙이 무너진다.
> - **Storybook 스토리가 theme를 읽는지(useTheme) vs 값을 하드코딩하는지 먼저 판별**하면 수정 범위가 80% 줄어든다. 자동 반영되는 스토리는 건드리지 말 것.
> - **`defaultTheme.dashboard` 같은 커스텀 확장**은 theme 변경의 사각지대. 같은 파일 안에서 하드코딩된 흰색/검정이 있는지 항상 별도 점검.
