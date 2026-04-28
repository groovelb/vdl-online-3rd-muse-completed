# MUSE TP1~TP6 — 스토리북 등록 계획

> 작성일: 2026-04-28
> 근거: `04-ux-intervention-roadmap.md` (TP1~TP6 + 시스템 프롬프트 업데이트) + `docs/muse/02-ux-flow.md` (정정된 UX flow + 데이터 모델)
> 목적: 신규 데이터 모델 / UX 요소 / 컴포넌트를 스토리북에 어떻게 등록할지 사전 설계. 코드 진입 전 등록 단위·계층·동선까지 결정.

---

## 0. 등록 원칙

### 스토리북 카테고리 매핑 (기존 컨벤션 준수)
- **Style** (`src/stories/style/`) — 디자인 토큰·아이콘 등 정적 자원. **신규 등록 없음** (이번 변경은 토큰 자체엔 영향 없음).
- **Overview** (`src/stories/overview/`) — 프로젝트 내러티브·로드맵·레퍼런스 매핑. **신규 등록 1개 (UX Intent Map)**.
- **MUSE** (`src/stories/muse/`) — MUSE 도메인 기획·스키마·AI 태스크. **신규 1개 + 기존 3개 수정**.
- **Page** (`src/stories/page/`) — 페이지 통합 스토리. **기존 ArchivePage·ProjectCreateWizard·ProjectDetailPage 수정**.
- **Template** (`src/stories/template/`) — 템플릿 합본. **변경 없음**.
- **Component-level** (`src/components/{category}/*.stories.jsx`) — 단일 컴포넌트. **신규 4개 + 기존 4개 수정**.

### 등록 단위 결정 기준
1. **신규 작은 컴포넌트** = 자체 스토리 파일 (component-level)
2. **기존 컴포넌트의 새 prop·variant** = 기존 스토리 파일에 새 export 추가
3. **데이터 모델 변경** = `src/stories/muse/References.stories.jsx`·`Projects.stories.jsx` 의 schema 섹션 업데이트
4. **시스템 프롬프트 변경** = `src/stories/muse/AITasks.stories.jsx` 의 IO/UX/DataModel 섹션 업데이트
5. **TP 전체 그림** = `src/stories/overview/UXIntent.stories.jsx` 신규 (내러티브 + 6 TP 한눈에)

---

## 1. 데이터 모델 등록 계획

### 신규/변경 필드 4개

| 필드 | 위치 | 등록 스토리 |
|---|---|---|
| `Reference.userIntent` (TP1) | `src/data/muse/schemas.js` typedef | `src/stories/muse/References.stories.jsx` schema 섹션 |
| `Project.mode` (TP2) | `src/data/muse/schemas.js` typedef | `src/stories/muse/Projects.stories.jsx` schema 섹션 |
| `Project.selectedRefs[].useLayers` (TP4) | `src/data/muse/schemas.js` typedef | `src/stories/muse/Projects.stories.jsx` schema 섹션 |
| `AnalysisLayers.*[].decisionRationale` (TP6) | `src/data/muse/schemas.js` typedef (token 단위) | `src/stories/muse/AnalysisResults.stories.jsx` schema 섹션 |

### 등록 형태 — schema 섹션 추가 패턴

기존 `References.stories.jsx` 맨 위에 schema 표가 있다면 그 표에 행 추가:

```jsx
// References.stories.jsx — schema 섹션 추가
<TableRow>
  <TableCell>userIntent</TableCell>
  <TableCell><code>{`{ aspect, note? }`}</code></TableCell>
  <TableCell>옵셔널</TableCell>
  <TableCell>TP1: 업로드 시 사용자가 "왜 좋았는지" 답한 선택값</TableCell>
</TableRow>
```

스토리 1개 신규 — `Reference / Schema with userIntent`:
- userIntent 미설정 vs aspect="color" vs aspect="mood"+note 의 3가지 fixture 비교 표시

### 데이터 모델 카드 컴포넌트 생성 (선택)
필요 시 `src/components/data-display/SchemaCard.jsx` 신규로 만들어 모든 schema 시각화 통합. 단, 이번 단계에선 **테이블만으로 충분**. 새 컴포넌트는 보류.

---

## 2. UX 요소(TP1~TP6) 등록 계획

### TP별 등록 매트릭스

| TP | UX 요소 | 컴포넌트 위치 | 신규/수정 | 스토리북 등록 |
|---|---|---|---|---|
| ~~**TP1**~~ | ~~레퍼런스 업로드 chip~~ | **폐기** (2026-04-28). UserIntentChipRow + 스토리 + 통합 모두 제거됨 |  |  |
| **TP2** | 프로젝트 모드 선택 카드 3개 | 신규 `src/components/card/ModeSelectCard.jsx` | **신규** | 신규 `card/ModeSelectCard.stories.jsx` (3 모드 variants) |
| **TP3** | 의도 시드 칩 + 예시 토글 | 신규 `src/components/input/IntentSeedField.jsx` (TextField 확장) | **신규** | 신규 `input/IntentSeedField.stories.jsx` |
| **TP4** | 카드 layer chip (자동/수동 토글) | `src/components/card/ImageCard.jsx` 의 새 slot **OR** 신규 `ReferenceLayerChipRow` | **수정 + 신규 sub-component** | `card/ImageCard.stories.jsx` 새 export `WithLayerChips` + 신규 `card/ReferenceLayerChipRow.stories.jsx` |
| **TP5** | 분석 직전 확인 박스 | 신규 `src/components/overlay-feedback/AnalysisConfirmBox.jsx` | **신규** | 신규 `overlay-feedback/AnalysisConfirmBox.stories.jsx` |
| **TP6** | 토큰 카드 출처 펼침 | `src/components/data-display/ColorSwatchList.jsx` (+ Typography·Layout·Gradient Preview 동일 패턴) | **수정** (4개 컴포넌트) | 각 4개 stories.jsx 에 새 export `WithDecisionTrace` |

### 신규 컴포넌트 4개 — 스토리북 카테고리

```
src/components/
├── card/
│   ├── ModeSelectCard.jsx              ← TP2 신규
│   ├── ModeSelectCard.stories.jsx
│   ├── UserIntentChipRow.jsx           ← TP1 sub-component (신규)
│   ├── UserIntentChipRow.stories.jsx
│   ├── ReferenceLayerChipRow.jsx       ← TP4 sub-component (신규)
│   └── ReferenceLayerChipRow.stories.jsx
├── input/
│   ├── IntentSeedField.jsx             ← TP3 신규
│   └── IntentSeedField.stories.jsx
└── overlay-feedback/
    ├── AnalysisConfirmBox.jsx          ← TP5 신규
    └── AnalysisConfirmBox.stories.jsx
```

### 스토리 단위 (각 컴포넌트별)

#### ModeSelectCard (TP2)
**Title**: `Card / ModeSelectCard`
**스토리 4개**:
- `Default` — 3 카드 선택 안 된 상태
- `ConceptSelected` — "🎨 컨셉" 선택
- `SystemSelected` — "🏗️ 시스템" 선택
- `HandoffSelected` — "🎯 코드직행" 선택

#### UserIntentChipRow (TP1)
**Title**: `Card / UserIntentChipRow`
**스토리 4개**:
- `Default` — 미선택 (자동 강조)
- `ColorSelected` — "색감" 선택
- `MoodWithNote` — "무드" + 한줄 메모 입력
- `Disabled` — 태깅 진행 중 비활성

#### IntentSeedField (TP3)
**Title**: `Input / IntentSeedField`
**스토리 3개**:
- `Empty` — 빈 textarea + 시드 칩
- `WithSeedClick` — 시드 클릭 후 textarea prepend 상태
- `ExamplesOpen` — 예시 토글 펼침

#### ReferenceLayerChipRow (TP4)
**Title**: `Card / ReferenceLayerChipRow`
**스토리 4개**:
- `AutoMode` — T2 referenceLayer 자동 표시
- `ManualAllOn` — 사용자가 모든 레이어 켬
- `ManualOnlyColor` — 색만 토글된 큐레이션
- `Locked` — 분석 시작 후 잠김

#### AnalysisConfirmBox (TP5)
**Title**: `OverlayFeedback / AnalysisConfirmBox`
**스토리 3개**:
- `ConceptMode` — 컨셉 모드 confirmation
- `SystemMode` — 시스템 모드
- `HandoffMode` — 코드직행 모드 (예상 비용 표시)

---

## 3. 기존 컴포넌트 스토리 — 새 export 추가

기존 컴포넌트의 prop 확장 시 별도 파일 만들지 않고 **기존 stories.jsx에 export 추가**.

| 컴포넌트 | 기존 스토리 파일 | 추가 export |
|---|---|---|
| `ImageCard` | `card/ImageCard.stories.jsx` | `WithUserIntent` (TP1) + `WithLayerChips` (TP4) |
| `ColorSwatchList` | `data-display/ColorSwatchList.stories.jsx` | `WithDecisionTrace` (TP6) |
| `TypographyPreview` | `data-display/TypographyPreview.stories.jsx` | `WithDecisionTrace` (TP6) |
| `LayoutTokenPreview` | `data-display/LayoutTokenPreview.stories.jsx` | `WithDecisionTrace` (TP6) |
| `GradientPreview` | `data-display/GradientPreview.stories.jsx` | `WithDecisionTrace` (TP6) |

---

## 4. 페이지 통합 스토리 업데이트

### ArchivePage (TP1)
- 파일: `src/stories/page/ArchivePage.stories.jsx` (또는 `src/components/templates/ArchivePage.stories.jsx`)
- 신규 export: `WithUserIntentEnabled` — 카드에 chip이 표시된 상태로 보여주는 fixture

### ProjectCreateWizard (TP2 + TP3 + TP4 + TP5)
- 파일: `src/components/templates/ProjectCreateWizard.stories.jsx`
- 기존 export 4개 (Step 1/2/3/Complete) → **6개로 확장**:
  - `Step0_ModeSelect` (신규 TP2)
  - `Step1_IntentInput` (TP3 시드/예시 추가)
  - `Step2_ReferencePicker` (TP4 layer chip)
  - `Step3_ConfirmBox` (신규 TP5)
  - `Step3_Analyzing` (기존 유지)
  - `Complete` (기존 유지)
- 모드별 분기 검증을 위해 모드 3종 스토리 그룹 추가 가능

### ProjectDetailPage (TP6)
- 파일: `src/components/templates/ProjectDetailPage.stories.jsx`
- 신규 export: `WithDecisionTrace` — 토큰 카드 모두 펼친 상태 fixture
- 기존 export 유지 (Default 등)

---

## 5. MUSE 도메인 스토리 업데이트

### `src/stories/muse/References.stories.jsx`
- schema 표에 `userIntent` 필드 행 추가
- 신규 export `Schema_WithUserIntent` — 필드별 데이터 흐름 시각화

### `src/stories/muse/Projects.stories.jsx`
- schema 표에 `mode`, `selectedRefs[].useLayers` 필드 행 추가
- 신규 export `Schema_ModeBranching` — 3 모드별 T2/T3 분기 다이어그램

### `src/stories/muse/AnalysisResults.stories.jsx`
- 토큰별 `decisionRationale` 구조 표 추가
- 신규 export `Schema_DecisionTrace` — 토큰 1개의 결정 로그 예시

### `src/stories/muse/AITasks.stories.jsx` (가장 큰 업데이트)
**T1·T2·T3 각 스토리에 신규 변수 반영**:
- TP1·TP2·TP4 입력 변수를 `T*_INPUTS` 카테고리 분류에 추가
- `T*_IO` (input/output) 항목에 신규 필드 추가:
  - T1: `userIntent.aspect`, `extractionRationale`
  - T2: `projectMode`, `referenceLayer`
  - T3: `projectMode`, `selectedRefs[].useLayers`, `decisionRationale`
- 시스템 프롬프트 코드블록 비교 (Before vs After) 섹션 추가

### `src/stories/muse/AIPlayground.stories.jsx`
- 각 태스크 라이브 호출 폼에 신규 입력 컨트롤 추가:
  - T1 페이로드 폼에 `userIntent.aspect` 셀렉트
  - T2/T3 페이로드 폼에 `projectMode` 셀렉트
  - T3 페이로드 폼에 layer chip per ref

---

## 6. Overview 신규 — UX Intent Map 스토리

### 새 파일: `src/stories/overview/UXIntent.stories.jsx`
**Title**: `Overview / UX Intent Map`

**역할**: TP1~TP6 전체 그림을 한 페이지에서 보여주는 내러티브 스토리. 신규 사용자/팀원이 MUSE의 차별 메시지를 한 번에 이해.

**스토리 1개 (단일 export)**:
- 헤더: "사용자 의도가 UX 자체에 박힌다" 메시지
- 4 super-theme 인용 박스 (T1 김은수 ZDNet / T2 Bitovi / T3 PCWorld / T4 Toss)
- TP1~TP6 카드 6개 — 각 카드:
  - 위치 (어느 페이지 / 어느 컴포넌트)
  - Before / After 비교
  - 핵심 인용 (직격 페인)
  - 데이터 흐름 (system prompt 변수)
- 페르소나 4명 진입 경로 다이어그램
- 검증 지표 표 (의도 입력 길이, layer 변경률 등)

→ 이 스토리가 MUSE의 **product narrative single source of truth**.

---

## 7. 등록 순서 (TP 작업 순서와 동기)

`04-ux-intervention-roadmap.md` 의 작업 순서와 맞춰 스토리 등록도 진행:

| Sprint Week | 작업 TP | 신규 스토리 | 수정 스토리 |
|---|---|---|---|
| **Week 1.1** | TP2 | `ModeSelectCard.stories.jsx` | `ProjectCreateWizard.stories.jsx` (`Step0_ModeSelect` export) + `Projects.stories.jsx` (mode 필드) |
| **Week 1.2** | TP1 | `UserIntentChipRow.stories.jsx` | `ImageCard.stories.jsx` (`WithUserIntent`) + `References.stories.jsx` + `ArchivePage.stories.jsx` |
| **Week 2.1** | TP3 | `IntentSeedField.stories.jsx` | `ProjectCreateWizard.stories.jsx` (`Step1_IntentInput` 갱신) |
| **Week 2.2** | TP4 | `ReferenceLayerChipRow.stories.jsx` | `ImageCard.stories.jsx` (`WithLayerChips`) + `ProjectCreateWizard.stories.jsx` (`Step2_ReferencePicker`) |
| **Week 3.1** | TP5 | `AnalysisConfirmBox.stories.jsx` | `ProjectCreateWizard.stories.jsx` (`Step3_ConfirmBox`) |
| **Week 3.2** | TP6 | — | `ColorSwatchList`/`TypographyPreview`/`LayoutTokenPreview`/`GradientPreview` 4개 (`WithDecisionTrace`) + `ProjectDetailPage.stories.jsx` + `AnalysisResults.stories.jsx` |
| **Week 3.3** | T1/T2/T3 system prompt 통합 | — | `AITasks.stories.jsx` 대규모 업데이트 + `AIPlayground.stories.jsx` 페이로드 폼 |
| **Week 4** | 종합 narrative | `UXIntent.stories.jsx` (Overview) | — |

→ 매 TP 끝에 "스토리 추가" 도 작업 단위에 포함. 코드와 스토리 동시 commit.

---

## 8. 등록 합계

### 신규 파일
| 카테고리 | 신규 컴포넌트 | 신규 스토리 |
|---|---|---|
| `card/` | 3 (`ModeSelectCard`, `UserIntentChipRow`, `ReferenceLayerChipRow`) | 3 |
| `input/` | 1 (`IntentSeedField`) | 1 |
| `overlay-feedback/` | 1 (`AnalysisConfirmBox`) | 1 |
| `stories/overview/` | — | 1 (`UXIntent`) |
| **합계 신규** | **5 컴포넌트** | **6 스토리 파일** |

### 수정 파일
| 파일 | 수정 내용 |
|---|---|
| `card/ImageCard.stories.jsx` | `WithUserIntent` + `WithLayerChips` export 2개 추가 |
| `data-display/{ColorSwatchList,TypographyPreview,LayoutTokenPreview,GradientPreview}.stories.jsx` | 각 `WithDecisionTrace` export 1개씩 (4개 파일) |
| `templates/ProjectCreateWizard.stories.jsx` | export 6개 (Step0~Step3 분리) |
| `templates/ProjectDetailPage.stories.jsx` | `WithDecisionTrace` export |
| `templates/ArchivePage.stories.jsx` | `WithUserIntentEnabled` export |
| `muse/References.stories.jsx` | schema 표 + `Schema_WithUserIntent` |
| `muse/Projects.stories.jsx` | schema 표 + `Schema_ModeBranching` |
| `muse/AnalysisResults.stories.jsx` | `Schema_DecisionTrace` |
| `muse/AITasks.stories.jsx` | T1/T2/T3 IO 섹션 + 시스템 프롬프트 비교 (3개 스토리) |
| `muse/AIPlayground.stories.jsx` | T1/T2/T3 페이로드 폼 (3 변수 추가) |
| **합계 수정** | **약 12 파일, 18개 export 추가** |

---

## 9. 컨벤션·체크리스트

### 신규 스토리 작성 체크리스트
- [ ] `title: 'Category / ComponentName'` 정확히
- [ ] `parameters: { layout: 'padded' }` (또는 component-level은 'centered')
- [ ] argTypes 명시 (TP variants 분기 가능하게)
- [ ] Default story 우선 + variants는 별도 export
- [ ] `component-work` skill 의 `storybook-writing.md` 규칙 준수
- [ ] 스토리에서 사용자 의도가 무엇인지 1줄 description 추가

### 컴포넌트 등록 체크리스트
- [ ] `src/components/{category}/index.js` barrel export 추가
- [ ] `.claude/skills/component-work/resources/components.md` 한 줄 항목 추가
- [ ] Props 주석 (`@param` 형식) 명시
- [ ] kebab-case 네이밍 (파일은 PascalCase, sx props는 camelCase)
- [ ] MUI sx 사용 (외부 CSS 금지)

### 데이터 모델 등록 체크리스트
- [ ] `src/data/muse/schemas.js` JSDoc typedef 갱신
- [ ] 더미 데이터 fixture 1~2건 (`src/data/muse/{references,projects,analysisResults}.js`)
- [ ] schema 스토리에서 fixture 시각화

---

## 10. 다음 단계

이 계획이 OK면:
1. **첫 작업 진입**: TP2 `ModeSelectCard` 컴포넌트 + `ProjectCreateWizard` Step 0 + 데이터 모델 `Project.mode`
2. **`/component-work` skill 호출**: TP2 작업이 component 영역이라 skill workflow 따라 진행

순서: `ModeSelectCard.jsx` 작성 → `ModeSelectCard.stories.jsx` 작성 → `Projects.stories.jsx` schema 업데이트 → `ProjectCreateWizard.jsx` Step 0 추가 → `ProjectCreateWizard.stories.jsx` `Step0_ModeSelect` export → `components.md` 한 줄 등록.

이 패턴이 TP1~TP6 모두 동일.
