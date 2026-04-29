/**
 * cli-test system — T3 (system mode) production-identical LLM call.
 *
 * Usage:
 *   node scripts/cli-test/system.mjs --input path/to/input.json [--out path/to/result/dir]
 *
 * input.json schema:
 *   {
 *     "projectName": "editorial minimal",
 *     "intent": "흑백 대비 매거진",
 *     "refs": [
 *       { "id": "248c3094-...", "note": "ref-001 의 hero 영역 색감만 차용", "useLayers": ["color"] },
 *       ...
 *     ]
 *   }
 *
 * Output (default to src/result/test/):
 *   - system-tokens.json     (parsed tool input)
 *   - system-vd.md           (visualDirection.markdown)
 *   - _raw-response.json
 *   - _input.json
 *
 * NOTE: tags enum is left as free-form here for baseline portability.
 *       Production wizard call uses preset enum from src/data/muse/tag.
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
  console.error('Usage: node scripts/cli-test/system.mjs --input <path/to/input.json> [--out <dir>]');
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
console.log('[cli-test/system] fetching service_role key via supabase CLI ...');
const serviceRoleKey = getServiceRoleKey(supabaseUrl);
console.log('[cli-test/system] fetching reference_items from Supabase ...');
const refRows = await fetchReferenceRows(supabaseUrl, serviceRoleKey, inputRefs.map((r) => r.id));
const rowById = Object.fromEntries(refRows.map((r) => [r.id, r]));
console.log(`[cli-test/system] fetched ${refRows.length}/${inputRefs.length} reference_items rows`);

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

/* ----- extractedPool (museAiTasks.runAnalyzeTokens 와 동일) ----- */
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

/* ----- system prompt + user message (production-identical) ----- */
const systemPrompt = extractSystemPromptByExportName('TASK_ANALYZE_TOKENS');
const refNotesBlock = buildReferenceNotesBlock(refs);

const layerCurationLines = extractedPool.some((r) => r.useLayers.length > 0)
  ? extractedPool
      .filter((r) => r.useLayers.length > 0)
      .map((r) => `${r.id}: ONLY use [${r.useLayers.join(', ')}]`)
      .join('\n')
  : '(없음 — 모든 ref의 모든 layer 자유 사용)';

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

/* ----- tool schema (BASELINE — 변경 전 schema 미러링) -----
 * tags enum 은 프리프리셋 의존성이라 free-form string 으로 둠 (baseline 비교에 무영향)
 */
const toolSchema = {
  name: 'submit_design_system',
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
              genre: { type: 'array', items: { type: 'string' }, minItems: 0, maxItems: 2 },
              style: { type: 'array', items: { type: 'string' }, minItems: 0, maxItems: 3 },
              subject: { type: 'array', items: { type: 'string' }, minItems: 0, maxItems: 3 },
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

console.log('[cli-test/system] system prompt length:', systemPrompt.length);
console.log('[cli-test/system] user text length:', userText1.length + userText2.length);
console.log('[cli-test/system] calling Anthropic API ...');
const response = await callAnthropic({ apiKey, payload });
console.log('[cli-test/system] stop_reason:', response.stop_reason);

const toolUse = (response.content || []).find((b) => b.type === 'tool_use' && b.name === 'submit_design_system');
if (!toolUse) {
  throw new Error(`No tool_use response. content: ${JSON.stringify(response.content)}`);
}
const result = toolUse.input || {};

/* ----- summary ----- */
const counts = {
  color: result.tokens?.color?.length || 0,
  typography: result.tokens?.typography?.length || 0,
  layout: result.tokens?.layout?.length || 0,
  gradient: result.tokens?.gradient?.length || 0,
  vdMarkdownLen: result.visualDirection?.markdown?.length || 0,
};
console.log('[cli-test/system] counts:', counts);

writeTestOutputs(outDir, {
  'system-tokens.json': result.tokens || {},
  'system-vd.md': `# ${projectName} — Visual Direction (system baseline)

${realCallHeader('system')}

${result.visualDirection?.markdown || '(empty)'}
`,
  '_raw-response.json': response,
  '_input.json': input,
  '_summary.json': { mode, projectName, intent, counts, stop_reason: response.stop_reason },
});

console.log(`[cli-test/system] DONE. Files written to ${outDir}`);
