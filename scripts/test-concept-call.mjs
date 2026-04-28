/**
 * Test concept T3 LLM call — actual Anthropic API direct call.
 *
 * Reads aiTasks.js source via fs (avoids ESM transitive import issues),
 * extracts TASK_ANALYZE_CONCEPT.systemPrompt + tool schema as inline literals,
 * builds user message exactly the way museAiTasks.runAnalyzeConcept builds it,
 * calls Anthropic API directly, writes outputs to src/result/test/.
 *
 * Run: node scripts/test-concept-call.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// 1) Load .env.local manually (no dotenv dep)
const envText = fs.readFileSync(path.join(ROOT, '.env.local'), 'utf-8');
const apiKey = envText.match(/^ANTHROPIC_API_KEY=(.+)$/m)?.[1]?.trim();
if (!apiKey) throw new Error('ANTHROPIC_API_KEY not found in .env.local');

// 2) Read aiTasks.js source and extract TASK_ANALYZE_CONCEPT.systemPrompt as plain string
const aiTasksSrc = fs.readFileSync(path.join(ROOT, 'src/data/muse/aiTasks.js'), 'utf-8');

// extract systemPrompt block: from `systemPrompt: \`` (after TASK_ANALYZE_CONCEPT) until matching backtick
const conceptStart = aiTasksSrc.indexOf('export const TASK_ANALYZE_CONCEPT');
if (conceptStart < 0) throw new Error('TASK_ANALYZE_CONCEPT not found');
const promptStartIdx = aiTasksSrc.indexOf('systemPrompt: `', conceptStart);
const promptBodyStart = promptStartIdx + 'systemPrompt: `'.length;
// Find closing backtick that's followed by `,` (the next field)
let i = promptBodyStart;
let depth = 0;
let systemPrompt = '';
while (i < aiTasksSrc.length) {
  const ch = aiTasksSrc[i];
  if (ch === '\\') {
    // escape char — copy next char literally (un-escape \` and \$ and \\)
    const next = aiTasksSrc[i + 1];
    if (next === '`') systemPrompt += '`';
    else if (next === '$') systemPrompt += '$';
    else if (next === '\\') systemPrompt += '\\';
    else systemPrompt += '\\' + next;
    i += 2;
    continue;
  }
  if (ch === '`' && depth === 0) break; // closing
  systemPrompt += ch;
  i += 1;
}

// 3) User input (exactly as user provided in chat)
const intent = 'functional dashboard with retro mood and paper texture';
const projectName = 'retro mood dashboard';

const refs = [
  {
    id: '248c3094-8bca-47b7-9d2f-c65dd51081bf',
    title: 'Grainy Ethereal Gradient',
    note: 'use retro style paper grained background with fixed position\n- paper texture',
    useLayers: [],
    attachIdx: 1,
    attachFile: '01-248c3094-8bca-47b7-9d2f-c65dd51081bf.jpg',
  },
  {
    id: '88fd6205-e3d4-4cd2-9748-65941efcfaf5',
    title: 'Typographic Weight Specimen',
    note: 'bold & contrast typography Hierarchy',
    useLayers: [],
    attachIdx: 2,
    attachFile: '02-88fd6205-e3d4-4cd2-9748-65941efcfaf5.jpg',
  },
  {
    id: '6c113186-bbca-4010-9250-38e1a087f1ce',
    title: 'Minimalist Dashboard Structure',
    note: 'Editorial Dashboard Layout\n- blend grid and gradient background',
    useLayers: [],
    attachIdx: 3,
    attachFile: '03-6c113186-bbca-4010-9250-38e1a087f1ce.jpg',
  },
];

// 4) Build extractedPool exactly like museAiTasks.runAnalyzeConcept does (extracted/tags/dominantColors empty since we don't have T1 results here — same as wizard sending placeholder for un-tagged refs)
const extractedPool = refs.map((r) => ({
  id: r.id,
  attachIdx: r.attachIdx,
  attachFile: r.attachFile,
  title: r.title,
  tags: {},
  dominantColors: [],
  extracted: {},
}));

// 5) Build refNotesBlock (same as buildReferenceNotesBlock in museAiTasks)
const withNotes = refs.filter((r) => r.note && r.note.trim().length > 0);
const refNotesBlock = withNotes.length === 0 ? '' : `

=== Per-Reference Notes (HIGHEST PRIORITY per ref) ===
사용자가 각 ref 별로 적은 차용 의도. 이 노트가 명시한 부분만 출력에 반영하고
명시되지 않은 layer 는 출처에서 제외 (차집합 = 무시).
${withNotes.map((r) => `- ${r.id} (첨부 ${r.attachIdx}번 = \`${r.attachFile}\`): "${r.note.trim()}"`).join('\n')}

각 노트 출처 토큰의 decisionRationale.appliedReferenceNote 에 verbatim 인용.`;

// 6) userMessage content
const userText1 = `=== Pre-extracted references (${refs.length}) ===

${JSON.stringify(extractedPool, null, 2)}

=== End of references ===${refNotesBlock}`;

const userText2 = `Intent: "${intent}"
Reference count: ${refs.length} (ids = [${refs.map((r) => r.id).join(', ')}])

Pre-extracted reference data is provided above as JSON.
Compose ONE Korean prompt 200-800 chars covering all 5 bands.`;

// 7) Tool schema (inline, mirrors aiTasks.js TASK_ANALYZE_CONCEPT.toolSchemas[0])
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

console.log('[test-concept-call] system prompt length:', systemPrompt.length);
console.log('[test-concept-call] user text length:', userText1.length + userText2.length);
console.log('[test-concept-call] calling Anthropic API ...');

const res = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json',
  },
  body: JSON.stringify(payload),
});

if (!res.ok) {
  const text = await res.text();
  throw new Error(`Anthropic API ${res.status}: ${text}`);
}

const response = await res.json();
console.log('[test-concept-call] stop_reason:', response.stop_reason);
console.log('[test-concept-call] content blocks:', response.content?.length);

const toolUse = (response.content || []).find((b) => b.type === 'tool_use' && b.name === 'submit_concept_prompt');
if (!toolUse) {
  throw new Error(`No tool_use response. content: ${JSON.stringify(response.content)}`);
}

const promptText = toolUse.input?.prompt || '';
console.log('[test-concept-call] received prompt length:', promptText.length);

// 8) Build paste block + concept-prompt.md exactly like buildAiPasteBlock + exportConceptPrompt would
const attachmentTable = refs.map((r) => {
  const layerStr = r.useLayers.length > 0 ? `차용: [${r.useLayers.join(', ')}]` : '차용: 자동(전체)';
  const note = r.note ? ` — ${r.note.replace(/\n/g, ' / ')}` : '';
  return `- 첨부 ${r.attachIdx}번: \`${r.attachFile}\` (${r.title}) — ${layerStr}${note}`;
}).join('\n');

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

_Generated by MUSE on ${new Date().toISOString().slice(0, 10)} (mode: concept) — REAL LLM call via test-concept-call.mjs_
`;

const conceptPromptMd = `# ${projectName} — Concept Prompt

_Generated by MUSE on ${new Date().toISOString().slice(0, 10)} (mode: concept) — REAL LLM call_

> ✅ 본 산출물은 **실제 Anthropic API 호출 결과** (Claude Haiku 4.5, 새 system prompt 룰 적용).
> 호출 스크립트: \`scripts/test-concept-call.mjs\`

## Reference Images (외부 AI 에 첨부할 정확한 파일명)

${attachmentTable}

> 외부 AI 도구에 paste 할 때 위 파일명을 그대로 첨부 순번대로 업로드.

## 사용 방법

아래 "AI Paste Block" 단락을 외부 AI 도구 (Claude Design / Gemini / AI Studio / ChatGPT 등) 에
그대로 붙여넣고 위 매칭 표의 파일을 첨부 순번대로 함께 업로드하세요.

## Prompt (raw — 5 섹션 markdown, LLM 출력 그대로)

${promptText}

---

${pasteBlock}

---

**프로젝트 의도**: ${intent}
`;

const outDir = path.join(ROOT, 'src/result/test');
fs.writeFileSync(path.join(outDir, 'ai-paste-block.md'), pasteBlock);
fs.writeFileSync(path.join(outDir, 'concept-prompt.md'), conceptPromptMd);

// Save full LLM response for debugging
fs.writeFileSync(path.join(outDir, '_raw-response.json'), JSON.stringify(response, null, 2));

console.log('[test-concept-call] DONE. Files written to src/result/test/');
console.log('  - ai-paste-block.md');
console.log('  - concept-prompt.md');
console.log('  - _raw-response.json (debug)');
