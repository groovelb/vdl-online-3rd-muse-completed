# AI Design Tools — Pain Points 정성 리서치 분석

> 분석일: 2026-04-27 (라운드 3 반영)
> 데이터 출처: `01-design-md-painpoints-raw.md` (52건 출처 기반)
> 분석 기법: Thematic Analysis (Braun & Clarke 6 phases) + Affinity Diagram + Severity × Frequency 매트릭스 + JTBD framework + Persona Pain Mapping
> 목적: MUSE 제품 정의·차별 메시지·기능 우선순위에 직접 활용 가능한 분석 산출물

---

## 0. 분석 개요

### 적용한 정성 분석 기법
1. **Open Coding** — 41건 raw 발화에서 64개 1차 코드 추출
2. **Axial Coding** — 64개 코드 → 13개 페인포인트 클러스터로 그룹핑
3. **Selective Coding** — 13개 클러스터 → 4개 핵심 테마 (super-themes) 추출
4. **Affinity Diagram** — 발화-클러스터-테마 3-tier 구조화
5. **Severity × Frequency 매트릭스** — 페인포인트 우선순위 (action priority)
6. **JTBD Frame** — 사용자가 도구를 "고용"하는 진짜 작업
7. **Persona Pain Mapping** — 어떤 역할이 어떤 페인을 겪는지 매핑

### 데이터 신뢰도
- **Tier A (★★★★★, n=11)**: 도구 자체 페이지의 자기 인정 / 대형 매체 인용 / 전문가 실명 발언 — 직접 인용 가능
- **Tier B (★★★★, n=15)**: 디자이너 1인칭 후기, 실명 / 매체 보도 — 인용 가능
- **Tier C (★★★, n=10)**: 비교 글, 가이드, 익명 — 정황 증거
- **Tier D (★★, n=5)**: 단편 발화, 제3자 인용

---

## 1. Phase 1·2: Familiarization + Initial Coding

### 1차 코드 64개 (raw 발화 → 코드)

| Raw 발화 (요약) | 코드 |
|---|---|
| "결과는 있지만 이유가 빠져 있는 구조" — 김은수 | `decision-without-rationale` |
| "왜 테라코타를 골랐는지는 담지 않는다" — 김은수 | `color-choice-opaque` |
| "두 프롬프트로 12-slide → 토큰 소진" — Pillitteri | `token-budget-burn` |
| "30분에 일주일 한도 80% 사라짐" — PCWorld | `pro-quota-insufficient` |
| "Brand direction and art style requests were largely ignored" — Bitovi | `brand-input-ignored` |
| "Generated greens instead of respecting design system tokens" — TDP | `token-spec-violation` |
| "no way to click into the swatch and edit it" — TDP | `inspect-edit-blocked` |
| "Stitch created an entirely new design system on the fly rather than using the one I provided" — TDP | `spec-disregarded` |
| "design.md should be treated as a prompt-conditioner, not a contract" — Royarindam | `spec-not-contract` |
| "AI doesn't have a Source of Truth. It's guessing your 'vibe.'" — Royarindam | `vibe-guessing` |
| "Multi-Reference Composition: cannot express conditional composites" — designmd.app | `multi-ref-impossible` |
| "MUI/Chakra Parity: No documented export paths" — designmd.app | `mui-export-absent` |
| "No mechanism for language-specific typography" — designmd.app | `localization-missing` |
| "Missing disabled, loading, error, focus indicators" — designmd.app | `state-matrix-incomplete` |
| "Typography is untouched. Shadows are whatever shadcn ships with" — SeedFlip | `partial-theme-output` |
| "tightly coupled to Stitch's ecosystem rather than a formal open standard" — DesignWhine | `vendor-lockin-risk` |
| "alpha 버전, expect changes" — MindStudio | `format-immature` |
| "this one is outdated the colors are broken" — shadcn discussion | `tool-maintenance-burden` |
| "Inter font, purple gradient, card layout, safe neutrals" — Frontend Design skill | `ai-aesthetic-monotony` |
| "Everything looks… the same" — Bitovi | `output-homogenization` |
| "navigation varied from page to page" — Stitch review | `cross-page-inconsistency` |
| "60+ 브랜드 모방, 신규 브랜드 X" — getdesign.md | `mimicry-only-no-creation` |
| "weak descriptions" — awesome-design-md | `descriptions-low-quality` |
| "doesn't address functional design, UX logic, or interaction patterns — only visual rules" — Banani | `surface-only-coverage` |
| "outputs are essentially read-only previews with prompt-driven edits" — TDP | `prompt-only-editing` |
| "every correction is another round-trip through the prompt" — TDP | `iteration-friction` |
| "10-30 second delay is enough for my brain to drift" — karozieminski | `latency-flow-break` |
| "if every exploration costs tokens, you start playing it safe" — Ocasio | `cost-induced-conservatism` |
| "no real-time co-editing" — multiple | `collab-absent` |
| "한 화면에 팀원 커서가 여럿 떠서 같이 수정 안 됨" — brunch | `single-user-only` |
| "디자이너의 미래는 원칙과 시스템을 설계하는 것" — Toss | `designer-as-system-architect` |
| "AI가 만족스러운 결과 내는 디자이너 15%" — Figma 2026 | `satisfaction-low-baseline` |
| "Some of the best decisions came from friction" — Fanny | `friction-as-craft` |
| "design isn't always a throughput problem" — Fanny | `throughput-misframe` |
| "starting from a terminal with vague creative direction is like describing a painting over the phone" — Fanny | `text-input-impoverished` |
| "human review of accuracy, expression, brand tone is necessary" — 이랜서 | `human-validation-required` |
| "결과물이 그대로 최종본으로 확정하기보다" — 이랜서 | `not-final-deliverable` |
| "spacing inconsistencies, typography that does not quite sit right" — Hannah Milan | `quality-fitness-gap` |
| "components that need rebuilding from scratch inside a proper design system" — Hannah Milan | `production-rebuild-required` |
| "What it cannot generate is judgment" — Hannah Milan | `judgment-unautomatable` |
| "border-radius 8px or 12px depending on AI generation" — wikidocs | `nondeterministic-output` |
| "웹 디자인도 저작권이 있을 텐데, 통째로 카피해서 적용" — wikidocs | `copyright-grey-area` |
| "텍스트만 갖고가고 이미지는 안들어간다" — MUSE T3 (대조 자료) | `image-reanalysis-cost` |
| "Stitch ignored specifics" — Royarindam | `specs-ignored-by-tool` |
| "lack of direct editing" — TDP | `direct-edit-blocked` |
| "Cannot generate photorealistic images" — karozieminski | `image-generation-gap` |
| "No backend/database functionality" — karozieminski | `backend-gap` |
| "MUI Sync experimental, limited to Button/Switch/Typography" — MUI docs | `mui-automation-partial` |
| "Manual TypeScript augmentation required" — design-tokens.dev | `type-system-manual-work` |
| "Shadow tokens require sector mapping through 25 array entries" — design-tokens.dev | `shadow-config-tedious` |
| "We're only changing naming and layer hierarchy. Nothing changes visually" — Sketch2React | `naming-only-no-automation` |
| "API outputs above 2K still in beta" — MindStudio | `scale-instability` |
| "Sorry, Stitch is unavailable" 68 reply | `tool-uptime-issues` |
| "no public API as of launch day" — Claude Design review | `automation-blocked` |
| "Cannot import Figma files" — KR review | `figma-import-blocked` |
| "Limited typography controls compared to full design-system tools" — tweakcn | `typography-controls-poor` |
| "OKLCH opacity bug" — tweakcn issue | `color-format-bugs` |
| "DarkMatter theme uses incorrect danger color" — tweakcn issue | `theme-quality-defects` |
| "decision fatigue problem" — shadesigner | `slider-fatigue` |
| "I don't know what my app should look like and I need to find out fast" — SeedFlip | `direction-blank-page` |
| "color-picker generators touch these dimensions [only]" — SeedFlip | `dimension-narrow` |
| "abstract requests easily veer off course" — 이랜서 | `vague-input-misfire` |
| "디자이너 없이 PM이 했을 때 어려운" — 한국 매체 | `non-designer-onboarding-gap` |
| "RAM 많이 사용하는 체감" — risemoment | `client-performance-poor` |
| "복잡한 작업 하나로 주간 할당량 50% 소모" — 다수 KR 매체 | `single-task-cost-extreme` |
| "프로토타입 수준에 머물며, 전문 도구 수준의 완성도 X" — daleseo | `prototype-not-production` |

---

## 2. Phase 3·4: Searching + Reviewing Themes

### 라운드 3 신규 코드 추가 (15개)

| Raw 발화 | 코드 |
|---|---|
| "lack a direct connection to component libraries" — UXPin | `production-component-disconnect` |
| "AI tools approximate padding: 12px from training data" — UXPin | `approximated-not-tokenized` |
| "rebuild everything or ship the approximation" — UXPin | `rework-or-inconsistency-tradeoff` |
| "KRDS 따라야 하고... 처음부터 만드는 게 나을 수도" — velog hanui | `krds-mismatch-rebuild` |
| "Button size s/m/l vs Tooltip sm/md/lg" — velog | `token-key-inconsistency` |
| "완전 자동화된 파이프라인은 온전한 품질 어려움" — velog rainlee | `full-automation-quality-gap` |
| "수동검토가 필요" — velog rainlee | `human-review-loop-needed` |
| "AI Makes [design system bugs] Worse" — Emilia | `ai-amplifies-bugs` |
| "Teams have lost hundreds of hours manually translating" — Inhaq | `translation-time-cost` |
| "spacing 25pt vs 8pt spatial system" — Inhaq | `system-mismatch-confusion` |
| Figma Config 2025: AI tokens + Git + live sync | `figma-platform-encroachment` |
| "Generate components using AI" tweakcn req | `ai-component-gen-demand` |
| "Image input for AI" tweakcn req | `image-input-demand` |
| "Design system linting" tweakcn req | `linting-demand` |
| "Contrast accessibility reporting" tweakcn req | `a11y-validation-demand` |

### 13개 페인포인트 클러스터 (Axial Coding)

| # | 클러스터 | 포함 코드 | 핵심 발화 |
|---|---|---|---|
| **C1** | 결정 근거 부재 (Decision Opacity) | `decision-without-rationale`, `color-choice-opaque`, `vibe-guessing`, `surface-only-coverage`, `descriptions-low-quality` | "결과는 있지만 이유가 빠져 있는 구조" |
| **C2** | 명세 무시 / Contract 부재 | `brand-input-ignored`, `token-spec-violation`, `spec-disregarded`, `spec-not-contract`, `specs-ignored-by-tool`, `nondeterministic-output` | "design.md should be treated as a prompt-conditioner, not a contract" |
| **C3** | 다중 레퍼런스 합성 부재 | `multi-ref-impossible`, `mimicry-only-no-creation` | "Tokens reference single paths, cannot express conditional composites" |
| **C4** | 비용·속도 압박 | `token-budget-burn`, `pro-quota-insufficient`, `cost-induced-conservatism`, `latency-flow-break`, `single-task-cost-extreme` | "30분에 일주일 한도 80% 사라짐" |
| **C5** | 출력 품질 부분성 | `partial-theme-output`, `state-matrix-incomplete`, `dimension-narrow`, `production-rebuild-required`, `quality-fitness-gap`, `prototype-not-production`, `output-homogenization`, `cross-page-inconsistency`, `ai-aesthetic-monotony` | "Typography is untouched. A generator that doesn't output these is partial" |
| **C6** | 직접 편집 불가 | `inspect-edit-blocked`, `direct-edit-blocked`, `prompt-only-editing`, `iteration-friction`, `slider-fatigue` | "every correction is another round-trip through the prompt" |
| **C7** | MUI 특화 자동화 갭 | `mui-export-absent`, `mui-automation-partial`, `type-system-manual-work`, `shadow-config-tedious`, `naming-only-no-automation` | "MUI/Chakra Parity: No documented export paths" |
| **C8** | 협업 부재 | `collab-absent`, `single-user-only` | "한 화면에 팀원 커서가 여럿 떠서 같이 수정 안 됨" |
| **C9** | Figma 의존/단절 | `figma-import-blocked` | "Cannot import Figma files" |
| **C10** | 도구 안정성·성숙도 | `tool-uptime-issues`, `format-immature`, `tool-maintenance-burden`, `scale-instability`, `client-performance-poor`, `color-format-bugs`, `theme-quality-defects`, `automation-blocked` | "alpha 버전, expect changes" |
| **C11** | 디자이너 craft 대체 불가 | `friction-as-craft`, `throughput-misframe`, `text-input-impoverished`, `judgment-unautomatable`, `human-validation-required`, `not-final-deliverable`, `vague-input-misfire`, `direction-blank-page` | "Some of the best decisions came from friction" |
| **C12** | 한국어/지역화 부재 | `localization-missing` | "No mechanism for language-specific typography" |
| **C13** | 표준화·소유권 우려 | `vendor-lockin-risk`, `copyright-grey-area` | "DESIGN.md tightly coupled to Stitch's ecosystem rather than a formal open standard" |
| **C14** | (신규) Production component 단절 | `production-component-disconnect`, `approximated-not-tokenized`, `rework-or-inconsistency-tradeoff`, `ai-amplifies-bugs`, `translation-time-cost`, `system-mismatch-confusion` | "AI tools approximate padding: 12px from training data rather than looking up actual design system tokens" |
| **C15** | (신규) 한국 시장 KRDS/지역 디자인 시스템 갭 | `krds-mismatch-rebuild`, `token-key-inconsistency` | "KRDS 따라야 하고... 솔직히 이거 하다 보면 처음부터 만드는 게 나을 수도" |
| **C16** | (신규) 인간 검토 루프 미지원 | `full-automation-quality-gap`, `human-review-loop-needed` | "완전 자동화된 파이프라인은 때로는 온전한 품질을 기대하기 어려울 때" |
| **C17** | (신규) Figma의 카테고리 역공습 | `figma-platform-encroachment` | "Figma Config 2025: AI tokens + Git + live sync" |
| **C18** | (신규) AI 도구 사용자가 원하는 것 (수요) | `ai-component-gen-demand`, `image-input-demand`, `linting-demand`, `a11y-validation-demand` | tweakcn discussions 사용자 요청 4종 |

---

## 3. Phase 5·6: Defining Themes (Selective Coding)

### 4개 핵심 테마 (Super-Themes)

13개 클러스터를 더 추상화하면 **4개 메타 테마**로 수렴:

```
Theme T1. "왜 그랬는지 모름"             ← C1 (결정 근거) + C2 (명세 무시)
Theme T2. "단일 입력의 단조로움"         ← C3 (다중 레퍼런스) + C5 (출력 품질) + C12 (지역화)
Theme T3. "통제권 상실"                   ← C4 (비용) + C6 (편집 불가) + C7 (MUI 갭) + C8 (협업) + C9 (Figma) + C10 (안정성)
Theme T4. "AI는 craft를 대체 못함"        ← C11 (craft) + C13 (소유권)
```

### 테마 정의

#### T1. "왜 그랬는지 모름" (Decision Opacity)
> **AI 디자인 도구는 결과물을 주지만, 그 결정의 근거·출처·재현성을 제공하지 않는다.**
> 사용자는 결과를 신뢰할 수 없거나, 신뢰하더라도 수정·검증·인계할 수 없다.

핵심 인용:
- 김은수 (IBM Research): "결과는 있지만 이유가 빠져 있는 구조"
- Royarindam: "AI doesn't have a Source of Truth. It's guessing your 'vibe.'"
- TDP: "Stitch created an entirely new design system on the fly rather than using the one I provided"

→ **MUSE 직격 점유**: `sourceReferenceIds` + `extracted` JSON으로 토큰의 출처 기록. T1 코드 검토에서 이미 데이터 모델 존재 확인됨.

#### T2. "단일 입력의 단조로움" (Single-Source Monotony)
> **현재 도구는 1개 브랜드, 1장 이미지, 1개 prompt를 받는 단일 입력 구조.**
> 다중 레퍼런스 합성이 불가능해 출력이 동질화되고 디자이너의 큐레이션 능력이 사장된다.

핵심 인용:
- designmd.app 자체: "cannot express conditional composites"
- Bitovi: "Everything looks… the same"
- Frontend Design skill: "Inter font, purple gradient, card layout, safe neutrals"

→ **MUSE 직격 점유**: T2 + T3가 N장 레퍼런스를 의도와 합성. 시장에 정확히 비어있는 자리.

#### T3. "통제권 상실" (Loss of Control)
> **사용자는 도구 사용 중 비용·시간·편집·협업·통합·안정성 모든 차원에서 통제권을 잃는다.**
> 결과적으로 "탐색을 못하고 안전한 답에 머물게 된다."

핵심 인용:
- Ocasio: "if every exploration costs tokens, you start playing it safe"
- TDP: "every correction is another round-trip through the prompt"
- karozieminski: "10-30 second delay is enough for my brain to drift"

→ **MUSE 부분 점유**: 자체 API 키 + 비용 투명 + 편집 가능 토큰 모델. 단 협업/Figma 통합은 미해결.

#### T4. "AI는 craft를 대체 못함" (Craft Irreducibility)
> **속도·throughput 최적화와 디자인 craft는 같지 않다.**
> 디자이너의 friction·judgment·brand 어휘는 자동화될 수 없으며, AI 도구는 이를 무시할 때 시장에서 거부된다.

핵심 인용:
- Fanny: "Some of the best design decisions came from friction"
- Hannah Milan: "What it cannot generate is judgment"
- Toss: "디자이너의 미래는 AI가 더 뛰어난 결과물을 만들 수 있도록 원칙과 시스템을 설계하는 것"

→ **MUSE 포지셔닝**: AI를 "디자이너 대체"가 아닌 "디자이너의 시스템 설계 도구"로 메시지. Toss 인용을 직접 활용.

---

## 4. Severity × Frequency 매트릭스 (우선순위)

```
                  낮은 빈도 ─────────────────── 높은 빈도
   ┌────────────────────────────────────────────────────┐
높 │                  │ C7 MUI 갭         │ C1 결정 근거 │
은 │                  │                   │ C4 비용·속도 │
심 │                  │                   │ C2 명세 무시 │
각 │                  │                   │ C5 출력 품질 │
도 ├──────────────────┼───────────────────┼──────────────┤
   │ C12 한국어       │ C13 소유권        │ C3 다중 레퍼 │
중 │                  │ C9  Figma 단절    │ C11 craft    │
   │                  │                   │ C6 편집 불가 │
   ├──────────────────┼───────────────────┼──────────────┤
낮 │                  │ C10 안정성        │ C8 협업      │
은                                                       
   └────────────────────────────────────────────────────┘
```

### Action Priority (P0~P3)

**P0 — 즉시 카피·기능 반영 (높은 심각도 + 높은 빈도)**
- C1 결정 근거 부재 → **메인 메시지**
- C2 명세 무시 → **메인 메시지**
- C4 비용·속도 → **사용량 투명성 포인트**
- C5 출력 품질 부분성 → **5 레이어 풀세트 강조**

**P1 — 차별 메시지 (높은 심각도 + 중간 빈도)**
- C7 MUI 갭 → **MUI 특화 진입 메시지**
- C3 다중 레퍼런스 → **무드보드 합성 메시지**
- C11 craft 보존 → **시스템 설계자 페르소나 메시지**

**P2 — 보조 메시지**
- C6 편집 불가 → **토큰 직접 편집 UI 강조**
- C12 한국어 → **한국어 어휘 매핑 (장기)**
- C8 협업, C9 Figma → **명시적 비차별 영역으로 인정**

**P3 — 무시**
- C10 안정성 → 모든 신생 도구 공통, 차별 메시지 X
- C13 소유권 → 직접 다루지 않음 (회피 가능)

---

## 5. JTBD Frame — 사용자가 "고용"하는 진짜 작업

### 사용자 발화에서 추출한 JTBD 3개

```
JTBD-1 (Discovery / Convergence)
"When I'm starting a new project with vague taste,
 I want to converge multiple references into one direction,
 so I can stop being indecisive and commit to a system."

JTBD-2 (Trust Building)
"When AI generates my design tokens,
 I want to see WHY each token was chosen,
 so I can defend the decision to my team / client / future self."

JTBD-3 (Production Handoff)
"When my design is ready,
 I want it to flow into my code stack (MUI/Tailwind) without manual re-mapping,
 so I don't lose 30% time on translation."
```

### 출처 인용
- JTBD-1: SeedFlip "I don't know what my app should look like" + Bitovi "uninspired layouts"
- JTBD-2: 김은수 "이유가 빠져있는 구조" + Royarindam "guessing your vibe" + 이랜서 "human review necessary"
- JTBD-3: design-tokens.dev "Manual TypeScript augmentation" + Sketch2React "Nothing changes visually"

→ **MUSE의 3개 핵심 기능 = 3개 JTBD에 1:1 매핑**:
- JTBD-1 ↔ T2 Recommend + 다중 레퍼런스 무드보드
- JTBD-2 ↔ `sourceReferenceIds` 추적 + T3 reasoning
- JTBD-3 ↔ ThemeExportDialog (MUI) + DTCG export (추가 권장)

---

## 6. Persona Pain Mapping

### 페르소나 4명 도출 (발화 분석)

#### P1. 비디자이너 PM/창업자 (한국 매체 다수)
> "디자이너 없이 프로토타입 만들고 싶다"

**겪는 페인** (강도순):
- C4 비용·속도 ★★★★★ ("30분에 80%")
- C5 출력 품질 ★★★★ ("색감과 여백이 어색")
- C11 craft 부재 ★★★★ ("초안만 가능, 완성품 X")
- C2 명세 무시 ★★★ ("vague request → veers off")

**MUSE 메시지**: "초안 도구 N개 사보세요. MUSE는 초안 + 결정 근거 + 5 레이어 토큰을 한 번에 줍니다."

#### P2. 시니어 디자이너 (Bitovi Levi Myers, Fanny, Hannah Milan)
> "AI는 내 craft를 못 대체한다. 그래도 가속은 필요하다."

**겪는 페인**:
- C11 craft 무시 ★★★★★ ("AI가 friction을 못 만듦")
- C2 spec ignored ★★★★★ ("Brand requests largely ignored")
- C6 직접 편집 불가 ★★★★
- C5 출력 품질 ★★★

**MUSE 메시지**: "디자이너를 대체하지 않습니다. 디자이너의 시스템 설계 능력을 증폭합니다." (Toss 인용 인용)

#### P3. 디자인 시스템 엔지니어 (디자인 토큰 + MUI/shadcn 사용자)
> "토큰을 코드로 가져오는 데 30%가 사라진다"

**겪는 페인**:
- C7 MUI 갭 ★★★★★ ("Manual TypeScript augmentation")
- C2 token-spec-violation ★★★★ ("greens 대신 tokens 무시")
- C13 vendor lockin ★★★ (DESIGN.md 표준 우려)
- C5 partial-theme ★★★★ ("color only")

**MUSE 메시지**: "MUI 특화 + DTCG 동시 export. shadcn 도구가 못 다루는 typography·shape·atmosphere까지."

#### P4. AI 코딩 에이전트 사용자 (Cursor/Claude Code 헤비 유저)
> "DESIGN.md 줘도 AI가 무시한다. 결정적 출력이 안 나온다."

**겪는 페인**:
- C2 spec-not-contract ★★★★★ ("prompt-conditioner only")
- C10 nondeterministic ★★★★ ("8px or 12px")
- C1 vibe-guessing ★★★★★
- C4 비용 ★★★

**MUSE 메시지**: "Schema-strict tool로 contract-grade 출력 강제. AI가 'vibe' 짐작하는 게 아니라 명세를 따릅니다."

---

## 7. 메시지 → 페인포인트 → 인용 매핑 (직접 사용 가능)

### 헤드라인 후보 (각 P0~P1 페인 직격)

| 헤드라인 | 직격 페인 | 근거 인용 | 화자 |
|---|---|---|---|
| **"AI가 디자인했지만 왜 그랬는지 모르는 시대를 끝낸다"** | C1 | "결과는 있지만 이유가 빠져 있는 구조" | 김은수 (IBM Research, ZDNet) |
| **"DESIGN.md는 prompt conditioner. MUSE는 contract."** | C2 | "design.md should be treated as a prompt-conditioner, not a contract" | Royarindam (Medium) |
| **"60+ 브랜드 모방 vs. 5장 무드보드 합성"** | C3 | designmd.app 자체 "cannot express conditional composites" | designmd.app |
| **"30분에 한도 80% 사라지는 도구가 아닙니다"** | C4 | PCWorld 인용 | 다수 매체 |
| **"색상만 다루면 디자인 시스템이 아닙니다"** | C5 | "A generator that doesn't output [typography, shape, atmosphere] is partial" | SeedFlip |
| **"MUI 시장에 AI 도구가 없습니다. 우리가 첫 번째."** | C7 | "MUI/Chakra Parity: No documented export paths" | designmd.app |

### 사회적 증거 인용 박스

> "AI 생성 UI에 만족하는 디자이너는 **15%**" — Figma 2026 디자이너 보고서

> "DESIGN.md는 '버튼은 테라코타 색'이라고 기록하지만, 왜 테라코타를 골랐는지는 담지 않는다.
> **결과는 있지만 이유가 빠져 있는 구조.**"
> — 김은수, IBM Research UX 엔지니어 (ZDNet Korea, 2026-04-26)

> "디자이너의 미래는 직접 디자인하는 것이 아니라
> **AI가 더 뛰어난 결과물을 만들 수 있도록 원칙과 시스템을 설계하는 것.**"
> — Toss 디자인팀

---

## 8. 분석 결론 — MUSE 포지셔닝 정정 권고

### 기존 포지셔닝 (대화 초기)
> "디자이너와 바이브 코딩 유저를 위한 레퍼런스 기반 디자인 토큰 추출 도구"

### 정성 분석 기반 정정 권고
> **"AI Decision-Traceable Design System Builder for Designers Who Curate Multiple References"**
> 한국어: "다중 레퍼런스를 의도와 합성해, 모든 디자인 결정의 근거를 추적 가능한 시스템으로 만드는 도구"

### 차별 메시지 우선순위
1. **결정 근거 추적 (T1)** — DESIGN.md 시장 전체에 대한 직접 비판 + 김은수 인용
2. **다중 레퍼런스 합성 (T2)** — 시장 정확한 공백, designmd.app 자체 인정
3. **MUI 특화 진입 (C7)** — 블루오션 진입권
4. **결과 + 근거 + 토큰 + DESIGN.md 4중 출력** (C5 부분성 비판 회피)

### 의도적 비차별 영역 (정직 메시지로 인정)
- 협업 (C8): "Figma + MUSE 워크플로우 추천"
- Figma 통합 (C9): "Figma는 협업, MUSE는 합성"
- 도구 안정성 (C10): "MVP, 빠른 반복"

---

## 9. 다음 단계 제안

### A. MUSE 카피 v1 작성 (이 분석 기반)
- 헤드라인 6개 후보 → 1개 선택 + A/B 변형
- 사회적 증거 인용 박스 3개 → 랜딩 페이지에 그대로
- 페르소나별 메시지 3개 → 다른 진입 경로

### B. 분석 보강 라운드 3 (선택)
- 디스콰이엇/페북 로그인 → P3 디자인 시스템 엔지니어 한국 발화 보강
- 사용자 인터뷰 5명 (P1·P2·P3 각 1~2명) → C12 한국어 페인포인트 검증

### C. 제품 우선순위 재정렬
- 즉시: `sourceReferenceIds` UI 가시화 (T1 직격, 데이터 이미 있음)
- 즉시: DTCG export (C5 + C7 진입권)
- 다음: 레이어별 가중치 UI ("ref-A에서 컬러만" — Figma 2026 만족도 15% 가설 검증)
- 후순위: 한국어 어휘 매핑

---

## 부록 — 코딩 노트

### 신뢰도 등급 정의
- **Tier A (★★★★★)**: 도구 자체 자기 인정 / 대형 매체 + 실명 전문가 / 대규모 통계 (Figma 2026)
- **Tier B (★★★★)**: 1인칭 디자이너 후기 / 매체 보도
- **Tier C (★★★)**: 비교 글, 가이드, 익명 / 정황 증거
- **Tier D (★★)**: 단편 발화, 제3자 인용

### 분석 한계
1. **로그인 필요 영역 미커버**: 디스콰이엇·Twitter·페북 — 한국 디자이너 직접 발화 부족
2. **Reddit 차단**: user-agent 차단으로 r/UXDesign·r/Frontend 1차 발화 부재
3. **표본 편향**: 영어 매체 위주, 한국 발화 13건 중 9건이 프로모션성
4. **시점 편향**: 2026-04 한 달치 데이터 — 장기 트렌드 미검증

### 신뢰도 보강 추천
- 사용자 인터뷰 5~10명 (페르소나 4명 cover)
- ProductHunt comment dump (로그인 없이 가능) — Stitch + Claude Design launch
- HN 토론 fetch (already partial)
- 6개월 후 재분석 (트렌드 안정화)
