/**
 * cli-test concept — T3 (concept) production-identical LLM call.
 *
 * Usage:
 *   node scripts/cli-test/concept.mjs --input path/to/input.json [--out path/to/result/dir]
 *
 * input.json schema:
 *   {
 *     "projectName": "retro mood dashboard",
 *     "intent": "functional dashboard with retro mood and paper texture",
 *     "refs": [
 *       { "id": "248c3094-...", "note": "use retro style paper grained background ...", "useLayers": [] },
 *       ...
 *     ]
 *   }
 *
 * Output (default to src/result/test/):
 *   - ai-paste-block.md
 *   - concept-prompt.md
 *   - _raw-response.json
 *   - _input.json (snapshot of input used for this run)
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  ROOT, loadEnv, getServiceRoleKey, fetchReferenceRows,
  extractSystemPromptByExportName, buildReferenceNotesBlock, buildAttachmentRow,
  callAnthropic, writeTestOutputs, realCallHeader,
} from './_lib.mjs';

/* ----- args ----- */
const args = process.argv.slice(2);
const inputPath = args[args.indexOf('--input') + 1];
const outArg = args[args.indexOf('--out') + 1];
if (!inputPath || inputPath === '--out') {
  console.error('Usage: node scripts/cli-test/concept.mjs --input <path/to/input.json> [--out <dir>]');
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
console.log('[cli-test/concept] fetching service_role key via supabase CLI ...');
const serviceRoleKey = getServiceRoleKey(supabaseUrl);
console.log('[cli-test/concept] fetching reference_items from Supabase ...');
const refRows = await fetchReferenceRows(supabaseUrl, serviceRoleKey, inputRefs.map((r) => r.id));
const rowById = Object.fromEntries(refRows.map((r) => [r.id, r]));
console.log(`[cli-test/concept] fetched ${refRows.length}/${inputRefs.length} reference_items rows`);

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

/* ----- extractedPool (museAiTasks.runAnalyzeConcept 와 동일) ----- */
const extractedPool = refs.map((r) => ({
  id: r.id,
  attachIdx: r.attachIdx,
  attachFile: r.attachFile,
  title: r.title,
  tags: r.tags,
  dominantColors: r.dominantColors,
  extracted: r.extracted,
}));

/* ----- system prompt + user message (production-identical) ----- */
const systemPrompt = extractSystemPromptByExportName('TASK_ANALYZE_CONCEPT');
const refNotesBlock = buildReferenceNotesBlock(refs);

const userText1 = `=== Pre-extracted references (${refs.length}) ===

${JSON.stringify(extractedPool, null, 2)}

=== End of references ===${refNotesBlock}`;

const userText2 = `Intent: "${intent}"
Reference count: ${refs.length} (ids = [${refs.map((r) => r.id).join(', ')}])

Pre-extracted reference data is provided above as JSON.
Compose ONE Korean prompt 200-800 chars covering all 5 bands.`;

const toolSchema = {
  name: 'submit_concept_prompt',
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
};

const payload = {
  model: 'claude-haiku-4-5',
  max_tokens: 1024,
  system: systemPrompt,
  tools: [toolSchema],
  tool_choice: { type: 'tool', name: 'submit_concept_prompt' },
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

console.log('[cli-test/concept] system prompt length:', systemPrompt.length);
console.log('[cli-test/concept] user text length:', userText1.length + userText2.length);
console.log('[cli-test/concept] calling Anthropic API ...');
const response = await callAnthropic({ apiKey, payload });
console.log('[cli-test/concept] stop_reason:', response.stop_reason);

const toolUse = (response.content || []).find((b) => b.type === 'tool_use' && b.name === 'submit_concept_prompt');
if (!toolUse) {
  throw new Error(`No tool_use response. content: ${JSON.stringify(response.content)}`);
}
const promptText = toolUse.input?.prompt || '';
console.log('[cli-test/concept] received prompt length:', promptText.length);

/* ----- build outputs (museExport.exportConceptPrompt 패턴) ----- */
const attachmentTable = refs.map(buildAttachmentRow).join('\n');

const pasteBlock = `# ${projectName} — AI Paste Block

> Claude Design / Gemini / AI Studio / ChatGPT 등 외부 AI 도구에 본문을 paste + 첨부 이미지 ${refs.length}장 함께 업로드.

## Goal

${intent}

## Concept Prompt
${promptText}

## 첨부물 매칭 (CRITICAL — 외부 AI 가 부분 차용 인식하도록)

${attachmentTable}

> 위 매칭 표는 외부 AI 가 본문의 ref-XXX 언급과 첨부 이미지를 연결하기 위한 것.
> 각 ref 의 "차용" 항목 외 layer 는 ref 에서 가져오지 않습니다 (차집합 = 무시).

---

${realCallHeader('concept')}`;

const conceptPromptMd = `# ${projectName} — Concept Prompt

${realCallHeader('concept')}

## Reference Images (외부 AI 에 첨부할 정확한 파일명)

${attachmentTable}

## 사용 방법

아래 "AI Paste Block" 단락을 외부 AI 도구 에 그대로 붙여넣고 위 매칭 표의 파일을 첨부 순번대로 업로드.

## Prompt (raw — LLM 출력 그대로)

${promptText}

---

${pasteBlock}

---

**프로젝트 의도**: ${intent}
`;

writeTestOutputs(outDir, {
  'ai-paste-block.md': pasteBlock,
  'concept-prompt.md': conceptPromptMd,
  '_raw-response.json': response,
  '_input.json': input,
});

console.log(`[cli-test/concept] DONE. Files written to ${outDir}`);
console.log('  - ai-paste-block.md');
console.log('  - concept-prompt.md');
console.log('  - _raw-response.json (debug, full Anthropic response)');
console.log('  - _input.json (snapshot of input used)');
