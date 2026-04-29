import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import { buildDesignMd } from '../../utils/handoffConverters.js';

/**
 * DESIGN.md preview — getdesign.md 스타일.
 *
 * variant 별 분기:
 *  - 'raw'      : DESIGN.md raw markdown 박스 + 복사 / 다운로드만 (DESIGN.md 탭 용)
 *  - 'showcase' : components 라이브 렌더 + spacing/rounded/elevation 시각화 (디자인 가이드 용, 탭 밖 하단)
 *  - 'full'     : 모두 (default — 단독 사용 시)
 *
 * Props:
 * @param {object} project - { name, intent, mode } [Required]
 * @param {object} layers  - analysis layers [Required]
 * @param {'raw'|'showcase'|'full'} variant - 분기 [Optional, 기본값: 'full']
 *
 * Example:
 * <DesignMdPreview project={ project } layers={ analysis } variant="raw" />
 */
export function DesignMdPreview({ project, layers, variant = 'full' }) {
  const [copied, setCopied] = useState(false);

  const designMd = useMemo(
    () => buildDesignMd({ project, layers }),
    [project, layers],
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(designMd);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

  const handleDownload = () => {
    const blob = new Blob([designMd], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(project?.name || 'design').toLowerCase().replace(/\s+/g, '-')}.DESIGN.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const components = layers?.components || {};
  const componentEntries = Object.entries(components);

  const showRaw = variant === 'raw' || variant === 'full';
  const showShowcase = variant === 'showcase' || variant === 'full';

  const Header = (
    <Box sx={ { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' } }>
      <Box>
        <Typography variant="overline" color="text.secondary" sx={ { letterSpacing: '0.12em' } }>
          { variant === 'showcase' ? 'DESIGN SYSTEM SHOWCASE' : 'DESIGN.MD' }
        </Typography>
        <Typography variant="h5" sx={ { fontWeight: 600, mt: 0.5 } }>
          { project?.name || 'Untitled' }
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={ { mt: 0.5 } }>
          { variant === 'showcase'
            ? '이 시스템의 컴포넌트 라이브 미리보기 + spacing / rounded / elevation 스케일'
            : 'Google Labs alpha spec — AI 코딩 에이전트가 그대로 컨텍스트로 받음' }
        </Typography>
      </Box>
      { showRaw && (
        <Box sx={ { display: 'flex', gap: 1 } }>
          <Button
            variant="outlined"
            size="small"
            startIcon={ copied ? <CheckIcon /> : <ContentCopyIcon /> }
            onClick={ handleCopy }
          >
            { copied ? '복사됨' : '전체 복사' }
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={ <DownloadIcon /> }
            onClick={ handleDownload }
          >
            DESIGN.md
          </Button>
        </Box>
      ) }
    </Box>
  );

  return (
    <Box sx={ { display: 'flex', flexDirection: 'column', gap: 4 } }>
      { Header }

      {/* ================ Components Live Preview (showcase 전용) ================ */}
      { showShowcase && componentEntries.length > 0 && (
        <Box>
          <Typography variant="overline" color="text.secondary" sx={ { letterSpacing: '0.12em', display: 'block', mb: 1.5 } }>
            COMPONENTS LIVE PREVIEW · { componentEntries.length }개
          </Typography>
          <Box sx={ { display: 'flex', flexDirection: 'column', gap: 2 } }>
            { componentEntries.map(([name, spec]) => (
              <ComponentCard key={ name } name={ name } spec={ spec } layers={ layers } />
            )) }
          </Box>
        </Box>
      ) }

      {/* ================ Spacing / Rounded / Elevation (showcase 전용) ================ */}
      { showShowcase && (
        <Box sx={ { display: 'flex', flexDirection: 'column', gap: 4 } }>
          <ScaleVisualizer
            title="SPACING"
            scale={ layers?.spacing }
            renderer={ (val) => (
              <Box sx={ { width: 12, height: val, bgcolor: 'primary.main', borderRadius: 0.5 } } />
            ) }
            empty="(spacing 없음)"
          />
          <ScaleVisualizer
            title="ROUNDED"
            scale={ layers?.rounded }
            renderer={ (val) => (
              <Box sx={ { width: 48, height: 48, bgcolor: 'primary.main', borderRadius: val } } />
            ) }
            empty="(rounded 없음)"
          />
          <ElevationVisualizer elevation={ layers?.elevation } />
        </Box>
      ) }

      {/* ================ Raw DESIGN.md (raw 전용) ================ */}
      { showRaw && (
        <Box>
          <Typography variant="overline" color="text.secondary" sx={ { letterSpacing: '0.12em', display: 'block', mb: 1 } }>
            DESIGN.MD (RAW)
          </Typography>
          <Box sx={ { position: 'relative' } }>
            <Box
              component="pre"
              sx={ {
                m: 0,
                p: 2.5,
                bgcolor: 'grey.50',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                fontSize: 12,
                lineHeight: 1.7,
                fontFamily: 'monospace',
                maxHeight: 520,
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              } }
            >
              { designMd }
            </Box>
            <Tooltip title={ copied ? '복사됨' : '전체 복사' } arrow>
              <IconButton
                size="small"
                onClick={ handleCopy }
                sx={ {
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                } }
              >
                { copied ? <CheckIcon fontSize="small" sx={ { color: 'success.main' } } /> : <ContentCopyIcon fontSize="small" /> }
              </IconButton>
            </Tooltip>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={ { display: 'block', mt: 1 } }>
            { designMd.length.toLocaleString() } chars · YAML front-matter + prose 8 sections (있는 섹션만 canonical 순서)
          </Typography>
        </Box>
      ) }
    </Box>
  );
}

/* ============================================
 * Helpers
 * ============================================ */

const REF_REGEX = /^\{([a-z]+)\.([a-zA-Z0-9_-]+)\}$/;

/** {a.b} → 실제 값. resolve 실패 시 null. */
function resolveRef(value, layers) {
  if (typeof value !== 'string') return value;
  const m = value.match(REF_REGEX);
  if (!m) return value;
  const [, axis, id] = m;
  if (axis === 'colors') {
    const c = (layers?.color || []).find((x) => x.id === id || x.role === id);
    return c?.hex || null;
  }
  if (axis === 'typography') {
    const t = (layers?.typography || []).find((x) => x.id === id || x.variant === id);
    return t || null;
  }
  if (axis === 'spacing') return layers?.spacing?.[id] ?? null;
  if (axis === 'rounded') return layers?.rounded?.[id] ?? null;
  if (axis === 'elevation') {
    const e = (layers?.elevation || []).find((x) => x.id === id);
    return e?.shadow || null;
  }
  return null;
}

/** component spec → MUI sx */
function specToSx(spec, layers) {
  const sx = {};
  const bg = resolveRef(spec?.backgroundColor, layers);
  if (bg) sx.bgcolor = bg;
  const fg = resolveRef(spec?.textColor, layers);
  if (fg) sx.color = fg;
  const border = resolveRef(spec?.borderColor, layers);
  if (border) {
    sx.border = '1px solid';
    sx.borderColor = border;
  }
  const radius = resolveRef(spec?.rounded, layers);
  if (radius) sx.borderRadius = typeof radius === 'number' ? `${radius}px` : radius;
  const padding = resolveRef(spec?.padding, layers);
  if (padding) sx.padding = typeof padding === 'number' ? `${padding}px` : padding;
  const elev = resolveRef(spec?.elevation, layers);
  if (elev) sx.boxShadow = elev;
  const typo = resolveRef(spec?.typography, layers);
  if (typo) {
    if (typo.fontFamily) sx.fontFamily = typo.fontFamily;
    if (typo.fontSize) sx.fontSize = typo.fontSize;
    if (typo.fontWeight) sx.fontWeight = typo.fontWeight;
    if (typo.lineHeight) sx.lineHeight = typo.lineHeight;
    if (typo.letterSpacing) sx.letterSpacing = typo.letterSpacing;
  }
  if (spec?.size) sx.fontSize = spec.size;
  if (spec?.height) sx.minHeight = spec.height;
  if (spec?.width) sx.width = spec.width;
  return sx;
}

/* ============================================
 * Subcomponents
 * ============================================ */

function ComponentCard({ name, spec, layers }) {
  const sx = specToSx(spec, layers);
  const propEntries = Object.entries(spec || {}).filter(([k]) => k !== 'decisionRationale');

  // 컴포넌트 이름 패턴별 라이브 렌더
  const lower = String(name).toLowerCase();
  const isButton = lower.includes('button') || lower.includes('cta') || lower.endsWith('-btn');
  const isCard = lower.includes('card') || lower === 'surface' || lower.includes('panel');
  const isInput = lower.includes('input') || lower.includes('textfield') || lower.includes('field');
  const isAppBar = lower.includes('app-bar') || lower.includes('appbar') || lower.includes('header') || lower.includes('navbar');
  const isChip = lower.includes('chip') || lower.includes('tag') || lower.includes('badge');

  return (
    <Box
      sx={ {
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        p: 2,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      } }
    >
      <Typography
        variant="caption"
        sx={ {
          fontFamily: 'monospace',
          color: 'text.secondary',
          fontSize: '0.72rem',
          fontWeight: 600,
        } }
      >
        { name }
      </Typography>

      {/* Live render */}
      <Box
        sx={ {
          minHeight: 84,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          bgcolor: 'grey.50',
          borderRadius: 1,
          border: '1px dashed',
          borderColor: 'divider',
        } }
      >
        { isButton && (
          <Box
            component="span"
            sx={ {
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'default',
              userSelect: 'none',
              ...sx,
              padding: sx.padding || '8px 16px',
            } }
          >
            { name.includes('secondary') ? 'Secondary' : 'Primary CTA' }
          </Box>
        ) }
        { isCard && (
          <Box sx={ { width: '100%', minHeight: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', ...sx } }>
            <Typography variant="body2" sx={ { opacity: 0.8 } }>Card content</Typography>
          </Box>
        ) }
        { isInput && (
          <Box
            sx={ {
              width: '100%',
              ...sx,
              padding: sx.padding || '8px 12px',
              border: sx.border || '1px solid',
              borderColor: sx.borderColor || 'divider',
              fontFamily: sx.fontFamily,
            } }
          >
            <Typography variant="body2" sx={ { opacity: 0.5 } }>placeholder</Typography>
          </Box>
        ) }
        { isAppBar && (
          <Box sx={ { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', ...sx, padding: sx.padding || '12px 16px' } }>
            <Typography variant="body2" sx={ { fontWeight: 600 } }>Brand</Typography>
            <Typography variant="caption" sx={ { opacity: 0.7 } }>Menu</Typography>
          </Box>
        ) }
        { isChip && (
          <Box component="span" sx={ { display: 'inline-flex', alignItems: 'center', ...sx, padding: sx.padding || '4px 10px' } }>
            { name }
          </Box>
        ) }
        { !isButton && !isCard && !isInput && !isAppBar && !isChip && (
          <Box sx={ { width: '100%', minHeight: 60, ...sx } }>
            <Typography variant="caption" sx={ { opacity: 0.6 } }>{ name }</Typography>
          </Box>
        ) }
      </Box>

      {/* Spec props */}
      <Box sx={ { display: 'flex', flexDirection: 'column', gap: 0.5 } }>
        { propEntries.map(([k, v]) => (
          <Box key={ k } sx={ { display: 'flex', gap: 1, alignItems: 'baseline', fontSize: 11 } }>
            <Typography variant="caption" sx={ { fontFamily: 'monospace', color: 'text.secondary', minWidth: 110 } }>
              { k }
            </Typography>
            <Typography variant="caption" sx={ { fontFamily: 'monospace', wordBreak: 'break-all' } }>
              { typeof v === 'string' ? v : JSON.stringify(v) }
            </Typography>
          </Box>
        )) }
      </Box>
    </Box>
  );
}

function ScaleVisualizer({ title, scale, renderer, empty }) {
  const entries = Object.entries(scale || {});
  return (
    <Box>
      <Typography variant="overline" color="text.secondary" sx={ { letterSpacing: '0.12em', display: 'block', mb: 1 } }>
        { title } · { entries.length }
      </Typography>
      { entries.length === 0 ? (
        <Typography variant="body2" color="text.disabled" sx={ { fontStyle: 'italic' } }>
          { empty }
        </Typography>
      ) : (
        <Box sx={ { display: 'flex', flexDirection: 'column', gap: 1.5 } }>
          { entries.map(([key, val]) => (
            <Box key={ key } sx={ { display: 'flex', alignItems: 'center', gap: 2 } }>
              <Typography variant="caption" sx={ { fontFamily: 'monospace', minWidth: 36, fontWeight: 600 } }>
                { key }
              </Typography>
              <Box sx={ { flexShrink: 0 } }>{ renderer(typeof val === 'number' ? `${val}px` : val) }</Box>
              <Typography variant="caption" color="text.secondary" sx={ { fontFamily: 'monospace' } }>
                { typeof val === 'number' ? `${val}px` : val }
              </Typography>
            </Box>
          )) }
        </Box>
      ) }
    </Box>
  );
}

function ElevationVisualizer({ elevation }) {
  const list = Array.isArray(elevation) ? elevation : [];
  return (
    <Box>
      <Typography variant="overline" color="text.secondary" sx={ { letterSpacing: '0.12em', display: 'block', mb: 1 } }>
        ELEVATION · { list.length }
      </Typography>
      { list.length === 0 ? (
        <Typography variant="body2" color="text.disabled" sx={ { fontStyle: 'italic' } }>
          (elevation 없음 — 평면 디자인)
        </Typography>
      ) : (
        <Box sx={ { display: 'flex', flexDirection: 'column', gap: 1.5 } }>
          { list.map((e) => (
            <Box key={ e.id || e.label } sx={ { display: 'flex', alignItems: 'center', gap: 2 } }>
              <Box sx={ { width: 48, height: 48, bgcolor: 'background.paper', borderRadius: 1, boxShadow: e.shadow } } />
              <Box sx={ { flex: 1 } }>
                <Typography variant="caption" sx={ { fontFamily: 'monospace', fontWeight: 600, display: 'block' } }>
                  { e.id || e.label } { e.level !== undefined && <Chip size="small" label={ `L${e.level}` } sx={ { height: 16, fontSize: '0.65rem', ml: 0.5 } } /> }
                </Typography>
                <Typography variant="caption" sx={ { fontFamily: 'monospace', color: 'text.secondary', display: 'block', wordBreak: 'break-all' } }>
                  { e.shadow }
                </Typography>
              </Box>
            </Box>
          )) }
        </Box>
      ) }
    </Box>
  );
}
