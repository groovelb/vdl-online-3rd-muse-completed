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
const TOOL_SUBMIT_TOKENS = 'submit_tokens';
const TOOL_SUBMIT_VD = 'submit_visual_direction';

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
  type: 'landing'|'dashboard'|'mobile'|'brand',
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

You receive a project intent sentence, a project type, a mode, and the archive metadata
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
  (3) dominantColors palette alignment with intent mood,
  (4) project type fit.
- For each recommended id, a ONE-SENTENCE Korean reason (max 40 characters).
- Rank best-first.

=== referenceLayer (TP4) — REQUIRED ===
For each recommendedId, emit referenceLayer with 1-2 most useful TokenLayerKey for this ref:
  TokenLayerKey: 'color' | 'typography' | 'layout' | 'gradient' | 'visualDirection'
The user will see these as default chip selection in Step 2 and may toggle.

- Respond via submit_recommendations tool. No prose.`,

  userMessageTemplate: `Project intent: "{{intent}}"
Project type: {{type}}
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
    description: '선택된 N 장의 T1 pre-extracted 데이터 + 의도 + 유형 + 모드 + 레이어 큐레이션',
    shape: `{
  intent: string,
  type: 'landing'|'dashboard'|'mobile'|'brand',
  mode: 'concept'|'system'|'handoff',  // TP2: 합성 톤 분기
  references: Array<{
    id, title, tags, dominantColors[], extracted,
    useLayers?: TokenLayerKey[]  // TP4: 사용자가 이 ref에서 가져올 레이어. 빈 배열이면 전체
  }>
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

=== Decision rationale (TP6, REQUIRED) ===
For EVERY token in tokens.color / typography / layout / gradient, emit decisionRationale with:
  - whichReferences: array of ref IDs that contributed to this token (subset of input)
  - whichLayers: which layers from those refs (per useLayers if set)
  - whyChosen: ONE LINE in user's intent language explaining why this value
  - alternativesConsidered: optional, array of {value, reason} for top 1-2 rejected candidates
This is shown to the user in the token detail panel. T1 super-theme: "AI가 정한 모든 결정의 이유를 추적할 수 있어야 한다."

=== OUTPUT ===

Call BOTH tools in the same response:
  1. submit_tokens — 4 token layers (color, typography, layout, gradient)
  2. submit_visual_direction — Markdown document + aggregated tags

Shared rules:
- Reflect project intent strongly. Two projects with same refs but different intents
  should produce noticeably different role/emphasis/typography variant assignments.
- All HEX codes 6-digit valid.
- Emphasis 2 is scarce: exactly one per layer at most.
- sourceReferenceIds[]: only IDs present in the input references.
- Do NOT fabricate values outside the extracted pool (exception: typography
  unification may require adjusted fontSize to form a coherent scale).

=== submit_tokens constraints ===

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

=== submit_visual_direction constraints ===

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
Respond via the two tools only. No prose outside of tools.`,

  userMessageTemplate: `Project intent: "{{intent}}"
Project type: {{type}}
Reference count: {{count}} (ids = [{{ids}}])

Pre-extracted references (T1 output, full data) are provided above as JSON.
No images will be provided. Compose the final token system + visual direction
narrative from the pre-extracted pool, selecting and combining based on intent.`,

  toolSchemas: [
    {
      name: TOOL_SUBMIT_TOKENS,
      description: 'Submit the 4-layer token system (color, typography, layout, gradient).',
      input_schema: {
        type: 'object',
        properties: {
          color: { type: 'array', minItems: 4, maxItems: 6 },
          typography: { type: 'array', minItems: 3, maxItems: 4 },
          layout: { type: 'array', minItems: 2, maxItems: 4 },
          gradient: { type: 'array', minItems: 1, maxItems: 3 },
        },
        required: ['color', 'typography', 'layout', 'gradient'],
      },
    },
    {
      name: TOOL_SUBMIT_VD,
      description: 'Submit the visual direction as a filled Markdown document plus aggregated tags.',
      input_schema: {
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

export const AI_TASKS = [TASK_AUTO_TAG, TASK_RECOMMEND, TASK_ANALYZE_TOKENS];

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
