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

/**
 * Token reference syntax validator (DESIGN.md 호환).
 *
 * components 의 모든 property value 가 `{a.b}` 형식이고,
 * path 의 첫 segment 는 colors|typography|rounded|spacing|elevation,
 * 두번째 segment 는 실제 emit 된 token id / scale key 와 매칭되어야 함.
 *
 * @param {object} input — { tokens: { color, typography, layout, gradient, spacing, rounded, elevation, components, ... } }
 * @returns {{ ok: boolean, errors: string[], danglingRefs: string[], literalProps: string[] }}
 */
function validateTokenRefs(input) {
  const errors = [];
  const danglingRefs = [];
  const literalProps = [];
  const t = input?.tokens || {};
  const components = t.components;

  if (!components || typeof components !== 'object' || Array.isArray(components)) {
    errors.push('components-missing-or-not-object');
    return { ok: false, errors, danglingRefs, literalProps };
  }
  const componentKeys = Object.keys(components);
  if (componentKeys.length < 3) {
    errors.push(`components-min-3-violated(got=${componentKeys.length})`);
  }

  const colorIds = new Set((t.color || []).map((x) => x?.id).filter(Boolean));
  const typoIds = new Set((t.typography || []).map((x) => x?.id).filter(Boolean));
  const elevIds = new Set((t.elevation || []).map((x) => x?.id).filter(Boolean));
  const spacingKeys = new Set(Object.keys(t.spacing || {}));
  const roundedKeys = new Set(Object.keys(t.rounded || {}));

  const axisIds = {
    colors: colorIds,
    typography: typoIds,
    elevation: elevIds,
    spacing: spacingKeys,
    rounded: roundedKeys,
  };
  const reservedProps = new Set([
    'decisionRationale', 'whichReferences', 'whyChosen', 'appliedUserNotes',
    'appliedReferenceNote', 'alternativesConsidered', 'sourceReferenceIds',
  ]);

  const refRegex = /^\{([a-z]+)\.([a-zA-Z0-9_-]+)\}$/;

  for (const compKey of componentKeys) {
    const spec = components[compKey];
    if (!spec || typeof spec !== 'object') {
      errors.push(`components.${compKey}-not-object`);
      continue;
    }
    for (const propKey of Object.keys(spec)) {
      if (reservedProps.has(propKey)) continue;
      const val = spec[propKey];
      if (typeof val !== 'string') continue;
      const m = val.match(refRegex);
      if (!m) {
        literalProps.push(`${compKey}.${propKey}="${val}"`);
        continue;
      }
      const [, axis, id] = m;
      const idsForAxis = axisIds[axis];
      if (!idsForAxis) {
        danglingRefs.push(`${compKey}.${propKey} → unknown axis "${axis}"`);
        continue;
      }
      if (!idsForAxis.has(id)) {
        danglingRefs.push(`${compKey}.${propKey} → ${axis}.${id} (not emitted)`);
      }
    }
  }

  if (literalProps.length > 0) errors.push(`literal-values:${literalProps.length}`);
  if (danglingRefs.length > 0) errors.push(`dangling-refs:${danglingRefs.length}`);

  return { ok: errors.length === 0, errors, danglingRefs, literalProps };
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

  const PROGRESS_KEYS_SYSTEM = [
    'color', 'typography', 'layout', 'gradient',
    'spacing', 'rounded', 'components', 'visualDirection',
  ];
  // 진행 상태 시작
  onProgress?.(
    PROGRESS_KEYS_SYSTEM.map((key, i) => ({
      key,
      status: i === 0 ? 'running' : 'pending',
    })),
  );

  const MAX_TOKENS = 8192;
  const [coreSchema, designmdSchema] = TASK_ANALYZE_TOKENS.toolSchemas;
  const baseModel = model || TASK_ANALYZE_TOKENS.model;

  // ========== Phase 1: CORE 4축 + visualDirection ==========

  const phase1Content = [
    ...content,
    {
      type: 'text',
      text: `=== PHASE 1 OF 2 ===
This call emits ONLY tokens.{color, typography, layout, gradient} + visualDirection.{markdown, tags}.
DO NOT include spacing/rounded/elevation/components in this call — those go in phase 2.
Required non-empty: color (4-6), typography (3-4), layout (2-4 with kind grid|container only), gradient (1-3).
visualDirection.markdown must be 200+ chars filling sections 1-6 of the template.`,
    },
  ];

  const callPhase1 = async (extraInstruction = '') => {
    const messagesContent = extraInstruction
      ? [...phase1Content, { type: 'text', text: extraInstruction }]
      : phase1Content;
    const res = await callAnthropic({
      model: baseModel,
      max_tokens: MAX_TOKENS,
      system: TASK_ANALYZE_TOKENS.systemPrompt,
      tools: [coreSchema],
      tool_choice: { type: 'tool', name: coreSchema.name },
      messages: [{ role: 'user', content: messagesContent }],
    });
    const input = extractToolInput(res, coreSchema.name);
    return { res, input };
  };

  const checkCoreEmpties = (input) => {
    const t = input?.tokens || {};
    const empties = ['color', 'typography', 'layout', 'gradient']
      .filter((k) => !(Array.isArray(t[k]) && t[k].length > 0));
    const md = input?.visualDirection?.markdown;
    if (!md || md.length < 200) empties.push('visualDirection.markdown');
    return empties;
  };
  const summarizePhase1 = (input) => {
    const t = input?.tokens || {};
    return {
      core: {
        color: Array.isArray(t.color) ? t.color.length : 0,
        typography: Array.isArray(t.typography) ? t.typography.length : 0,
        layout: Array.isArray(t.layout) ? t.layout.length : 0,
        gradient: Array.isArray(t.gradient) ? t.gradient.length : 0,
      },
      visualDirection: {
        markdownLen: input?.visualDirection?.markdown?.length || 0,
        tags: input?.visualDirection?.tags ? Object.keys(input.visualDirection.tags) : [],
      },
    };
  };

  let { res: p1Res, input: phase1 } = await callPhase1();
  if (!phase1) throw new Error(`T3 phase1 tool_use 응답 없음. text: ${extractText(p1Res) || '(empty)'}`);
  if (p1Res?.stop_reason === 'max_tokens') {
    throw new Error(`T3 phase1 응답이 max_tokens(${MAX_TOKENS})에서 잘렸습니다.`);
  }
  // eslint-disable-next-line no-console
  console.log('[runAnalyzeTokens] Phase 1 결과:', summarizePhase1(phase1));

  let p1Empties = checkCoreEmpties(phase1);
  if (p1Empties.length > 0) {
    // eslint-disable-next-line no-console
    console.warn('[runAnalyzeTokens] Phase 1 검증 실패 → 재시도:', p1Empties);
    const retry = await callPhase1(
      `[CRITICAL RETRY] Phase 1 missing/short: ${p1Empties.join(', ')}. Re-emit COMPLETE phase 1: tokens (color 4-6, typography 3-4, layout 2-4, gradient 1-3) + visualDirection (markdown 200+ chars, tags).`
    );
    if (retry.input) {
      phase1 = retry.input;
      p1Res = retry.res;
      p1Empties = checkCoreEmpties(phase1);
    }
    // eslint-disable-next-line no-console
    console.log('[runAnalyzeTokens] Phase 1 재시도 결과:', summarizePhase1(phase1));
  }
  if (p1Empties.length > 0) {
    // eslint-disable-next-line no-console
    console.error('[runAnalyzeTokens] Phase 1 재시도 후에도 비어있음:', p1Empties);
  }

  // 진행 상태 — phase 1 axes done
  onProgress?.(
    PROGRESS_KEYS_SYSTEM.map((key) => {
      if (['color', 'typography', 'layout', 'gradient', 'visualDirection'].includes(key)) {
        return { key, status: 'done' };
      }
      return { key, status: key === 'spacing' ? 'running' : 'pending' };
    }),
  );

  // ========== Phase 2: spacing / rounded / elevation / components ==========

  const phase1Color = phase1?.tokens?.color || [];
  const phase1Typo = phase1?.tokens?.typography || [];
  const phase1Layout = phase1?.tokens?.layout || [];
  const phase1Gradient = phase1?.tokens?.gradient || [];

  const phase2Content = [
    ...content,
    {
      type: 'text',
      text: `=== PHASE 2 OF 2 ===
Phase 1 emitted these tokens — use these EXACT ids when building component {path} references.

colors (use as "{colors.<id>}"):
${phase1Color.map((c) => `  - ${c.id}  (${c.hex}, role=${c.role || '?'})`).join('\n') || '  (none)'}

typography (use as "{typography.<id>}"):
${phase1Typo.map((t) => `  - ${t.id}  (variant=${t.variant || '?'}, ${t.fontFamily || '?'})`).join('\n') || '  (none)'}

layout entries (FYI, not directly referenced):
${phase1Layout.map((l) => `  - ${l.id}  (kind=${l.kind})`).join('\n') || '  (none)'}

gradient entries (FYI):
${phase1Gradient.map((g) => `  - ${g.id}`).join('\n') || '  (none)'}

THIS CALL emits ONLY:
  - spacing: object map (3-6 entries, e.g. { sm: "8px", md: "16px", lg: "24px" })
  - rounded: object map (2-5 entries, e.g. { sm: "4px", md: "8px" })
  - elevation: array (0-3 entries, may be empty)
  - components: object map (3-8 entries) — kebab-case names. EACH value's properties MUST be "{a.b}" token-ref strings:
      "{colors.<id>}"      → use phase 1 color ids exactly
      "{typography.<id>}"  → use phase 1 typography ids exactly
      "{spacing.<key>}"    → use scale keys you emit in this call's spacing
      "{rounded.<key>}"    → use scale keys you emit in this call's rounded
      "{elevation.<id>}"   → use ids you emit in this call's elevation
    NEVER use literal values like "#1A1C1E" or "16px" inside component spec values.
    EACH component MUST include decisionRationale: { whichReferences[], whyChosen }.
    Include at least one button-primary (or equivalent CTA).`,
    },
  ];

  const callPhase2 = async (extraInstruction = '') => {
    const messagesContent = extraInstruction
      ? [...phase2Content, { type: 'text', text: extraInstruction }]
      : phase2Content;
    const res = await callAnthropic({
      model: baseModel,
      max_tokens: MAX_TOKENS,
      system: TASK_ANALYZE_TOKENS.systemPrompt,
      tools: [designmdSchema],
      tool_choice: { type: 'tool', name: designmdSchema.name },
      messages: [{ role: 'user', content: messagesContent }],
    });
    const input = extractToolInput(res, designmdSchema.name);
    return { res, input };
  };

  // phase2 결과를 합쳐서 validateTokenRefs 가 phase1 ids 를 알 수 있게 한다.
  const buildMergedForRefCheck = (phase2) => ({
    tokens: {
      color: phase1Color,
      typography: phase1Typo,
      spacing: phase2?.spacing || {},
      rounded: phase2?.rounded || {},
      elevation: Array.isArray(phase2?.elevation) ? phase2.elevation : [],
      components: phase2?.components || {},
    },
  });
  const summarizePhase2 = (phase2) => ({
    spacing: phase2?.spacing && typeof phase2.spacing === 'object' ? Object.keys(phase2.spacing).length : 0,
    rounded: phase2?.rounded && typeof phase2.rounded === 'object' ? Object.keys(phase2.rounded).length : 0,
    elevation: Array.isArray(phase2?.elevation) ? phase2.elevation.length : 0,
    components: phase2?.components && typeof phase2.components === 'object' ? Object.keys(phase2.components).length : 0,
  });

  let { res: p2Res, input: phase2 } = await callPhase2();
  if (p2Res?.stop_reason === 'max_tokens') {
    // eslint-disable-next-line no-console
    console.error('[runAnalyzeTokens] Phase 2 응답이 max_tokens 에서 잘림 — phase 2 결과 무시하고 phase 1 만으로 진행');
    phase2 = null;
  }
  // eslint-disable-next-line no-console
  console.log('[runAnalyzeTokens] Phase 2 결과:', phase2 ? summarizePhase2(phase2) : '(없음)');

  let refCheck = phase2 ? validateTokenRefs(buildMergedForRefCheck(phase2)) : { ok: true, literalProps: [], danglingRefs: [], errors: [] };
  const hasComponents = phase2?.components && typeof phase2.components === 'object'
    && !Array.isArray(phase2.components) && Object.keys(phase2.components).length > 0;
  const needsRefRetry = hasComponents && (refCheck.literalProps.length > 0 || refCheck.danglingRefs.length > 0);

  if (needsRefRetry) {
    // eslint-disable-next-line no-console
    console.warn('[runAnalyzeTokens] Phase 2 ref 위반 → 재시도:', { literals: refCheck.literalProps.slice(0, 3), danglings: refCheck.danglingRefs.slice(0, 3) });
    const parts = ['[CRITICAL RETRY] Phase 2 components contained invalid references.'];
    if (refCheck.literalProps.length > 0) {
      parts.push(`Literal values found (must be {a.b} token-ref): ${refCheck.literalProps.slice(0, 5).join(' | ')}.`);
    }
    if (refCheck.danglingRefs.length > 0) {
      parts.push(`Dangling references: ${refCheck.danglingRefs.slice(0, 5).join(' | ')}. Use ONLY ids that exist in phase 1 (color, typography) or this call's spacing/rounded/elevation keys.`);
    }
    const retry = await callPhase2(parts.join(' '));
    if (retry.input) {
      phase2 = retry.input;
      p2Res = retry.res;
      refCheck = validateTokenRefs(buildMergedForRefCheck(phase2));
    }
    // eslint-disable-next-line no-console
    console.log('[runAnalyzeTokens] Phase 2 재시도 결과:', summarizePhase2(phase2));
  }

  // system 모드 fallback: 재시도 후에도 ref 위반이면 components 만 빈 객체로 강등.
  let phase2Final = phase2;
  let refValidation = null;
  const stillHasInvalidComponents = phase2Final?.components && Object.keys(phase2Final.components).length > 0
    && (refCheck.literalProps.length > 0 || refCheck.danglingRefs.length > 0);
  if (stillHasInvalidComponents) {
    // eslint-disable-next-line no-console
    console.warn('[runAnalyzeTokens] components ref 위반 지속 → 빈 객체로 fallback (system mode)');
    phase2Final = { ...phase2Final, components: {} };
    refValidation = {
      fallback: true,
      errors: refCheck.errors,
      danglingRefs: refCheck.danglingRefs,
      literalProps: refCheck.literalProps,
    };
  }

  // 완료 상태
  onProgress?.(
    PROGRESS_KEYS_SYSTEM.map((key) => ({ key, status: 'done' })),
  );

  // ========== Merge & return ==========

  const mergedTokens = {
    color: phase1Color,
    typography: phase1Typo,
    layout: phase1Layout,
    gradient: phase1Gradient,
    spacing: phase2Final?.spacing || {},
    rounded: phase2Final?.rounded || {},
    elevation: Array.isArray(phase2Final?.elevation) ? phase2Final.elevation : [],
    components: phase2Final?.components || {},
  };

  return {
    tokens: mergedTokens,
    visualDirection: phase1?.visualDirection || null,
    _refValidation: refValidation,
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

  const MAX_TOKENS = 8192;
  const [coreSchema, designmdSchema] = TASK_ANALYZE_HANDOFF.toolSchemas;
  const baseModel = model || TASK_ANALYZE_HANDOFF.model;

  const PROGRESS_KEYS_HANDOFF = [
    'color', 'typography', 'layout', 'gradient',
    'spacing', 'rounded', 'components', 'visualDirection',
  ];

  onProgress?.(
    PROGRESS_KEYS_HANDOFF.map((key, i) => ({
      key,
      status: i === 0 ? 'running' : 'pending',
    })),
  );

  // ========== Phase 1: CORE 4축 + visualDirection + layerDetails 5키 ==========

  const phase1Content = [
    ...content,
    {
      type: 'text',
      text: `=== PHASE 1 OF 2 ===
This call emits ONLY:
- tokens.{color, typography, layout, gradient} — kebab-case ids, decisionRationale required
- visualDirection.{markdown 200+ chars, tags}
- layerDetails.{color, typography, layout, gradient, visualDirection} — 한글 200-500자 각

DO NOT include spacing/rounded/elevation/components in this call (phase 2).
DO NOT include layerDetails.{spacing, rounded, components, elevation} in this call.`,
    },
  ];

  const callPhase1 = async (extraInstruction = '') => {
    const messagesContent = extraInstruction
      ? [...phase1Content, { type: 'text', text: extraInstruction }]
      : phase1Content;
    const res = await callAnthropic({
      model: baseModel,
      max_tokens: MAX_TOKENS,
      system: TASK_ANALYZE_HANDOFF.systemPrompt,
      tools: [coreSchema],
      tool_choice: { type: 'tool', name: coreSchema.name },
      messages: [{ role: 'user', content: messagesContent }],
    });
    const input = extractToolInput(res, coreSchema.name);
    return { res, input };
  };

  const validatePhase1 = (input) => {
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

  const summarizePhase1 = (input) => ({
    core: {
      color: Array.isArray(input?.tokens?.color) ? input.tokens.color.length : 0,
      typography: Array.isArray(input?.tokens?.typography) ? input.tokens.typography.length : 0,
      layout: Array.isArray(input?.tokens?.layout) ? input.tokens.layout.length : 0,
      gradient: Array.isArray(input?.tokens?.gradient) ? input.tokens.gradient.length : 0,
    },
    visualDirection: { markdownLen: input?.visualDirection?.markdown?.length || 0 },
    layerDetailsKeys: input?.layerDetails ? Object.keys(input.layerDetails) : [],
  });

  let { res: p1Res, input: phase1 } = await callPhase1();
  if (!phase1) throw new Error(`T3(handoff) phase1 tool_use 응답 없음. text: ${extractText(p1Res) || '(empty)'}`);
  if (p1Res?.stop_reason === 'max_tokens') {
    throw new Error(`T3(handoff) phase1 응답이 max_tokens(${MAX_TOKENS})에서 잘렸습니다.`);
  }
  // eslint-disable-next-line no-console
  console.log('[runAnalyzeHandoff] Phase 1 결과:', summarizePhase1(phase1));

  let p1Errors = validatePhase1(phase1);
  if (p1Errors.length > 0) {
    // eslint-disable-next-line no-console
    console.warn('[runAnalyzeHandoff] Phase 1 검증 실패 → 재시도:', p1Errors);
    const retry = await callPhase1(
      `[CRITICAL RETRY] Phase 1 errors: ${p1Errors.join(', ')}. Re-emit COMPLETE phase 1: tokens (4 core axes non-empty, kebab-case ids, decisionRationale), visualDirection (markdown 200+ chars), layerDetails (5 keys 200-500자 each).`
    );
    if (retry.input) {
      phase1 = retry.input;
      p1Res = retry.res;
      p1Errors = validatePhase1(phase1);
    }
    // eslint-disable-next-line no-console
    console.log('[runAnalyzeHandoff] Phase 1 재시도 결과:', summarizePhase1(phase1));
  }
  if (p1Errors.length > 0) {
    // eslint-disable-next-line no-console
    console.error('[runAnalyzeHandoff] Phase 1 재시도 후에도 검증 실패:', p1Errors);
  }

  onProgress?.(
    PROGRESS_KEYS_HANDOFF.map((key) => {
      if (['color', 'typography', 'layout', 'gradient', 'visualDirection'].includes(key)) {
        return { key, status: 'done' };
      }
      return { key, status: key === 'spacing' ? 'running' : 'pending' };
    }),
  );

  // ========== Phase 2: spacing / rounded / elevation / components + layerDetails 3키 ==========

  const phase1Color = phase1?.tokens?.color || [];
  const phase1Typo = phase1?.tokens?.typography || [];
  const phase1Layout = phase1?.tokens?.layout || [];
  const phase1Gradient = phase1?.tokens?.gradient || [];

  const phase2Content = [
    ...content,
    {
      type: 'text',
      text: `=== PHASE 2 OF 2 ===
Phase 1 emitted these tokens — use these EXACT ids in component {path} references.

colors:
${phase1Color.map((c) => `  - ${c.id}  (${c.hex})`).join('\n') || '  (none)'}

typography:
${phase1Typo.map((t) => `  - ${t.id}  (variant=${t.variant || '?'})`).join('\n') || '  (none)'}

THIS CALL emits ONLY:
  - spacing (3-6 entries object map)
  - rounded (2-5 entries object map)
  - elevation (0-3 array, may be empty)
  - components (3-8 entries) — kebab-case names, decisionRationale per component, all values "{a.b}" token-ref
  - layerDetails.{spacing, rounded, components} 한글 200-500자 each, layerDetails.elevation optional

Token reference syntax (STRICT):
  "{colors.<phase1-id>}"      → exact phase 1 color id
  "{typography.<phase1-id>}"  → exact phase 1 typography id
  "{spacing.<this-key>}"      → key from this call's spacing object
  "{rounded.<this-key>}"      → key from this call's rounded object
  "{elevation.<this-id>}"     → id from this call's elevation array
NEVER inline literal hex / dimension / px values. Include at least one button-primary CTA.`,
    },
  ];

  const callPhase2 = async (extraInstruction = '') => {
    const messagesContent = extraInstruction
      ? [...phase2Content, { type: 'text', text: extraInstruction }]
      : phase2Content;
    const res = await callAnthropic({
      model: baseModel,
      max_tokens: MAX_TOKENS,
      system: TASK_ANALYZE_HANDOFF.systemPrompt,
      tools: [designmdSchema],
      tool_choice: { type: 'tool', name: designmdSchema.name },
      messages: [{ role: 'user', content: messagesContent }],
    });
    const input = extractToolInput(res, designmdSchema.name);
    return { res, input };
  };

  const buildMergedForRefCheck = (phase2) => ({
    tokens: {
      color: phase1Color,
      typography: phase1Typo,
      spacing: phase2?.spacing || {},
      rounded: phase2?.rounded || {},
      elevation: Array.isArray(phase2?.elevation) ? phase2.elevation : [],
      components: phase2?.components || {},
    },
  });
  const summarizePhase2 = (phase2) => ({
    spacing: phase2?.spacing && typeof phase2.spacing === 'object' ? Object.keys(phase2.spacing).length : 0,
    rounded: phase2?.rounded && typeof phase2.rounded === 'object' ? Object.keys(phase2.rounded).length : 0,
    elevation: Array.isArray(phase2?.elevation) ? phase2.elevation.length : 0,
    components: phase2?.components && typeof phase2.components === 'object' ? Object.keys(phase2.components).length : 0,
    layerDetailsKeys: phase2?.layerDetails ? Object.keys(phase2.layerDetails) : [],
  });

  let { res: p2Res, input: phase2 } = await callPhase2();
  if (p2Res?.stop_reason === 'max_tokens') {
    // eslint-disable-next-line no-console
    console.error('[runAnalyzeHandoff] Phase 2 응답이 max_tokens 에서 잘림 — phase 2 결과 무시');
    phase2 = null;
  }
  // eslint-disable-next-line no-console
  console.log('[runAnalyzeHandoff] Phase 2 결과:', phase2 ? summarizePhase2(phase2) : '(없음)');

  let refCheck = phase2 ? validateTokenRefs(buildMergedForRefCheck(phase2)) : { ok: true, literalProps: [], danglingRefs: [], errors: [] };
  const hasComponents = phase2?.components && typeof phase2.components === 'object'
    && !Array.isArray(phase2.components) && Object.keys(phase2.components).length > 0;
  const needsRefRetry = hasComponents && (refCheck.literalProps.length > 0 || refCheck.danglingRefs.length > 0);

  if (needsRefRetry) {
    // eslint-disable-next-line no-console
    console.warn('[runAnalyzeHandoff] Phase 2 ref 위반 → 재시도:', { literals: refCheck.literalProps.slice(0, 3), danglings: refCheck.danglingRefs.slice(0, 3) });
    const parts = ['[CRITICAL RETRY] Phase 2 components contained invalid references.'];
    if (refCheck.literalProps.length > 0) {
      parts.push(`Literal values: ${refCheck.literalProps.slice(0, 5).join(' | ')}.`);
    }
    if (refCheck.danglingRefs.length > 0) {
      parts.push(`Dangling references: ${refCheck.danglingRefs.slice(0, 5).join(' | ')}.`);
    }
    parts.push('Use ONLY ids from phase 1 (colors, typography) or keys from this call (spacing, rounded, elevation).');
    const retry = await callPhase2(parts.join(' '));
    if (retry.input) {
      phase2 = retry.input;
      p2Res = retry.res;
      refCheck = validateTokenRefs(buildMergedForRefCheck(phase2));
    }
    // eslint-disable-next-line no-console
    console.log('[runAnalyzeHandoff] Phase 2 재시도 결과:', summarizePhase2(phase2));
  }

  // handoff strict — 재시도 후에도 ref 위반이면 에러 표면화 (components 누락은 통과)
  const stillHasInvalidComponents = phase2?.components && Object.keys(phase2.components).length > 0
    && (refCheck.literalProps.length > 0 || refCheck.danglingRefs.length > 0);
  if (stillHasInvalidComponents) {
    // eslint-disable-next-line no-console
    console.error('[runAnalyzeHandoff] components ref 위반 지속 (strict):', refCheck);
    throw new Error(
      `T3(handoff) phase 2 components token-reference 검증 실패. ` +
      `Dangling: ${refCheck.danglingRefs.slice(0, 3).join(' | ')}. ` +
      `Literals: ${refCheck.literalProps.slice(0, 3).join(' | ')}.`
    );
  }

  onProgress?.(
    PROGRESS_KEYS_HANDOFF.map((key) => ({ key, status: 'done' })),
  );

  // ========== Merge ==========

  const mergedTokens = {
    color: phase1Color,
    typography: phase1Typo,
    layout: phase1Layout,
    gradient: phase1Gradient,
    spacing: phase2?.spacing || {},
    rounded: phase2?.rounded || {},
    elevation: Array.isArray(phase2?.elevation) ? phase2.elevation : [],
    components: phase2?.components || {},
  };
  const mergedLayerDetails = { ...(phase1?.layerDetails || {}), ...(phase2?.layerDetails || {}) };

  return {
    tokens: mergedTokens,
    visualDirection: phase1?.visualDirection || null,
    layerDetails: mergedLayerDetails,
  };
}

/**
 * 단일 reference 의 활용 노트 자동 생성.
 *
 * 프로젝트 의도 + 모드 + ref 의 tags / extracted 메타를 바탕으로
 * "이 레퍼런스에서 무엇을 차용할지" 를 한 줄(≤100자) 한국어로 제안.
 * Step 3 활용 노트 입력의 보조 — 사용자가 그대로 쓸 수도, 수정해서 쓸 수도 있다.
 *
 * @param {object} params
 * @param {string} params.intent - 프로젝트 한 줄 의도
 * @param {'concept'|'system'|'handoff'} [params.mode='system']
 * @param {object} params.ref - { id, title?, tags?, dominantColors?, extracted?, useLayers? }
 * @param {string[]} [params.useLayers] - 사용자가 큐레이션한 차용 layer (있으면 우선 반영)
 * @param {string} [params.model]
 * @returns {Promise<string>} 노트 문자열 (최대 100자, 양쪽 trim)
 */
export async function runSuggestRefNote({ intent, mode = 'system', ref, useLayers, model }) {
  if (!ref?.id) throw new Error('ref 가 필요합니다');

  const layers = Array.isArray(useLayers) && useLayers.length > 0
    ? useLayers
    : (Array.isArray(ref.useLayers) ? ref.useLayers : []);

  const meta = {
    id: ref.id,
    title: ref.title || null,
    tags: ref.tags || {},
    dominantColors: ref.dominantColors || [],
    extracted: ref.extracted || {},
    useLayers: layers,
  };

  const system = `당신은 디자인 레퍼런스 큐레이터입니다. 사용자가 선택한 레퍼런스에서 어느 부분을 차용할지 한국어 한 줄(≤100자)로 구체적으로 제안하세요.

규칙:
- 100자 이내. 마침표/따옴표 없이 핵심만.
- "hero 영역 색감" / "우측 사이드바 구조 모방" 처럼 어느 영역의 어느 layer 인지 명시.
- useLayers 가 지정돼 있으면 그 layer 만 다룬다.
- mode=concept 이면 무드/감성, mode=system 이면 토큰/role, mode=handoff 이면 naming/구현 디테일에 무게.
- 출력은 노트 문자열만. 라벨/접두사/설명 금지.`;

  const userText = `=== 프로젝트 의도 ===
${intent || '(없음)'}

=== 모드 ===
${mode}

=== 레퍼런스 메타 ===
${JSON.stringify(meta, null, 2)}

이 레퍼런스에서 차용할 부분을 한 줄로 제안하세요.`;

  const response = await callAnthropic({
    model: model || TASK_ANALYZE_TOKENS.model,
    max_tokens: 200,
    system,
    messages: [{ role: 'user', content: userText }],
  });

  const text = (extractText(response) || '').trim().replace(/^["'`]|["'`]$/g, '').trim();
  return text.slice(0, 100);
}
