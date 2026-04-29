/**
 * cli-test handoff — T3 (handoff mode) production-identical LLM call.
 *
 * Usage:
 *   node scripts/cli-test/handoff.mjs --input path/to/input.json [--out path/to/result/dir]
 *
 * input.json schema:
 *   {
 *     "projectName": "editorial handoff",
 *     "intent": "흑백 대비 매거진 — Tailwind/MUI 출고",
 *     "refs": [
 *       { "id": "248c3094-...", "note": "ref-001 의 hero 영역 색감만 차용", "useLayers": ["color"] },
 *       ...
 *     ]
 *   }
 *
 * Output (default to src/result/test/):
 *   - handoff-bundle.json     (parsed tool input)
 *   - handoff-vd.md           (visualDirection.markdown)
 *   - handoff-layer-details.md (5 Korean layer details)
 *   - _raw-response.json
 *   - _input.json
 *
 * NOTE: tags enum is left as free-form (baseline portability).
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  ROOT, loadEnv, getServiceRoleKey, fetchReferenceRows,
  extractSystemPromptByExportName, buildReferenceNotesBlock,
  callAnthropic, writeTestOutputs, realCallHeader,
} from './_lib.mjs';

/* ----- args ----- */
const args = process.argv.slice(2);
const inputPath = args[args.indexOf('--input') + 1];
const outArg = args[args.indexOf('--out') + 1];
if (!inputPath || inputPath === '--out') {
  console.error('Usage: node scripts/cli-test/handoff.mjs --input <path/to/input.json> [--out <dir>]');
  process.exit(1);
}
const outDir = outArg && outArg !== '--input'
  ? path.resolve(ROOT, outArg)
  : path.join(ROOT, 'src/result/test');

/* ----- input ----- */
const input = JSON.parse(fs.readFileSync(path.resolve(ROOT, inputPath), 'utf-8'));
const { projectName, intent, refs: inputRefs } = input;
if (!projectName || !intent || !Array.isArray(inputRefs) || inputRefs.length === 0) {
  throw new Error('input.json must have { projectName, intent, refs: [...] }');
}

/* ----- env + supabase ----- */
const { apiKey, supabaseUrl } = loadEnv();
console.log('[cli-test/handoff] fetching service_role key via supabase CLI ...');
const serviceRoleKey = getServiceRoleKey(supabaseUrl);
console.log('[cli-test/handoff] fetching reference_items from Supabase ...');
const refRows = await fetchReferenceRows(supabaseUrl, serviceRoleKey, inputRefs.map((r) => r.id));
const rowById = Object.fromEntries(refRows.map((r) => [r.id, r]));
console.log(`[cli-test/handoff] fetched ${refRows.length}/${inputRefs.length} reference_items rows`);

/* ----- merge input + supabase rows ----- */
const refs = inputRefs.map((r, i) => {
  const row = rowById[r.id];
  if (!row) throw new Error(`reference_items row missing for id ${r.id}`);
  return {
    id: row.id,
    title: row.title || null,
    tags: row.tags || {},
    dominantColors: row.dominant_colors || [],
    extracted: row.extracted || {},
    note: r.note || '',
    useLayers: Array.isArray(r.useLayers) ? r.useLayers : [],
    attachIdx: i + 1,
    attachFile: `${String(i + 1).padStart(2, '0')}-${r.id}.jpg`,
  };
});

/* ----- extractedPool (museAiTasks.runAnalyzeHandoff 와 동일) ----- */
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

/* ----- system prompt + user message ----- */
const systemPrompt = extractSystemPromptByExportName('TASK_ANALYZE_HANDOFF');
const refNotesBlock = buildReferenceNotesBlock(refs);

const layerCurationLines = extractedPool.some((r) => r.useLayers.length > 0)
  ? extractedPool
      .filter((r) => r.useLayers.length > 0)
      .map((r) => `${r.id}: ONLY use [${r.useLayers.join(', ')}]`)
      .join('\n')
  : '(없음 — 모든 ref 의 모든 layer 자유 사용)';

const userText1 = `=== Pre-extracted references (${refs.length}) ===

${JSON.stringify(extractedPool, null, 2)}

=== End of references ===

=== Layer Curation (TP4) ===
${layerCurationLines}${refNotesBlock}`;

const userText2 = `Intent: "${intent}"
Reference count: ${refs.length} (ids = [${refs.map((r) => r.id).join(', ')}])

Pre-extracted reference data is provided above as JSON.
Compose the handoff bundle with all 4 token layers, 5 Korean layer details, and the visualDirection narrative.`;

/* ----- tool schema (BASELINE — 변경 전 5-layer layerDetails) ----- */
const toolSchema = {
  name: 'submit_handoff_bundle',
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
              genre: { type: 'array', items: { type: 'string' }, minItems: 0, maxItems: 2 },
              style: { type: 'array', items: { type: 'string' }, minItems: 0, maxItems: 3 },
              subject: { type: 'array', items: { type: 'string' }, minItems: 0, maxItems: 3 },
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
};

const payload = {
  model: 'claude-haiku-4-5',
  max_tokens: 8192,
  system: systemPrompt,
  tools: [toolSchema],
  tool_choice: { type: 'tool', name: 'submit_handoff_bundle' },
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

console.log('[cli-test/handoff] system prompt length:', systemPrompt.length);
console.log('[cli-test/handoff] user text length:', userText1.length + userText2.length);
console.log('[cli-test/handoff] calling Anthropic API ...');
const response = await callAnthropic({ apiKey, payload });
console.log('[cli-test/handoff] stop_reason:', response.stop_reason);

const toolUse = (response.content || []).find((b) => b.type === 'tool_use' && b.name === 'submit_handoff_bundle');
if (!toolUse) {
  throw new Error(`No tool_use response. content: ${JSON.stringify(response.content)}`);
}
const result = toolUse.input || {};

const counts = {
  color: result.tokens?.color?.length || 0,
  typography: result.tokens?.typography?.length || 0,
  layout: result.tokens?.layout?.length || 0,
  gradient: result.tokens?.gradient?.length || 0,
  layerDetails: Object.keys(result.layerDetails || {}).length,
  vdMarkdownLen: result.visualDirection?.markdown?.length || 0,
};
console.log('[cli-test/handoff] counts:', counts);

const ld = result.layerDetails || {};
const layerDetailsMd = `# ${projectName} — Layer Details (handoff baseline)

${realCallHeader('handoff')}

## color
${ld.color || '(empty)'}

## typography
${ld.typography || '(empty)'}

## layout
${ld.layout || '(empty)'}

## gradient
${ld.gradient || '(empty)'}

## visualDirection
${ld.visualDirection || '(empty)'}
`;

writeTestOutputs(outDir, {
  'handoff-bundle.json': result,
  'handoff-vd.md': `# ${projectName} — Visual Direction (handoff baseline)

${realCallHeader('handoff')}

${result.visualDirection?.markdown || '(empty)'}
`,
  'handoff-layer-details.md': layerDetailsMd,
  '_raw-response.json': response,
  '_input.json': input,
  '_summary.json': { mode: 'handoff', projectName, intent, counts, stop_reason: response.stop_reason },
});

console.log(`[cli-test/handoff] DONE. Files written to ${outDir}`);
