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
 * T1 · 이미지 URL → 자동 태깅
 * @param {object} params
 * @param {string} params.imageUrl - 원본 이미지 URL (data URL / bundled / http)
 * @param {string} [params.model] - 모델 override (기본: TASK_AUTO_TAG.model)
 * @returns {Promise<{ tags, dominantColors, title }>}
 */
export async function runAutoTag({ imageUrl, model }) {
  const dataUrl = imageUrl.startsWith('data:')
    ? imageUrl
    : await imageUrlToBase64DataUrl(imageUrl);
  const resized = await resizeDataUrl(dataUrl, 1024);
  const imageBlock = toImageBlock(resized);
  if (!imageBlock) throw new Error('이미지 블록 생성 실패');

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

  // 이미지 512px 리사이즈 (T1 primary signal + image verification 역할 분담)
  const imageBlocks = [];
  for (const ref of selectedRefs) {
    const dataUrl = ref.thumbnailUrl.startsWith('data:')
      ? ref.thumbnailUrl
      : await imageUrlToBase64DataUrl(ref.thumbnailUrl);
    const resized = await resizeDataUrl(dataUrl, 512);
    imageBlocks.push({ ref, block: toImageBlock(resized) });
  }

  // T1 분석 결과를 JSON 헤더로 상단 배치 (PRIMARY signal)
  const t1Summary = selectedRefs.map((ref) => ({
    id: ref.id,
    tags: ref.tags || {},
    dominantColors: ref.dominantColors || [],
    title: ref.title || null,
  }));

  // content 구성:
  //   1) T1 JSON 헤더 (primary classification signal)
  //   2) 이미지들 + 각각의 경량 id 앵커 (secondary, concrete value 추출용)
  //   3) 최종 지시 (intent/type/count)
  const content = [];
  content.push({
    type: 'text',
    text: `=== PRIMARY SIGNAL: T1 pre-analysis (${selectedRefs.length} references) ===

${JSON.stringify(t1Summary, null, 2)}

=== SECONDARY: images below (512px, same order as ids above) ===`,
  });
  imageBlocks.forEach(({ ref, block }) => {
    content.push(block);
    content.push({ type: 'text', text: `↑ image for id: ${ref.id}` });
  });
  content.push({
    type: 'text',
    text: TASK_ANALYZE_TOKENS.userMessageTemplate
      .replace('{{intent}}', intent)
      .replace('{{type}}', type)
      .replace('{{count}}', String(selectedRefs.length))
      .replace('{{ids}}', selectedRefs.map((r) => r.id).join(', ')),
  });

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
