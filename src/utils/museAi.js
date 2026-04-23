/**
 * MUSE AI 클라이언트 헬퍼
 *
 * 브라우저(Storybook)에서 Anthropic을 직접 호출하지 않고, 로컬 Vite middleware
 * `/api/anthropic/messages` 를 경유한다. API 키는 Node 프로세스에만 머물고
 * 클라이언트 번들에는 포함되지 않는다.
 */

const PROXY_BASE = '/api/anthropic';

/** 헬스 체크 — 키 로드 여부 확인 */
export async function checkAnthropicHealth() {
  const res = await fetch(`${PROXY_BASE}/health`);
  return res.json();
}

/**
 * Anthropic messages.create 호출 (로컬 프록시 경유).
 *
 * @param {object} params
 * @param {string} params.model - 예: 'claude-haiku-4-5-20251001'
 * @param {string} [params.system] - 시스템 프롬프트
 * @param {Array}  params.messages - [{ role: 'user'|'assistant', content: ... }]
 * @param {Array}  [params.tools]  - Tool 정의 배열
 * @param {object} [params.tool_choice] - { type: 'tool', name: '...' } 등
 * @param {number} [params.max_tokens]
 * @param {number} [params.temperature]
 * @returns {Promise<object>} Anthropic API 응답 원본
 */
export async function callAnthropic(params) {
  const res = await fetch(`${PROXY_BASE}/messages`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(`Anthropic error ${res.status}: ${data?.error?.message || data?.error || 'unknown'}`);
    err.status = res.status;
    err.detail = data;
    throw err;
  }
  return data;
}

/**
 * 응답 content blocks에서 첫 tool_use 블록의 input 객체 추출.
 * @param {object} response - Anthropic messages 응답
 * @param {string} [toolName] - 특정 tool 이름으로 필터링
 * @returns {object|null}
 */
export function extractToolInput(response, toolName) {
  const blocks = response?.content;
  if (!Array.isArray(blocks)) return null;
  const block = blocks.find(
    (b) => b.type === 'tool_use' && (!toolName || b.name === toolName),
  );
  return block?.input || null;
}

/**
 * 응답에서 text 블록을 합쳐 평문으로 반환 (폴백/디버그용)
 */
export function extractText(response) {
  const blocks = response?.content;
  if (!Array.isArray(blocks)) return '';
  return blocks.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
}

/**
 * 모든 tool_use 블록의 input을 이름별 map으로 추출.
 * T3처럼 단일 호출에 2 tool이 오는 경우에 사용.
 * @param {object} response
 * @returns {Record<string, object>} { [toolName]: inputObject }
 */
export function extractAllToolInputs(response) {
  const blocks = response?.content;
  if (!Array.isArray(blocks)) return {};
  const result = {};
  for (const b of blocks) {
    if (b.type === 'tool_use' && b.name) {
      result[b.name] = b.input;
    }
  }
  return result;
}

/**
 * 이미지 URL(dataURL 또는 http)을 Anthropic messages content의 image block으로 변환.
 * - data URL이면 base64 + media_type 추출
 * - http URL이면 { type: 'image', source: { type: 'url', url } } 사용 (2025+ 지원)
 */
export function toImageBlock(src) {
  if (!src) return null;
  if (src.startsWith('data:')) {
    const match = src.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return null;
    return {
      type: 'image',
      source: { type: 'base64', media_type: match[1], data: match[2] },
    };
  }
  // http(s) / 절대경로 / Vite import된 /@fs/... 모두 url 타입 시도
  return { type: 'image', source: { type: 'url', url: src } };
}

/**
 * Vite import된 이미지 URL을 base64 data URL로 fetch & 변환.
 * Storybook iframe 내부에서 fetch → Blob → FileReader.
 */
export async function imageUrlToBase64DataUrl(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Image fetch failed: ${res.status} ${url}`);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * File 객체 → base64 data URL 변환 (업로드 flow 전용)
 */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Canvas 리사이즈 — 긴 변을 maxDim 이하로 (AI payload 절감).
 * @param {string} dataUrl - data:image/...;base64,...
 * @param {number} maxDim - 기본 1024
 * @returns {Promise<string>} 리사이즈된 JPEG data URL (품질 0.85)
 */
export function resizeDataUrl(dataUrl, maxDim = 1024) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

