/**
 * MUSE AI Tasks — 시스템 프롬프트 / 입출력 스키마 / 워크플로우 정의
 *
 * 각 태스크는 다음 필드를 포함:
 *  - id, name, purpose, stage            (메타)
 *  - model                               (기본 모델)
 *  - input / output schemas              (JSON Schema-like 요약)
 *  - systemPrompt                        (Claude system message)
 *  - userMessageTemplate                 (user turn 템플릿)
 *  - toolSchema                          (tool use 구조화 출력)
 *  - qualityCriteria                     (자동/수동 평가 축)
 *  - goldenExample                       (입력 / 기대 출력 데모)
 *  - workflow                            (단계 리스트)
 *
 * 실제 API 호출 코드는 별도 레이어 (scripts/muse-ai/*)에서 이 파일을 import해 사용.
 */

/** 태그 어휘 — 태깅 태스크에서 이 외의 단어 금지 */
export const TAG_VOCABULARY = [
  'Muted', 'Warm', 'Deep', 'Soft', 'Bold',
  'Editorial', 'Minimal', 'Gradient', 'Brutal', 'Swiss',
  'Mono', 'Pastel', 'Neon', 'Earth', 'Ocean',
];

/** 공통 품질 축 */
const COMMON_QUALITY = [
  { id: 'schema', label: '스키마 준수', type: 'auto', description: '필수 필드 존재 + 타입 적합' },
  { id: 'hex', label: 'HEX 형식', type: 'auto', description: '^#[0-9A-Fa-f]{6}$' },
];

/* =========================================================
 * T1. 자동 태깅 (Auto-tag)
 * ========================================================= */
export const TASK_AUTO_TAG = {
  id: 't1',
  name: '자동 태깅',
  purpose: 'Reference 아카이빙 시 AI가 태그/대표색/제목을 자동 부여',
  stage: 'archive.upload',
  model: 'claude-haiku-4-5',

  input: {
    kind: 'image',
    description: '단일 reference 이미지 (최대 ~5MB)',
    shape: '{ imageBase64: string, mediaType: "image/jpeg" | "image/png" }',
  },

  output: {
    description: 'Reference 스키마의 부분 집합',
    shape: `{
  tags: string[2..4],            // TAG_VOCABULARY에서만
  dominantColors: string[3..5],  // #RRGGBB, 배경→강조 순
  title: string                  // 2~5 단어 영문, 스타일 기술
}`,
  },

  systemPrompt: `You are a design curation assistant for MUSE, a visual reference library.

Given a single reference image, extract:
1. tags — 2 to 4 descriptive tags from this closed vocabulary ONLY:
   ${TAG_VOCABULARY.join(', ')}
2. dominantColors — 3 to 5 HEX colors ordered from most prominent background to most prominent accent.
3. title — a 2 to 5 word English title capturing the DESIGN FEEL (not literal subject).

Rules:
- Tags MUST come from the vocabulary above. Never invent new tags.
- HEX codes must be valid 6-digit uppercase format (e.g. #14132B).
- Title describes visual style: prefer "Muted Portrait" over "Woman With Hat".
- Be consistent: visually similar images should get overlapping tags.
- Respond using the submit_tagging tool. Do not write any prose.`,

  userMessageTemplate: `Analyze this reference image and submit the tagging.`,

  toolSchema: {
    name: 'submit_tagging',
    description: 'Submit tags, dominant colors, and title for a reference image.',
    input_schema: {
      type: 'object',
      properties: {
        tags: {
          type: 'array',
          items: { type: 'string', enum: TAG_VOCABULARY },
          minItems: 2, maxItems: 4,
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
    { id: 'vocab', label: '어휘 준수', type: 'auto', description: 'TAG_VOCABULARY 외 단어 0건' },
    { id: 'color-accuracy', label: '컬러 정확도', type: 'auto', description: '이미지 픽셀 통계 vs 출력 HEX Delta E < 15' },
    { id: 'title-style', label: '제목 스타일성', type: 'manual', description: '"문자적 묘사" 아닌 "디자인 톤" 서술인가' },
  ],

  goldenExample: {
    inputDescription: 'reference5.jpg (어두운 에디토리얼 초상)',
    expectedOutput: {
      tags: ['Editorial', 'Deep', 'Muted'],
      dominantColors: ['#1A1A1F', '#8B7A6B', '#E8DCC4'],
      title: 'Muted Editorial Portrait',
    },
  },

  workflow: [
    '유저가 드래그앤드롭/URL로 이미지 업로드',
    '클라이언트가 이미지를 base64 인코딩',
    'Anthropic messages.create({ model, system, tools, messages })',
    'Response의 tool_use 블록에서 input 객체 추출',
    '자동 검증 (schema + vocab + hex)',
    '실패 시 1회 재시도 → 그래도 실패하면 수동 태깅 fallback',
    'Reference 객체에 병합 후 아카이브에 저장',
  ],

  estCost: {
    model: 'Haiku 4.5',
    tokensIn: '~1.2k (image + system)',
    tokensOut: '~120',
    note: 'prompt caching 시 system ~250 토큰 캐시됨',
  },
};

/* =========================================================
 * T2. 레퍼런스 추천 (Recommend)
 * ========================================================= */
export const TASK_RECOMMEND = {
  id: 't2',
  name: '레퍼런스 추천',
  purpose: '프로젝트 의도 문장 → 아카이브에서 어울리는 top-N 추천',
  stage: 'project.create.step2',
  model: 'claude-haiku-4-5',

  input: {
    kind: 'text',
    description: '의도 + 아카이브 메타데이터 (이미지 없음)',
    shape: `{
  intent: string,
  type: 'landing'|'dashboard'|'mobile'|'brand',
  archive: Array<{ id, tags[], dominantColors[], title }>,
  n?: number  // 기본 8
}`,
  },

  output: {
    description: '추천 id 목록 + 각 id별 한 줄 근거',
    shape: `{
  recommendedIds: string[5..10],
  reasons: Array<{ id: string, reason: string(한글, <40자) }>
}`,
  },

  systemPrompt: `You are MUSE's reference matcher.

You receive a project intent sentence, a project type, and the archive metadata (IDs, tags, dominantColors, titles). You DO NOT see images.

Select the top N references (5 to 10) that best match the intent.

Rules:
- Work only with provided metadata. Do not request images.
- Prioritize: (1) tag overlap with intent keywords, (2) color palette alignment with intent mood, (3) project type fit (landing/dashboard/mobile/brand).
- For each recommended id, provide a ONE-SENTENCE Korean reason (max 40 characters).
- Rank from best to worst match.
- Return between 5 and 10 recommendations (respect the requested n if given).
- Respond using the submit_recommendations tool. No prose.`,

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
        recommendedIds: {
          type: 'array',
          items: { type: 'string' },
          minItems: 5, maxItems: 10,
        },
        reasons: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              reason: { type: 'string', maxLength: 40 },
            },
            required: ['id', 'reason'],
          },
        },
      },
      required: ['recommendedIds', 'reasons'],
    },
  },

  qualityCriteria: [
    ...COMMON_QUALITY,
    { id: 'id-validity', label: 'ID 유효성', type: 'auto', description: '모든 recommendedIds가 입력 archive에 존재' },
    { id: 'tag-overlap', label: '태그 겹침', type: 'auto', description: '의도 키워드 ↔ 추천 태그 평균 자카드 > 0.3' },
    { id: 'diversity', label: '다양성', type: 'auto', description: '추천 중복 id 0건, 태그 편중 지양' },
    { id: 'relevance', label: '의도 반영도', type: 'manual', description: '사람이 보기에 의도와 맞는가 (pairwise A/B)' },
  ],

  goldenExample: {
    inputDescription: 'intent="흑백 대비 매거진 톤", type=landing, archive=27건',
    expectedOutput: {
      recommendedIds: ['ref-002', 'ref-005', 'ref-008', 'ref-011', 'ref-017'],
      reasons: [
        { id: 'ref-002', reason: '흑백 대비가 강한 에디토리얼 구도' },
        { id: 'ref-005', reason: 'Mono 태그 + 매거진 레이아웃' },
      ],
    },
  },

  workflow: [
    '위자드 Step 1 완료 시 intent/type 확보',
    '아카이브 메타 배열을 JSON으로 직렬화',
    'API 호출 (텍스트만, 이미지 없음 → 매우 저렴)',
    '결과 id로 aarchive에서 Reference 객체 조회',
    'Step 2 상단 "추천" 섹션에 표시 + reason 툴팁',
    '사용자가 원하면 무시·추가 선택 가능 (강제 아님)',
  ],

  estCost: {
    model: 'Haiku 4.5',
    tokensIn: '~500 (archive 27건 metadata)',
    tokensOut: '~200',
    note: '가장 저렴. 이미지 없음',
  },
};

/* =========================================================
 * T3. 토큰 분석 (Analyze Tokens)
 * ========================================================= */
export const TASK_ANALYZE_TOKENS = {
  id: 't3',
  name: '토큰 분석',
  purpose: '선택된 레퍼런스에서 5-레이어 디자인 토큰 추출',
  stage: 'project.create.step3',
  model: 'claude-sonnet-4-6',

  input: {
    kind: 'image+text',
    description: 'N장 이미지 + 의도 + 유형',
    shape: `{
  intent: string,
  type: 'landing'|'dashboard'|'mobile'|'brand',
  references: Array<{ id, imageBase64, mediaType, tags[], dominantColors[] }>
}`,
  },

  output: {
    description: 'AnalysisLayers (5-레이어). 스키마는 src/data/muse/schemas.js 참조',
    shape: `{
  color: ColorToken[4..6],
  typography: TypographyToken[3..4],
  layout: LayoutToken[2..4],
  gradient: GradientToken[1..3],
  keyVisual: Array<{ referenceId, emphasis, caption? }>[2..4]
}`,
  },

  systemPrompt: `You are MUSE's design token extractor.

You receive 3 to 6 reference images for a single project, along with the project's intent and type (landing / dashboard / mobile / brand). Extract a coherent 5-layer design token system that serves the intent.

Per-layer constraints:

[color] 4-6 tokens.
- fields: id, label, hex, role (primary | secondary | accent | neutral), group (Brand | Surface | Data | Neutral), isEnabled (true), emphasis (0|1|2), sourceReferenceIds[]
- exactly one primary.

[typography] 3-4 tokens.
- fields: id, label, variant (h1|h2|h3|body1|body2|caption), fontFamily (CSS stack string), fontWeight (100-900), fontSize (CSS value; use clamp() for display headings), lineHeight (number), letterSpacing (em value), isEnabled (true), emphasis
- infer weight/size from visual hierarchy, not exact pixel measurements.

[layout] 2-4 tokens.
- kind in {grid, spacing, container}.
- grid: columns (2-16), gap (px)
- spacing: px (4-128)
- container: ratio (0-1), maxWidth (CSS value)

[gradient] 1-3 tokens.
- fields: id, label, gradient (full CSS gradient string), isEnabled, emphasis.

[keyVisual] 2-4 items.
- select from input reference ids only. Do not invent ids.
- emphasis higher = more central.

Global rules:
- Reflect the project intent strongly — tokens should serve that intent.
- All HEX codes valid 6-digit.
- Each token has sourceReferenceIds showing which input refs informed it.
- Emphasis 2 is scarce. Use only for the single most important token per layer.
- Respond using the submit_analysis tool. No prose.`,

  userMessageTemplate: `Project intent: "{{intent}}"
Project type: {{type}}
Reference images: {{count}} provided below, ids = [{{ids}}]

Extract the design token system.`,

  toolSchema: {
    name: 'submit_analysis',
    description: 'Submit the 5-layer design token analysis.',
    input_schema: {
      type: 'object',
      properties: {
        color: { type: 'array', minItems: 4, maxItems: 6 },
        typography: { type: 'array', minItems: 3, maxItems: 4 },
        layout: { type: 'array', minItems: 2, maxItems: 4 },
        gradient: { type: 'array', minItems: 1, maxItems: 3 },
        keyVisual: { type: 'array', minItems: 2, maxItems: 4 },
      },
      required: ['color', 'typography', 'layout', 'gradient', 'keyVisual'],
    },
  },

  qualityCriteria: [
    ...COMMON_QUALITY,
    { id: 'primary-unique', label: 'Primary 유일', type: 'auto', description: 'color.role==="primary" 개수 = 1' },
    { id: 'ref-id-validity', label: 'keyVisual id 유효성', type: 'auto', description: '모든 keyVisual.referenceId가 입력에 존재' },
    { id: 'palette-coherence', label: '팔레트 일관성', type: 'auto', description: '컬러 토큰의 HEX가 입력 dominantColors와 겹치는 정도' },
    { id: 'typo-hierarchy', label: '타이포 위계', type: 'auto', description: 'fontSize/weight가 variant 위계와 일치 (h1 > h2 > body1)' },
    { id: 'intent-fit', label: '의도 반영도', type: 'manual', description: '사람이 보기에 의도가 tokens에 드러나는가' },
    { id: 'export-success', label: 'Export 적합성', type: 'auto', description: 'ThemeExportDialog가 오류 없이 코드 생성' },
  ],

  goldenExample: {
    inputDescription: '프로젝트 "Editorial Minimal" · intent="흑백 대비 매거진" · 6장',
    expectedOutput: {
      color: [
        { id: 'col-ink', label: 'Primary Ink', hex: '#14132B', role: 'primary', group: 'Brand', isEnabled: true, emphasis: 2, sourceReferenceIds: ['ref-001', 'ref-003'] },
        { id: 'col-bg', label: 'Page Surface', hex: '#FCFCFF', role: 'neutral', group: 'Surface', isEnabled: true, emphasis: 0, sourceReferenceIds: ['ref-002'] },
      ],
      // ... typography, layout, gradient, keyVisual 생략
    },
  },

  workflow: [
    '위자드 Step 2에서 선택된 referenceIds 확보',
    '각 이미지 base64 인코딩 + 태그/도미넌트 컬러 첨부 (이미지 외 힌트)',
    'Anthropic messages.create (Sonnet 4.6, tool use 강제)',
    'tool_use 결과를 AnalysisLayers로 매핑',
    '자동 검증 (primary 유일성, keyVisual id 유효성 등)',
    '검증 통과 시 ProjectDetailPage에 즉시 렌더',
    '사용자가 on/off + emphasis 편집 → ThemeExportDialog로 최종 코드 Export',
  ],

  estCost: {
    model: 'Sonnet 4.6',
    tokensIn: '~8k (이미지 4장 + 시스템)',
    tokensOut: '~1.2k',
    note: '가장 비쌈. 초기엔 N=3~4로 제한 권장. prompt caching 적극 활용',
  },
};

/* =========================================================
 * 전체 태스크 레지스트리 + 워크플로우 다이어그램
 * ========================================================= */

export const AI_TASKS = [TASK_AUTO_TAG, TASK_RECOMMEND, TASK_ANALYZE_TOKENS];

export const AI_TASKS_BY_ID = Object.fromEntries(AI_TASKS.map((t) => [t.id, t]));

/** MUSE 전체 AI 플로우 — Storybook mermaid 렌더용 */
export const AI_WORKFLOW_DIAGRAM = `flowchart LR
  Upload[이미지 업로드] --> T1[T1 자동 태깅]
  T1 --> Archive[(Archive)]
  NewProj[프로젝트 생성 Step 1] -->|intent+type| T2[T2 레퍼런스 추천]
  Archive --> T2
  T2 --> Step2[Step 2 레퍼런스 선택]
  Step2 --> T3[T3 토큰 분석]
  T3 --> Detail[프로젝트 상세]
  Detail --> Export[Export MUI theme]
`;
