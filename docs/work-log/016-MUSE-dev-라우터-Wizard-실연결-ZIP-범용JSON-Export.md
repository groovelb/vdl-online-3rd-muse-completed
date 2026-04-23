---
session: 016
date: 2026-04-22
title: MUSE — dev 라우터 + Wizard T2/T3 실연결 + ZIP 번들/범용 JSON Export 전환
---

# 016. MUSE — dev 라우터 + Wizard T2/T3 실연결 + ZIP 번들/범용 JSON Export 전환

## 🎯 User Goal

> 두 가지 요청을 연달아 처리.
> (1) "dev에서 테스트 가능하도록 라우터 세팅 + 1 로컬세션에서 end-to-end flow 체험 가능한 프로덕션 구조".
> (2) Export를 MUI theme 코드 대신 **ZIP 번들(레퍼런스 이미지 + JSON 토큰 + 비주얼 디렉션 MD)** 로 내보내고, JSON은 **MUI 비종속 범용 스키마**로 출력. 외부 AI 코딩 도구에 그대로 input으로 투입 가능한 형태.

## 🔑 주요 의사결정

- **`src/pages/` 컨테이너 계층 신설 (페이지 템플릿은 건드리지 않음)**: 기존 `components/templates/*` 는 그대로 Storybook용 풀 stateless 템플릿 유지, 라우팅·store 연결·navigate는 모두 `src/pages/*Route.jsx` 래퍼에서 처리. 이중 구조로 스토리 회귀 0.
- **Router는 React Router v7, index → `/archive` redirect**: MUSE 메인 경험이 아카이브이므로. 5 route: archive / projects / projects/new / projects/:id / settings. 404는 `/archive`로 리디렉트.
- **ProjectCreateWizard에 `recommendedLoader` prop 추가**: Step 2 진입 시 T2 자동 호출. 기존 `recommended` 정적 prop은 유지 (Storybook 호환). `useEffect`로 step 전환 감지해 비동기 fetch.
- **Wizard `onComplete({ form, referenceIds, analysis })` 시그니처 변경**: 기존 `{ ...form, referenceIds }` 평면 구조에서 `analysis` 필드 추가 객체로. `onAnalyze`의 반환값(T3 결과)을 onComplete까지 전달해 Route가 store에 저장 가능하게. 기존 스토리 1개도 새 시그니처로 호환 수정.
- **`vite.config.js`에도 `museApiPlugin` 추가**: 기존엔 Storybook만 `/api/anthropic/*` 프록시. `pnpm dev`에서도 똑같이 작동하려면 메인 Vite dev server에도 플러그인 등록. Storybook 프리뷰와 앱이 같은 프록시 구현 공유.
- **VD.md 단독 다운로드 버튼 제거 → ZIP 안으로 통합**: 초기엔 `VD.md` 헤더 버튼을 별도로 뒀지만 ZIP 번들이 더 풍부한 산출물을 주는 시점에 UX 단순화. 다이얼로그에서 "muse.json만" / "ZIP 번들" 두 경로만 남김.
- **범용 JSON 스키마 = MUI theme 키 전면 제거**: 기존 `palette.primary.main` / `typography.h1` 등 MUI 특화 구조를 버리고 `color.tokens[]` / `typography.tokens[]` / `layout.tokens[]` / `gradient.tokens[]` + `visualDirection` + `references[]` + `meta` 의 7 슬롯 평면 구조. 각 토큰은 `hex` · CSS value 그대로 들어있어 **프레임워크 비종속**. `serializeTheme.js` 유틸은 참고용으로 남기고 더 이상 사용 안 함.
- **JSZip 라이브러리 도입**: 브라우저 native `CompressionStream`은 단일 stream만 가능해 ZIP 컨테이너(엔트리 여러 개) 불가. JSZip(100KB gzip)이 API 간결 + 현 시점 사실상 표준.
- **이미지 fetch 실패는 `.error.txt` 파일로 대체**: ZIP 생성 중 한 장 fetch 실패해도 전체 ZIP이 깨지지 않게. 사용자는 압축 해제 후 "어떤 이미지가 빠졌는지" 즉시 알 수 있음.
- **README.md를 ZIP 안에 자동 생성**: Cursor/Claude Code/ChatGPT 용 예시 프롬프트 + 스키마 요약 포함. 사용자가 다른 환경에서 이 ZIP을 받았을 때 "어떻게 쓰지?" 탐색 비용 0.

## 💬 Claude의 핵심 반응

- **컨테이너 페이지와 페이지 템플릿 분리**: Storybook이 페이지 템플릿을 직접 소비하고, App은 `*Route.jsx`를 소비. 기존 스토리 26개가 수정 없이 그대로 통과.
- **`logo={ <MuseNav /> }` 슬롯 재활용**: 각 페이지 템플릿은 이미 `logo` prop을 지원하고 있어, Nav 컴포넌트를 logo slot에 주입하는 것만으로 모든 페이지에 통일된 네비 바 적용. AppShell API 변경 불필요.
- **Wizard의 onComplete 시그니처 변경을 "Storybook 호환 + 타입 명시 교체"로 한 턴 마감**: `onComplete({ ...state.form, referenceIds })` 2곳 모두 `{ form, referenceIds, analysis }` 로 변경, 기존 스토리 1곳도 즉시 수정. breaking change지만 호출처가 2곳이라 파급 최소.
- **Universal JSON에 `description` 필드 삽입**: 각 레이어마다 한 줄 한글 설명. Claude/GPT가 JSON을 소비할 때 레이어 의미를 추가 프롬프트 없이 자체 파악하게 하는 "LLM 친화 주석".
- **`sourceReferenceIds` 를 토큰에 그대로 보존**: export 후에도 "이 토큰이 어떤 이미지에서 왔는지" 추적 가능. AI가 Regenerate 요청받았을 때 같은 seed 되찾기 용이.
- **ZIP download 파일명은 `muse-{slug}-{YYYY-MM-DD}.zip`**: 프로젝트명 slugify + 오늘 날짜. 여러 번 export해도 overwrite 되지 않음.

## 📂 변경된 파일

### 신규 (7)

| 파일 | 요약 |
|------|------|
| `src/pages/ArchiveRoute.jsx` | `/archive` — store + navigate + MuseNav |
| `src/pages/ProjectListRoute.jsx` | `/projects` — store projects → 썸네일 파생 (현재 references에서) |
| `src/pages/ProjectCreateRoute.jsx` | `/projects/new` — Wizard wrap, `recommendedLoader`에 T2 실호출, `onAnalyze`에 T3 실호출, `onComplete`에서 store.addProject + store.setAnalysis + navigate |
| `src/pages/ProjectDetailRoute.jsx` | `/projects/:id` — useParams, store.getAnalysis, updateLayer, 404 fallback, references 주입 |
| `src/pages/SettingsRoute.jsx` | `/settings` — store settings 양방향 |
| `src/pages/MuseNav.jsx` | 공용 상단 네비 — NavLink active 스타일링 |
| `src/pages/index.js` | barrel |
| `src/utils/museExport.js` | `buildUniversalJson` · `exportProjectAsZip` · `downloadUniversalJson` · README/확장자 헬퍼 |

### 수정 (8)

| 파일 | 요약 |
|------|------|
| `src/App.jsx` | BrowserRouter + 6 Route (index→/archive redirect, 4 page, 404 fallback) |
| `vite.config.js` | `museApiPlugin()` 추가 → `pnpm dev`에서도 `/api/anthropic/*` 작동 |
| `src/components/templates/ProjectCreateWizard.jsx` | `recommendedLoader` prop 지원, onAnalyze 반환값을 onComplete에 `analysis` 필드로 전달 |
| `src/components/templates/ProjectCreateWizard.stories.jsx` | 새 `onComplete` 시그니처에 맞춰 result 수신 |
| `src/components/templates/ProjectDetailPage.jsx` | `references` prop 추가, VD.md 헤더 버튼 제거, Export 아이콘을 FolderZip으로, `buildThemeObject` 헬퍼 완전 제거 |
| `src/components/templates/ProjectDetailPage.stories.jsx` | `references` 전달 |
| `src/components/overlay-feedback/ThemeExportDialog.jsx` | `themeObject` prop 제거 → `project`/`analysis`/`references` 3 props. 내용: createTheme 코드 → 범용 JSON 프리뷰 + ZIP/JSON 다운로드 이중 액션 + 패키징 상태 표시 |
| `src/components/overlay-feedback/ThemeExportDialog.stories.jsx` | 새 props에 맞춘 스토리 3종 (Default/DashboardProject/MissingPrimaryWarning) |
| `package.json` | `jszip` dependency 추가 |

## 🧩 컴포넌트 작업

- **신규(1)**: `MuseNav` — NavLink 기반 공용 상단 네비게이션
- **수정**: `ProjectCreateWizard` (recommendedLoader + onComplete 시그니처), `ProjectDetailPage` (props 확장 + 내부 buildThemeObject 제거), `ThemeExportDialog` (완전 재작성)
- **재활용**: 기존 페이지 템플릿 4종(Archive/ProjectList/ProjectDetail/Settings) + `MuseStoreProvider`

## ✅ 최종 결과

- `pnpm dev` 단일 명령으로 `http://localhost:5173/` 에서 end-to-end 플로우 체험 가능:
  1. `/archive` → 27장 더미 + 업로드 시 T1 실태깅 + localStorage persist
  2. "새 프로젝트" → Wizard Step 1 입력 → Step 2 진입 즉시 T2 실호출하여 추천 표시 → 선택 → Step 3 T3 실호출 → `/projects/:id` 자동 이동
  3. 상세 페이지에서 토큰 편집 → Export → 다이얼로그에서 범용 JSON 확인 → "ZIP 번들 다운로드"
  4. 받은 `muse-{slug}-YYYY-MM-DD.zip` = README + muse.json + visual-direction.md + references/*.jpg
- Export 산출물은 **프레임워크 비종속**. AI 코딩 도구에 바로 drag-drop 하여 "이 토큰으로 구현하라" 프롬프트와 함께 사용 가능.

## 🔁 재현 가이드

1. **라우팅 계층은 페이지 템플릿과 분리**: `src/components/templates/*` (Storybook용 stateless)과 `src/pages/*Route.jsx` (라우팅 + store + navigate) 분리. 한 컴포넌트가 두 역할을 하지 않게.
2. **Wizard 자동 태스크 호출 패턴**:
   - `recommendedLoader: async ({ intent, type }) => Array<item>` prop 추가
   - 내부 `useEffect`에서 step 전환 감지 → 호출 → 로컬 state에 저장
   - 기존 정적 `recommended` prop은 유지 (Storybook 등 외부 주입)
3. **Wizard onComplete 시그니처 바꿀 땐 호출처 동시 수정**: 이전 `(project) => void` → 새 `({ form, referenceIds, analysis }) => void`. `onAnalyze` 반환값을 Wizard가 기억했다가 onComplete에 함께 전달하는 점이 핵심.
4. **vite.config.js에 Storybook 플러그인 공유**: `museApiPlugin`을 `.storybook/`에 두고 `vite.config.js`에서 import하여 `plugins: [react(), museApiPlugin()]`. 환경변수 로딩/프록시 로직이 두 개 서버에서 동일하게 작동.
5. **ZIP 번들 설계**:
   - JSZip 사용, `zip.file('muse.json', ...)` + `zip.folder('references')` + 이미지 Promise.all fetch
   - 이미지 실패 시 `.error.txt` 로 대체 (전체 번들 생성 중단 방지)
   - `generateAsync({ type: 'blob' })` → `URL.createObjectURL` → `<a download>` 다운로드
6. **범용 JSON 스키마 원칙**:
   - 프레임워크 식별자(`palette.primary.main` 같은 MUI 키) 금지
   - `hex` · CSS value · enum · boolean만 허용
   - 각 레이어에 한 줄 `description` (LLM이 JSON만 보고도 의미 파악 가능)
   - 토큰의 `sourceReferenceIds` 보존 (추적성)
   - `references[].filename` 은 ZIP 내부 경로 (`references/ref-001.jpg`)
7. **README.md 자동 생성**: ZIP 번들 수령자가 별도 안내 없이 바로 쓸 수 있도록. Cursor/Claude Code 프롬프트 예시 + 스키마 설명 포함.

> 💡 핵심 포인트:
> - **페이지 템플릿은 stateless, 라우팅 계층은 store-aware**: 이 분리가 Storybook ↔ 프로덕션 앱 양립의 핵심. 페이지 템플릿에 router hook을 직접 집어넣으면 Storybook에서 MemoryRouter 데코레이터 등 복잡한 우회 필요.
> - **Export는 "프레임워크 비종속 JSON" 원칙 고수**: MUI specific key가 하나라도 들어가면 AI 도구가 Tailwind 프로젝트에서 이 번들을 받았을 때 변환 프롬프트 비용 발생. HEX/CSS value만 남기면 "toTailwind / toStyled" 같은 어댑터는 소비 측에서 쉽게 작성 가능.
> - **다중 서버 플러그인은 한 파일에서 export**: `.storybook/museApiPlugin.js` 하나를 Storybook + Vite main 양쪽에서 import. 키 로딩/릴레이 로직 이원화하면 환경 간 동작 차이 debug 지옥.
> - **ZIP에 README를 넣으면 수령자의 학습비용이 거의 0**: 압축 해제 순간 바로 "이게 뭔지 + 어떻게 쓰는지" 파악. AI 도구는 README를 프롬프트 context로 읽고 알아서 해석.
> - **breaking change의 범위를 체크 후 감행**: Wizard onComplete 시그니처 변경은 호출처 2곳 + 스토리 1곳 = 총 3 파일. 이 정도면 breaking change도 한 턴에 정리 가능. 호출처가 수십 개면 호환 어댑터를 두는 편이 낫다.
