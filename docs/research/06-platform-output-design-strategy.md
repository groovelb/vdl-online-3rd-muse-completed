# 06. 플랫폼별 전달 모범 + MUSE 산출물 설계 전략

> 2026-04-28 · 외부 AI 도구 3종 (Claude Design / Google AI Studio / Gemini) 대상으로
> MUSE 의 mode 별 산출물(concept/system/handoff) 이 어떻게 받아들여지는지 분석하고,
> 각 플랫폼 친화 산출물을 설계하기 위한 전략 문서.
>
> 본 문서는 **분석·전략 단계**. 코드 변경은 별도 work-log 로 분리.

---

## 0. 진단 — 사용자가 보고한 두 문제

| 증상 | 발생 조건 |
|---|---|
| **A. 토큰만 전달 시** | T3 산출물(토큰 + MD)을 외부 AI 에 던지면 hex/spec 만 보고 레퍼런스 이미지의 시각적 뉘앙스(질감/구도/실제 톤감)를 못 살림 |
| **B. 이미지 같이 전달 시** | 레퍼런스 이미지 그냥 첨부하면 외부 AI가 이미지의 불필요한 부분까지 모방 (예: ref-002 의 색감만 원했는데 레이아웃까지 베낌) |

**본질**: "**어느 이미지의 어느 부분**" 이 명시되지 않은 게 핵심. 토큰만 = 빈약, 이미지 통째 = 과잉.

---

## 1. 플랫폼별 입력 사양 (공식 출처 종합)

### 1.1 Claude Design (Anthropic Labs, 2026-04-17 출시)

| 항목 | 내용 |
|---|---|
| 모델 | Claude Opus 4.7 (vision) |
| 입력 형식 | 텍스트 prompt / **이미지** / **DOCX·PPTX·XLSX** / 코드베이스 / Figma 파일 / GitHub repo / 웹 URL 캡처 / 폰트·로고 자산 |
| 미명시 형식 | `.md` / `.json` / `.zip` / DTCG 토큰 |
| 디자인 시스템 input | "프로젝트가 organization 의 design system 자동 상속". GitHub/Figma 에서 inferred. **별도 토큰 직접 업로드 명시 없음** |
| Handoff bundle 형식 | **Proprietary (DTCG 비호환)** — "intentionally proprietary, not DTCG... whatever works best between two models from the same lab" |
| 흐름 | Claude Design **출력** → Claude Code (단방향). 외부에서 만든 bundle 을 Claude Design **입력** 으로 던지는 시나리오는 공식 지원 X |
| Best Practice prompt | goal + layout + content + audience |

**결정적 함의**: MUSE handoff 산출물의 DTCG ZIP 을 Claude Design 에 던지는 시나리오는 무의미. **Claude Design 에는 prose + 이미지** 가 가장 잘 맞음.

### 1.2 Google AI Studio (aistudio.google.com)

| 항목 | 내용 |
|---|---|
| 컨텍스트 | 1M tokens (Gemini 2.5 Pro/Flash) |
| 파일 첨부 | File API: 2GB/파일, 20GB total. text/image/audio/video/document |
| 이미지 한도 | 요청당 최대 3,600 |
| ZIP 자동 해제 | ❌ 보장 없음 |
| 시스템 instruction | 자유 |
| 권장 입력 | File API URI 또는 base64 inline + `contents` 배열 직접 삽입 |

### 1.3 Gemini (consumer, gemini.google.com)

| 항목 | 내용 |
|---|---|
| 컨텍스트 | 1M tokens |
| 파일 첨부 | prompt당 **최대 10개 / 100MB** |
| ZIP 지원 | ✅ **내부 ≤10 파일 / 100MB / video·audio 불포함** |
| 시스템 프롬프트 | Gem 만들 때만 (일반 chat 은 user message 합침) |

---

## 2. 공통 원칙 — 어느 플랫폼에서도 markdown image 앵커는 신뢰 불가

세 플랫폼 모두 공식 문서상 `[ref-001](references/ref-001.jpg)` 식 마크다운 링크가 첨부 이미지 슬롯과 자동 매칭된다는 명시 **없음**.

**→ 3중 표기 의무**:
1. **마크다운 앵커** (사람·trace 용, MD 파일을 사람이 읽을 때 navigation)
2. **실제 이미지 첨부** (별도 파일 또는 ZIP 내부)
3. **Prose 매칭 단서** ("ref-001 은 첨부 1번 이미지" 식 자연어 지시)

---

## 3. 현재 MUSE 산출물 ↔ 플랫폼별 적합성 매트릭스

| Mode | 현재 산출물 | Claude Design | AI Studio | Gemini |
|---|---|---|---|---|
| **concept** | 800자 한글 prompt `.md` 단일 | ⚠️ `.md` 직접 업로드 명시 없음 → **본문 paste** | ✅ inline content | ✅ |
| **system** | tokens JSON + VD MD + ZIP | ❌ JSON/ZIP 미지원 → **prose 변환 필요** | ⚠️ ZIP 자동 해제 X → **multi-file** | ⚠️ ZIP OK 단 ≤10 파일 |
| **handoff** | DTCG ZIP + framework configs + .cursorrules + 5 layer MD | ❌ DTCG 비호환 + Claude Design 자체가 만드는 흐름 → **우회**. Claude Code 직접 입력으로만 가치 | ⚠️ ZIP 자동 해제 X | ⚠️ 파일 ≤10 초과 가능 |

### 핵심 발견 (CRITICAL)

1. **Claude Design 은 "디자인 시스템을 받는 도구" 가 아니라 "분위기 보여주는 도구"**. DTCG 토큰을 Claude Design 에 던지는 건 본질적 미스매치. handoff 산출물은 **Claude Code 직접 입력** 용으로만 의미 있음.

2. **3 플랫폼 모두 ZIP 해제 / 파일 첨부 인식 / markdown 앵커 자동 매칭 보장 없음**. 따라서 **prose 임베드 + 이미지 별도 첨부 + "첨부 N번" 단서** 패턴이 가장 안정적.

3. **레퍼런스 부분 차용** 지시는 어느 플랫폼도 공식 동작 명시 없음. → MUSE 가 **prose 차원에서 명시적으로** 표현해야: "ref-001: 색·구조만 차용 (typography 무시)" 식.

---

## 4. 플랫폼별 모범 입력 패턴 (도출)

### 4.1 Claude Design 모범

```
=== prompt 본문 (paste) ===
goal: [한 줄 의도]
layout: [화면 구조 한 줄]
content: [어떤 정보 표시]
audience: [타겟]

=== Design System (자연어, paste) ===
Primary: #14132B (잉크 톤, 첨부 1번 ref-001 색감 차용)
Surface: #FAF6E8 (크림, 첨부 2번 ref-002 배경에서)
Display Type: Playfair Display serif 4rem (첨부 3번 ref-003 hero 모방)
Grid: 12-col 24px gap (첨부 1번 ref-001 구조)

=== 차용 정책 ===
- 첨부 1번 (ref-001): 색·구조만 (typography 무시)
- 첨부 2번 (ref-002): 배경 톤만 (레이아웃 무시)
- 첨부 3번 (ref-003): hero typography 만

=== 첨부물 ===
이미지 1: ref-001.jpg
이미지 2: ref-002.jpg
이미지 3: ref-003.jpg
```

**핵심**: 토큰을 자연어로 풀어 + **레퍼런스 차용 정책 명시** + 첨부 순번 매칭. JSON·DTCG·ZIP 없음.

### 4.2 Gemini consumer 모범

- ZIP OK 단 ≤10 파일. 파일명으로 의미 표현 (`01-prompt.md`, `02-tokens.json`, `03-ref-001.jpg`).
- prompt 본문은 채팅 입력란에 paste, ZIP 은 첨부.
- 마찬가지로 prose 안에 "첨부 ZIP 의 ref-001.jpg 는 색감 차용" 식 단서.

### 4.3 Google AI Studio (API) 모범

- File API 로 개별 업로드 → URI 받음 → `contents` 배열에 직접 inline.
- 시스템 instruction 박스에 차용 정책 + 토큰 주입.
- multimodal 한 번에 처리 가능 (3,600 이미지 + long context).
- DTCG JSON 도 OK 단 ` ```json ` 코드블록 + 자연어 hint ("이 토큰을 디자인 시스템으로 사용") 동반.

---

## 5. MUSE 분석 산출물 설계 전략 (제안)

### 5.1 데이터 모델 보강

#### 5.1.1 Per-Reference Notes (사용자 입력)
- `Project.referenceNotes: { [refId]: string }` — DB jsonb 추가
- ProjectDetailPage 에서 각 레퍼런스 카드별로 200자 노트 textarea
- "ref-001 의 ___ 부분 차용" 식 사용자 의도 기록

#### 5.1.2 Per-Reference Layer Curation (이미 부분 존재)
- 기존 `selectedRefs[].useLayers` 활용 + DB 의 `project_references.use_layers` 활용
- 사용자 노트와 별도로 "어느 layer 를 가져올지" 명시적 데이터

#### 5.1.3 Anchored Mentions (T3 산출물 강화)
- **VD markdown / layerDetails / decisionRationale 모두 ref-id 직접 참조 강제**
- 시각적 특징 묘사할 때마다 `ref-001` 명시 (markdown 앵커 + prose 양쪽)
- T3 system prompt 에 **"모든 시각 묘사는 ref-XXX 출처를 명시"** 강제 룰 추가

### 5.2 산출물 형식 — Mode × Platform 매트릭스

| | Claude Design | Gemini | AI Studio | 범용 |
|---|---|---|---|---|
| **concept** | paste-ready prose + 이미지 첨부 (현재 .md 그대로 안내문 추가) | 동일 | 동일 | 현재 .md |
| **system** | **prose-flat .md** (tokens 자연어 풀이 + 차용 정책) + 이미지 ZIP | 현재 ZIP (단 파일 ≤10 제약) | File API 분할 | 현재 ZIP |
| **handoff** | **(우회)** Claude Code 직접 입력용으로만. Claude Design 에는 system 모드 산출물 사용 권장 | 현재 ZIP 분할 (tokens / refs / docs 3 ZIP) | File API 분할 | 현재 ZIP |

### 5.3 신규 산출물 — "Claude Design Paste Block"

모든 mode 의 ZIP / .md 옆에 **`claude-design-paste.md`** 추가:

```markdown
# {Project} — Claude Design 용 Paste Block

> 아래 본문을 Claude Design 에 paste + 첨부 이미지 N장 함께 업로드.

## Goal
{intent 1줄}

## Design System
- Primary: {hex} ({label}, 첨부 N번 {ref-id} {차용 부분})
- Surface: ...
- Display: ...
- Grid: ...

## 차용 정책 (per-reference)
- 첨부 1번 ({ref-id}): {layer 차용 명시 / 무시할 layer 명시}
- 첨부 2번 ({ref-id}): ...

## Build
{화면 / 컴포넌트 요청}
```

**생성 시점**: T3 산출물 + per-ref note + per-ref layer curation 모두 결합한 결정론적 변환 함수 (`buildClaudeDesignPaste`).

### 5.4 ZIP 내 이미지 명명 규약

- 파일명을 **첨부 순번** 으로 시작: `01-ref-001.jpg`, `02-ref-002.jpg`, ...
- paste prose 의 "첨부 1번" 과 정확히 매칭
- 사용자가 ZIP 풀어서 외부 도구에 던질 때도 순서 보존

### 5.5 T3 시스템 프롬프트 강화 항목

| 강화 항목 | 적용 task |
|---|---|
| 모든 토큰 `decisionRationale.whichReferences` 필수 (이미 강제됨) | 3 mode 공통 |
| **VD markdown / layerDetails 안에서 시각 묘사 시 ref-XXX 명시 강제** (신규) | system / handoff |
| **per-reference note 가 있으면 prompt 안에 ref-id 별로 verbatim 인용** (신규) | 3 mode 공통 |
| **차용 정책 (어느 ref 의 어느 layer)** 별도 섹션 출력 | system / handoff |
| concept 800자 안에 "ref-XXX 의 색 / typography / 구조" 문구 강제 | concept |

---

## 6. 작업 우선순위 — 다음 단계 Phase

| Phase | 항목 | 산출물 |
|---|---|---|
| 1 | DB 마이그레이션 — `referenceNotes` jsonb 컬럼 + 매퍼 | SQL + museDb.js + museStore.jsx |
| 2 | ProjectDetailPage 에 per-ref note 카드 신규 컴포넌트 (`ReferenceNoteCard`) | jsx 신규 |
| 3 | T3 시스템 프롬프트 강화 — ref 앵커 + per-ref note 주입 + 차용 정책 출력 | aiTasks.js (3 task) + museAiTasks.js |
| 4 | `buildClaudeDesignPaste` 변환 함수 신규 (`handoffConverters.js` 에 추가) | 함수 1개 |
| 5 | Export 분기 — 모든 mode ZIP/MD 에 `claude-design-paste.md` 동봉 | museExport.js |
| 6 | ZIP 내 이미지 명명 규약 (`01-ref-001.jpg`) | museExport.js |
| 7 | UI — Export 버튼을 dropdown 으로 (Claude Design / Gemini / Generic) | ThemeExportDialog 또는 Detail header |
| 8 | 빌드 검증 + 실제 Claude Design / Gemini 에 paste 테스트 | manual |

---

## 7. 결정 필요 항목 (사용자 입력 대기)

1. **per-ref note 위치**: ProjectDetailPage 의 "사용된 레퍼런스" 카드를 inline 편집 가능하게 / 클릭 시 sidebar dialog 열기 / 별도 page → 어느 패턴?
2. **차용 정책 입력 UI**: 자유 텍스트 (200자) / chip 선택 (color/typo/layout/gradient/visualDirection 다중 선택) / 둘 다? — 데이터 정합성과 UX 트레이드오프
3. **`claude-design-paste.md` 생성 시점**: T3 호출 시점에 LLM 이 같이 생성 / Export 시점에 클라이언트 결정론적 생성 — 후자가 안정적 (LLM 재호출 없음, regression 0)
4. **Phase 7 dropdown 우선순위**: 지금 단계에서 필요? 아니면 Phase 5 까지만 하고 단일 ZIP 으로 두기?

---

## 8. 실측 검증 — Concept 결과 분석 (2026-04-28)

> 같은 input (intent: "functional dashboard with retro mood and paper texture", 3 references with per-ref notes) 으로 Claude Design + Gemini 두 플랫폼에 paste 후 결과 비교.
> 산출물: `src/result/muse-retro-mood-dashboard-concept-2026-04-28/` + `gemini.png` + `claude-design.png`

### 8.1 결과 비교

| 평가 항목 | Claude Design | Gemini |
|---|---|---|
| 의도 해석 | ✅ Editorial daily journal "Margin" — 의도 잘 파악 | ❌ "Sustainable Future Initiative" 솔라셀 대시보드 — intent 와 무관 |
| Layout | ✅ 모듈러 그리드 카드, refined radius, 12-col 톤 | ⚠️ placeholder 카드만, 깊이 없음 |
| Typography | ✅ Editorial sans hierarchy | ⚠️ "Fit Build Launch" 큰 타이틀 — 의도와 어긋남 |
| Background | ❌ **flat cream — ref-002 의 ethereal grain gradient 손실** | ❌ flat gray — grain 없음 |
| Color | ✅ 잉크/크림 대비 잡힘 | ⚠️ 잘못된 black bar 하단 |
| 사용자 노트 반영 | ⚠️ "paper-grained background, fixed" 가 단순 cream 으로 의역 | ❌ 거의 무시 |

### 8.2 본질 진단 — 5 가지 prompt 결함

| # | 문제 | 위치 | 영향 |
|---|---|---|---|
| **A** | 단일 prose 한 단락 (467자) | `concept-prompt.md` Prompt(raw) 섹션 | weight 분리 없음 → 모델이 핵심/부가 구분 불가 |
| **B** | 사용자 노트가 "semantic, not verbatim" 으로 약화 | T3 system prompt 룰 | "use retro style paper grained background with fixed position" → "종이의 온기" 로 축소. **강도 손실** |
| **C** | Reference 본문 직접 인용 0건 | prompt 본문 vs 첨부물 매칭 표 분리 | 본문에 `ref-002` 출처 명시 없음 → 모델이 첨부 이미지 시각과 본문 추상 묘사 link 못 함 |
| **D** | Negative / Avoid 섹션 부재 | T3 system prompt | Claude Cookbook 명시: "explicit avoidance" 가 weighting 핵심. `purple gradients on white` 류 generic 회귀 차단 못 함 |
| **E** | Goal 추상 ("retro mood") | concept output | "1970s editorial? 80s synth?" 모호 → Gemini 가 "Sustainable Future" 로 hallucinate |

### 8.3 외부 자료 핵심 권고 (Anthropic / Google 공식)

- **Anthropic Cookbook (frontend aesthetics)**:
  - "Claude **defaults to safe choices unless explicitly encouraged otherwise**" — Claude Design 의 cream 회귀 정확히 이것
  - 4 차원 분리 권장: **Typography / Color & Theme / Motion / Backgrounds** — 단락 prose 가 아니라 분리 섹션
  - Background: "**Layer CSS gradients, geometric patterns, contextual effects** rather than defaulting to solid colors"
  - 강조 메커니즘 = **explicit avoidance** ("Never use Inter / Roboto / Arial...")
  - "**Reference the design system explicitly. If Primary Button or Card layout exists, name them in the prompt**"
- **Google Gemini 2.5 Image**:
  - "Describe the scene, not just keywords" (우리 prose 충족 ✅)
  - 권장 순서: subject → composition → environment → lighting → **textures** → aspect ratio
  - "Use **semantic positive framing**: NOT 'no cars' BUT 'empty deserted street'"
  - 정형 weighting 시스템은 공식 미제공 — 모델이 prompt 의 **명확성** 에 의존

---

## 9. Concept Prompt Schema 재설계 — 5 섹션 sectionalize

### 9.1 새 출력 구조

```markdown
## GOAL
{1줄, 시대·장르 구체 — 추상 형용사 대신 "1970s editorial magazine inspired functional dashboard" 식}

## STYLE [CRITICAL]
- {핵심1: 사용자 노트 verbatim, 출처 ref 직접 명시}
- {핵심2: verbatim, 출처 ref}
- {핵심3: verbatim, 출처 ref}

## REFERENCES
- 첨부 1번 `01-...jpg`: {what to copy} — {ignore via 차집합}
- 첨부 2번 `02-...jpg`: {what to copy} — {ignore}
- 첨부 3번 `03-...jpg`: {what to copy} — {ignore}

## TOKENS
- Color: Primary {hex}, Surface {hex}, Accent {hex}
- Type: {family} {weight} {size}
- Grid: {cols}-col {gap}px gap, max {width}

## AVOID
- {generic default 차단: "flat solid background", "predictable card grid", "Inter/Roboto fonts" 등}
```

### 9.2 핵심 변화 (vs 현재)

| 항목 | 현재 | 개선 |
|---|---|---|
| 구조 | 단락 prose | **5 섹션 markdown headers** |
| 사용자 노트 | "semantic, not verbatim" 의역 | **`[CRITICAL]` 섹션에 verbatim 인용** |
| Reference 출처 | 본문 외부 매칭 표 only | 본문 안 in-text + 매칭 표 **둘 다** |
| Negative | 없음 | `## AVOID` 섹션 신설 |
| Weight | 자연어 강조어 ("핵심", "중요") | **`[CRITICAL]` 섹션 헤더 + bullets** |
| Goal | 추상 ("retro mood") | 시대·장르 구체 (extracted.tags 활용) |

### 9.3 자수 한도 — 800자 → 1000자

- sectionalize 헤더 + bullet 마커 자체로 자수 소요
- Gemini 약점은 **길이가 아니라 명확성** — 늘려도 무방
- `TASK_ANALYZE_CONCEPT.toolSchemas[0].input_schema.properties.prompt.maxLength` 800 → **1000**
- minLength 200 → **300** (5 섹션 모두 포함하려면 최소 자수 ↑)

### 9.4 T3 system prompt 강화 항목 (concept 전용)

| 항목 | 변경 |
|---|---|
| 출력 형식 | "5 band 자연어 단락" → **"5 섹션 markdown (## GOAL / ## STYLE [CRITICAL] / ## REFERENCES / ## TOKENS / ## AVOID)"** |
| 사용자 노트 | "semantic 반영" → **"`[CRITICAL]` 섹션에 verbatim 인용"** |
| Reference 인용 | 권장 → **각 [CRITICAL] bullet 옆에 출처 ref-XXX + attachFile 직접 명시 강제** |
| Negative | 없음 → **`## AVOID` 섹션에 1+ 항목 강제** ("flat solid background", "purple gradients on white", 등 cliché 차단) |
| Goal 구체화 | 추상 형용사 허용 → **시대·장르·페르소나 명시 권장** (extracted.tags.visualDirection.genre/style 활용) |
| 마크다운 금지 룰 | 기존 "##, **, \`\`\`, - bullets 금지" → **"## headers + bullet 허용 (sectionalize 위해)"** |

### 9.5 자동 검증 룰 추가

기존 (concept tool schema 검증):
- 길이 200-800
- HEX 3+
- 마크다운 부재
- 토큰 ID 부재

변경:
- 길이 300-1000
- HEX 3+
- **`## STYLE [CRITICAL]` 섹션 존재 (정규식 매치)**
- **`## AVOID` 섹션 존재 (정규식 매치)**
- 토큰 ID 부재 (id naming 표기 금지 유지)
- 마크다운 헤더 **허용** (단 ` ``` ` 코드블록 여전히 금지)

---

## 10. 신규 작업 우선순위 (Concept Schema 재설계 적용)

§6 의 1-8 phase 는 완료/진행 중. 이번 검증 후 추가 phase:

| Phase | 항목 | 적용 파일 | 기대 효과 |
|---|---|---|---|
| **A** | T3 concept system prompt 의 output 형식을 5 섹션 markdown 으로 변경 + 사용자 노트 verbatim 룰 | `aiTasks.js` `TASK_ANALYZE_CONCEPT.systemPrompt` | weight 분리 + 사용자 강조 보존 |
| **B** | tool_schema maxLength 800→1000, minLength 200→300 | `aiTasks.js` 동일 task | sectionalize 자수 확보 |
| **C** | `## AVOID` 섹션 강제 + `## STYLE [CRITICAL]` 섹션 강제 (system prompt + 자동 검증) | `aiTasks.js` + `museAiTasks.js` `runAnalyzeConcept` validate() | generic 회귀 차단 |
| **D** | Goal 시대·장르 구체화 룰 — `extracted.tags.visualDirection.genre/style` 를 prompt 에 명시 인용 권장 | `aiTasks.js` system prompt | "retro mood" 모호성 해소 |
| **E** | 마크다운 금지 룰 완화 — `##` headers + `-` bullets 허용 (단 코드블록 여전히 금지) | validate() 정규식 수정 | sectionalize 호환 |
| **F** | 동일 input 으로 재호출 → Claude Design / Gemini 결과 재검증 | manual | 효과 측정 |

### 10.1 시스템 / handoff 모드 적용 여부

- 본 §9 의 sectionalize 는 **concept 전용**. system / handoff 는 schema 가 다름 (4 token layer + VD MD / + layerDetails) — 자체 구조가 이미 sectionalize.
- 단 §8.2 의 (B) (D) (E) 는 system / handoff system prompt 에도 부분 적용 권장:
  - (B) 사용자 노트 verbatim — 이미 강제됨 (이번 세션) ✓
  - (D) Negative / Avoid — system / handoff 에는 아직 없음. 추후 보강
  - (E) Goal 구체화 — 모든 mode 공통

---

## 11. 출처

- [Introducing Claude Design by Anthropic Labs](https://www.anthropic.com/news/claude-design-anthropic-labs)
- [Get started with Claude Design (Help Center)](https://support.claude.com/en/articles/14604416-get-started-with-claude-design)
- [Using Claude Design for prototypes and UX (Tutorial)](https://claude.com/resources/tutorials/using-claude-design-for-prototypes-and-ux)
- [Claude Design to Claude Code Handoff (claudefa.st)](https://claudefa.st/blog/guide/mechanics/claude-design-handoff)
- [Anthropic launches Claude Design (TechCrunch)](https://techcrunch.com/2026/04/17/anthropic-launches-claude-design-a-new-product-for-creating-quick-visuals/)
- [Claude Design vs Figma (VentureBeat)](https://venturebeat.com/technology/anthropic-just-launched-claude-design-an-ai-tool-that-turns-prompts-into-prototypes-and-challenges-figma)
- [Gemini API File API (Google)](https://ai.google.dev/gemini-api/docs/files)
- [Gemini API Long Context (Google)](https://ai.google.dev/gemini-api/docs/long-context)
- [Gemini Image Understanding (Google)](https://ai.google.dev/gemini-api/docs/image-understanding)
- [Gemini Apps Help — Files](https://support.google.com/gemini/answer/14903178)
- [Claude Vision (Anthropic Docs)](https://platform.claude.com/docs/en/build-with-claude/vision)
- [Claude.ai Supported File Types](https://support.claude.com/en/articles/8241126-supported-file-types-on-claude-ai)
- [Prompt design strategies — Gemini API (Google)](https://ai.google.dev/gemini-api/docs/prompting-strategies)
- [How to prompt Gemini 2.5 Flash Image Generation (Google Developers Blog)](https://developers.googleblog.com/how-to-prompt-gemini-2-5-flash-image-generation-for-the-best-results/)
- [Prompting for frontend aesthetics (Claude Cookbook)](https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics)
- [Claude prompting best practices (Claude Docs)](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
- [awesome-claude-design (community curated)](https://github.com/rohitg00/awesome-claude-design)
