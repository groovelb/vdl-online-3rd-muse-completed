/**
 * MUSE AI Tasks — 태스크별 실행 헬퍼
 *
 * 페이지/Playground에서 공통으로 쓰는 T1/T2/T3 호출 래퍼.
 * `aiTasks.js` 의 정의 + `museAi.js` 의 클라이언트 + preset helper를 조합.
 */

import {
  callAnthropic,
  extractToolInput,
  extractAllToolInputs,
  extractText,
  toImageBlock,
  imageUrlToBase64DataUrl,
  resizeDataUrl,
} from './museAi';
import {
  TASK_AUTO_TAG,
  TASK_RECOMMEND,
  TASK_ANALYZE_TOKENS,
} from '../data/muse';

/**
 * 재시도 가능한 에러인가 판정.
 *   - network/timeout: retry
 *   - 429 (rate limit): retry
 *   - 5xx: retry
 *   - 4xx (429 제외): no retry (재호출해도 같은 에러)
 *   - tool_use 응답 없음: 1회 retry (Haiku 가 간헐적으로 schema 위반)
 */
function isRetryableError(err) {
  if (!err) return false;
  const status = err.status;
  if (!status) return true; // network/timeout 등 status 없음
  if (status === 429) return true;
  if (status >= 500 && status < 600) return true;
  if (status >= 400 && status < 500) return false;
  return false;
}

/**
 * T1 · 이미지 URL → 자동 태깅 (자동 재시도 3회)
 *   - 재시도 조건: network / 429 / 5xx / tool_use 응답 없음
 *   - 포기 조건: 4xx (except 429) — 설정/이미지 문제
 * @returns {Promise<{ tags, dominantColors, title, extracted }>}
 */
export async function runAutoTag({ imageUrl, model, maxAttempts = 3 }) {
  const dataUrl = imageUrl.startsWith('data:')
    ? imageUrl
    : await imageUrlToBase64DataUrl(imageUrl);
  const resized = await resizeDataUrl(dataUrl, 1024);
  const imageBlock = toImageBlock(resized);
  if (!imageBlock) throw new Error('이미지 블록 생성 실패');

  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await callAnthropic({
        model: model || TASK_AUTO_TAG.model,
        max_tokens: 512,
        system: TASK_AUTO_TAG.systemPrompt,
        tools: [TASK_AUTO_TAG.toolSchema],
        tool_choice: { type: 'tool', name: TASK_AUTO_TAG.toolSchema.name },
        messages: [
          {
            role: 'user',
            content: [imageBlock, { type: 'text', text: TASK_AUTO_TAG.userMessageTemplate }],
          },
        ],
      });
      const toolInput = extractToolInput(response, TASK_AUTO_TAG.toolSchema.name);
      if (!toolInput) {
        throw new Error(`T1 tool_use 응답 없음. text: ${extractText(response) || '(empty)'}`);
      }
      return toolInput;
    } catch (e) {
      lastError = e;
      if (!isRetryableError(e) || attempt === maxAttempts) {
        throw e;
      }
      // exponential backoff: 500ms → 1500ms
      const delay = 500 * Math.pow(3, attempt - 1);
      // eslint-disable-next-line no-console
      console.warn(`[runAutoTag] attempt ${attempt} 실패, ${delay}ms 후 재시도`, e?.message);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}

/**
 * T2 · 의도 문장 + 아카이브 메타 → top-N 추천
 * @returns {Promise<{ recommendedIds, reasons }>}
 */
export async function runRecommend({ intent, type, archive, n = 6, model }) {
  const compactArchive = archive.map((r) => ({
    id: r.id,
    title: r.title,
    tags: r.tags,
    dominantColors: r.dominantColors,
  }));

  const userText = TASK_RECOMMEND.userMessageTemplate
    .replace('{{intent}}', intent)
    .replace('{{type}}', type)
    .replace('{{n}}', String(n))
    .replace('{{archiveCount}}', String(compactArchive.length))
    .replace('{{archiveJson}}', JSON.stringify(compactArchive, null, 2));

  const response = await callAnthropic({
    model: model || TASK_RECOMMEND.model,
    max_tokens: 1024,
    system: TASK_RECOMMEND.systemPrompt,
    tools: [TASK_RECOMMEND.toolSchema],
    tool_choice: { type: 'tool', name: TASK_RECOMMEND.toolSchema.name },
    messages: [{ role: 'user', content: userText }],
  });

  const toolInput = extractToolInput(response, TASK_RECOMMEND.toolSchema.name);
  if (!toolInput) {
    throw new Error(`T2 tool_use 응답 없음. text: ${extractText(response) || '(empty)'}`);
  }
  return toolInput;
}

/**
 * T3 · 이미지 N장 + 의도 → tokens + visualDirection(MD)
 * @param {object} params
 * @param {string} params.intent
 * @param {string} params.type
 * @param {Array<{id, thumbnailUrl, tags?, dominantColors?}>} params.selectedRefs - 최대 4장 권장
 * @param {string} [params.model]
 * @param {function} [params.onProgress] - (layers) => void, 현재는 단발(완료 시 전부 done)
 * @returns {Promise<{ tokens, visualDirection }>}
 */
export async function runAnalyzeTokens({ intent, type, selectedRefs, model, onProgress }) {
  if (!selectedRefs?.length) throw new Error('최소 1장 이상 필요');

  // 사전 추출된 데이터만 payload 로 전송. 이미지 없음.
  const extractedPool = selectedRefs.map((ref) => ({
    id: ref.id,
    title: ref.title || null,
    tags: ref.tags || {},
    dominantColors: ref.dominantColors || [],
    extracted: ref.extracted || {},
  }));

  const content = [
    {
      type: 'text',
      text: `=== Pre-extracted references (${selectedRefs.length}) ===

${JSON.stringify(extractedPool, null, 2)}

=== End of references ===`,
    },
    {
      type: 'text',
      text: TASK_ANALYZE_TOKENS.userMessageTemplate
        .replace('{{intent}}', intent)
        .replace('{{type}}', type)
        .replace('{{count}}', String(selectedRefs.length))
        .replace('{{ids}}', selectedRefs.map((r) => r.id).join(', ')),
    },
  ];

  // 진행 상태 시작 — 호출 전 레이어 모두 running
  onProgress?.(
    ['color', 'typography', 'layout', 'gradient', 'visualDirection'].map((key, i) => ({
      key,
      status: i === 0 ? 'running' : 'pending',
    })),
  );

  const response = await callAnthropic({
    model: model || TASK_ANALYZE_TOKENS.model,
    max_tokens: 4096,
    system: TASK_ANALYZE_TOKENS.systemPrompt,
    tools: TASK_ANALYZE_TOKENS.toolSchemas,
    tool_choice: { type: 'any' },
    messages: [{ role: 'user', content }],
  });

  const allTools = extractAllToolInputs(response);
  const tokens = allTools.submit_tokens || null;
  const visualDirection = allTools.submit_visual_direction || null;

  if (!tokens && !visualDirection) {
    throw new Error(`T3 tool_use 응답 없음. text: ${extractText(response) || '(empty)'}`);
  }

  // 완료 상태 전달
  onProgress?.(
    ['color', 'typography', 'layout', 'gradient', 'visualDirection'].map((key) => ({
      key,
      status: 'done',
    })),
  );

  return { tokens, visualDirection };
}
