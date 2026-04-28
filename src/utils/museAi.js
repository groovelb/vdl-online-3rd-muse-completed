/**
 * MUSE AI 클라이언트 헬퍼
 *
 * 브라우저에서 Anthropic을 직접 호출하지 않고, Supabase Edge Function
 * `anthropic-messages` 를 경유한다. API 키는 Supabase secrets 에만 존재하며
 * 클라이언트 번들에는 포함되지 않는다.
 *
 * 인증: supabase 세션이 있어야 호출 가능 (Edge Function이 JWT 검증).
 */

import { supabase } from '../lib/supabase';

const FUNCTION_NAME = 'anthropic-messages';

function getFunctionUrl() {
  const base = import.meta.env.VITE_SUPABASE_URL;
  if (!base) throw new Error('VITE_SUPABASE_URL 이 설정되지 않았습니다.');
  return `${base}/functions/v1/${FUNCTION_NAME}`;
}

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    const err = new Error('로그인이 필요합니다. (Anthropic 프록시는 인증 사용자 전용)');
    err.status = 401;
    throw err;
  }
  return {
    Authorization: `Bearer ${session.access_token}`,
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    'content-type': 'application/json',
  };
}

/** 헬스 체크 — 세션 유무만 확인. (Edge Function 자체 health 엔드포인트는 없음) */
export async function checkAnthropicHealth() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    ok: Boolean(session),
    hasSession: Boolean(session),
    userId: session?.user?.id ?? null,
    endpoint: getFunctionUrl(),
  };
}

/**
 * Anthropic messages.create 호출 (Supabase Edge Function 경유).
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
  const headers = await getAuthHeaders();
  const res = await fetch(getFunctionUrl(), {
    method: 'POST',
    headers,
    body: JSON.stringify(params),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(
      `Anthropic error ${res.status}: ${data?.error?.message || data?.error || data?.message || 'unknown'}`,
    );
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
 * 동일 tool 이 여러 번 호출됐을 때 input 들을 머지.
 *  - 배열 필드: concat (중복 토큰은 id 기준 dedupe)
 *  - 객체 필드: shallow merge (later wins)
 *  - 스칼라: later wins (모델이 후속 호출에서 refine 한다고 가정)
 *
 * Haiku 4.5 가 tool_choice='any' 에서 submit_tokens 를
 * 레이어별로 분할 호출하는 경우(예: color → typography → layout → gradient
 * 각각 1번씩) 마지막 input 만 살아남으면 다른 레이어가 빈 배열로 사라진다.
 * 이를 방지하기 위해 merge.
 */
function mergeToolInputs(prev, next) {
  if (!prev) return next;
  if (!next) return prev;
  const out = { ...prev };
  for (const [k, v] of Object.entries(next)) {
    if (Array.isArray(v) && Array.isArray(prev[k])) {
      const seen = new Set(prev[k].map((it) => it?.id).filter(Boolean));
      const merged = [...prev[k]];
      for (const item of v) {
        if (item && typeof item === 'object' && item.id) {
          if (!seen.has(item.id)) {
            merged.push(item);
            seen.add(item.id);
          }
        } else {
          merged.push(item);
        }
      }
      out[k] = merged;
    } else if (v && typeof v === 'object' && !Array.isArray(v) && prev[k] && typeof prev[k] === 'object') {
      out[k] = { ...prev[k], ...v };
    } else if (v !== undefined && v !== null && v !== '') {
      out[k] = v;
    }
  }
  return out;
}

/**
 * 모든 tool_use 블록의 input을 이름별 map으로 추출.
 * 동일 tool 이름 중복 호출 시 input merge (덮어쓰기 X).
 * @param {object} response
 * @returns {Record<string, object>} { [toolName]: mergedInput }
 */
export function extractAllToolInputs(response) {
  const blocks = response?.content;
  if (!Array.isArray(blocks)) return {};
  const result = {};
  for (const b of blocks) {
    if (b.type === 'tool_use' && b.name) {
      result[b.name] = mergeToolInputs(result[b.name], b.input);
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
