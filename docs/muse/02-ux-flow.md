# MUSE — UX Flow

> **핵심 원칙**: 새 화면 신규 X. 기존 5개 입력 지점(TP2~TP6)에 "왜?" 질문을 끼워 넣어 사용자 의도를 UX 자체에 박는다. 자세한 명세: [04-ux-intervention-roadmap.md](../research/04-ux-intervention-roadmap.md)
>
> **2026-04-28**: TP1(레퍼런스 업로드 chip) 폐기. T1은 이미지가 정보 원천이라 사용자 chip이 태깅 정확도를 의미 있게 향상시키지 않음. TP4(레이어 chip)와 다운스트림 가치 중복으로 판단.

## 유저 시나리오

### 시나리오 1: 레퍼런스 수시 아카이빙

- **사용자**: 디자이너 / 바이브 코딩 유저
- **목표**: 평소 영감을 받은 이미지를 프로젝트와 무관하게 모아둔다
- **플로우**:
  1. 아카이브 화면 진입 (인피니트 그리드 뷰)
  2. 이미지 드래그앤드롭 또는 URL 붙여넣기
  3. T1 자동 태깅 실행 (5 레이어 태그 + dominantColors + extracted 동시 추출 — Haiku 4.5 vision)
  4. 그리드에 즉시 추가 (태그 배지 + 대표 색상 swatch 표시)
- **성공 조건**: 업로드 후 2초 이내 썸네일 노출, 태그는 비동기로 채워짐
- **예외 상황**: 링크 로드 실패 → 재시도 버튼, AI 태깅 실패 → 카드에 "다시 시도" 버튼

### 시나리오 2: 프로젝트 생성 — Progressive Narrowing 5-step (TP2~TP4 + Step 3)

- **사용자**: 디자이너 / PM / 엔지니어
- **목표**: 사용자가 모드 → 한 줄 의도 → 레퍼런스 → 활용 노트 4단계로 의도를 좁혀가며 결정. **"AI가 알아서"가 아닌 "내가 단계마다 결정했다"는 인식**.
- **플로우**:
  1. **Step 0 (TP2): 모드 선택 카드 3개**
     - 🎨 컨셉 잡기 / 🏗️ 디자인 시스템 (default) / 🎯 코드 직행
     - → `project.mode` 저장 → T2/T3 system prompt 분기 + Step 3 minLength 차등
  2. **Step 1 (TP3): 제목 + 한 줄 의도**
     - 제목 TextField + IntentGuideField (placeholder + helperText 가이드만, maxLength 120)
     - 가이드: "무드 / 사용자 맥락 / 시각 방향 / 제약을 한 줄에"
  3. **Step 2 (TP4): 추천 + 레이어 chip**
     - T2 추천 N장 (mode 분기로 다양성 ↔ 일관성 ↔ 완전성)
     - 카드별 chip: 🎨 색  📝 타이포  📐 레이아웃 (자동: T2 referenceLayer / 수동: 사용자 토글)
     - → `selectedRefs[].useLayers` 저장
  4. **Step 3 (NEW, 활용 노트 — RefinementNotesField)**
     - 레퍼런스 본 후 활용 지점 명시 textarea + 선택된 ref 썸네일 + 가이드 박스
     - 모드별 minLength: **concept=0(스킵) / system=30 / handoff=50**
     - 좋은 예: "ref-002 색을 primary로, ref-005 grid 강조, 타이포는 가볍게"
     - → `project.userNotes` 저장 → T3 합성 **HIGHEST PRIORITY** 입력
     - [분석 시작 →] 버튼이 곧 confirm (TP5 흡수, 별도 step 없음)
  5. **Step 4: 분석 진행** (AnalysisProgress) → 완료 시 프로젝트 상세
- **T3 입력 우선순위 (Progressive Narrowing)**: userNotes (L4) > useLayers (L3) > intent (L2) > mode (L1)
- **성공 조건**:
  - concept 모드: 비디자이너 P1 도 5분 안에 완료 (Step 3 스킵 가능)
  - system/handoff 모드: 사용자가 명시 지시한 토큰이 결과에 직접 반영 (TP6 펼침에 ✋ appliedUserNotes 인용)
- **예외 상황**: 0장 선택 시 비활성, 분석 중 이탈 시 백그라운드 진행

### 시나리오 3: 토큰 확인 및 조정 + 결정 추적 펼침 (TP6)

- **사용자**: 디자이너 / 바이브 코딩 유저 / 디자인 시스템 엔지니어
- **목표**: AI가 추출한 토큰의 **출처와 이유를 검증**하고, 의도에 맞게 다듬는다. **"왜 이 색이 primary?"에 즉답할 수 있는 상태**.
- **플로우**:
  1. 프로젝트 상세 진입 → 레이어 탭(컬러/타이포/레이아웃/그라디언트/비주얼 디렉션)
  2. 레이어별 토큰 카드 목록 확인 + **각 카드 우측에 ❓ from N refs 인디케이터 상시 표시**
  3. **카드 클릭 시 펼침** — 출처 레퍼런스 썸네일 inline + 의도 매칭 이유 + 탈락 후보(`alternativesConsidered`) 표시
     ```
     primary: #14132B
     ───────────────────────────
     출처: ref-002 [썸] + ref-005 [썸]
     의도 매칭: "차분한 다크" → 짙은 색 우선
     다른 후보: ref-013 #4F46E5 (탈락: 채도 너무 높음)
     ```
  4. 불필요 토큰 제거(토글 off) 또는 중요 토큰 강조(emphasis 상승) — 기존 유지
  5. 실시간으로 프리뷰 영역 업데이트
- **성공 조건**:
  - 토큰 카드 hover/click률 >60% (사용자가 근거 확인하는 행동)
  - 토큰 on/off 시 200ms 이내 프리뷰 반영
  - 디자인 리뷰 회의에서 "왜 이 색?" 질문에 즉답률 ↑ (사용자 인터뷰)
- **예외 상황**: `decisionRationale` 누락 시 (구버전 데이터) 기본 sourceReferenceIds만 표시, 전체 제거 시 최소 1개 유지 경고

### 시나리오 4: 4중 export — 토큰 + 결정 로그 + 시장 표준

- **사용자**: 바이브 코딩 유저 / 디자인 시스템 엔지니어 (P3·P4)
- **목표**: 정리된 토큰을 다른 도구로 가져갈 때 **결정 로그까지 함께** 제공해 "왜 이 토큰인지"가 외부 도구·팀에 전달되게 한다
- **플로우**:
  1. 프로젝트 상세에서 "Export" 클릭
  2. Export 다이얼로그에 **모드별 default 산출물** 자동 선택:
     - 🎨 컨셉 모드: DESIGN.md 우선 + 미리보기
     - 🏗️ 시스템 모드: 토큰 JSON + decision-trace.md
     - 🎯 코드직행 모드: DTCG tokens.json + MUI theme + cursorrules
  3. 복사 / 파일 다운로드 / ZIP 번들 — 4종 출력 동시 가능
     - MUI theme (`createTheme` 코드)
     - DTCG W3C tokens.json (외부 표준)
     - DESIGN.md (Stitch 호환 9-section)
     - decision-trace.md (모든 토큰 결정 로그)
- **성공 조건**: 외부 도구 (Cursor / Claude Code / Style Dictionary) import 무수정 성공률 >90%
- **예외 상황**: 필수 토큰(palette.primary 등) 미충족 시 경고 표시, decisionRationale 누락 시 기본 출처만 표시

---

## UX 플로우 (TP2~TP6)

```mermaid
flowchart TD
    Start([사용자 진입]) --> Archive[아카이브 그리드]
    Archive -->|이미지 업로드| Upload[드래그앤드롭 / URL]
    Upload --> AutoTag["T1 · 자동 태깅<br/>(Haiku 4.5 vision)<br/>tags + dominantColors + extracted"]
    AutoTag --> Archive

    Archive -->|새 프로젝트| TP2["TP2: 모드 선택 카드<br/>🎨 컨셉 / 🏗️ 시스템 / 🎯 코드직행"]
    TP2 --> TP3["TP3: 제목 + 한 줄 의도<br/>(IntentGuideField, maxLength 120)"]
    TP3 -->|projectMode + intent| Recommend["T2 · 레퍼런스 추천<br/>(Haiku text-only)<br/>+ referenceLayer per ref"]
    Recommend --> TP4["TP4: 카드 layer chip<br/>🎨 색  📝 타이포  📐 레이아웃<br/>(자동 / 수동 토글)"]
    TP4 -->|selectedRefs.useLayers| Step3["Step 3 (NEW): 활용 노트<br/>RefinementNotesField<br/>모드별 minLength 차등"]
    Step3 -->|분석 시작 →<br/>userNotes (L4 우선)| Analyze["T3 · 토큰 합성<br/>(Haiku text-only)<br/>L4>L3>L2>L1<br/>+ decisionRationale + appliedUserNotes"]
    Analyze --> Detail[프로젝트 상세 - 레이어 탭]

    Detail --> TP6["TP6: 토큰 카드 출처 펼침<br/>출처 + 이유 + ✋ 사용자 노트 + 탈락 후보<br/>(4 layer 모두 적용)"]
    TP6 -->|레이어 탭 전환| Edit[토큰 on/off + emphasis]
    Edit -->|프리뷰 갱신| Detail

    Detail -->|Export| ExportDlg["4중 Export 다이얼로그<br/>MUI / DTCG / DESIGN.md / decision-trace.md"]
    ExportDlg -->|모드별 default 출력| Done([완료])

    classDef tp fill:#fef3c7,stroke:#f59e0b,stroke-width:2px;
    class TP2,TP3,TP4,Step3,TP6 tp;
```

> 노란 박스 = 사용자 의도 입력 지점. ~~TP1~~ ~~TP5~~ 폐기. **Step 3 활용 노트 신규** (T3 HIGHEST PRIORITY 입력).

---

## 정보 구조 (IA)

```
MUSE
├── 아카이브 (/)
│   ├── 인피니트 그리드 (이미지 + 태그 + 대표 색상)
│   ├── 검색 / 태그 / 색상 필터
│   ├── 카드 클릭 → 디테일 모달 (출처/태그/팔레트)
│   └── 업로드 영역 (드래그앤드롭 + URL 입력)
├── 프로젝트 목록 (/projects)
│   └── 프로젝트 카드 (2x2 썸네일 + 이름 + 모드 뱃지)
├── 프로젝트 생성 (/projects/new)
│   ├── ★Step 0. 모드 선택 카드 — TP2 (컨셉 / 시스템 / 코드직행)
│   ├── Step 1. 이름 + 의도 (+ ★시드 칩 + 예시 — TP3)
│   ├── Step 2. 레퍼런스 선택 (추천 + 아카이브 + ★layer chip — TP4)
│   └── Step 3. ★분석 직전 확인 박스 — TP5 → 분석 진행 화면
├── 프로젝트 상세 (/projects/:id)
│   ├── 사용된 레퍼런스 strip (썸네일 행)
│   ├── 레이어 탭 (컬러 / 타이포 / 레이아웃 / 그라디언트 / 비주얼 디렉션(MD))
│   ├── 토큰 목록 + 편집 패널 (★카드 출처 펼침 — TP6)
│   ├── 실시간 프리뷰 영역
│   └── Export 액션 (★4중 출력)
└── 설정 (/settings)
    └── AI 모델 / 스토리지 / 테마

★ 표시 = TP2~TP6 사용자 의도 입력 지점 (신규). TP1 폐기로 아카이브에는 의도 입력 없음.
```

---

## 데이터 모델

> **단일 진실 원천**: `src/data/muse/schemas.js` (JSDoc typedef). 아래 표와 불일치 발견 시 스키마 파일이 기준.
> 더미 데이터: `src/data/muse/{references,projects,analysisResults,userSettings}.js`.

### 엔티티 개요

| 엔티티 | 주요 필드 | 관계 |
|--------|----------|------|
| `Reference` | `id`, `source` (file/url), `thumbnailUrl`, `tags` (ReferenceLayeredTags), `dominantColors[]`, `extracted` (palette/typo/layout/gradient), `title?`, `createdAt` | N:M Project |
| `Project` | `id`, `name`, `intent`, `type`, **`mode` — TP2**, **`selectedRefs[]` ({ id, useLayers[] }) — TP4**, **`userNotes` — Step 3 NEW (T3 HIGHEST PRIORITY)**, `referenceIds[]`, `createdAt` | N:M Reference |
| `AnalysisResult` | `id`, `projectId`, `layers` (AnalysisLayers + **`decisionRationale` per token + `appliedUserNotes?` 인용 — TP6**), `status`, `updatedAt` | 1:1 Project |
| `UserSettings` | `aiModel`, `storageMode`, `themeMode`, `isAutoTagEnabled` | singleton |

### `ReferenceLayeredTags` (Reference.tags)

preset(`src/data/muse/tag/muse_tags_preset.json`) 어휘에서만 선택. flat 배열 아님.

```ts
{
  color:        string[]   // 0~3개
  typography:   string[]   // 0~3개
  layout:       string[]   // 0~3개
  gradient:     string[]   // 0~3개
  visualDirection: {
    genre:   string[]     // 0~2개
    style:   string[]     // 0~2개
    subject: string[]     // 0~2개
  }
}
```

> **어댑터**: 기존 flat tag 전제 코드(검색/필터)는 `references.js` 의 `flattenTags(ref)` 헬퍼로 `string[]` 변환해서 호환.

### `AnalysisLayers` (AnalysisResult.layers)

레이어마다 **다른 shape**. 단일 제네릭 Token 으로 묶지 않음 — DB 설계 시 JSON blob vs. 레이어별 정규화 결정 포인트.

| 레이어 | 타입 | 주요 필드 |
|-------|------|----------|
| `color` | `ColorToken[]` | `id, label, hex, role?(primary/secondary/accent/neutral), group?, isEnabled, emphasis(0-2), sourceReferenceIds?[]` |
| `typography` | `TypographyToken[]` | `id, label, variant?, fontFamily, fontWeight, fontSize, lineHeight?, letterSpacing?, sampleText?, isEnabled, emphasis` |
| `layout` | `LayoutToken[]` | `id, label, kind(grid/spacing/container), columns?, gap?, px?, ratio?, maxWidth?, isEnabled, emphasis` |
| `gradient` | `GradientToken[]` | `id, label, gradient, stops?[{offset,color}], isEnabled, emphasis` |
| `visualDirection` | `VisualDirectionLayer` (객체) | `markdown` (`visual_direction_template.md` 포맷으로 채워진 MD), `tags?` ({genre, style, subject}) |

- `isEnabled`, `emphasis(0\|1\|2)` 는 color/typography/layout/gradient 공통. 토큰 on/off + 강조 편집 UX의 기반.
- `sourceReferenceIds` 는 현재 ColorToken 에만 정의되어 있음 (다른 레이어로 확장 시 스키마 추가 필요).
- `visualDirection` 은 토큰 배열이 아닌 단일 객체 — Export 시 `visual-direction.md` 파일로 별도 추출.

---

## AI 태스크

MUSE가 Claude API에 위임하는 3개 태스크. 시스템 프롬프트·Tool 스키마·품질 축·골든 예시의 **단일 진실 원천은 `src/data/muse/aiTasks.js`** 이며, Storybook `MUSE/AI Tasks/*` 에서 검토 가능.

### 태스크 인벤토리 (TP2~TP6 통합 후)

| ID | 태스크 | 시점 (stage) | 입력 (★ = TP 신규 변수) | 출력 (★ = TP 신규 필드) | 기본 모델 |
|----|--------|-------------|------|------|---------|
| **T1** | 자동 태깅 + 토큰 추출 | `archive.upload` | 이미지 1장 (TP1 폐기, 사용자 의도 입력 없음) | `{ tags, dominantColors, title, extracted }` | Haiku 4.5 vision |
| **T2** | 레퍼런스 추천 | `project.create.step2` | 의도 문장 + 아카이브 메타 + ★`projectMode` (TP2) | `{ recommendedIds, reasons, ★referenceLayer per id }` | Haiku 4.5 text-only |
| **T3** | 토큰 합성 + VD | `project.create.step4` | 선택 레퍼런스 메타 + intent + ★`mode` + ★`useLayers` + **★`userNotes` (Step 3, HIGHEST PRIORITY)** | 2 tool: `submit_tokens` + `submit_visual_direction` (+ ★`decisionRationale` per token: whichRefs / whyChosen / **★`appliedUserNotes?` 인용** / alternativesConsidered) | Haiku 4.5 text-only |

→ AI 호출 비용 변화 거의 없음 (system prompt token +200~300, cache hit). 출력 디테일 ↑.

### 시나리오 ↔ 태스크 매핑

| 시나리오 | 호출되는 AI 태스크 |
|---------|------------------|
| 시나리오 1: 레퍼런스 수시 아카이빙 | **T1** (업로드 직후 비동기) |
| 시나리오 2: 프로젝트 생성 & 큐레이션 | **T2** (Step 2 진입 시, 선택적) → **T3** (Step 3 실행 시) |
| 시나리오 3: 토큰 확인 및 조정 | — (AI 호출 없음, 순수 수동 편집) |
| 시나리오 4: MUI theme export | — (AI 호출 없음, `serializeTheme` 유틸만) |

### 공통 운영 원칙

- **Tool use 강제**: 3개 태스크 모두 프롬프트만으로 JSON을 유도하지 않고 `tool_use` 스키마로 구조화 출력
- **Prompt caching**: 시스템 프롬프트는 캐시 히트 대상 — 특히 T1 배치 태깅 시 비용 절감 큼
- **자동 검증 + 1회 재시도**: schema / 어휘(T1) / HEX 형식 / id 유효성 검증 실패 시 1회 자동 재호출, 두 번째 실패 시 수동 fallback
- **API 키는 로컬 env 전용**: 브라우저 직접 호출 금지. Node CLI (`scripts/muse-ai/*`) 또는 Vite dev proxy 경유
- **비용 가드**: T3는 Sonnet + 이미지 N장으로 가장 비쌈 → 초기 `N ≤ 4` 제한, 의도 문장을 명확히 받아 낭비 호출 방지

### 품질 평가 체계

| 축 | 적용 범위 | 방식 |
|----|----------|------|
| 스키마 준수 | T1 / T2 / T3 | 자동 (JSON Schema 검증) |
| 레이어별 어휘 준수 (preset enum) | T1 | 자동 |
| HEX 형식 | T1 / T3 | 자동 |
| ID 유효성 (recommendedIds / sourceReferenceIds) | T2 / T3 | 자동 |
| Primary 유일성 | T3 | 자동 (role=primary 개수 = 1) |
| 타이포 위계 정합성 | T3 | 자동 (h1 > h2 > body1) |
| 의도 반영도 | T2 / T3 | 수동 (pairwise A/B) |
| 골든 케이스 비교 | T1 / T3 | 자동 (diff + Delta E) |

### 참조

- **데이터**: `src/data/muse/aiTasks.js` — `TASK_AUTO_TAG`, `TASK_RECOMMEND`, `TASK_ANALYZE_TOKENS`, `AI_TASKS`, `AI_WORKFLOW_DIAGRAM`. 어휘는 `src/data/muse/tag/index.js` helper (`getLayerTags`, `getVisualDirectionTags`, `renderVocabularyPrompt`)
- **Storybook**: `MUSE/AI Tasks/*` 문서 스토리 · `MUSE/AI Playground/Health Check · T1 Auto Tag · T2 Recommend · T3 Analyze Tokens + VD` 라이브 호출
- **프록시 레이어**: `.storybook/museApiPlugin.js` (`/api/anthropic/*`) · `src/utils/museAi.js` (클라이언트 헬퍼)
- **실행 레이어(예정)**: `scripts/muse-ai/*` — CLI 실행, 평가, 골든셋 관리

---

## 컴포넌트 리스트

역할별로 그룹핑. 각 그룹은 MUSE의 주요 화면/기능 단위에 대응한다.

### A. 앱 골격 — 글로벌 레이아웃 · 네비게이션

전체 화면에 공통으로 깔리는 셸과 컨테이너.

| 컴포넌트 | 용도 | 구분 | 기존 경로 / 비고 |
|----------|------|------|-----------------|
| `AppShell` | 전역 레이아웃 (GNB + 메인 영역) | 재활용 | `components/layout/AppShell.jsx` |
| `GNB` | 글로벌 네비게이션 바 | 재활용 | `components/navigation/GNB.jsx` |
| `PageContainer` | 반응형 페이지 컨테이너 | 재활용 | `components/layout/PageContainer.jsx` |
| `SectionContainer` | 섹션 단위 컨테이너 | 재활용 | `components/container/SectionContainer.jsx` |

### B. 아카이브 — 레퍼런스 수집 · 탐색

아카이브 화면의 수집/탐색 흐름을 담당.

| 컴포넌트 | 용도 | 구분 | 기존 경로 / 비고 |
|----------|------|------|-----------------|
| `FileDropzone` | 드래그앤드롭 / URL 업로드 | 재활용 | `components/input/FileDropzone.jsx` |
| `Masonry` (MUI) | 인피니트 그리드 베이스 | 수정 | 인피니트 스크롤 훅 연결 |
| `ImageCard` | 레퍼런스 썸네일 + 태그 배지 + 선택 체크박스 | 수정 | `components/card/ImageCard.jsx` 확장 |
| `SearchBar` | 아카이브 검색 | 재활용 | `components/input/SearchBar.jsx` |
| `FilterBar` | 태그/컬러톤 필터 | 재활용 | `components/templates/FilterBar.jsx` |
| `TagInput` | 개별 레퍼런스 태그 편집 | 재활용 | `components/input/TagInput.jsx` |

### C. 프로젝트 — 목록 · 생성

프로젝트 관리 및 3-step 생성 위자드.

| 컴포넌트 | 용도 | 구분 | 기존 경로 / 비고 |
|----------|------|------|-----------------|
| `MoodboardCard` | 프로젝트 목록 카드 (2x2 썸네일) | 재활용 | `components/card/MoodboardCard.jsx` |
| `CardContainer` | 카드 기본 컨테이너 | 재활용 | `components/card/CardContainer.jsx` |
| `TextField` / `Select` / `Button` | 이름·의도·유형 입력 폼 | 재활용 | MUI |
| `ProjectCreateWizard` | 3스텝 생성 위자드 (이름/의도/유형 → 레퍼런스 선택 → 분석) | 신규 | 카테고리: `templates` |
| `ReferencePicker` | 추천 + 아카이브 다중 선택 패널 | 신규 | 카테고리: `templates` |

### D. 분석 피드백 — 진행 상태 · 경고

분석 실행 중 및 경고 상황 피드백.

| 컴포넌트 | 용도 | 구분 | 기존 경로 / 비고 |
|----------|------|------|-----------------|
| `Dialog` (MUI) | 경고/확인 모달 | 재활용 | MUI |
| `AnalysisProgress` | 분석 진행 상태 표시 (레이어별 단계 인디케이터) | 신규 | 카테고리: `overlay-feedback` |

### E. 토큰 편집 — 프로젝트 상세 셸

레이어 전환과 편집/프리뷰 분할 레이아웃.

| 컴포넌트 | 용도 | 구분 | 기존 경로 / 비고 |
|----------|------|------|-----------------|
| `CategoryTab` | 레이어 탭 (컬러/타이포/레이아웃/그라디언트/비주얼 디렉션) | 재활용 | `components/in-page-navigation/CategoryTab.jsx` |
| `SplitScreen` | 토큰 편집 패널 + 프리뷰 좌우 분할 | 재활용 | `components/layout/SplitScreen.jsx` |
| `Switch` | 토큰 on/off 토글 | 재활용 | MUI |
| `TokenListItem` | 레이어 공통 토큰 행 (on/off + emphasis 슬라이더) | 신규 | 카테고리: `data-display` |

### F. 레이어별 프리뷰 — 토큰 시각화

편집 결과를 즉시 확인하는 레이어별 시각화 컴포넌트.

| 컴포넌트 | 용도 | 구분 | 기존 경로 / 비고 |
|----------|------|------|-----------------|
| `ColorSwatchList` | 컬러 토큰 스와치 + HEX + 토글 | 신규 | 카테고리: `data-display` |
| `TypographyPreview` | 타이포 샘플 텍스트 + 속성 미리보기 | 신규 | 카테고리: `data-display` |
| `LayoutTokenPreview` | 그리드/스페이싱 다이어그램 | 신규 | 카테고리: `data-display` |
| `GradientPreview` | 그라디언트 토큰 스와치 | 신규 | 카테고리: `data-display` |
| `visualDirection` 렌더러 | Markdown 서술 + 태그 칩 표시 (ProjectDetailPage에 내장) | 신규(내장) | `pre`+Chip 기반 (추후 react-markdown 가능) |

### G. Export — 산출물 내보내기

MUI theme 코드 최종 산출 흐름.

| 컴포넌트 | 용도 | 구분 | 기존 경로 / 비고 |
|----------|------|------|-----------------|
| `ThemeExportDialog` | MUI theme 코드 다이얼로그 (복사/다운로드) | 신규 | 카테고리: `overlay-feedback` (Dialog 확장) |
| `Button` | Export 트리거 | 재활용 | MUI |

---

### 그룹별 합계

| 그룹 | 재활용 | 수정 | 신규 |
|------|-------|------|------|
| A. 앱 골격 | 4 | 0 | 0 |
| B. 아카이브 | 4 | 2 | 0 |
| C. 프로젝트 | 4 | 0 | 2 |
| D. 분석 피드백 | 1 | 0 | 1 |
| E. 토큰 편집 셸 | 3 | 0 | 1 |
| F. 레이어 프리뷰 | 0 | 0 | 5 |
| G. Export | 1 | 0 | 1 |
| **합계** | **17** | **2** | **10** |

---

## 핵심 설계 포인트

- **사용자 의도가 UX의 5개 입력 지점에 박힌다 (TP2~TP6)**: 새 화면 신규 X. 기존 흐름에 작은 질문 끼워 넣어 사용자가 답을 만드는 동안 자기 취향을 의식하게 만듦. 답은 system prompt 변수로 흘러가 결과 디테일 ↑. (TP1 폐기 — T1은 이미지가 정보 원천이라 사용자 의도가 정확도 향상에 기여 안 함)
- **모든 질문은 스킵 가능 (자동 default OK)**: TP2 모드 미선택 시 "🏗️ 시스템" default. TP1 chip 미클릭 시 자동 태깅. 비디자이너 P1 페르소나 진입 막지 않음.
- **모드별 분기가 파이프라인 전체 결정**: TP2 모드(컨셉/시스템/코드직행) 한 번 선택이 T2 정렬 + T3 합성 톤 + Export default 모두 분기. 사용자가 "내가 지금 뭘 하려는지" 명시화.
- **아카이빙과 프로젝트 생성의 분리**: 아카이빙은 수시로, 프로젝트는 의도 기반 큐레이션 — 두 플로우의 진입점을 명확히 구분
- **분석은 비동기·백그라운드**: 생성 이탈 후 돌아와도 결과 확인 가능
- **토큰 편집 = on/off + emphasis 2축 + 결정 추적 (TP6)**: 삭제가 아닌 비활성화 기반으로 언제든 복원 가능. 추가로 카드 클릭 시 출처/이유/대안 펼침으로 "왜 이 토큰?" 즉답 가능.
- **4중 Export — 토큰 + 결정 로그 + 시장 표준 동시**: MUI theme + DTCG W3C tokens.json + DESIGN.md (Stitch 호환) + decision-trace.md. 모드별 default 다름.
- **AI 태스크는 경계면으로만 노출**: 3개 Claude 태스크(T1 태깅+추출 / T2 추천 / T3 합성)의 프롬프트·스키마는 `src/data/muse/aiTasks.js`에 고정. TP1~TP6의 새 변수(userIntent, projectMode, useLayers) 추가도 이 파일에서만 — UI 컴포넌트는 콜백만 소비.

---

## 참조 (정성 리서치 → UX 매핑)

- [docs/research/02-painpoints-qualitative-analysis.md](../research/02-painpoints-qualitative-analysis.md) — 4 super-themes (T1 결정 추적 / T2 단일 입력 / T3 통제권 / T4 craft) 직격 매핑
- [docs/research/04-ux-intervention-roadmap.md](../research/04-ux-intervention-roadmap.md) — TP1~TP6 + 시스템 프롬프트 업데이트 구현 명세 + 3~4주 작업 순서
