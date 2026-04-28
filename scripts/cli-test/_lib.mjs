/**
 * cli-test 공통 라이브러리.
 *
 * Production 동일 조건 호출의 핵심 함수들:
 *  - .env.local 읽기 (ANTHROPIC_API_KEY, VITE_SUPABASE_URL)
 *  - supabase CLI 로 service_role key 자동 획득 (사용자 입력 0)
 *  - reference_items 의 실제 데이터 fetch (RLS 우회)
 *  - aiTasks.js 에서 systemPrompt 동적 추출 (fs)
 *  - Anthropic API 직접 호출
 *  - museAiTasks 와 동일 형식의 user message 빌드
 *  - 결과 + _raw-response.json 저장 (검증용)
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '../..');

/* ============================================
 * 1. 환경 자원 — .env.local + supabase CLI
 * ============================================ */

export function loadEnv() {
  const envText = fs.readFileSync(path.join(ROOT, '.env.local'), 'utf-8');
  const apiKey = envText.match(/^ANTHROPIC_API_KEY=(.+)$/m)?.[1]?.trim();
  const supabaseUrl = envText.match(/^VITE_SUPABASE_URL=(.+)$/m)?.[1]?.trim();
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not found in .env.local');
  if (!supabaseUrl) throw new Error('VITE_SUPABASE_URL not found in .env.local');
  return { apiKey, supabaseUrl };
}

export function getServiceRoleKey(supabaseUrl) {
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!projectRef) throw new Error('Cannot extract project ref from supabaseUrl');
  const out = execSync(`pnpm supabase projects api-keys --project-ref ${projectRef}`, {
    encoding: 'utf-8',
    cwd: ROOT,
  });
  const key = out.match(/service_role\s*\|\s*(eyJ[A-Za-z0-9._-]+)/)?.[1];
  if (!key) throw new Error('service_role key not found in supabase CLI output');
  return key;
}

/* ============================================
 * 2. supabase reference_items 실제 데이터
 * ============================================ */

export async function fetchReferenceRows(supabaseUrl, serviceRoleKey, refIds) {
  const idsCsv = refIds.map((id) => `"${id}"`).join(',');
  const url = `${supabaseUrl}/rest/v1/reference_items?id=in.(${idsCsv})&select=id,title,tags,dominant_colors,extracted`;
  const res = await fetch(url, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  return res.json();
}

/* ============================================
 * 3. aiTasks.js 의 systemPrompt 동적 추출
 *   - aiTasks.js 가 ESM + transitive imports 라
 *     dynamic import 하기 까다로워서 fs 로 텍스트 추출.
 *   - concept system prompt 는 정적 (no ${} interpolation) 이라 안전.
 * ============================================ */

export function extractSystemPromptByExportName(exportName) {
  const aiTasksSrc = fs.readFileSync(path.join(ROOT, 'src/data/muse/aiTasks.js'), 'utf-8');
  const taskStart = aiTasksSrc.indexOf(`export const ${exportName}`);
  if (taskStart < 0) throw new Error(`${exportName} not found in aiTasks.js`);
  const promptStartIdx = aiTasksSrc.indexOf('systemPrompt: `', taskStart);
  const promptBodyStart = promptStartIdx + 'systemPrompt: `'.length;

  let i = promptBodyStart;
  let result = '';
  while (i < aiTasksSrc.length) {
    const ch = aiTasksSrc[i];
    if (ch === '\\') {
      const next = aiTasksSrc[i + 1];
      if (next === '`') result += '`';
      else if (next === '$') result += '$';
      else if (next === '\\') result += '\\';
      else result += '\\' + next;
      i += 2;
      continue;
    }
    if (ch === '`') break;
    result += ch;
    i += 1;
  }
  return result;
}

/* ============================================
 * 4. Helpers — paste block / attachment table
 *   museAiTasks + handoffConverters 와 동일 패턴
 * ============================================ */

export function inferAttachExt(url) {
  if (!url) return '.jpg';
  const m = String(url).match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  if (!m) return '.jpg';
  const ext = m[1].toLowerCase();
  return ext === 'jpeg' ? '.jpg' : `.${ext}`;
}

/**
 * museAiTasks.runAnalyze* 의 buildReferenceNotesBlock 동일 형식.
 * @param {Array<{id, note, attachIdx, attachFile}>} refs
 */
export function buildReferenceNotesBlock(refs) {
  const withNotes = refs.filter((r) => r.note && String(r.note).trim().length > 0);
  if (withNotes.length === 0) return '';
  const lines = withNotes.map((r) => `- ${r.id} (첨부 ${r.attachIdx}번 = \`${r.attachFile}\`): "${String(r.note).trim()}"`);
  return `\n\n=== Per-Reference Notes (HIGHEST PRIORITY per ref) ===
사용자가 각 ref 별로 적은 차용 의도. 이 노트가 명시한 부분만 출력에 반영하고
명시되지 않은 layer 는 출처에서 제외 (차집합 = 무시).
${lines.join('\n')}

각 노트 출처 토큰의 decisionRationale.appliedReferenceNote 에 verbatim 인용.`;
}

/**
 * handoffConverters.buildAttachmentRow 와 동일.
 */
export function buildAttachmentRow(ref) {
  const layers = ref.useLayers || [];
  const layerStr = layers.length > 0 ? `차용: [${layers.join(', ')}]` : '차용: 자동(전체)';
  const note = ref.note ? ` — ${String(ref.note).replace(/\n/g, ' / ')}` : '';
  const title = ref.title ? ` (${ref.title})` : '';
  return `- 첨부 ${ref.attachIdx}번: \`${ref.attachFile}\`${title} — ${layerStr}${note}`;
}

/* ============================================
 * 5. Anthropic API direct call
 * ============================================ */

export async function callAnthropic({ apiKey, payload }) {
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
    throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

/* ============================================
 * 6. Output writer
 * ============================================ */

export function writeTestOutputs(outDir, files) {
  fs.mkdirSync(outDir, { recursive: true });
  for (const [filename, content] of Object.entries(files)) {
    const data = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
    fs.writeFileSync(path.join(outDir, filename), data);
  }
}

/**
 * Mark all output markdown with explicit "REAL LLM call" header.
 * Prevents Claude from confusing simulated content with real LLM output.
 */
export function realCallHeader(taskName) {
  const ts = new Date().toISOString();
  return `_Generated by MUSE cli-test/${taskName} on ${ts.slice(0, 10)} ${ts.slice(11, 19)} UTC_

> ✅ **REAL LLM call** via \`scripts/cli-test/${taskName}.mjs\` — production-identical (supabase reference_items 실제 데이터 + system prompt 동적 추출 + Anthropic API 직접 호출).
`;
}
