/**
 * Token Converters. tokens → framework configs / docs (결정론적)
 *
 * T3 가 산출한 token layers (color/typography/layout/gradient + spacing/rounded/elevation/components)
 * 를 받아 외부 도구가 먹을 수 있는 산출물로 변환. LLM 재호출 0회, 순수 함수.
 *
 * 산출물:
 *  - DTCG (W3C Design Tokens Community Group) JSON
 *  - Tailwind config (tailwind.config.js 텍스트)
 *  - MUI theme (createTheme 인자 객체 텍스트)
 *  - CSS Variables (:root { --token: value })
 *  - AI Paste Block (외부 AI 도구 paste 용 단일 .md)
 *  - DESIGN.md (Google Labs alpha spec, system 모드 ZIP 메인)
 *  - decision-trace.md (TP6 출처/근거/탈락 후보)
 *  - 첨부물 매칭 표 (모든 가이드 문서 공통)
 */

const onlyEnabled = (tokens = []) => tokens.filter((t) => t.isEnabled !== false);
const safeId = (id) => String(id || '').toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

export const inferImageExt = (url) => {
  if (!url) return '.jpg';
  const m = String(url).match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  if (!m) return '.jpg';
  const ext = m[1].toLowerCase();
  return ext === 'jpeg' ? '.jpg' : `.${ext}`;
};

/**
 * 첨부물 매칭 표 한 줄 생성 — 모든 가이드 문서에서 동일 형식 사용.
 * "- 첨부 1번: 01-ref-001.jpg ({title}) — 차용: [color, layout] — {note}"
 */
export function buildAttachmentRow(orderedRef, useLayersByRef = {}, notes = {}) {
  const layers = useLayersByRef[orderedRef.id] || [];
  const note = notes[orderedRef.id] || '';
  const layerStr = layers.length > 0 ? `차용: [${layers.join(', ')}]` : '차용: 자동(전체)';
  const noteStr = note ? ` — ${note}` : '';
  const title = orderedRef.title ? ` (${orderedRef.title})` : '';
  return `- 첨부 ${orderedRef.attachIdx}번: \`${orderedRef.attachFile}\`${title} — ${layerStr}${noteStr}`;
}

/** 첨부물 매칭 표 markdown 블록 생성 */
export function buildAttachmentTable(project, references) {
  const ordered = buildOrderedRefs(project, references);
  const useLayersByRef = Object.fromEntries(
    (project?.selectedRefs || []).map((sr) => [sr.id, sr.useLayers || []]),
  );
  const notes = project?.referenceNotes || {};
  if (ordered.length === 0) return '_(첨부 레퍼런스 없음)_';
  return ordered.map((r) => buildAttachmentRow(r, useLayersByRef, notes)).join('\n');
}

/**
 * 사용된 ref 를 안정적 순서로 정렬 + 첨부 순번 부여.
 * 외부 도구의 첨부물 매칭 prose ("첨부 1번 = ref-XXX") 의 일관성 확보.
 */
function buildOrderedRefs(project, references) {
  const ids = project?.referenceIds || [];
  return ids
    .map((id) => (references || []).find((r) => r.id === id))
    .filter(Boolean)
    .map((r, i) => ({
      ...r,
      attachIdx: i + 1,
      attachFile: `${String(i + 1).padStart(2, '0')}-${r.id}${inferImageExt(r.thumbnailUrl)}`,
    }));
}

/* ============================================
 * DTCG JSON
 * ============================================ */

export function buildDtcgTokens({
  color = [], typography = [], layout = [], gradient = [],
  spacing = {}, rounded = {}, elevation = [], components = {},
} = {}) {
  const dtcg = {
    $schema: 'https://design-tokens.github.io/community-group/format/',
    color: {},
    font: {},
    space: {},
    radius: {},
    grid: {},
    gradient: {},
    shadow: {},
    component: {},
  };

  for (const c of onlyEnabled(color)) {
    dtcg.color[safeId(c.id || c.label)] = {
      $value: c.hex,
      $type: 'color',
      $description: `${c.label || ''}${c.role ? ` (${c.role})` : ''}`,
    };
  }

  for (const t of onlyEnabled(typography)) {
    dtcg.font[safeId(t.id || t.variant || t.label)] = {
      $value: {
        fontFamily: t.fontFamily,
        fontWeight: t.fontWeight,
        fontSize: t.fontSize,
        lineHeight: t.lineHeight,
        letterSpacing: t.letterSpacing || '0',
      },
      $type: 'typography',
      $description: t.label || '',
    };
  }

  for (const l of onlyEnabled(layout)) {
    const id = safeId(l.id || l.label);
    if (l.kind === 'grid') {
      dtcg.grid[id] = {
        $value: { columns: l.columns, gap: `${l.gap}px` },
        $type: 'grid',
        $description: l.label || '',
      };
    } else if (l.kind === 'spacing') {
      // legacy 호환 — 신규 흐름은 spacing scale map 사용
      dtcg.space[id] = { $value: `${l.px}px`, $type: 'dimension', $description: l.label || '' };
    } else if (l.kind === 'container') {
      dtcg.space[`${id}-max`] = { $value: l.maxWidth, $type: 'dimension', $description: l.label || '' };
    }
  }

  for (const [k, v] of Object.entries(spacing || {})) {
    dtcg.space[safeId(k)] = { $value: typeof v === 'number' ? `${v}px` : v, $type: 'dimension', $description: `spacing.${k}` };
  }
  for (const [k, v] of Object.entries(rounded || {})) {
    dtcg.radius[safeId(k)] = { $value: typeof v === 'number' ? `${v}px` : v, $type: 'dimension', $description: `rounded.${k}` };
  }

  for (const g of onlyEnabled(gradient)) {
    dtcg.gradient[safeId(g.id || g.label)] = {
      $value: g.gradient,
      $type: 'gradient',
      $description: g.label || '',
    };
  }

  for (const e of onlyEnabled(Array.isArray(elevation) ? elevation : [])) {
    dtcg.shadow[safeId(e.id || e.label)] = {
      $value: e.shadow,
      $type: 'shadow',
      $description: e.label || `level ${e.level ?? 0}`,
    };
  }

  // components: token-ref string ({a.b}) 을 DTCG alias 형식 ({a.b}) 으로 그대로 보존.
  for (const [name, spec] of Object.entries(components || {})) {
    if (!spec || typeof spec !== 'object') continue;
    const out = {};
    for (const [propKey, val] of Object.entries(spec)) {
      if (propKey === 'decisionRationale') continue;
      out[propKey] = val;
    }
    dtcg.component[safeId(name)] = { $value: out, $type: 'object', $description: `component spec for ${name}` };
  }

  return dtcg;
}

/* ============================================
 * Tailwind config
 * ============================================ */

export function buildTailwindConfig({
  color = [], typography = [], layout = [], gradient = [],
  spacing: spacingScale = {}, rounded = {}, elevation = [],
} = {}) {
  const colors = {};
  for (const c of onlyEnabled(color)) {
    const key = c.role && c.role !== 'neutral' ? c.role : safeId(c.id || c.label);
    if (c.role === 'primary' || c.role === 'secondary' || c.role === 'accent') {
      colors[c.role] = c.hex;
    } else {
      colors[key] = c.hex;
    }
  }

  const fontFamily = {};
  const fontSize = {};
  for (const t of onlyEnabled(typography)) {
    const key = (t.variant || t.id || t.label || 'base').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (t.fontFamily) {
      fontFamily[key] = t.fontFamily.split(',').map((f) => f.trim().replace(/^['"]|['"]$/g, ''));
    }
    if (t.fontSize) {
      fontSize[key] = [t.fontSize, { lineHeight: String(t.lineHeight || 1.5), letterSpacing: t.letterSpacing || '0' }];
    }
  }

  const spacing = {};
  for (const [k, v] of Object.entries(spacingScale || {})) {
    spacing[safeId(k)] = typeof v === 'number' ? `${v}px` : v;
  }
  let gridCols = 12;
  let gridGap = 24;
  let containerMaxW = '1200px';
  for (const l of onlyEnabled(layout)) {
    if (l.kind === 'grid') {
      gridCols = l.columns || gridCols;
      gridGap = l.gap || gridGap;
    } else if (l.kind === 'spacing') {
      spacing[safeId(l.id || l.label)] = `${l.px}px`;
    } else if (l.kind === 'container') {
      containerMaxW = l.maxWidth || containerMaxW;
    }
  }

  const borderRadius = {};
  for (const [k, v] of Object.entries(rounded || {})) {
    borderRadius[safeId(k)] = typeof v === 'number' ? `${v}px` : v;
  }

  const boxShadow = {};
  for (const e of onlyEnabled(Array.isArray(elevation) ? elevation : [])) {
    boxShadow[safeId(e.id || e.label || `elev-${e.level ?? 0}`)] = e.shadow;
  }

  const backgroundImage = {};
  for (const g of onlyEnabled(gradient)) {
    backgroundImage[safeId(g.id || g.label)] = g.gradient;
  }

  const extend = {
    colors,
    fontFamily,
    fontSize,
    spacing,
    gridTemplateColumns: { main: `repeat(${gridCols}, minmax(0, 1fr))` },
    gap: { main: `${gridGap}px` },
    maxWidth: { container: containerMaxW },
    backgroundImage,
  };
  if (Object.keys(borderRadius).length) extend.borderRadius = borderRadius;
  if (Object.keys(boxShadow).length) extend.boxShadow = boxShadow;

  const obj = { theme: { extend } };

  return `// tailwind.config.js — generated by MUSE\n/** @type {import('tailwindcss').Config} */\nmodule.exports = ${JSON.stringify(obj, null, 2)};\n`;
}

/* ============================================
 * MUI theme
 * ============================================ */

export function buildMuiTheme({
  color = [], typography = [], gradient = [],
  spacing: spacingScale = {}, rounded = {}, elevation = [],
} = {}) {
  const palette = { mode: 'light' };
  for (const c of onlyEnabled(color)) {
    if (c.role === 'primary') palette.primary = { main: c.hex };
    else if (c.role === 'secondary') palette.secondary = { main: c.hex };
    else if (c.role === 'accent') palette.warning = { main: c.hex };
  }
  // background = 가장 밝은 neutral 추정
  const surfaces = onlyEnabled(color).filter((c) => c.role === 'neutral' || c.group === 'Surface');
  if (surfaces.length) {
    const lightest = surfaces.reduce((a, b) => (luminance(a.hex) > luminance(b.hex) ? a : b));
    palette.background = { default: lightest.hex, paper: lightest.hex };
  }

  const muiTypography = {};
  for (const t of onlyEnabled(typography)) {
    const variant = t.variant || mapHierarchyToVariant(t);
    muiTypography[variant] = {
      fontFamily: t.fontFamily,
      fontWeight: t.fontWeight,
      fontSize: t.fontSize,
      lineHeight: t.lineHeight,
      letterSpacing: t.letterSpacing || '0',
    };
  }
  const baseFontFamily = onlyEnabled(typography)[0]?.fontFamily;
  if (baseFontFamily) muiTypography.fontFamily = baseFontFamily;

  // shape.borderRadius — rounded scale 의 md (또는 첫 항목) 기준
  const roundedKeys = Object.keys(rounded || {});
  const baseRoundedRaw = rounded?.md ?? rounded?.sm ?? (roundedKeys[0] ? rounded[roundedKeys[0]] : '8px');
  const baseRoundedNum = (() => {
    const m = String(baseRoundedRaw).match(/(\d+(?:\.\d+)?)(px|rem)?/);
    if (!m) return 8;
    const n = parseFloat(m[1]);
    return m[2] === 'rem' ? Math.round(n * 16) : Math.round(n);
  })();
  const shape = { borderRadius: baseRoundedNum };

  // spacing — sm 기준 (없으면 8)
  const spacingValue = (() => {
    const sm = spacingScale?.sm ?? spacingScale?.md ?? 8;
    if (typeof sm === 'number') return sm;
    const m = String(sm).match(/(\d+(?:\.\d+)?)(px|rem)?/);
    if (!m) return 8;
    const n = parseFloat(m[1]);
    return m[2] === 'rem' ? Math.round(n * 16) : Math.round(n);
  })();

  // shadows 배열 (MUI 는 25개 — 0번은 'none', 1~24 는 elevation level)
  const shadows = ['none', ...new Array(24).fill('none')];
  for (const e of onlyEnabled(Array.isArray(elevation) ? elevation : [])) {
    const lv = Math.max(1, Math.min(24, e.level || 1));
    shadows[lv] = e.shadow || 'none';
  }

  const gradients = {};
  for (const g of onlyEnabled(gradient)) gradients[safeId(g.id || g.label)] = g.gradient;

  const obj = { palette, typography: muiTypography, shape, spacing: spacingValue, shadows, gradients };

  return `// mui-theme.js — generated by MUSE\nimport { createTheme } from '@mui/material/styles';\n\nexport const theme = createTheme(${JSON.stringify(obj, null, 2)});\n\nexport default theme;\n`;
}

const mapHierarchyToVariant = (t) => {
  const h = t.hierarchy || (t.fontSize?.includes('rem') && parseFloat(t.fontSize) >= 2 ? 'display' : 'body');
  if (h === 'display') return 'h1';
  if (h === 'heading') return 'h2';
  if (h === 'caption') return 'caption';
  return 'body1';
};

const luminance = (hex) => {
  const m = String(hex || '').match(/^#([0-9a-f]{6})$/i);
  if (!m) return 0;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 0xff, g = (n >> 8) & 0xff, b = n & 0xff;
  return 0.299 * r + 0.587 * g + 0.114 * b;
};

/* ============================================
 * CSS Variables
 * ============================================ */

export function buildCssVariables({
  color = [], typography = [], layout = [], gradient = [],
  spacing = {}, rounded = {}, elevation = [],
} = {}) {
  const lines = [':root {'];
  for (const c of onlyEnabled(color)) {
    lines.push(`  --color-${safeId(c.id || c.role || c.label)}: ${c.hex};`);
  }
  for (const t of onlyEnabled(typography)) {
    const id = safeId(t.id || t.variant || t.label);
    lines.push(`  --font-${id}-family: ${t.fontFamily};`);
    lines.push(`  --font-${id}-size: ${t.fontSize};`);
    lines.push(`  --font-${id}-weight: ${t.fontWeight};`);
    lines.push(`  --font-${id}-line-height: ${t.lineHeight};`);
  }
  for (const l of onlyEnabled(layout)) {
    const id = safeId(l.id || l.label);
    if (l.kind === 'grid') {
      lines.push(`  --grid-${id}-columns: ${l.columns};`);
      lines.push(`  --grid-${id}-gap: ${l.gap}px;`);
    } else if (l.kind === 'spacing') {
      lines.push(`  --space-${id}: ${l.px}px;`);
    } else if (l.kind === 'container') {
      lines.push(`  --container-${id}-max: ${l.maxWidth};`);
    }
  }
  for (const [k, v] of Object.entries(spacing || {})) {
    const val = typeof v === 'number' ? `${v}px` : v;
    lines.push(`  --space-${safeId(k)}: ${val};`);
  }
  for (const [k, v] of Object.entries(rounded || {})) {
    const val = typeof v === 'number' ? `${v}px` : v;
    lines.push(`  --radius-${safeId(k)}: ${val};`);
  }
  for (const e of onlyEnabled(Array.isArray(elevation) ? elevation : [])) {
    lines.push(`  --shadow-${safeId(e.id || e.label || `elev-${e.level ?? 0}`)}: ${e.shadow};`);
  }
  for (const g of onlyEnabled(gradient)) {
    lines.push(`  --gradient-${safeId(g.id || g.label)}: ${g.gradient};`);
  }
  lines.push('}');
  return `/* tokens.css — generated by MUSE */\n${lines.join('\n')}\n`;
}


/* ============================================
 * DESIGN_SYSTEM.md (5 layer 상세 문서)
 * ============================================ */

/* ============================================
 * AI Paste Block (mode 공통, 플랫폼 중립)
 *
 * 외부 AI 도구 (Claude Design / Gemini / AI Studio / ChatGPT 등) 에 paste 할 단일 .md.
 * 토큰 자연어 풀이 + 차용 정책 (per-ref) + 첨부물 매칭 prose 3중 표기.
 * LLM 재호출 없음 — 결정론적 변환.
 *
 * @param {object} params
 * @param {object} params.project - { id, name, intent, mode, referenceIds, selectedRefs, referenceNotes }
 * @param {object} params.analysis - mode 별 layers (system: tokens / concept: { conceptPrompt })
 * @param {Array} params.references - 전체 store references (id, thumbnailUrl, title)
 * @returns {string} markdown
 * ============================================ */
export function buildAiPasteBlock({ project, analysis, references }) {
  const mode = project?.mode || 'system';
  const orderedRefs = buildOrderedRefs(project, references);
  const notes = project?.referenceNotes || {};
  const useLayersByRef = Object.fromEntries(
    (project?.selectedRefs || []).map((sr) => [sr.id, sr.useLayers || []]),
  );

  const refMatchingLines = orderedRefs.map((r) => buildAttachmentRow(r, useLayersByRef, notes));

  const head = [
    `# ${project?.name || 'Untitled'} — AI Paste Block`,
    '',
    `> Claude Design / Gemini / AI Studio / ChatGPT 등 외부 AI 도구에 본문을 paste + 첨부 이미지 ${orderedRefs.length}장 함께 업로드.`,
    '',
    `## Goal`,
    project?.intent || '(없음)',
    '',
  ];

  // mode 별 본문
  let body = [];
  if (mode === 'concept') {
    const prompt = analysis?.conceptPrompt || '';
    body = [
      `## Concept Prompt`,
      prompt || '(아직 생성되지 않음)',
      '',
    ];
  } else {
    // system: 토큰 자연어 풀이
    const c = onlyEnabled(analysis?.color || []);
    const t = onlyEnabled(analysis?.typography || []);
    const l = onlyEnabled(analysis?.layout || []);
    const g = onlyEnabled(analysis?.gradient || []);

    const colorLines = c.map((tok) => {
      const role = tok.role ? `${tok.role} ` : '';
      const refs = (tok.decisionRationale?.whichReferences || []).join(', ');
      const refStr = refs ? ` (출처: ${refs})` : '';
      return `- ${role}${tok.label || tok.id}: ${tok.hex}${refStr}`;
    });

    const typoLines = t.map((tok) => {
      const refs = (tok.decisionRationale?.whichReferences || []).join(', ');
      const refStr = refs ? ` (출처: ${refs})` : '';
      return `- ${tok.variant || tok.label || tok.id}: ${tok.fontFamily} ${tok.fontWeight} ${tok.fontSize} / line-height ${tok.lineHeight}${refStr}`;
    });

    const layoutLines = l.map((tok) => {
      const refs = (tok.decisionRationale?.whichReferences || []).join(', ');
      const refStr = refs ? ` (출처: ${refs})` : '';
      if (tok.kind === 'grid') return `- Grid: ${tok.columns}-col, gap ${tok.gap}px${refStr}`;
      if (tok.kind === 'spacing') return `- Spacing ${tok.label || tok.id}: ${tok.px}px${refStr}`;
      if (tok.kind === 'container') return `- Container ${tok.label || tok.id}: max-width ${tok.maxWidth}${refStr}`;
      return `- ${tok.label || tok.id}: ${tok.kind}${refStr}`;
    });

    const gradientLines = g.map((tok) => {
      const refs = (tok.decisionRationale?.whichReferences || []).join(', ');
      const refStr = refs ? ` (출처: ${refs})` : '';
      return `- ${tok.label || tok.id}: ${tok.gradient}${refStr}`;
    });

    const vd = analysis?.visualDirection || {};
    const vdTags = vd.tags ? Object.entries(vd.tags).flatMap(([k, v]) => (v || []).map((x) => `${k}:${x}`)).join(', ') : '';

    body = [
      `## Design System`,
      '',
      `### Color`,
      ...(colorLines.length ? colorLines : ['(없음)']),
      '',
      `### Typography`,
      ...(typoLines.length ? typoLines : ['(없음)']),
      '',
      `### Layout`,
      ...(layoutLines.length ? layoutLines : ['(없음)']),
      '',
      `### Gradient`,
      ...(gradientLines.length ? gradientLines : ['(없음)']),
      '',
      `### Visual Direction`,
      vdTags ? `**Tags**: ${vdTags}` : '',
      vd.markdown || '',
      '',
    ];
  }

  const tail = [
    `## 첨부물 매칭 (CRITICAL — 외부 AI 가 부분 차용 인식하도록)`,
    '',
    ...(refMatchingLines.length ? refMatchingLines : ['(첨부 레퍼런스 없음)']),
    '',
    `> 위 매칭 표는 외부 AI 가 본문의 ref-XXX 언급과 첨부 이미지를 연결하기 위한 것.`,
    `> 각 ref 의 "차용" 항목 외 layer 는 ref 에서 가져오지 않습니다 (차집합 = 무시).`,
    '',
    `---`,
    '',
    `_Generated by MUSE on ${new Date().toISOString().slice(0, 10)} (mode: ${mode})_`,
  ];

  return [...head, ...body, ...tail].filter((x) => x !== null && x !== undefined).join('\n');
}


/* ============================================
 * DESIGN.md (Google Labs alpha spec, system 모드)
 *   - YAML front-matter: colors, typography, spacing, rounded, components
 *     + vendor extension x-gradient / x-elevation
 *   - prose 8 canonical sections (있는 섹션만 순서 유지)
 * ============================================ */

const yamlScalar = (v) => {
  if (v === null || v === undefined) return '~';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  const s = String(v);
  // 항상 double-quote (안전) — backslash / quote escape
  return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
};

const yamlObject = (obj, indent = 0) => {
  const lines = [];
  const pad = '  '.repeat(indent);
  for (const [k, v] of Object.entries(obj || {})) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      lines.push(`${pad}${k}:`);
      lines.push(yamlObject(v, indent + 1));
    } else if (Array.isArray(v)) {
      lines.push(`${pad}${k}:`);
      for (const item of v) {
        if (item && typeof item === 'object') {
          const entries = Object.entries(item);
          if (entries.length === 0) continue;
          const [firstK, firstV] = entries[0];
          lines.push(`${pad}  - ${firstK}: ${yamlScalar(firstV)}`);
          for (let i = 1; i < entries.length; i++) {
            const [ek, ev] = entries[i];
            lines.push(`${pad}    ${ek}: ${yamlScalar(ev)}`);
          }
        } else {
          lines.push(`${pad}  - ${yamlScalar(item)}`);
        }
      }
    } else {
      lines.push(`${pad}${k}: ${yamlScalar(v)}`);
    }
  }
  return lines.join('\n');
};

/**
 * DESIGN.md 생성 (Google Labs alpha spec).
 *
 * @param {object} params
 * @param {object} params.project - { name, intent }
 * @param {object} params.layers - analysis.layers (color/typography/layout/gradient + spacing/rounded/elevation/components + visualDirection [+ layerDetails])
 * @returns {string}
 */
export function buildDesignMd({ project, layers }) {
  const date = new Date().toISOString().slice(0, 10);
  const ld = layers?.layerDetails || {};
  const vd = layers?.visualDirection || { markdown: '', tags: {} };

  /* ----- YAML front-matter ----- */
  const colors = {};
  for (const c of onlyEnabled(layers?.color || [])) {
    colors[safeId(c.id || c.label || c.role)] = c.hex;
  }
  const typography = {};
  for (const t of onlyEnabled(layers?.typography || [])) {
    const key = (t.variant || t.id || t.label || 'base').toString();
    const obj = {};
    if (t.fontFamily) obj.fontFamily = t.fontFamily;
    if (t.fontSize) obj.fontSize = t.fontSize;
    if (t.fontWeight) obj.fontWeight = t.fontWeight;
    if (t.lineHeight) obj.lineHeight = String(t.lineHeight);
    if (t.letterSpacing) obj.letterSpacing = t.letterSpacing;
    typography[key] = obj;
  }
  const spacing = {};
  for (const [k, v] of Object.entries(layers?.spacing || {})) {
    spacing[k] = typeof v === 'number' ? `${v}px` : v;
  }
  const rounded = {};
  for (const [k, v] of Object.entries(layers?.rounded || {})) {
    rounded[k] = typeof v === 'number' ? `${v}px` : v;
  }
  const components = {};
  for (const [name, spec] of Object.entries(layers?.components || {})) {
    if (!spec || typeof spec !== 'object') continue;
    const cleaned = {};
    for (const [pk, pv] of Object.entries(spec)) {
      if (pk === 'decisionRationale') continue;
      cleaned[pk] = pv;
    }
    components[name] = cleaned;
  }
  const xGradient = {};
  for (const g of onlyEnabled(layers?.gradient || [])) {
    xGradient[safeId(g.id || g.label)] = g.gradient;
  }
  const xElevation = (Array.isArray(layers?.elevation) ? layers.elevation : []).filter((e) => e && (e.isEnabled !== false)).map((e) => ({
    id: safeId(e.id || e.label || `elev-${e.level ?? 0}`),
    shadow: e.shadow,
    level: e.level ?? 0,
  }));

  const fm = {
    version: 'alpha',
    name: project?.name || 'Untitled',
    description: project?.intent || '',
  };
  if (Object.keys(colors).length) fm.colors = colors;
  if (Object.keys(typography).length) fm.typography = typography;
  if (Object.keys(spacing).length) fm.spacing = spacing;
  if (Object.keys(rounded).length) fm.rounded = rounded;
  if (Object.keys(components).length) fm.components = components;
  if (Object.keys(xGradient).length) fm['x-gradient'] = xGradient;
  if (xElevation.length) fm['x-elevation'] = xElevation;

  const yamlBody = yamlObject(fm);

  /* ----- prose 8 canonical sections (있는 섹션만, 순서 유지) ----- */
  const sections = [];

  // 1. Overview — visualDirection.markdown 의 §2 전체방향성 (있으면 발췌, 없으면 markdown 전체)
  const overviewBody = (() => {
    if (!vd.markdown) return null;
    const m = vd.markdown.match(/##\s*2\.\s*전체\s*방향성[\s\S]*?(?=\n##\s|$)/);
    if (m) {
      return m[0].replace(/^##\s*2\.\s*전체\s*방향성\s*\n?/, '').trim();
    }
    return vd.markdown.trim();
  })();
  if (overviewBody) sections.push(`## Overview\n\n${overviewBody}`);

  // 2. Colors
  if (ld.color || Object.keys(colors).length) {
    const palette = onlyEnabled(layers?.color || [])
      .map((c) => `- \`${safeId(c.id || c.label)}\` (${c.role || c.group || ''}): \`${c.hex}\` — ${c.label || ''}`)
      .join('\n');
    sections.push(`## Colors\n\n${ld.color ? `${ld.color}\n\n` : ''}${palette || '(없음)'}`);
  }

  // 3. Typography
  if (ld.typography || Object.keys(typography).length) {
    const typoLines = onlyEnabled(layers?.typography || [])
      .map((t) => `- \`${t.variant || t.id}\`: ${t.fontFamily || ''} ${t.fontWeight || ''} ${t.fontSize || ''}`)
      .join('\n');
    sections.push(`## Typography\n\n${ld.typography ? `${ld.typography}\n\n` : ''}${typoLines || '(없음)'}`);
  }

  // 4. Layout
  if (ld.layout || (layers?.layout || []).length) {
    const layoutLines = onlyEnabled(layers?.layout || [])
      .map((l) => `- \`${l.id || l.label}\` (${l.kind || 'unknown'}): ${l.columns ? `cols=${l.columns}` : ''} ${l.gap ? `gap=${l.gap}` : ''} ${l.maxWidth ? `maxW=${l.maxWidth}` : ''}`.trim())
      .join('\n');
    sections.push(`## Layout\n\n${ld.layout ? `${ld.layout}\n\n` : ''}${layoutLines || '(없음)'}`);
  }

  // 4.5. Gradient — 있을 때만 (DESIGN.md alpha 의 vendor extension `x-gradient` 와 1:1)
  const enabledGradients = onlyEnabled(layers?.gradient || []);
  if (enabledGradients.length > 0 || ld.gradient) {
    const gradientLines = enabledGradients
      .map((g) => `- \`${g.id || g.label}\`: \`${g.gradient}\``)
      .join('\n');
    sections.push(`## Gradient\n\n${ld.gradient ? `${ld.gradient}\n\n` : ''}${gradientLines || '(없음)'}`);
  }

  // 5. Elevation & Depth — 있을 때만
  if (xElevation.length > 0 || ld.elevation) {
    const elevLines = xElevation.map((e) => `- \`${e.id}\` (level ${e.level}): \`${e.shadow}\``).join('\n');
    sections.push(`## Elevation & Depth\n\n${ld.elevation ? `${ld.elevation}\n\n` : ''}${elevLines || '(없음)'}`);
  }

  // 6. Shapes (rounded scale)
  if (Object.keys(rounded).length || ld.rounded) {
    const shapesLines = Object.entries(rounded).map(([k, v]) => `- \`${k}\`: \`${v}\``).join('\n');
    sections.push(`## Shapes\n\n${ld.rounded ? `${ld.rounded}\n\n` : ''}${shapesLines || '(없음)'}`);
  }

  // 7. Components
  if (Object.keys(components).length || ld.components) {
    const compLines = Object.entries(components).map(([name, spec]) => {
      const props = Object.entries(spec).map(([pk, pv]) => `  - \`${pk}\`: \`${pv}\``).join('\n');
      return `### \`${name}\`\n${props}`;
    }).join('\n\n');
    sections.push(`## Components\n\n${ld.components ? `${ld.components}\n\n` : ''}${compLines || '(없음)'}`);
  }

  // 8. Do's and Don'ts — VD §5/§6 추출
  const dos = vd.markdown?.match(/##\s*5\.\s*구현\s*가이드라인[\s\S]*?(?=\n##\s|$)/)?.[0];
  const donts = vd.markdown?.match(/##\s*6\.\s*피해야\s*할\s*요소[\s\S]*?(?=\n##\s|$)/)?.[0];
  if (dos || donts) {
    sections.push(
      `## Do's and Don'ts\n\n` +
      (dos ? `**Do**\n${dos.replace(/^##\s*5\.\s*구현\s*가이드라인\s*\n?/, '').trim()}\n\n` : '') +
      (donts ? `**Don't**\n${donts.replace(/^##\s*6\.\s*피해야\s*할\s*요소\s*\n?/, '').trim()}` : '')
    );
  }

  return `---\n${yamlBody}\n---\n\n<!-- DESIGN.md (Google Labs alpha spec) — generated by MUSE on ${date} -->\n\n${sections.join('\n\n')}\n`;
}

/* ============================================
 * decision-trace.md
 *   - 모든 token 의 whichReferences / whyChosen / appliedUserNotes / alternativesConsidered
 *     를 axis 별로 정렬한 문서.
 *   - TP6 결정 추적 패널의 export 형태.
 * ============================================ */

export function buildDecisionTraceMd({ project, layers }) {
  const date = new Date().toISOString().slice(0, 10);
  const sections = [];

  const renderRationale = (token) => {
    const r = token?.decisionRationale;
    if (!r) return null;
    const lines = [];
    lines.push(`- **whichReferences**: ${(r.whichReferences || []).join(', ') || '(없음)'}`);
    if (r.whichLayers?.length) lines.push(`- **whichLayers**: ${r.whichLayers.join(', ')}`);
    if (r.whyChosen) lines.push(`- **whyChosen**: ${r.whyChosen}`);
    if (r.appliedUserNotes) lines.push(`- **appliedUserNotes**: "${r.appliedUserNotes}"`);
    if (r.appliedReferenceNote) lines.push(`- **appliedReferenceNote**: "${r.appliedReferenceNote}"`);
    if (r.alternativesConsidered?.length) {
      lines.push(`- **alternativesConsidered**:`);
      for (const alt of r.alternativesConsidered) {
        lines.push(`  - \`${alt.value}\` — ${alt.reason || ''}`);
      }
    }
    return lines.join('\n');
  };

  const renderAxisArray = (axisKey, tokens) => {
    if (!tokens?.length) return;
    const items = tokens.map((tk) => {
      const rationale = renderRationale(tk);
      const head = `### \`${tk.id || tk.label}\``;
      return `${head}\n${rationale || '_(rationale 없음)_'}`;
    }).join('\n\n');
    sections.push(`## ${axisKey}\n\n${items}`);
  };

  renderAxisArray('color', layers?.color);
  renderAxisArray('typography', layers?.typography);
  renderAxisArray('layout', layers?.layout);
  renderAxisArray('gradient', layers?.gradient);
  renderAxisArray('elevation', Array.isArray(layers?.elevation) ? layers.elevation : []);

  // components — 객체 맵
  const components = layers?.components || {};
  if (Object.keys(components).length) {
    const items = Object.entries(components).map(([name, spec]) => {
      const rationale = renderRationale(spec);
      return `### \`${name}\`\n${rationale || '_(rationale 없음)_'}`;
    }).join('\n\n');
    sections.push(`## components\n\n${items}`);
  }

  if (layers?._refValidation) {
    sections.push(
      '## Token-ref Validation Notes\n\n' +
      `- fallback applied: \`${layers._refValidation.fallback ? 'yes' : 'no'}\`\n` +
      `- errors: ${(layers._refValidation.errors || []).join(', ') || '(없음)'}\n` +
      (layers._refValidation.danglingRefs?.length
        ? `- danglingRefs:\n${layers._refValidation.danglingRefs.map((d) => `  - ${d}`).join('\n')}\n`
        : '') +
      (layers._refValidation.literalProps?.length
        ? `- literalProps:\n${layers._refValidation.literalProps.map((d) => `  - ${d}`).join('\n')}`
        : '')
    );
  }

  return `# ${project?.name || 'Project'} — Decision Trace\n\n_Generated by MUSE on ${date}_\n\n` +
    `> 모든 token 의 출처 (whichReferences) + 선택 이유 (whyChosen) + 사용자 노트 인용 (appliedUserNotes) + 탈락 후보 (alternativesConsidered) 의 추적 문서.\n\n` +
    sections.join('\n\n') + '\n';
}
