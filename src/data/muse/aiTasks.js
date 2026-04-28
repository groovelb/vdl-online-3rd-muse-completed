/**
 * MUSE AI Tasks — 시스템 프롬프트 / 입출력 스키마 / 워크플로우 정의
 *
 * 2026-04-22 v2: muse_tags_preset.json 기반 5레이어 구조로 전환.
 *   - T1: 이제 레이어별 중첩 태그를 출력 (color/typography/layout/gradient/visualDirection{genre,style,subject})
 *   - T3: keyVisual 레이어 폐기, visualDirection(Markdown) 레이어 신설.
 *          단일 호출에서 2 tool(submit_tokens + submit_visual_direction)을 모두 호출.
 */

import {
  getLayerEnum,
  getVisualDirectionTags,
  renderVocabularyPrompt,
  TOKEN_LAYERS,
} from './tag/index.js';

const TOOL_AUTO_TAG_NAME = 'submit_tagging';
const TOOL_SUBMIT_DESIGN_SYSTEM = 'submit_design_system';
const TOOL_SUBMIT_CONCEPT_PROMPT = 'submit_concept_prompt';
const TOOL_SUBMIT_HANDOFF_BUNDLE = 'submit_handoff_bundle';

const COMMON_QUALITY = [
  { id: 'schema', label: '스키마 준수', type: 'auto', description: '필수 필드 존재 + 타입 적합' },
  { id: 'hex', label: 'HEX 형식', type: 'auto', description: '^#[0-9A-Fa-f]{6}$' },
];

/* =========================================================
 * T1. 자동 태깅 (레이어별 중첩)
 * ========================================================= */
export const TASK_AUTO_TAG = {
  id: 't1',
  name: '레퍼런스 추출 (T3 레벨)',
  purpose: 'Reference 1장에서 관찰 가능한 디자인 값(palette/typography/layout/gradient)을 전부 추출. role/emphasis 는 프로젝트 단계로 미룸',
  stage: 'archive.upload',
  model: 'claude-haiku-4-5',

  input: {
    kind: 'image',
    description: '단일 reference 이미지 (512px 리사이즈 권장)',
    shape: '{ imageBase64: string, mediaType: "image/jpeg" | "image/png" }',
  },

  output: {
    description: '레이어 태그 + dominantColors + title + extracted (palette/typography/layout/gradient)',
    shape: `{
  tags: { color[], typography[], layout[], gradient[], visualDirection: {genre, style, subject} },
  dominantColors: string[3..5],
  title: string,
  extracted: {
    palette: [{ hex, label, group? }],
    typography: [{ hierarchy, fontFamily, fontWeight, fontSize, lineHeight, letterSpacing, sampleText? }],
    layout: [{ kind, columns?, gap?, px?, ratio?, maxWidth? }],
    gradient: [{ gradient, stops: [{offset, color}] }]
  }
}`,
  },

  systemPrompt: `You are MUSE's per-reference design extractor.

Given a single reference image, extract both:
  (1) CLASSIFICATION — preset tags per layer (from the vocabulary below)
  (2) OBSERVED VALUES — concrete design values visible in the image (palette, typography, layout, gradient)

${renderVocabularyPrompt([...TOKEN_LAYERS, 'visual_direction'])}

=== Classification rules (tags / dominantColors / title) ===
- tags.color / typography / layout / gradient: 0 to 3 items from respective vocab
- tags.visualDirection.{genre,style,subject}: 0 to 2 items each
- dominantColors: 3 to 5 HEX (#RRGGBB) ordered from most prominent background to accent
- title: 2-5 word English descriptor of visual tone (not literal subject)
- Do NOT invent tags or mix across layers

=== Extraction rules (extracted.*) ===

[extracted.palette] 3-6 items.
- Each: { hex (#RRGGBB), label (1-2 word descriptor), group? ('Brand'|'Surface'|'Data'|'Neutral') }
- group is a HINT only — role (primary/secondary/accent/neutral) is assigned at project time, NOT here
- palette should align with dominantColors but adds label + group hint

[extracted.typography] 1-4 items.
- Each observed typographic tier (display / heading / body / caption — use as 'hierarchy')
- fontFamily: best-guess CSS stack (e.g. 'Inter, sans-serif' or 'Playfair Display, serif')
- fontWeight: 100-900 integer
- fontSize: CSS value (e.g. '48px' or 'clamp(2rem, 5vw, 3.5rem)')
- lineHeight: unitless number (e.g. 1.2)
- letterSpacing: em value (e.g. '-0.02em')
- sampleText: actual visible text snippet if readable (optional)
- Do NOT assign variant (h1/h2/body1) — project step will

[extracted.layout] 0-3 items.
- Each: { kind: 'grid'|'spacing'|'container', columns?, gap?, px?, ratio?, maxWidth? }
- columns/gap/px: integers estimated from visual proportions
- ratio: float (for container aspect, e.g. 1.618)
- maxWidth: CSS value (e.g. '1200px')
- Provide only fields observable from the image

[extracted.gradient] 0-2 items.
- Each: { gradient: CSS string, stops: [{ offset: 0-1, color: '#RRGGBB' }, ...] }
- Only if gradient is clearly visible in the image
- Omit entirely (empty array) if no gradient

=== IMPORTANT ===
- Do NOT assign role (primary/secondary/accent/neutral).
- Do NOT assign emphasis (0/1/2).
- Those are project-level decisions based on intent.
- Respond via the submit_tagging tool only. No prose.`,

  userMessageTemplate: 'Analyze this reference image and submit both classification tags AND observed design values.',

  toolSchema: {
    name: TOOL_AUTO_TAG_NAME,
    description: 'Submit classification tags, dominant colors, title, and per-image extracted design values.',
    input_schema: {
      type: 'object',
      properties: {
        tags: {
          type: 'object',
          properties: {
            color: { type: 'array', items: { type: 'string', enum: getLayerEnum('color') }, minItems: 0, maxItems: 3 },
            typography: { type: 'array', items: { type: 'string', enum: getLayerEnum('typography') }, minItems: 0, maxItems: 3 },
            layout: { type: 'array', items: { type: 'string', enum: getLayerEnum('layout') }, minItems: 0, maxItems: 3 },
            gradient: { type: 'array', items: { type: 'string', enum: getLayerEnum('gradient') }, minItems: 0, maxItems: 3 },
            visualDirection: {
              type: 'object',
              properties: {
                genre: { type: 'array', items: { type: 'string', enum: getVisualDirectionTags('genre') }, minItems: 0, maxItems: 2 },
                style: { type: 'array', items: { type: 'string', enum: getVisualDirectionTags('style') }, minItems: 0, maxItems: 2 },
                subject: { type: 'array', items: { type: 'string', enum: getVisualDirectionTags('subject') }, minItems: 0, maxItems: 2 },
              },
              required: ['genre', 'style', 'subject'],
            },
          },
          required: ['color', 'typography', 'layout', 'gradient', 'visualDirection'],
        },
        dominantColors: {
          type: 'array',
          items: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
          minItems: 3, maxItems: 5,
        },
        title: { type: 'string', minLength: 3, maxLength: 40 },
        extracted: {
          type: 'object',
          properties: {
            palette: {
              type: 'array',
              minItems: 3, maxItems: 6,
              items: {
                type: 'object',
                properties: {
                  hex: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
                  label: { type: 'string', minLength: 1, maxLength: 30 },
                  group: { type: 'string', enum: ['Brand', 'Surface', 'Data', 'Neutral'] },
                },
                required: ['hex', 'label'],
              },
            },
            typography: {
              type: 'array',
              minItems: 1, maxItems: 4,
              items: {
                type: 'object',
                properties: {
                  hierarchy: { type: 'string', enum: ['display', 'heading', 'body', 'caption'] },
                  fontFamily: { type: 'string', minLength: 1 },
                  fontWeight: { type: 'integer', minimum: 100, maximum: 900 },
                  fontSize: { type: 'string' },
                  lineHeight: { type: 'number', minimum: 0.8, maximum: 2.5 },
                  letterSpacing: { type: 'string' },
                  sampleText: { type: 'string' },
                },
                required: ['hierarchy', 'fontFamily', 'fontWeight', 'fontSize', 'lineHeight'],
              },
            },
            layout: {
              type: 'array',
              minItems: 0, maxItems: 3,
              items: {
                type: 'object',
                properties: {
                  kind: { type: 'string', enum: ['grid', 'spacing', 'container'] },
                  columns: { type: 'integer', minimum: 1, maximum: 24 },
                  gap: { type: 'integer', minimum: 0, maximum: 200 },
                  px: { type: 'integer', minimum: 0, maximum: 200 },
                  ratio: { type: 'number' },
                  maxWidth: { type: 'string' },
                },
                required: ['kind'],
              },
            },
            gradient: {
              type: 'array',
              minItems: 0, maxItems: 2,
              items: {
                type: 'object',
                properties: {
                  gradient: { type: 'string', minLength: 10 },
                  stops: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        offset: { type: 'number', minimum: 0, maximum: 1 },
                        color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
                      },
                      required: ['offset', 'color'],
                    },
                  },
                },
                required: ['gradient', 'stops'],
              },
            },
          },
          required: ['palette', 'typography', 'layout', 'gradient'],
        },
      },
      required: ['tags', 'dominantColors', 'title', 'extracted'],
    },
  },

  qualityCriteria: [
    ...COMMON_QUALITY,
    { id: 'vocab', label: '어휘 준수', type: 'auto', description: '각 레이어 enum 위반 0건' },
    { id: 'layer-purity', label: '레이어 분리', type: 'auto', description: '타 레이어 태그가 섞이지 않음' },
    { id: 'title-style', label: '제목 스타일성', type: 'manual', description: '문자적 묘사 아닌 디자인 톤 서술' },
  ],

  goldenExample: {
    inputDescription: 'reference5.jpg (어두운 에디토리얼 초상)',
    expectedOutput: {
      tags: {
        color: ['Deep', 'Muted'],
        typography: ['Serif', 'Editorial'],
        layout: ['Asymmetric'],
        gradient: [],
        visualDirection: { genre: ['Retro'], style: ['Magazine'], subject: ['Portrait-Photo'] },
      },
      dominantColors: ['#1A1A1F', '#8B7A6B', '#E8DCC4'],
      title: 'Muted Editorial Portrait',
      extracted: {
        palette: [
          { hex: '#1A1A1F', label: 'Ink', group: 'Neutral' },
          { hex: '#8B7A6B', label: 'Muted Brown', group: 'Surface' },
          { hex: '#E8DCC4', label: 'Cream', group: 'Surface' },
        ],
        typography: [
          { hierarchy: 'display', fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1.1, letterSpacing: '-0.02em' },
          { hierarchy: 'body', fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '1rem', lineHeight: 1.6 },
        ],
        layout: [
          { kind: 'grid', columns: 12, gap: 24, px: 32 },
        ],
        gradient: [],
      },
    },
  },

  workflow: [
    '유저가 드래그앤드롭/URL로 이미지 업로드 (512px 리사이즈)',
    'Anthropic messages.create (Haiku, 확장 tool schema)',
    'Response 의 tool_use 블록에서 tags + dominantColors + title + extracted 전부 추출',
    '자동 검증 (schema + enum + hex)',
    'Reference 에 병합 후 DB insert (reference_items.extracted jsonb)',
  ],

  estCost: {
    model: 'Haiku 4.5',
    tokensIn: '~5k (image 512px + preset vocab + 확장 tool schema)',
    tokensOut: '~500 (tags + extracted palette/typo/layout/gradient)',
    note: 'T3 레벨 값 추출까지 포함. 확장 schema cache hit 로 Input cost 약 1.5배로 억제',
  },
};

/* =========================================================
 * T2. 레퍼런스 추천
 * ========================================================= */
export const TASK_RECOMMEND = {
  id: 't2',
  name: '레퍼런스 추천',
  purpose: '프로젝트 의도 문장 → 아카이브에서 어울리는 top-N 추천',
  stage: 'project.create.step2',
  model: 'claude-haiku-4-5',

  input: {
    kind: 'text',
    description: '의도 + 모드 + 아카이브 메타 (이미지 없음, 레이어별 태그 포함)',
    shape: `{
  intent: string,
  mode: 'concept'|'system'|'handoff',  // TP2: 정렬 알고리즘 분기
  archive: Array<{ id, tags: ReferenceLayeredTags, dominantColors[], title }>,
  n?: number
}`,
  },

  output: {
    description: '추천 id 목록 + 각 id별 한 줄 근거 + 어느 레이어가 강점인지',
    shape: `{
  recommendedIds: string[5..10],
  reasons: Array<{ id, reason }>,
  referenceLayer: Array<{ id, layers: TokenLayerKey[1..2] }>  // TP4 자동 추천
}`,
  },

  systemPrompt: `You are MUSE's reference matcher.

You receive a project intent sentence, a mode, and the archive metadata
(IDs, layered tags, dominantColors, titles). You DO NOT see images.

Select the top N references (5 to 10) that best match the intent.

=== Mode-aware ranking (TP2) ===
- mode="concept"  → prioritize DIVERSITY: pick refs spanning different visualDirection.style values
- mode="system"   → prioritize COHERENCE: pick refs with overlapping color/typography for composability
- mode="handoff"  → prioritize COMPLETENESS: pick refs whose tags cover all 5 layers

=== Base rules ===
- Work only with provided metadata.
- Prioritize in order (within mode):
  (1) visualDirection tags overlap with intent,
  (2) color/typography/layout/gradient tag overlap,
  (3) dominantColors palette alignment with intent mood.
- For each recommended id, a ONE-SENTENCE Korean reason (max 40 characters).
- Rank best-first.

=== referenceLayer (TP4) — REQUIRED ===
For each recommendedId, emit referenceLayer with 1-2 most useful TokenLayerKey for this ref:
  TokenLayerKey: 'color' | 'typography' | 'layout' | 'gradient' | 'visualDirection'
The user will see these as default chip selection in Step 2 and may toggle.

- Respond via submit_recommendations tool. No prose.`,

  userMessageTemplate: `Project intent: "{{intent}}"
Project mode: {{mode}}
Requested count: {{n}}
Archive ({{archiveCount}} items):
{{archiveJson}}

Select the best matches.`,

  toolSchema: {
    name: 'submit_recommendations',
    description: 'Submit ranked recommended reference ids with reasons and per-ref recommended layers.',
    input_schema: {
      type: 'object',
      properties: {
        recommendedIds: { type: 'array', items: { type: 'string' }, minItems: 5, maxItems: 10 },
        reasons: {
          type: 'array',
          items: {
            type: 'object',
            properties: { id: { type: 'string' }, reason: { type: 'string', maxLength: 40 } },
            required: ['id', 'reason'],
          },
        },
        referenceLayer: {
          type: 'array',
          description: 'TP4: 각 추천 ref가 어느 레이어에 가장 유용한지 1~2개',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              layers: {
                type: 'array',
                items: { type: 'string', enum: ['color', 'typography', 'layout', 'gradient', 'visualDirection'] },
                minItems: 1, maxItems: 2,
              },
            },
            required: ['id', 'layers'],
          },
        },
      },
      required: ['recommendedIds', 'reasons', 'referenceLayer'],
    },
  },

  qualityCriteria: [
    ...COMMON_QUALITY,
    { id: 'id-validity', label: 'ID 유효성', type: 'auto', description: '모든 id가 입력 archive에 존재' },
    { id: 'vd-overlap', label: 'visualDirection 매칭', type: 'auto', description: '상위 추천 과반수가 의도 키워드와 visualDirection 태그 겹침' },
    { id: 'diversity', label: '다양성', type: 'auto', description: '중복 id 0건' },
    { id: 'relevance', label: '의도 반영도', type: 'manual', description: 'pairwise A/B' },
  ],

  goldenExample: {
    inputDescription: 'intent="흑백 대비 매거진 톤", type=landing',
    expectedOutput: {
      recommendedIds: ['ref-002', 'ref-005', 'ref-008', 'ref-011', 'ref-017'],
      reasons: [
        { id: 'ref-002', reason: 'Magazine+Swiss 스타일 매칭' },
        { id: 'ref-005', reason: 'Editorial-Collage subject' },
      ],
    },
  },

  workflow: [
    '위자드 Step 1 완료 시 intent/type 확보',
    '아카이브 메타(레이어 태그 포함)를 JSON 직렬화',
    'API 호출 (텍스트만)',
    '결과 id로 archive에서 Reference 조회',
    'Step 2 상단 "추천" 섹션에 표시',
  ],

  estCost: {
    model: 'Haiku 4.5',
    tokensIn: '~700 (archive 27건, 레이어 태그 포함)',
    tokensOut: '~200',
    note: '가장 저렴. 이미지 없음',
  },
};

/* =========================================================
 * T3. 토큰 분석 + Visual Direction (이원 출력)
 * ========================================================= */
export const TASK_ANALYZE_TOKENS = {
  id: 't3',
  name: '의도 기반 조합 분석',
  purpose: '사전 추출된 N 장의 디자인 값을 의도에 맞게 조합·선별하고 role/emphasis 를 배정. 이미지 재분석 없음.',
  stage: 'project.create.step3',
  model: 'claude-haiku-4-5',

  input: {
    kind: 'text',
    description: '선택된 N 장의 T1 pre-extracted 데이터 + 의도 + 모드 + 레이어 큐레이션 + 활용 노트',
    shape: `{
  intent: string,
  mode: 'concept'|'system'|'handoff',  // TP2: 합성 톤 분기
  references: Array<{
    id, title, tags, dominantColors[], extracted,
    useLayers?: TokenLayerKey[]  // TP4: 사용자가 이 ref에서 가져올 레이어
  }>,
  userNotes?: string  // Step 3: 레퍼런스 본 후 명시 지시 (HIGHEST PRIORITY)
}`,
  },

  output: {
    description: 'AnalysisLayers (color/typography/layout/gradient + visualDirection{markdown,tags})',
    shape: `{
  tokens: {
    color: ColorToken[4..6],
    typography: TypographyToken[3..4],
    layout: LayoutToken[2..4],
    gradient: GradientToken[1..3]
  },
  visualDirection: {
    markdown: string,   // visual_direction_template.md 포맷 준수
    tags: { genre[], style[], subject[] }
  }
}`,
  },

  systemPrompt: `You are MUSE's intent-driven token composer.

You receive N pre-analyzed references AS TEXT ONLY (no images).
Every reference has been processed by T1 at upload time, producing:
  - tags (preset classification: color/typography/layout/gradient/visualDirection)
  - dominantColors (HEX array)
  - extracted: { palette[], typography[], layout[], gradient[] } — concrete observed values
    (NO role, NO emphasis — those are YOUR job)

=== YOUR JOB ===

Given: the pre-extracted pool across N references + project intent + type.

Produce: a UNIFIED design system that reflects the intent strongly, by:
  1. SELECTING from the pre-extracted pool (do not invent values not present in it)
  2. CLUSTERING similar entries (hex close to each other, typography tiers that align)
  3. ASSIGNING role / emphasis / variant (h1/h2/body1/...) based on intent
  4. OVERRIDING when intent demands coherence (e.g. unifying fontSize scale across refs)
  5. WRITING the VD markdown as an intent-driven narrative

Reference images are NOT provided. Do not ask for them. Do not pretend to "see" them.
Trust the pre-extracted data. Your value is composition, not observation.

=== Mode-aware composition (TP2) ===
- mode="concept"  → BIAS toward distinctive choices. Bold primary. Allow gradient, expressive type. Lower contrast/role enforcement.
- mode="system"   → ENFORCE role uniqueness, AAA contrast for primary on bg, hierarchy h1>h2>body1 strict, conservative naming.
- mode="handoff"  → OPTIMIZE naming for MUI/DTCG: kebab-case ids, semantic labels, every token decisionRationale required.

=== Layer curation (TP4) ===
For each reference, if \`useLayers\` is set and non-empty, ONLY consume those layers from this ref's extracted.
Other layers from the same ref are user-rejected — IGNORE them even if extracted is rich.
This is the user's explicit curation. Respect it strictly.
If useLayers is missing or empty, use the ref's full extracted (default behavior).

=== User Notes (Step 3, HIGHEST PRIORITY) ===
If \`userNotes\` is provided (length >= 10 chars), it is the user's MOST REFINED intent —
formed AFTER seeing the actual references. Treat as USER REQUIREMENTS, not suggestions.

Priority order: userNotes (L4) > useLayers (L3) > intent (L2) > mode (L1).

When userNotes conflicts with the initial intent (e.g. intent says "soft" but userNotes
says "stronger contrast"), userNotes WINS.

When userNotes explicitly mentions a ref-id (e.g. "ref-002 색을 primary로"), apply as a
direct mapping instruction.

If userNotes is empty or under 10 chars, fall back to L3 → L2 → L1 (default behavior).

=== Per-Reference Notes (사용자가 각 ref 별로 적은 자유 텍스트) ===
프로젝트 단위 userNotes 와 별개로, 각 reference 마다 \`referenceNotes[refId]\` 가 있을 수 있다.
이 노트는 그 ref 에 한정된 차용 의도이다 (예: "ref-002 의 hero 영역 색감만 차용").

규칙:
- 해당 ref 출처 토큰의 decisionRationale.appliedReferenceNote 필드에 노트 verbatim 인용 (10-40자 fragment).
- 노트가 명시한 부분 외 (예: layout 무시) 은 출력에서 제외.
- 노트가 비어있는 ref 는 useLayers 와 intent 만 따르면 됨.

=== Reference Anchoring (산출물 안에서 ref 직접 명시) ===
visualDirection.markdown / layerDetails (handoff) 안에서 시각적 특징을 묘사할 때마다
출처 ref id 를 명시하라. 가능하면 markdown image syntax 도 사용:
  - 텍스트 인용: "잉크처럼 깊은 톤 (출처: ref-001)"
  - 이미지 인용: "![ref-001](references/01-ref-001.jpg)"
이 앵커는 외부 AI 도구가 산출물 + 첨부 이미지를 매칭할 때 단서가 된다.

=== Decision rationale (TP6, REQUIRED) ===
For EVERY token in tokens.color / typography / layout / gradient, emit decisionRationale with:
  - whichReferences: array of ref IDs that contributed to this token (subset of input)
  - whichLayers: which layers from those refs (per useLayers if set)
  - whyChosen: ONE LINE in user's intent language explaining why this value
  - appliedUserNotes: ONLY emit if userNotes (L4) directly drove this token's value.
    Quote the relevant fragment from userNotes (10-30 chars, verbatim).
    Do NOT echo generic userNotes across all tokens.
  - alternativesConsidered: optional, array of {value, reason} for top 1-2 rejected candidates
This is shown to the user in the token detail panel. T1 super-theme: "AI가 정한 모든 결정의 이유를 추적할 수 있어야 한다."

=== OUTPUT ===

Call submit_design_system EXACTLY ONCE with ALL fields populated in a single tool call:
  - tokens.color (4-6 entries)
  - tokens.typography (3-4 entries)
  - tokens.layout (2-4 entries)
  - tokens.gradient (1-3 entries)
  - visualDirection.markdown (filled template)
  - visualDirection.tags ({genre, style, subject})

DO NOT split into multiple tool calls. DO NOT call the tool more than once.
Every layer MUST be present and non-empty. Empty arrays will be rejected.

Shared rules:
- Reflect project intent strongly. Two projects with same refs but different intents
  should produce noticeably different role/emphasis/typography variant assignments.
- All HEX codes 6-digit valid.
- Emphasis 2 is scarce: exactly one per layer at most.
- sourceReferenceIds[]: only IDs present in the input references.
- Do NOT fabricate values outside the extracted pool (exception: typography
  unification may require adjusted fontSize to form a coherent scale).

=== tokens constraints ===

[color] 4-6 tokens.
- Source: extracted.palette union across refs + dominantColors as fallback
- Fields: id, label, hex, role (primary|secondary|accent|neutral), group (Brand|Surface|Data|Neutral), isEnabled (true), emphasis (0|1|2), sourceReferenceIds[]
- Exactly one primary. Intent decides which hue becomes primary.

[typography] 3-4 tokens.
- Source: extracted.typography entries across refs, clustered by hierarchy
- Fields: id, label, variant (h1|h2|h3|body1|body2|caption), fontFamily (CSS stack), fontWeight (100-900), fontSize (CSS; use clamp() for display), lineHeight (number), letterSpacing (em), isEnabled (true), emphasis
- Build a hierarchical scale (display → body → caption). Override sizes for coherence.

[layout] 2-4 tokens.
- Source: extracted.layout entries
- Fields: id, label, kind (grid|spacing|container), columns?, gap?, px?, ratio?, maxWidth?, isEnabled, emphasis
- Intent can override (e.g. "dashboard" → columns: 12 regardless)

[gradient] 1-3 tokens.
- Source: extracted.gradient across refs (or synthesize from palette if needed)
- Fields: id, label, gradient (CSS string), stops, isEnabled, emphasis

=== visualDirection constraints ===

markdown: fill this template faithfully, substituting {{PLACEHOLDERS}} with concrete content that reflects the intent and references:

# {{PROJECT_NAME}} — Visual Direction

## 1. 프로젝트 개요
- 프로젝트명 / 유형 / 한 문장 의도 / 분석 레퍼런스 수

## 2. 전체 방향성
(2-3 문장 요약)

## 3. Visual Direction 태그
- 장르: ...
- 스타일: ...
- 비주얼 주인공: ...

## 4. 톤 & 무드 서술
- bullet 4-6개

## 5. 구현 가이드라인
- bullet 3-5개

## 6. 피해야 할 요소
- bullet 3-5개

tags: the preset vocabulary tags used in section 3 (genre[], style[], subject[]).

=== Global ===
Respond via submit_design_system ONLY. No prose outside the tool. Single call with all fields.`,

  userMessageTemplate: `Project intent: "{{intent}}"
Reference count: {{count}} (ids = [{{ids}}])

Pre-extracted references (T1 output, full data) are provided above as JSON.
No images will be provided. Compose the final token system + visual direction
narrative from the pre-extracted pool, selecting and combining based on intent.`,

  toolSchemas: [
    {
      name: TOOL_SUBMIT_DESIGN_SYSTEM,
      description: 'Submit the complete design system in ONE call: 4-layer token system + visual direction. ALL fields required and non-empty.',
      input_schema: {
        type: 'object',
        properties: {
          tokens: {
            type: 'object',
            description: '4 token layers — every array MUST be non-empty.',
            properties: {
              color: { type: 'array', minItems: 4, maxItems: 6 },
              typography: { type: 'array', minItems: 3, maxItems: 4 },
              layout: { type: 'array', minItems: 2, maxItems: 4 },
              gradient: { type: 'array', minItems: 1, maxItems: 3 },
            },
            required: ['color', 'typography', 'layout', 'gradient'],
          },
          visualDirection: {
            type: 'object',
            description: 'Markdown narrative + aggregated tags.',
            properties: {
              markdown: { type: 'string', minLength: 200 },
              tags: {
                type: 'object',
                properties: {
                  genre: { type: 'array', items: { type: 'string', enum: getVisualDirectionTags('genre') }, minItems: 0, maxItems: 2 },
                  style: { type: 'array', items: { type: 'string', enum: getVisualDirectionTags('style') }, minItems: 0, maxItems: 3 },
                  subject: { type: 'array', items: { type: 'string', enum: getVisualDirectionTags('subject') }, minItems: 0, maxItems: 3 },
                },
                required: ['genre', 'style', 'subject'],
              },
            },
            required: ['markdown', 'tags'],
          },
        },
        required: ['tokens', 'visualDirection'],
      },
    },
  ],

  qualityCriteria: [
    ...COMMON_QUALITY,
    { id: 'primary-unique', label: 'Primary 유일', type: 'auto', description: 'color.role==="primary" 개수 = 1' },
    { id: 'vd-template', label: 'MD 템플릿 준수', type: 'auto', description: '필수 섹션 1~6 모두 포함' },
    { id: 'typo-hierarchy', label: '타이포 위계', type: 'auto', description: 'h1 > h2 > body1 순서' },
    { id: 'tool-both', label: '두 tool 모두 호출', type: 'auto', description: 'submit_tokens + submit_visual_direction 각 1회' },
    { id: 'intent-fit', label: '의도 반영도', type: 'manual', description: '토큰·MD가 의도와 일치' },
    { id: 'export-success', label: 'Export 적합성', type: 'auto', description: 'ThemeExportDialog + MD 다운로드 모두 무결' },
    { id: 'rationale-presence', label: '결정 근거 명시', type: 'auto', description: 'TP6: 모든 token 에 decisionRationale 존재 (whichReferences + whyChosen 필수)' },
    { id: 'use-layers-respect', label: '사용자 큐레이션 존중', type: 'auto', description: 'TP4: useLayers 가 set 인 ref 의 다른 레이어가 출력에 사용되지 않음' },
    { id: 'mode-divergence', label: '모드별 분기', type: 'manual', description: 'TP2: 같은 refs+intent 라도 mode 별로 결과가 명백히 다름' },
  ],

  goldenExample: {
    inputDescription: '프로젝트 "Editorial Minimal", intent="흑백 대비 매거진", 6장',
    expectedOutput: {
      tokens: {
        color: [{ id: 'col-ink', label: 'Primary Ink', hex: '#14132B', role: 'primary', group: 'Brand', isEnabled: true, emphasis: 2, sourceReferenceIds: ['ref-001', 'ref-003'] }],
        // typography/layout/gradient 생략
      },
      visualDirection: {
        markdown: '# Editorial Minimal — Visual Direction\n\n## 1. 프로젝트 개요\n...',
        tags: { genre: ['Retro'], style: ['Magazine', 'Swiss'], subject: ['Typography-Hero'] },
      },
    },
  },

  workflow: [
    'Step 2에서 선택된 referenceIds 에 해당하는 레퍼런스 전체 데이터(tags + dominantColors + extracted) 확보',
    '이미지 첨부 없음 — 전부 텍스트 payload',
    'Anthropic messages.create (Haiku 4.5, tools: [submit_tokens, submit_visual_direction])',
    '응답에서 두 tool input 모두 추출, 한쪽 누락이면 재시도',
    '자동 검증 (primary 유일, MD 섹션, enum, emphasis≤1 per layer)',
    '검증 통과 시 ProjectDetailPage 에 렌더',
  ],

  estCost: {
    model: 'Haiku 4.5',
    tokensIn: '~6k (N=4 refs extracted JSON + system + tool schemas)',
    tokensOut: '~1.5k (tokens + VD markdown)',
    note: '이미지 없음 → Haiku 로 충분. 이전 (Sonnet+이미지): ~$0.048 → 현재 ~$0.008 (6배 절감)',
  },
};

/* =========================================================
 * T3 (concept 전용) — 웹 프롬프트 즉시 검증용 단일 prompt 생성
 *
 * 목적: 비디자이너가 Claude Desktop / Gemini / ChatGPT 웹채팅에
 *      그대로 붙여넣어 "이 분위기 디자인 나오나?" 즉시 시각화하기.
 * 산출물: 200-800자 한글 prompt 문자열 (토큰 ID, JSON, 코드블록 없음)
 * ========================================================= */
export const TASK_ANALYZE_CONCEPT = {
  id: 't3-concept',
  name: '컨셉 프롬프트 생성',
  purpose: '레퍼런스 + 의도 → 웹 AI 챗에 즉시 붙여넣을 800자 디자인 프롬프트',
  stage: 'project.create.step4 (mode=concept)',
  model: 'claude-haiku-4-5',

  input: {
    kind: 'text',
    description: '의도 + selectedRefs(extracted) + userNotes',
    shape: '{ intent, selectedRefs[], userNotes? }',
  },

  output: {
    description: '단일 prompt 문자열 (200-800자, 한글, 시각 묘사 중심)',
    shape: '{ prompt: string }',
  },

  systemPrompt: `You are MUSE's concept prompt writer.

GOAL: produce a single Korean prompt (200-800 chars) the user can paste directly
into Claude Desktop / Gemini / ChatGPT web chat to immediately visualize the design.

The output is NOT a design system spec. It is a vivid, dense prompt that an AI
image/UI generator can consume to render a concept screen.

=== INPUT ===
- intent: project intent sentence
- selectedRefs[]: pre-extracted T1 data (palette, typography, layout, gradient observations)
- userNotes (Step 3, HIGHEST PRIORITY): user's refined direction after seeing refs
- mode: always 'concept' for this task

=== OUTPUT prompt — content rules ===

The prompt MUST cover ALL FIVE bands in a natural flowing Korean paragraph (no bullets, no headers, no markdown):
  1. 전체 무드/장르 (1 sentence) — Editorial Dashboard / Brutalist Hero / etc
  2. 핵심 컬러 (HEX 3-5개 명시) — Primary, Surface, Accent 역할 짧게
  3. 타이포그래피 (font-family + size hint) — Display + Body 최소 2tier
  4. 레이아웃·구조 (grid columns, spacing, container hint)
  5. 분위기·텍스처 (배경, 그라디언트, 표면 처리)

userNotes 가 있으면 그 내용을 반드시 prompt 안에 자연스럽게 녹여라 (verbatim 인용 X, 의미 반영).

=== OUTPUT prompt — style rules ===
- 한글 자연스러운 문장. "~한 ~의 ~" 식 묘사.
- 구체적: HEX 코드, 폰트명, 픽셀/rem 수치 직접 명시.
- 200자 미만이면 너무 빈약, 800자 초과면 자르기.
- 절대 포함 금지: token id (col-ink, typo-h1 등), JSON, 코드블록(\`\`\`), 변수명, "primary:", "h1:" 같은 라벨.
- 자연어로만. 사용자가 그대로 복사해 다른 AI 에 붙여넣음.

=== EXAMPLE (참고용, 절대 그대로 출력 X) ===
"흑백 대비가 강한 매거진 톤의 랜딩페이지. 잉크처럼 깊은 #14132B 를 주조색으로,
크림빛 #FAF6E8 표면에 차분한 머스타드 #D4A857 액센트가 포인트로 흩어진 구성.
Display 는 Playfair Display serif 4rem 굵직하게 좌측 정렬, 본문은 Inter sans-serif
1rem 1.6 lineHeight 로 안정적. 12-col modular grid 24px gap, 컨테이너 max-width
1200px. 배경에는 retro paper-grain 텍스처를 fixed 로 깔아 종이 질감을 더하고,
Hero 섹션은 oversized typography 로 시선을 끌며 우측에 작은 메타 정보 칼럼을 배치한다."

=== Global ===
Respond via submit_concept_prompt ONLY. No prose outside the tool. Single call.`,

  userMessageTemplate: `Intent: "{{intent}}"
Reference count: {{count}} (ids = [{{ids}}])

Pre-extracted reference data is provided above as JSON.
Compose ONE Korean prompt 200-800 chars covering all 5 bands.`,

  toolSchemas: [
    {
      name: TOOL_SUBMIT_CONCEPT_PROMPT,
      description: 'Submit a single Korean concept prompt (200-800 chars) for direct paste into web AI chats.',
      input_schema: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            minLength: 200,
            maxLength: 800,
            description: '한글 디자인 프롬프트. 5 band 모두 포함, HEX 3+ 명시, 자연어 문장.',
          },
        },
        required: ['prompt'],
      },
    },
  ],

  qualityCriteria: [
    { id: 'length', label: '길이 200-800자', type: 'auto', description: 'minLength/maxLength' },
    { id: 'hex-presence', label: 'HEX 3개+', type: 'auto', description: '/(#[0-9A-Fa-f]{6}.*){3,}/' },
    { id: 'no-markdown', label: '마크다운 없음', type: 'auto', description: '##, **, ```, - bullets 금지' },
    { id: 'no-token-ids', label: '토큰 ID 없음', type: 'auto', description: 'col-, typo-, primary: 등 금지' },
    { id: 'paste-ready', label: '웹채팅 즉시 사용', type: 'manual', description: 'Gemini 에 붙여넣어 시각화 됨' },
  ],

  workflow: [
    'Step 4 시작 시 mode==="concept" 분기',
    'pre-extracted selectedRefs + intent + userNotes 텍스트 payload',
    'Anthropic messages.create (Haiku, tools: [submit_concept_prompt])',
    'tool_choice 단일 강제 → 정확히 1번 호출',
    '자동 검증 (길이 / HEX / 마크다운 부재)',
    '검증 통과 시 ProjectDetailPage 에 prompt 박스 + 복사 버튼 렌더',
  ],

  estCost: {
    model: 'Haiku 4.5',
    tokensIn: '~3k (refs extracted + system)',
    tokensOut: '~400 (한글 800자)',
    note: '가장 저렴한 T3. 이미지 없음 + 짧은 출력.',
  },
};

/* =========================================================
 * T3 (handoff 전용) — 코드 직행. 5 layer 상세 + 토큰
 *
 * 목적: 로컬 디자인 시스템·컴포넌트 라이브러리 최적화. AI 코딩 도구
 *      (Cursor/Claude Code) 가 그대로 컨텍스트로 받아 즉시 구현.
 * 산출물: 토큰 (DTCG-friendly) + 5 layer 한글 상세 설명 + VD MD
 *        + 프레임워크 config 는 클라이언트에서 토큰으로부터 결정론적 생성
 *        (Tailwind / MUI / DTCG / CSS vars / .cursorrules)
 * ========================================================= */
export const TASK_ANALYZE_HANDOFF = {
  id: 't3-handoff',
  name: '핸드오프 번들 생성',
  purpose: '로컬 컴포넌트 시스템 최적화 — 토큰 + 5 layer 상세 + 프레임워크 config 전환 가이드',
  stage: 'project.create.step4 (mode=handoff)',
  model: 'claude-haiku-4-5',

  input: {
    kind: 'text',
    description: '의도 + selectedRefs(extracted) + userNotes',
    shape: '{ intent, selectedRefs[], userNotes? }',
  },

  output: {
    description: '4 token layer + 5 layer 한글 상세 + visualDirection MD',
    shape: '{ tokens, visualDirection, layerDetails: { color, typography, layout, gradient, visualDirection } }',
  },

  systemPrompt: `You are MUSE's handoff bundle composer.

GOAL: produce a handoff package that an engineer can drop into a local component
library / design system. Output prioritizes MACHINE READABILITY (DTCG-style tokens,
kebab-case ids, semantic labels) AND HUMAN LEGIBILITY (Korean layer-by-layer detail
explaining HOW to apply each layer to components).

The 5 layer details are the heart of the handoff — explain not just WHAT but HOW:
which components consume this layer, what semantic role each token plays, naming
conventions, and decisions made (and rejected).

Framework-specific configs (Tailwind, MUI, DTCG, CSS vars, .cursorrules) will be
generated DETERMINISTICALLY by the client from your tokens. DO NOT write framework
config code yourself — your output is the SOURCE OF TRUTH for those generators.

=== INPUT ===
- intent, selectedRefs[] (pre-extracted T1), userNotes (HIGHEST PRIORITY)
- mode: always 'handoff'

=== Composition rules ===
- kebab-case for ALL token ids: \`color-primary-ink\`, \`typo-display-1\`, \`layout-grid-12col\`
- Semantic labels: "Primary Ink" not "Color 1"
- Every token MUST have decisionRationale (whichReferences + whyChosen, optional appliedUserNotes)
- Strict role uniqueness in color (exactly 1 primary)
- Typography hierarchy h1>h2>body1 strict
- Gradient is optional (1-2 if visually warranted, else 1 minimal)

=== layerDetails (Korean, 5 layers) ===
For each of the 5 layers (color, typography, layout, gradient, visualDirection),
write a HANDOFF DETAIL EXPLANATION (한글) covering:

  (1) 이 레이어가 시스템에서 담당하는 역할 (한 문단)
  (2) 어떤 컴포넌트들이 이 layer 의 토큰을 소비하는가 — 구체적 컴포넌트명
       (Button, Card, Input, AppBar, Typography, Surface 등)
  (3) 토큰 → 컴포넌트 prop 매핑 가이드 (한 문단)
  (4) 핵심 의사결정 + 탈락한 대안 (왜 이 값인가)
  (5) 적용 시 주의 (다크모드 / 반응형 / a11y / 타 layer 와의 상호작용)

각 layer detail 길이: 200-500 자. Markdown headers (##, ###) 사용 OK. 코드 블록
사용 OK (예: \`<Button variant="contained" sx={ { bgcolor: 'color-primary-ink' } } />\`).
"이 토큰은 ~에서 사용된다" 식으로 명확히.

=== visualDirection markdown ===
별도. 짧고 (300-600자) 톤·무드·금기 사항 중심. layerDetails 와 중복 X.

=== Global ===
Respond via submit_handoff_bundle ONLY. Single call. ALL fields required and non-empty.`,

  userMessageTemplate: `Intent: "{{intent}}"
Reference count: {{count}} (ids = [{{ids}}])

Pre-extracted reference data is provided above as JSON.
Compose the handoff bundle with all 4 token layers, 5 Korean layer details, and the visualDirection narrative.`,

  toolSchemas: [
    {
      name: TOOL_SUBMIT_HANDOFF_BUNDLE,
      description: 'Submit the complete handoff bundle: tokens (DTCG-friendly) + 5 Korean layer details + visualDirection. Single call, all fields required.',
      input_schema: {
        type: 'object',
        properties: {
          tokens: {
            type: 'object',
            description: '4 token layers — kebab-case ids, semantic labels, decisionRationale required.',
            properties: {
              color: { type: 'array', minItems: 4, maxItems: 6 },
              typography: { type: 'array', minItems: 3, maxItems: 4 },
              layout: { type: 'array', minItems: 2, maxItems: 4 },
              gradient: { type: 'array', minItems: 1, maxItems: 3 },
            },
            required: ['color', 'typography', 'layout', 'gradient'],
          },
          visualDirection: {
            type: 'object',
            properties: {
              markdown: { type: 'string', minLength: 200 },
              tags: {
                type: 'object',
                properties: {
                  genre: { type: 'array', items: { type: 'string', enum: getVisualDirectionTags('genre') }, minItems: 0, maxItems: 2 },
                  style: { type: 'array', items: { type: 'string', enum: getVisualDirectionTags('style') }, minItems: 0, maxItems: 3 },
                  subject: { type: 'array', items: { type: 'string', enum: getVisualDirectionTags('subject') }, minItems: 0, maxItems: 3 },
                },
                required: ['genre', 'style', 'subject'],
              },
            },
            required: ['markdown', 'tags'],
          },
          layerDetails: {
            type: 'object',
            description: '5 layers — Korean handoff explanation (200-500 chars each).',
            properties: {
              color: { type: 'string', minLength: 200, maxLength: 800 },
              typography: { type: 'string', minLength: 200, maxLength: 800 },
              layout: { type: 'string', minLength: 200, maxLength: 800 },
              gradient: { type: 'string', minLength: 150, maxLength: 800 },
              visualDirection: { type: 'string', minLength: 200, maxLength: 800 },
            },
            required: ['color', 'typography', 'layout', 'gradient', 'visualDirection'],
          },
        },
        required: ['tokens', 'visualDirection', 'layerDetails'],
      },
    },
  ],

  qualityCriteria: [
    { id: 'kebab-ids', label: 'kebab-case ID', type: 'auto', description: '모든 token id /^[a-z0-9-]+$/' },
    { id: 'primary-unique', label: 'Primary 유일', type: 'auto', description: 'color.role==="primary" 개수 = 1' },
    { id: 'rationale-presence', label: '결정 근거 명시', type: 'auto', description: '모든 token decisionRationale 존재' },
    { id: 'layer-details-5', label: '5 layer 상세', type: 'auto', description: 'layerDetails 5 키 모두 200자+' },
    { id: 'config-conversion', label: 'Config 변환 무결', type: 'auto', description: 'DTCG/Tailwind/MUI/CSS 모두 valid 한 형식' },
  ],

  workflow: [
    'Step 4 시작 시 mode==="handoff" 분기',
    'pre-extracted selectedRefs + intent + userNotes 텍스트 payload',
    'Anthropic messages.create (Haiku, tools: [submit_handoff_bundle])',
    'tool_choice 단일 강제 → 정확히 1번 호출',
    '클라이언트에서 tokens → DTCG/Tailwind/MUI/CSS-vars/.cursorrules 결정론적 변환',
    'ProjectDetailPage 에 5 layer 상세 + 프레임워크 미리보기 탭 렌더',
    'Export 시 ZIP 번들 (tokens + 4 framework + .cursorrules + DESIGN_SYSTEM.md)',
  ],

  estCost: {
    model: 'Haiku 4.5',
    tokensIn: '~6k (refs + system + tool schema)',
    tokensOut: '~3k (tokens + 5 layer details + VD)',
    note: 'system 모드보다 출력 1.5배 (5 layer 한글 상세 추가). 변환 코드는 LLM 부담 0.',
  },
};

export const AI_TASKS = [TASK_AUTO_TAG, TASK_RECOMMEND, TASK_ANALYZE_TOKENS, TASK_ANALYZE_CONCEPT, TASK_ANALYZE_HANDOFF];

export const AI_TASKS_BY_ID = Object.fromEntries(AI_TASKS.map((t) => [t.id, t]));

export const AI_WORKFLOW_DIAGRAM = `flowchart LR
  Upload[이미지 업로드] --> T1["T1 · 레이어별 태깅<br/>(Haiku, 5 layers)"]
  T1 --> Archive[(Archive)]
  NewProj[프로젝트 생성 Step 1] -->|intent+type| T2["T2 · 추천<br/>(Haiku, 텍스트)"]
  Archive --> T2
  T2 --> Step2[Step 2 레퍼런스 선택]
  Step2 --> T3["T3 · Tokens + VD<br/>(Sonnet, 2 tools)"]
  T3 --> Detail[프로젝트 상세]
  Detail --> Export[tokens.js + visual-direction.md]
`;

/** 구버전 호환 제거된 flat 어휘 — preset helper의 getLayerTags()로 대체 */
