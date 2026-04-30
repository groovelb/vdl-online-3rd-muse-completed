/**
 * Generate static tokens for hero ScatterGallery.
 *
 * src/assets/example/*.{jpg,jpeg,png} 각 이미지를 Anthropic Vision 으로 분석해
 * { tags, dominantColors, title } 결과를 src/data/exampleTokens.json 에 저장.
 *
 * Self-contained — production T1 의 lite 버전 (preset enum 없이 free-form tags).
 *
 * Usage:
 *   node scripts/gen-example-tokens.mjs           # 누락된 이미지만 처리
 *   node scripts/gen-example-tokens.mjs --force   # 전체 재생성
 *
 * Requires .env.local with ANTHROPIC_API_KEY.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const FORCE = process.argv.includes('--force');
const EXAMPLE_DIR = path.join(ROOT, 'src/assets/example');
const OUT_PATH = path.join(ROOT, 'src/data/exampleTokens.json');

/* ----- env ----- */
function loadEnv() {
  const envText = fs.readFileSync(path.join(ROOT, '.env.local'), 'utf-8');
  const apiKey = envText.match(/^ANTHROPIC_API_KEY=(.+)$/m)?.[1]?.trim();
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not found in .env.local');
  return { apiKey };
}

/* ----- task (lite, self-contained) ----- */
const MODEL = 'claude-haiku-4-5';

const SYSTEM_PROMPT = `You are MUSE's per-image visual tagger.

Given a single design reference image, return:
- tags: 3-6 short single-word descriptors covering visual tone (e.g. editorial, brutalist, pastel, gradient, minimal, cinematic, retro, vivid, dark, mono)
- dominantColors: 3-5 HEX (#RRGGBB) ordered from most prominent to accent
- title: 2-5 word English descriptor of the visual mood (NOT literal subject — describe the feel)

Rules:
- Tags must be lowercase, single English word, hyphens allowed (e.g. "off-white", "low-contrast")
- Do NOT describe people, brands, or specific objects in tags
- Respond via the submit_tagging tool only. No prose.`;

const TOOL_SCHEMA = {
  name: 'submit_tagging',
  description: 'Submit visual tags, dominant colors, and a short mood title.',
  input_schema: {
    type: 'object',
    properties: {
      tags: {
        type: 'array',
        items: { type: 'string', minLength: 2, maxLength: 24 },
        minItems: 3,
        maxItems: 6,
      },
      dominantColors: {
        type: 'array',
        items: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
        minItems: 3,
        maxItems: 5,
      },
      title: { type: 'string', minLength: 3, maxLength: 40 },
    },
    required: ['tags', 'dominantColors', 'title'],
  },
};

const USER_PROMPT = 'Analyze this reference image and submit tags, dominant colors, and a short mood title.';

/* ----- image → base64 + media type ----- */
function readImage(filePath) {
  const buf = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mediaType = ext === '.png' ? 'image/png' : 'image/jpeg';
  return { base64: buf.toString('base64'), mediaType };
}

/* ----- Anthropic call ----- */
async function callT1({ apiKey, base64, mediaType }) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      tools: [TOOL_SCHEMA],
      tool_choice: { type: 'tool', name: TOOL_SCHEMA.name },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
            { type: 'text', text: USER_PROMPT },
          ],
        },
      ],
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Anthropic ${res.status}: ${txt.slice(0, 400)}`);
  }
  const json = await res.json();
  const tool = (json.content || []).find((b) => b.type === 'tool_use');
  if (!tool?.input) throw new Error(`No tool_use in response: ${JSON.stringify(json).slice(0, 400)}`);
  return tool.input;
}

/* ----- main ----- */
async function main() {
  const { apiKey } = loadEnv();

  const files = fs.readdirSync(EXAMPLE_DIR)
    .filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
    .sort();

  const existing = fs.existsSync(OUT_PATH)
    ? JSON.parse(fs.readFileSync(OUT_PATH, 'utf-8'))
    : {};

  const targets = FORCE ? files : files.filter((f) => !existing[f]);
  console.log(`[gen-example-tokens] ${targets.length} / ${files.length} 이미지 태깅`);

  let processed = 0;
  for (const filename of targets) {
    const filePath = path.join(EXAMPLE_DIR, filename);
    const { base64, mediaType } = readImage(filePath);
    const sizeKB = (base64.length * 0.75 / 1024).toFixed(0);
    process.stdout.write(`  [${++processed}/${targets.length}] ${filename} (${sizeKB}KB) ... `);
    try {
      const result = await callT1({ apiKey, base64, mediaType });
      existing[filename] = result;
      fs.writeFileSync(OUT_PATH, `${JSON.stringify(existing, null, 2)}\n`);
      console.log(`OK · "${result.title}" · tags: ${(result.tags || []).join(', ')}`);
    } catch (e) {
      console.log(`FAIL — ${e.message}`);
    }
  }

  console.log(`[gen-example-tokens] 완료 → ${OUT_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
