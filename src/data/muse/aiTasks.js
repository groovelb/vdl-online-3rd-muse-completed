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
  name: '자동 태깅',
  purpose: 'Reference 아카이빙 시 preset 기반 5레이어 태그를 자동 부여',
  stage: 'archive.upload',
  model: 'claude-haiku-4-5',

  input: {
    kind: 'image',
    description: '단일 reference 이미지 (최대 ~5MB)',
    shape: '{ imageBase64: string, mediaType: "image/jpeg" | "image/png" }',
  },

  output: {
    description: 'Reference.tags (레이어별 중첩) + dominantColors + title',
    shape: `{
  tags: {
    color: string[0..3],
    typography: string[0..3],
    layout: string[0..3],
    gradient: string[0..3],
    visualDirection: {
      genre: string[0..2],
      style: string[0..2],
      subject: string[0..2],
    }
  },
  dominantColors: string[3..5],
  title: string
}`,
  },

  systemPrompt: `You are a design curation assistant for MUSE.

Given a single reference image, extract structured tags organized by layers.
Each tag must come from the closed vocabulary below (descriptions provided for nuance).

${renderVocabularyPrompt([...TOKEN_LAYERS, 'visual_direction'])}

Output rules:
- For each of color / typography / layout / gradient: pick 0 to 3 tags from the respective vocabulary.
- For visualDirection: pick 0 to 2 tags per sub-category (genre / style / subject).
- Do NOT invent tags. Do NOT mix tags across layers (e.g. don't put "Muted" in typography).
- dominantColors: 3 to 5 HEX colors (#RRGGBB) ordered from most prominent background to most prominent accent.
- title: 2 to 5 word English title capturing the visual style (not literal subject).
- Respond using the submit_tagging tool only. No prose.`,

  userMessageTemplate: 'Analyze this reference image and submit the tagging.',

  toolSchema: {
    name: TOOL_AUTO_TAG_NAME,
    description: 'Submit layered tags, dominant colors, and title for a reference image.',
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
      },
      required: ['tags', 'dominantColors', 'title'],
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
        visualDirection: {
          genre: ['Retro'],
          style: ['Magazine'],
          subject: ['Portrait-Photo'],
        },
      },
      dominantColors: ['#1A1A1F', '#8B7A6B', '#E8DCC4'],
      title: 'Muted Editorial Portrait',
    },
  },

  workflow: [
    '유저가 드래그앤드롭/URL로 이미지 업로드',
    '클라이언트가 이미지를 base64 인코딩',
    'Anthropic messages.create (system에 preset 어휘 삽입, tool_choice 강제)',
    'Response의 tool_use 블록에서 input 객체 추출',
    '자동 검증 (schema + 레이어별 enum + hex)',
    '실패 시 1회 재시도 → 그래도 실패하면 수동 태깅 fallback',
    'Reference 객체에 병합 후 아카이브에 저장',
  ],

  estCost: {
    model: 'Haiku 4.5',
    tokensIn: '~1.8k (image + preset 어휘 포함 system)',
    tokensOut: '~200',
    note: 'prompt caching 시 system ~1.6k 캐시됨',
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
    description: '의도 + 아카이브 메타 (이미지 없음, 레이어별 태그 포함)',
    shape: `{
  intent: string,
  type: 'landing'|'dashboard'|'mobile'|'brand',
  archive: Array<{ id, tags: ReferenceLayeredTags, dominantColors[], title }>,
  n?: number
}`,
  },

  output: {
    description: '추천 id 목록 + 각 id별 한 줄 근거',
    shape: `{ recommendedIds: string[5..10], reasons: Array<{ id, reason }> }`,
  },

  systemPrompt: `You are MUSE's reference matcher.

You receive a project intent sentence, a project type, and the archive metadata
(IDs, layered tags, dominantColors, titles). You DO NOT see images.

Select the top N references (5 to 10) that best match the intent.

Rules:
- Work only with provided metadata.
- Prioritize in order:
  (1) visualDirection tags (genre/style/subject) overlap with intent,
  (2) color/typography/layout/gradient tag overlap,
  (3) dominantColors palette alignment with intent mood,
  (4) project type fit.
- For each recommended id, a ONE-SENTENCE Korean reason (max 40 characters).
- Rank best-first.
- Respond via submit_recommendations tool. No prose.`,

  userMessageTemplate: `Project intent: "{{intent}}"
Project type: {{type}}
Requested count: {{n}}
Archive ({{archiveCount}} items):
{{archiveJson}}

Select the best matches.`,

  toolSchema: {
    name: 'submit_recommendations',
    description: 'Submit ranked recommended reference ids with reasons.',
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
      },
      required: ['recommendedIds', 'reasons'],
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
  name: '토큰 분석 + 비주얼 디렉션',
  purpose: '선택된 레퍼런스에서 4 토큰 레이어(JSON) + visualDirection(Markdown) 동시 산출',
  stage: 'project.create.step3',
  model: 'claude-sonnet-4-6',

  input: {
    kind: 'image+text',
    description: 'N장 이미지(각 레퍼런스는 T1 태그 포함) + 의도 + 유형',
    shape: `{
  intent: string,
  type: 'landing'|'dashboard'|'mobile'|'brand',
  references: Array<{ id, imageBase64, mediaType, tags: ReferenceLayeredTags, dominantColors[] }>
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

  systemPrompt: `You are MUSE's design token + visual direction extractor.

You receive 3 to 6 reference images for a single project, each with pre-tagged
layered tags from T1, plus the project's intent and type.

You MUST call BOTH of these tools in the same response:
  1. submit_tokens — 4 token layers (color, typography, layout, gradient) as JSON
  2. submit_visual_direction — Markdown document following the MUSE visual direction template

Shared rules (apply to both tools):
- Reflect the project intent strongly.
- All HEX codes valid 6-digit.
- Emphasis 2 is scarce. Use only for the single most important token per layer.
- Do NOT fabricate reference ids.

=== submit_tokens constraints ===

[color] 4-6 tokens.
- fields: id, label, hex, role (primary | secondary | accent | neutral), group (Brand | Surface | Data | Neutral), isEnabled (true), emphasis (0|1|2), sourceReferenceIds[]
- exactly one primary.

[typography] 3-4 tokens.
- fields: id, label, variant (h1|h2|h3|body1|body2|caption), fontFamily (CSS stack), fontWeight (100-900), fontSize (CSS; use clamp() for display), lineHeight (number), letterSpacing (em), isEnabled (true), emphasis

[layout] 2-4 tokens.
- kind in {grid, spacing, container}.

[gradient] 1-3 tokens.
- CSS gradient string, isEnabled, emphasis.

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
Reference images: {{count}} provided below, ids = [{{ids}}], each with T1 tags.

Extract the token system AND the visual direction document.`,

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
    'Step 2에서 선택된 referenceIds + 각 Reference의 T1 tags 확보',
    '각 이미지 base64 + 태그 힌트 첨부',
    'Anthropic messages.create (Sonnet 4.6, tools: [submit_tokens, submit_visual_direction])',
    '응답에서 두 tool의 input 모두 추출, 한쪽이라도 누락이면 재시도',
    '자동 검증 (primary 유일, MD 섹션 존재, enum 준수 등)',
    '검증 통과 시 ProjectDetailPage에 즉시 렌더 (visualDirection 탭에 MD 렌더러)',
    '편집 후 ThemeExportDialog(tokens.js) + MD 다운로드',
  ],

  estCost: {
    model: 'Sonnet 4.6',
    tokensIn: '~9k (이미지 4장 + preset + 템플릿)',
    tokensOut: '~2k',
    note: '단일 호출에 2 tool output — 분리 호출 대비 비용 절감. 초기 N≤4 제한 권장',
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
