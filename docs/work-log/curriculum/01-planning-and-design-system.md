# Stage 1. 기획 점검 + 디자인 시스템 세팅

> 선행: 없음 · 다음: [Stage 2](./02-ux-flow-and-components.md)

---

## ① 이번 Stage에서 만드는 것

**기획 문서 3종 + 디자인 토큰 + 전역 UI 규칙**.

30초 요약:
- MUSE가 무엇인지 / 어떤 화면이 있는지 / 어떤 비주얼인지를 3개 문서로 확정
- 확정된 비주얼을 `src/styles/themes/default.js`에 토큰으로 반영
- **토큰만으로는 안 잡히는 전역 규칙**(elevation, hover, placeholder, GNB, 앰비언트 배경)까지 이 Stage에서 전부 정의

> 이 Stage의 핵심 메시지: **"테마는 한 번에 끝낸다."** 나중에 QA로 고치는 비용이 크다. (실제 프로젝트에서는 022에서 뒤늦게 잡았지만, 교육용으로는 여기서 끝낸다.)

---

## ② 프리뷰 — 이번에 만질 것

| 종류 | 항목 | 신규/수정 |
|---|---|---|
| 문서 | `docs/muse/01-project-summary.md` | 신규 |
| 문서 | `docs/muse/02-ux-flow.md` | 신규 |
| 문서 | `docs/muse/03-visual-direction.md` | 신규 |
| 토큰 | `src/styles/themes/default.js` | 수정 |
| 스토리 | `src/stories/style/Colors.stories.jsx` 등 | 수정 (MUSE 토큰 동기화) |
| 컴포넌트 | `src/pages/MuseNav.jsx`, `src/pages/UserMenu.jsx` | 신규 (GNB 레이아웃) |
| 배경 | 앰비언트 배경 (multi-radial + linear 3-layer) | 신규 |

**이 Stage 이후 이 파일들은 웬만하면 다시 안 만진다.**

---

## ③ 설계 기준 (Spec)

### 기획 문서 규칙
1. Phase 1은 **MVP 스코프** (필수 6 + 선택 2) + **제외 범위**(코드 생성 / 협업 / 모바일 네이티브)를 명시
2. Phase 2는 **4 시나리오 Mermaid** + **IA 트리** + **컴포넌트 역할 7그룹**
3. Phase 3는 **Primary / 배경 / radius / elevation** 4가지 비주얼 규칙 확정
4. 각 Phase 끝에 **확인 포인트 N개** → 승인 게이트 후 다음으로

### 비주얼 규칙
| 항목 | 값 | 이유 |
|---|---|---|
| Primary | `#14132B` (near-black) | **이미지 퍼스트** — Primary가 튀면 레퍼런스 색 인식 방해 |
| 배경 | `#FCFCFF` / `#F8F8FC` (은은한 바이올렛 틴트) | 완벽한 흰색은 이미지 색 왜곡 |
| Accent | `#4F46E5` (바이올렛) | `info` 슬롯에 배정 |
| Card radius | `24px` **통일** | 클리커블/비클리커블 구분 삭제 |
| Button/Chip radius | `999px` | pill 일관 |
| 전역 `shape.borderRadius` | `0` | 컴포넌트별 오버라이드로만 확장 |
| elevation | **0** (전역) | 그림자 대신 radius + 배경 틴트로 위계 |
| MUI grey | **전면 교체** (커스텀 바이올렛 틴트 10단계) | 배경 톤과 동일 hue |

### 전역 UI 규칙 (토큰으로 안 잡히는 것)
- **hover = 색/opacity만**, 위치 이동(translateY 등) **금지**
- **라벨 제거 → placeholder 전수** (floating label 전면 제거)
- **GNB = 좌(로고+nav) / 우(Avatar dropdown)**
- **앰비언트 배경 = multi-radial + linear 3-layer** (body 배경)

---

## ④ 실습 순서

### Step 1. 기획 Phase 1 — project-summary 작성

`docs/muse/01-project-summary.md`를 아래 구조로 작성:

```markdown
# MUSE — Project Summary

## 배경
레퍼런스 이미지에서 디자인 토큰을 추출하는 도구. 디자이너가 "이런 무드로 가자"는 의도를 시각 언어로 빠르게 굳히기 위함.

## 핵심 기능 (필수 6 + 선택 2)
1. [필수] 레퍼런스 업로드 및 아카이빙
2. [필수] 자동 태깅 (AI)
3. [필수] 프로젝트 단위 레퍼런스 묶기
4. [필수] 디자인 토큰 추출 (색/타이포/레이아웃/그라데이션/비주얼디렉션)
5. [필수] 토큰 on/off + emphasis(0-2) 편집
6. [필수] 범용 JSON / ZIP Export
7. [선택] 자동 추천
8. [선택] 타이포그래피 상세 분석

## 제외 범위
- 코드 생성 (React/Vue 등)
- 협업·코멘트
- 모바일 네이티브 앱

## 성공 기준
- 업로드 2초 이내 썸네일 노출
- 프로젝트 생성 후 토큰 추출 30초 이내
- Export ZIP이 프레임워크 비종속

## 확인 포인트
- [ ] 저장소 전략 (로컬 → Supabase 2단계로 갈지)
- [ ] AI 모델 (Anthropic Claude)
- [ ] 유형 프리셋 우선순위
- [ ] 타이포 분석 범위 (font-family만 vs weight/size까지)
```

**핵심**: 제외 범위를 반드시 쓴다. 스코프 크립 차단용.

### Step 2. 기획 Phase 2 — ux-flow 작성

`docs/muse/02-ux-flow.md`에 아래 포함:

- **4 시나리오 Mermaid flowchart**:
  - 시나리오 A: 아카이빙 (업로드 → 자동태깅 → 그리드)
  - 시나리오 B: 프로젝트 생성 (Wizard 3-step)
  - 시나리오 C: 토큰 편집 (on/off + emphasis)
  - 시나리오 D: Export (ZIP / JSON)
- **IA 트리**: `/archive`, `/projects`, `/projects/new`, `/projects/:id`, `/settings`
- **컴포넌트 역할 7그룹** (A~G): Archive 관련 / Project 관련 / Token 편집 / Export / 공통 카드 / 공통 입력 / 네비게이션
- **토큰 편집 2축**: `on/off` + `emphasis(0-2)` — 삭제가 아닌 비활성화 기반

**핵심**: 신규/수정/재활용 컴포넌트 수를 그룹별 합계 표로 가시화. "재활용 먼저" 원칙 체화.

### Step 3. 기획 Phase 3 — visual-direction 작성 + 승인 게이트

`docs/muse/03-visual-direction.md`에 §③ 표를 그대로 기술. 변경 필드를 **`theme.js` 수정 입력 포맷**으로 나열:

```
palette.primary.main = #14132B
palette.info.main = #4F46E5
palette.background.default = #FCFCFF
palette.background.paper = #F8F8FC
shape.borderRadius = 0
components.MuiCard.styleOverrides.root.borderRadius = 24
components.MuiButton.styleOverrides.root.borderRadius = 999
```

**승인 게이트**: "이 비주얼로 진행해도 되는가"를 이해관계자에게 확인. 특히 **Primary=near-black**은 브랜드팀이 거부감 가질 수 있어 이미지 퍼스트 논리 사전 공유.

### Step 4. 토큰 적용 — `default.js` 수정

`src/styles/themes/default.js` 하나만 수정. 별도 파일 만들지 말 것.

```js
// src/styles/themes/default.js (발췌)
const theme = createTheme({
  palette: {
    primary: { main: '#14132B', contrastText: '#FFFFFF' },
    info: { main: '#4F46E5', contrastText: '#FFFFFF' },
    background: { default: '#FCFCFF', paper: '#F8F8FC' },
    grey: {
      50: '#FCFCFF', 100: '#F8F8FC', 200: '#EFEFF5',
      // ... 커스텀 바이올렛 틴트 10단계
      900: '#1A1930',
    },
  },
  shape: { borderRadius: 0 },
  components: {
    MuiPaper: { defaultProps: { elevation: 0 } },
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { borderRadius: 999 } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 999 } } },
    MuiCard: { styleOverrides: { root: { borderRadius: 24 } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 24 } } },
    MuiIconButton: { styleOverrides: { root: { boxShadow: 'none' } } },
  },
});
```

**함정 주의**:
- `MuiPaper` default `elevation: 0` 을 빠뜨리면 Card/Dialog에서 그림자 튀어나옴
- `MuiButton`은 `disableElevation: true` 까지 해야 클릭 시 elevation 안 생김
- `shape.borderRadius = 0` 을 안 지우면 Table/TextField 등 의도치 않은 곳에 radius 붙음

### Step 5. Storybook 색상 스토리 동기화

`src/stories/style/Colors.stories.jsx` 등에서 **MUI 원시 import 제거**:

```js
// ❌ 제거
import { grey, blueGrey } from '@mui/material/colors';

// ✅ 테마 토큰 참조
import { useTheme } from '@mui/material';
const theme = useTheme();
const swatches = Object.entries(theme.palette.grey);
```

**이유**: 원시 import가 남아있으면 토큰 교체 효과가 스토리에 반영 안 됨.

### Step 6. GNB 레이아웃 — MuseNav + UserMenu

`src/pages/MuseNav.jsx`:
- 좌측: 로고 + nav links (`/archive`, `/projects`, `/settings`)
- 우측: `<UserMenu />` (Avatar + dropdown)

`src/pages/UserMenu.jsx`:
- Avatar 클릭 시 이름/이메일/로그아웃 dropdown
- Stage 5에서 Auth 붙이기 전까진 mock 데이터로 진행

**규칙**: GNB는 이 파일에서만 렌더. 페이지 템플릿에 GNB 포함시키지 말 것 (레이아웃 중복 방지).

### Step 7. 앰비언트 배경 — multi-radial + linear

body 배경에 3-layer gradient:
```css
background:
  radial-gradient(ellipse at 10% 10%, rgba(79, 70, 229, 0.04), transparent 50%),
  radial-gradient(ellipse at 90% 20%, rgba(20, 19, 43, 0.03), transparent 40%),
  linear-gradient(180deg, #FCFCFF 0%, #F8F8FC 100%);
```

**위치**: `default.js`의 `MuiCssBaseline.styleOverrides.body` 또는 `index.css`. **절대 페이지 컴포넌트 내부에 주지 말 것** (스크롤 시 배경 끊김).

---

## ⑤ 체크리스트

- [ ] `docs/muse/01-project-summary.md` 작성 — 필수 6 + 선택 2 + 제외 범위 포함
- [ ] `docs/muse/02-ux-flow.md` 작성 — 4 시나리오 Mermaid + IA + 컴포넌트 7그룹
- [ ] `docs/muse/03-visual-direction.md` 작성 + **이해관계자 승인**
- [ ] `default.js` 수정 — Primary/info/background/grey 전면 교체
- [ ] `MuiPaper` elevation=0 전역, `MuiButton` disableElevation
- [ ] Card/Dialog radius=24, Button/Chip radius=999, 전역 shape.borderRadius=0
- [ ] Storybook 색상 스토리가 MUSE 토큰으로 렌더됨
- [ ] MuseNav + UserMenu 컴포넌트 (mock)
- [ ] body 앰비언트 배경 (3-layer) 적용
- [ ] Storybook에서 Button / Card / Dialog hover 시 **위치 이동 없음** 확인

---

## ⑥ 원본 로그 레퍼런스

이 Stage의 출처:
- **001** (Phase 1 기획) → Step 1
- **002** (Phase 2 UX flow) → Step 2 *(컴포넌트 리스트는 Stage 2에서도 재참조)*
- **003** (Phase 3 비주얼 디렉션) → Step 3
- **004** (토큰 적용) → Step 4, 5
- **022** (디자인 QA 전수) → **Step 4의 elevation=0, hover 규칙 / Step 6의 GNB 재구성 / Step 7의 앰비언트 배경**이 이 로그에서 왔다

### 실제 진행 이력 부록

> 프로젝트에서는 022가 **거의 마지막**(2026-04-23)에 나왔다. 토큰 세팅(004)에서는 `MuiPaper` elevation=0 설정을 빠뜨려서, 이후 컴포넌트·페이지를 다 만든 뒤 QA 단계에서 **하나씩 elevation=0을 추가하는 작업**이 발생했다. hover 위치 이동, floating label, GNB 레이아웃도 같은 이유로 뒤늦게 정비됐다.
>
> **교훈**: 전역 UI 규칙은 토큰과 같은 시점에 확정해야 한다. 컴포넌트를 만들고 난 뒤에 잡으면, 이미 작성된 컴포넌트를 전수 감사해야 한다.
>
> 교육용으로는 이 시행착오를 숨기고 **처음부터 이 규칙들을 토큰과 함께 적용**하도록 Stage 1을 재구성했다.

---

**다음 Stage**: [Stage 2. UX flow + 컴포넌트 만들기](./02-ux-flow-and-components.md)
