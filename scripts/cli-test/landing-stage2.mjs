/**
 * cli-test landing-stage2 — 랜딩 Stage 2 의 분석 결과를 위한 production-identical T3 (system mode) 호출.
 *
 * Stage 1 의 3 장 example 이미지를 ref 로 사용. 사용자 지정 layer 매핑:
 *   ref-001 (213923458...jpg, Bold Energetic Message)        → typography base
 *   ref-002 (9a731d7608...jpg, Bold Gradient Fintech Energy) → layout base
 *   ref-003 (9bcda910...jpg, Neon Gradient Blur)             → color + gradient base
 *
 * Supabase 미사용. extracted 는 exampleTokens.json + 이미지 시각 검수로 hand-craft.
 *
 * Usage:
 *   node scripts/cli-test/landing-stage2.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  ROOT, loadEnv, extractSystemPromptByExportName, buildReferenceNotesBlock,
  callAnthropic, writeTestOutputs, realCallHeader,
} from './_lib.mjs';

const intent = '의도까지 추적 가능한 디자인 시스템. 컬러는 네온/그라디언트 강한 톤, 타이포는 매거진 헤드라인 임팩트, 레이아웃은 fintech-grade 격자.';

const refs = [
  {
    id: 'ref-001',
    title: 'Bold Energetic Message',
    tags: { color: ['Vivid'], typography: ['Display', 'All-caps'], layout: [], gradient: [] },
    dominantColors: ['#D32F2F', '#1A1A1A', '#E53935', '#C62828', '#F44336'],
    extracted: {
      palette: [
        { hex: '#D32F2F', label: 'Hero Red', group: 'Brand' },
        { hex: '#1A1A1A', label: 'Ink', group: 'Neutral' },
        { hex: '#F44336', label: 'Alert Red', group: 'Brand' },
      ],
      typography: [
        {
          hierarchy: 'display',
          fontFamily: 'Bricolage Grotesque, Inter, sans-serif',
          fontWeight: 800,
          fontSize: 'clamp(64px, 8vw, 120px)',
          lineHeight: 0.95,
          letterSpacing: '-0.04em',
          sampleText: 'BOLD ENERGY',
        },
        {
          hierarchy: 'heading',
          fontFamily: 'Bricolage Grotesque, Inter, sans-serif',
          fontWeight: 700,
          fontSize: 'clamp(36px, 4vw, 56px)',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
        },
        {
          hierarchy: 'body',
          fontFamily: 'IBM Plex Sans, sans-serif',
          fontWeight: 400,
          fontSize: '16px',
          lineHeight: 1.6,
        },
      ],
      layout: [],
      gradient: [],
    },
    note: '',
    useLayers: ['typography'],
    attachIdx: 1,
    attachFile: '01-ref-001.jpg',
  },
  {
    id: 'ref-002',
    title: 'Bold Gradient Fintech Energy',
    tags: { color: ['Vivid', 'Deep'], typography: [], layout: ['Grid', 'Hero'], gradient: ['Mesh', 'Sunset'] },
    dominantColors: ['#1E3A8A', '#FFA500', '#0F172A', '#FF6B35'],
    extracted: {
      palette: [
        { hex: '#1E3A8A', label: 'Deep Indigo', group: 'Brand' },
        { hex: '#0F172A', label: 'Slate Ink', group: 'Neutral' },
      ],
      typography: [],
      layout: [
        { kind: 'grid', columns: 12, gap: 24, maxWidth: '1280px' },
        { kind: 'spacing', px: 8 },
        { kind: 'container', maxWidth: '1280px', ratio: 1.78 },
      ],
      gradient: [],
    },
    note: '',
    useLayers: ['layout'],
    attachIdx: 2,
    attachFile: '02-ref-002.jpg',
  },
  {
    id: 'ref-003',
    title: 'Neon Gradient Blur',
    tags: { color: ['Neon', 'Vivid'], typography: [], layout: [], gradient: ['Neon-glow', 'Mesh', 'Soft-blur'] },
    dominantColors: ['#FF1744', '#0066FF', '#00FFCC', '#7B1FA2', '#1A1A1A'],
    extracted: {
      palette: [
        { hex: '#FF1744', label: 'Neon Magenta', group: 'Brand' },
        { hex: '#0066FF', label: 'Electric Blue', group: 'Brand' },
        { hex: '#00FFCC', label: 'Cyan Glow', group: 'Brand' },
        { hex: '#7B1FA2', label: 'Deep Violet', group: 'Brand' },
        { hex: '#1A1A1A', label: 'Void', group: 'Neutral' },
      ],
      typography: [],
      layout: [],
      gradient: [
        {
          gradient: 'linear-gradient(135deg, #FF1744 0%, #7B1FA2 50%, #0066FF 100%)',
          stops: [
            { offset: 0, color: '#FF1744' },
            { offset: 0.5, color: '#7B1FA2' },
            { offset: 1, color: '#0066FF' },
          ],
        },
        {
          gradient: 'radial-gradient(circle at 30% 70%, #00FFCC 0%, transparent 60%)',
          stops: [
            { offset: 0, color: '#00FFCC' },
            { offset: 1, color: '#1A1A1A' },
          ],
        },
      ],
    },
    note: '',
    useLayers: ['color', 'gradient'],
    attachIdx: 3,
    attachFile: '03-ref-003.jpg',
  },
];

const extractedPool = refs.map((r) => ({
  id: r.id,
  attachIdx: r.attachIdx,
  attachFile: r.attachFile,
  title: r.title,
  tags: r.tags,
  dominantColors: r.dominantColors,
  extracted: r.extracted,
  useLayers: r.useLayers,
}));

const systemPrompt = extractSystemPromptByExportName('TASK_ANALYZE_TOKENS');
const refNotesBlock = buildReferenceNotesBlock(refs);

const layerCurationLines = extractedPool
  .filter((r) => r.useLayers.length > 0)
  .map((r) => `${r.id}: ONLY use [${r.useLayers.join(', ')}]`)
  .join('\n');

const mode = 'system';
const modeBias = 'ENFORCE role uniqueness, AAA contrast for primary on bg, hierarchy strict.';

const userText1 = `=== Pre-extracted references (${refs.length}) ===

${JSON.stringify(extractedPool, null, 2)}

=== End of references ===

=== Project Mode (TP2) ===
mode: ${mode}
${modeBias}

=== Layer Curation (TP4) ===
${layerCurationLines}${refNotesBlock}`;

const userText2 = `Project intent: "${intent}"
Reference count: ${refs.length} (ids = [${refs.map((r) => r.id).join(', ')}])

Pre-extracted references (T1 output, full data) are provided above as JSON.
No images will be provided. Compose the final token system + visual direction
narrative from the pre-extracted pool, selecting and combining based on intent.`;

const toolSchema = {
  name: 'submit_design_system',
  description: 'Submit the complete design system in ONE call: 4-layer token system + visual direction.',
  input_schema: {
    type: 'object',
    properties: {
      tokens: {
        type: 'object',
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
              genre: { type: 'array', items: { type: 'string' }, maxItems: 2 },
              style: { type: 'array', items: { type: 'string' }, maxItems: 3 },
              subject: { type: 'array', items: { type: 'string' }, maxItems: 3 },
            },
            required: ['genre', 'style', 'subject'],
          },
        },
        required: ['markdown', 'tags'],
      },
    },
    required: ['tokens', 'visualDirection'],
  },
};

const { apiKey } = loadEnv();

const payload = {
  model: 'claude-haiku-4-5',
  max_tokens: 8192,
  system: systemPrompt,
  tools: [toolSchema],
  tool_choice: { type: 'tool', name: 'submit_design_system' },
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: userText1 },
        { type: 'text', text: userText2 },
      ],
    },
  ],
};

console.log(realCallHeader('landing-stage2 (T3 system)'));
console.log('[landing-stage2] system prompt length:', systemPrompt.length);
console.log('[landing-stage2] user text length:', userText1.length + userText2.length);
console.log('[landing-stage2] calling Anthropic API ...');

const response = await callAnthropic({ apiKey, payload });
console.log('[landing-stage2] stop_reason:', response.stop_reason);

const toolUse = (response.content || []).find((b) => b.type === 'tool_use' && b.name === 'submit_design_system');
if (!toolUse) {
  throw new Error(`No tool_use response. content: ${JSON.stringify(response.content)}`);
}
const result = toolUse.input || {};

const counts = {
  color: result.tokens?.color?.length || 0,
  typography: result.tokens?.typography?.length || 0,
  layout: result.tokens?.layout?.length || 0,
  gradient: result.tokens?.gradient?.length || 0,
};
console.log('[landing-stage2] token counts:', counts);

const outDir = path.join(ROOT, 'src/result/landing-stage2');
fs.mkdirSync(outDir, { recursive: true });

writeTestOutputs(outDir, {
  '_input.json': { intent, refs },
  '_raw-response.json': response,
  'system-tokens.json': result,
  'system-vd.md': result.visualDirection?.markdown || '',
});

console.log('[landing-stage2] saved →', outDir);
