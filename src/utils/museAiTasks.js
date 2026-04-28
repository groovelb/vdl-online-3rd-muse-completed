/**
 * MUSE AI Tasks — 태스크별 실행 헬퍼
 *
 * 페이지/Playground에서 공통으로 쓰는 T1/T2/T3 호출 래퍼.
 * `aiTasks.js` 의 정의 + `museAi.js` 의 클라이언트 + preset helper를 조합.
 */

import {
  callAnthropic,
  extractToolInput,
  extractText,
  toImageBlock,
  imageUrlToBase64DataUrl,
  resizeDataUrl,
} from './museAi';
import {
  TASK_AUTO_TAG,
  TASK_RECOMMEND,
  TASK_ANALYZE_TOKENS,
  TASK_ANALYZE_CONCEPT,
  TASK_ANALYZE_HANDOFF,
} from '../data/muse';

/**
 * 재시도 가능한 에러인가 판정.
 *   - network/timeout: retry
 *   - 429 (rate limit): retry
 *   - 5xx: retry
 *   - 4xx (429 제외): no retry (재호출해도 같은 에러)
 *   - tool_use 응답 없음: 1회 retry (Haiku 가 간헐적으로 schema 위반)
 */
/** ref 의 첨부 파일명 추론 (paste block 의 inferImageExt 와 동일 로직) */
function inferRefAttachFile(ref, idx) {
  const url = ref?.thumbnailUrl || '';
  const m = String(url).match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  let ext = '.jpg';
  if (m) {
    const e = m[1].toLowerCase();
    ext = e === 'jpeg' ? '.jpg' : `.${e}`;
  }
  const prefix = String(idx + 1).padStart(2, '0');
  return `${prefix}-${ref.id}${ext}`;
}

/**
 * Build per-reference notes block for T3 system prompts.
 * selectedRefs[].note 가 비어있지 않은 ref 만 포함.
 * 모델은 이 노트를 verbatim 인용하고 차용 layer 외 부분 무시해야 함.
 */
function buildReferenceNotesBlock(selectedRefs) {
  const withNotes = (selectedRefs || []).filter((r) => r?.note && String(r.note).trim().length > 0);
  if (withNotes.length === 0) return '';
  const lines = withNotes.map((r, idx) => {
    const i = (selectedRefs || []).indexOf(r);
    const file = inferRefAttachFile(r, i >= 0 ? i : idx);
    return `- ${r.id} (첨부 ${(i >= 0 ? i : idx) + 1}번 = \`${file}\`): "${String(r.note).trim()}"`;
  });
  return `\n\n=== Per-Reference Notes (HIGHEST PRIORITY per ref) ===
사용자가 각 ref 별로 적은 차용 의도. 이 노트가 명시한 부분만 출력에 반영하고
명시되지 않은 layer 는 출처에서 제외 (차집합 = 무시).
${lines.join('\n')}

각 노트 출처 토큰의 decisionRationale.appliedReferenceNote 에 verbatim 인용.`;
}

/** extractedPool 에 attachFile 필드 부여 — system prompt 가 정확한 파일명 인용하도록 */
function withAttachFiles(selectedRefs) {
  return (selectedRefs || []).map((ref, i) => ({
    ...ref,
    attachFile: inferRefAttachFile(ref, i),
    attachIdx: i + 1,
  }));
}

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
 * T2 · 의도 문장 + 모드 + 아카이브 메타 → top-N 추천 + 레이어 자동 추천
 * @param {object} params
 * @param {string} params.intent
 * @param {'concept'|'system'|'handoff'} [params.mode='system'] - TP2 모드 (정렬 분기)
 * @param {Array} params.archive
 * @param {number} [params.n=6]
 * @param {string} [params.model]
 * @returns {Promise<{ recommendedIds, reasons, referenceLayer }>}
 */
export async function runRecommend({ intent, mode = 'system', archive, n = 6, model }) {
  const compactArchive = archive.map((r) => ({
    id: r.id,
    title: r.title,
    tags: r.tags,
    dominantColors: r.dominantColors,
  }));

  const userText = TASK_RECOMMEND.userMessageTemplate
    .replace('{{intent}}', intent)
    .replace('{{mode}}', mode)
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
 * T3 · 사전 추출 N장 + 의도 + 모드 + 레이어 큐레이션 + 활용 노트 → tokens + visualDirection(MD)
 * @param {object} params
 * @param {string} params.intent
 * @param {'concept'|'system'|'handoff'} [params.mode='system'] - TP2 합성 톤
 * @param {Array<{id, thumbnailUrl, tags?, dominantColors?, extracted?, useLayers?}>} params.selectedRefs
 * @param {string} [params.userNotes=''] - Step 3 활용 노트 (레퍼런스 본 후 명시 지시, HIGHEST PRIORITY)
 * @param {string} [params.model]
 * @param {function} [params.onProgress]
 * @returns {Promise<{ tokens, visualDirection }>}
 */
export async function runAnalyzeTokens({ intent, mode = 'system', selectedRefs, model, onProgress }) {
  if (!selectedRefs?.length) throw new Error('최소 1장 이상 필요');

  // 사전 추출된 데이터만 payload 로 전송. 이미지 없음. attachFile = ZIP 안 정확한 파일명.
  const extractedPool = selectedRefs.map((ref, i) => ({
    id: ref.id,
    attachIdx: i + 1,
    attachFile: inferRefAttachFile(ref, i),
    title: ref.title || null,
    tags: ref.tags || {},
    dominantColors: ref.dominantColors || [],
    extracted: ref.extracted || {},
    useLayers: Array.isArray(ref.useLayers) ? ref.useLayers : [],
  }));

  const refNotesBlock = buildReferenceNotesBlock(selectedRefs);

  const content = [
    {
      type: 'text',
      text: `=== Pre-extracted references (${selectedRefs.length}) ===

${JSON.stringify(extractedPool, null, 2)}

=== End of references ===

=== Project Mode (TP2) ===
mode: ${mode}
${mode === 'concept' ? 'BIAS toward distinctive choices. Bold primary. Lower role enforcement.'
  : mode === 'handoff' ? 'OPTIMIZE naming for MUI/DTCG. Every token decisionRationale required.'
  : 'ENFORCE role uniqueness, AAA contrast for primary on bg, hierarchy strict.'}

=== Layer Curation (TP4) ===
${extractedPool.some((r) => r.useLayers.length > 0)
  ? extractedPool
    .filter((r) => r.useLayers.length > 0)
    .map((r) => `${r.id}: ONLY use [${r.useLayers.join(', ')}]`)
    .join('\n')
  : '(없음 — 모든 ref의 모든 layer 자유 사용)'}${refNotesBlock}`,
    },
    {
      type: 'text',
      text: TASK_ANALYZE_TOKENS.userMessageTemplate
        .replace('{{intent}}', intent)
        .replace('{{mode}}', mode)
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

  const toolName = TASK_ANALYZE_TOKENS.toolSchemas[0].name;

  // 단일 tool 강제 호출 → 모델이 분할 호출할 수 없음 (tool_choice.type='tool').
  // 빈 레이어 발생 시 1회 재시도 (Haiku 가 간헐적으로 minItems 위반).
  const callOnce = async (extraInstruction = '') => {
    const messagesContent = extraInstruction
      ? [...content, { type: 'text', text: extraInstruction }]
      : content;
    const res = await callAnthropic({
      model: model || TASK_ANALYZE_TOKENS.model,
      max_tokens: 8192,
      system: TASK_ANALYZE_TOKENS.systemPrompt,
      tools: TASK_ANALYZE_TOKENS.toolSchemas,
      tool_choice: { type: 'tool', name: toolName },
      messages: [{ role: 'user', content: messagesContent }],
    });
    const input = extractToolInput(res, toolName);
    return { res, input };
  };

  const checkEmpties = (input) => {
    const t = input?.tokens || {};
    return ['color', 'typography', 'layout', 'gradient'].filter((k) => !(Array.isArray(t[k]) && t[k].length > 0));
  };

  let { res: response, input: result } = await callOnce();

  if (!result) {
    throw new Error(`T3 tool_use 응답 없음. text: ${extractText(response) || '(empty)'}`);
  }

  if (response?.stop_reason === 'max_tokens') {
    throw new Error('T3 응답이 max_tokens(8192)에서 잘렸습니다. 레퍼런스 개수를 줄이거나 다시 시도해주세요.');
  }

  let empties = checkEmpties(result);
  if (empties.length > 0) {
    // eslint-disable-next-line no-console
    console.warn('[runAnalyzeTokens] 빈 layer 감지 → 재시도:', empties);
    const retryInstruction = `[CRITICAL RETRY] Your previous response left these layers empty: ${empties.join(', ')}. ` +
      'Re-emit the COMPLETE design system. Every tokens.{color,typography,layout,gradient} array MUST be non-empty per schema minItems. ' +
      'Use the pre-extracted pool above as the source.';
    const retry = await callOnce(retryInstruction);
    if (retry.input) {
      result = retry.input;
      response = retry.res;
      empties = checkEmpties(result);
      if (empties.length > 0) {
        // eslint-disable-next-line no-console
        console.error('[runAnalyzeTokens] 재시도 후에도 빈 layer:', empties);
      }
    }
  }

  // 완료 상태 전달
  onProgress?.(
    ['color', 'typography', 'layout', 'gradient', 'visualDirection'].map((key) => ({
      key,
      status: 'done',
    })),
  );

  return {
    tokens: result.tokens || null,
    visualDirection: result.visualDirection || null,
  };
}

/**
 * T3 (concept) — 800자 한글 디자인 프롬프트 생성
 *  - 웹 AI 챗(Claude Desktop / Gemini / ChatGPT)에 즉시 붙여넣을 형태
 *  - 단일 prompt 문자열만 반환 (토큰 합성 X)
 *  - 검증: 길이 200-800, HEX 3+, 마크다운/토큰ID 부재
 *  - 검증 실패 시 1회 retry
 *
 * @param {object} params
 * @param {string} params.intent
 * @param {Array<{id, tags?, dominantColors?, extracted?}>} params.selectedRefs
 * @param {string} [params.userNotes='']
 * @param {string} [params.model]
 * @param {function} [params.onProgress]
 * @returns {Promise<{ conceptPrompt: string }>}
 */
export async function runAnalyzeConcept({ intent, selectedRefs, model, onProgress }) {
  if (!selectedRefs?.length) throw new Error('최소 1장 이상 필요');

  const extractedPool = selectedRefs.map((ref, i) => ({
    id: ref.id,
    attachIdx: i + 1,
    attachFile: inferRefAttachFile(ref, i),
    title: ref.title || null,
    tags: ref.tags || {},
    dominantColors: ref.dominantColors || [],
    extracted: ref.extracted || {},
  }));

  const refNotesBlock = buildReferenceNotesBlock(selectedRefs);
  const content = [
    {
      type: 'text',
      text: `=== Pre-extracted references (${selectedRefs.length}) ===

${JSON.stringify(extractedPool, null, 2)}

=== End of references ===${refNotesBlock}`,
    },
    {
      type: 'text',
      text: TASK_ANALYZE_CONCEPT.userMessageTemplate
        .replace('{{intent}}', intent)
        .replace('{{count}}', String(selectedRefs.length))
        .replace('{{ids}}', selectedRefs.map((r) => r.id).join(', ')),
    },
  ];

  const toolName = TASK_ANALYZE_CONCEPT.toolSchemas[0].name;

  const callOnce = async (extraInstruction = '') => {
    const messagesContent = extraInstruction
      ? [...content, { type: 'text', text: extraInstruction }]
      : content;
    const res = await callAnthropic({
      model: model || TASK_ANALYZE_CONCEPT.model,
      max_tokens: 1024,
      system: TASK_ANALYZE_CONCEPT.systemPrompt,
      tools: TASK_ANALYZE_CONCEPT.toolSchemas,
      tool_choice: { type: 'tool', name: toolName },
      messages: [{ role: 'user', content: messagesContent }],
    });
    const input = extractToolInput(res, toolName);
    return { res, input };
  };

  // 자동 검증: 길이, HEX 개수, 마크다운/토큰ID 부재
  const validate = (prompt) => {
    if (!prompt || typeof prompt !== 'string') return ['empty'];
    const errors = [];
    if (prompt.length < 200) errors.push(`too-short(${prompt.length})`);
    if (prompt.length > 800) errors.push(`too-long(${prompt.length})`);
    const hexCount = (prompt.match(/#[0-9A-Fa-f]{6}/g) || []).length;
    if (hexCount < 3) errors.push(`hex-too-few(${hexCount})`);
    if (/```|^#{1,6}\s|^\s*[-*]\s/m.test(prompt)) errors.push('markdown-detected');
    if (/(col-|typo-|primary:|h1:|--[a-z]+-)/i.test(prompt)) errors.push('token-id-detected');
    return errors;
  };

  onProgress?.([{ key: 'conceptPrompt', status: 'running' }]);

  let { res: response, input: result } = await callOnce();
  if (!result?.prompt) {
    throw new Error(`T3(concept) tool_use 응답 없음. text: ${extractText(response) || '(empty)'}`);
  }

  let errors = validate(result.prompt);
  if (errors.length > 0) {
    // eslint-disable-next-line no-console
    console.warn('[runAnalyzeConcept] 검증 실패 → 재시도:', errors);
    const retryInstruction = `[CRITICAL RETRY] Previous prompt failed validation: ${errors.join(', ')}. ` +
      'Constraints: 200-800 Korean chars, ≥3 HEX codes, NO markdown headers/bullets/code blocks, NO token IDs. ' +
      'Re-emit a single natural Korean paragraph.';
    const retry = await callOnce(retryInstruction);
    if (retry.input?.prompt) {
      result = retry.input;
      response = retry.res;
      errors = validate(result.prompt);
      if (errors.length > 0) {
        // eslint-disable-next-line no-console
        console.error('[runAnalyzeConcept] 재시도 후에도 검증 실패:', errors, '— prompt 그대로 반환');
      }
    }
  }

  onProgress?.([{ key: 'conceptPrompt', status: 'done' }]);

  return { conceptPrompt: result.prompt };
}

/**
 * T3 (handoff) — 토큰 + 5 layer 한글 상세 + VD MD
 *  - 프레임워크 config (Tailwind/MUI/DTCG/CSS-vars/.cursorrules) 는 클라이언트에서 토큰으로부터 결정론적 생성
 *  - 검증: 4 token layer 비어있지 않음 + layerDetails 5 키 모두 200자+
 *  - 검증 실패 시 1회 retry
 *
 * @returns {Promise<{ tokens, visualDirection, layerDetails }>}
 */
export async function runAnalyzeHandoff({ intent, selectedRefs, model, onProgress }) {
  if (!selectedRefs?.length) throw new Error('최소 1장 이상 필요');

  const extractedPool = selectedRefs.map((ref, i) => ({
    id: ref.id,
    attachIdx: i + 1,
    attachFile: inferRefAttachFile(ref, i),
    title: ref.title || null,
    tags: ref.tags || {},
    dominantColors: ref.dominantColors || [],
    extracted: ref.extracted || {},
    useLayers: Array.isArray(ref.useLayers) ? ref.useLayers : [],
  }));

  const refNotesBlock = buildReferenceNotesBlock(selectedRefs);

  const content = [
    {
      type: 'text',
      text: `=== Pre-extracted references (${selectedRefs.length}) ===

${JSON.stringify(extractedPool, null, 2)}

=== End of references ===

=== Layer Curation (TP4) ===
${extractedPool.some((r) => r.useLayers.length > 0)
  ? extractedPool.filter((r) => r.useLayers.length > 0).map((r) => `${r.id}: ONLY use [${r.useLayers.join(', ')}]`).join('\n')
  : '(없음 — 모든 ref 의 모든 layer 자유 사용)'}${refNotesBlock}`,
    },
    {
      type: 'text',
      text: TASK_ANALYZE_HANDOFF.userMessageTemplate
        .replace('{{intent}}', intent)
        .replace('{{count}}', String(selectedRefs.length))
        .replace('{{ids}}', selectedRefs.map((r) => r.id).join(', ')),
    },
  ];

  const toolName = TASK_ANALYZE_HANDOFF.toolSchemas[0].name;

  const callOnce = async (extraInstruction = '') => {
    const messagesContent = extraInstruction
      ? [...content, { type: 'text', text: extraInstruction }]
      : content;
    const res = await callAnthropic({
      model: model || TASK_ANALYZE_HANDOFF.model,
      max_tokens: 8192,
      system: TASK_ANALYZE_HANDOFF.systemPrompt,
      tools: TASK_ANALYZE_HANDOFF.toolSchemas,
      tool_choice: { type: 'tool', name: toolName },
      messages: [{ role: 'user', content: messagesContent }],
    });
    const input = extractToolInput(res, toolName);
    return { res, input };
  };

  const validate = (input) => {
    const errors = [];
    const t = input?.tokens || {};
    for (const k of ['color', 'typography', 'layout', 'gradient']) {
      if (!Array.isArray(t[k]) || t[k].length === 0) errors.push(`tokens.${k}-empty`);
    }
    const ld = input?.layerDetails || {};
    for (const k of ['color', 'typography', 'layout', 'gradient', 'visualDirection']) {
      if (!ld[k] || ld[k].length < 200) errors.push(`layerDetails.${k}-too-short`);
    }
    if (!input?.visualDirection?.markdown || input.visualDirection.markdown.length < 200) {
      errors.push('visualDirection-markdown-too-short');
    }
    return errors;
  };

  onProgress?.(
    ['color', 'typography', 'layout', 'gradient', 'visualDirection'].map((key, i) => ({
      key,
      status: i === 0 ? 'running' : 'pending',
    })),
  );

  let { res: response, input: result } = await callOnce();
  if (!result) {
    throw new Error(`T3(handoff) tool_use 응답 없음. text: ${extractText(response) || '(empty)'}`);
  }

  if (response?.stop_reason === 'max_tokens') {
    throw new Error('T3(handoff) 응답이 max_tokens(8192)에서 잘렸습니다. 레퍼런스 개수를 줄여보세요.');
  }

  let errors = validate(result);
  if (errors.length > 0) {
    // eslint-disable-next-line no-console
    console.warn('[runAnalyzeHandoff] 검증 실패 → 재시도:', errors);
    const retryInstruction = `[CRITICAL RETRY] Previous handoff bundle failed: ${errors.join(', ')}. ` +
      'Re-emit COMPLETE bundle. ALL 4 token layers non-empty. ALL 5 layerDetails keys present (200+ chars each). ' +
      'visualDirection.markdown 200+ chars. Use the pre-extracted pool as source.';
    const retry = await callOnce(retryInstruction);
    if (retry.input) {
      result = retry.input;
      response = retry.res;
      errors = validate(result);
      if (errors.length > 0) {
        // eslint-disable-next-line no-console
        console.error('[runAnalyzeHandoff] 재시도 후에도 검증 실패:', errors);
      }
    }
  }

  onProgress?.(
    ['color', 'typography', 'layout', 'gradient', 'visualDirection'].map((key) => ({
      key,
      status: 'done',
    })),
  );

  return {
    tokens: result.tokens || null,
    visualDirection: result.visualDirection || null,
    layerDetails: result.layerDetails || null,
  };
}
