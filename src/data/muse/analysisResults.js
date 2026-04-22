import { getReferenceThumbnails, referencesById } from './references.js';
import { projects } from './projects.js';

/**
 * MUSE — 프로젝트별 분석 결과 더미
 *
 * 실제 AI 분석 결과를 흉내낸 형태. projectId로 조회.
 *
 * @type {Record<string, import('./schemas.js').AnalysisResult>}
 */

/** 공통 타이포 프리셋 */
const TYPO_PRESETS = {
  editorial: [
    {
      id: 'typo-display',
      label: 'Display Heading',
      variant: 'h1',
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 700,
      fontSize: 'clamp(48px, 6vw, 96px)',
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
      sampleText: 'Editorial',
      isEnabled: true,
      emphasis: 2,
    },
    {
      id: 'typo-section',
      label: 'Section Heading',
      variant: 'h2',
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 600,
      fontSize: 'clamp(32px, 4vw, 56px)',
      lineHeight: 1.15,
      letterSpacing: '-0.02em',
      isEnabled: true,
      emphasis: 1,
    },
    {
      id: 'typo-body',
      label: 'Body',
      variant: 'body1',
      fontFamily: '"Pretendard Variable", sans-serif',
      fontWeight: 400,
      fontSize: '16px',
      lineHeight: 1.7,
      isEnabled: true,
      emphasis: 1,
    },
    {
      id: 'typo-caption',
      label: 'Caption',
      variant: 'caption',
      fontFamily: '"Pretendard Variable", sans-serif',
      fontWeight: 500,
      fontSize: '12px',
      lineHeight: 1.5,
      letterSpacing: '0.02em',
      isEnabled: false,
      emphasis: 0,
    },
  ],
};

/** 공통 레이아웃 프리셋 */
const LAYOUT_PRESETS = {
  landing: [
    { id: 'lay-grid-12', label: '12 Column Grid', kind: 'grid', columns: 12, gap: 24, isEnabled: true, emphasis: 2 },
    { id: 'lay-section-gap', label: 'Section Gap', kind: 'spacing', px: 96, isEnabled: true, emphasis: 2 },
    { id: 'lay-card-pad', label: 'Card Padding', kind: 'spacing', px: 24, isEnabled: true, emphasis: 1 },
    { id: 'lay-hero', label: 'Hero Container', kind: 'container', ratio: 0.9, maxWidth: '1440px', isEnabled: true, emphasis: 1 },
  ],
  dashboard: [
    { id: 'lay-grid-16', label: '16 Column Grid', kind: 'grid', columns: 16, gap: 16, isEnabled: true, emphasis: 2 },
    { id: 'lay-panel-gap', label: 'Panel Gap', kind: 'spacing', px: 16, isEnabled: true, emphasis: 1 },
    { id: 'lay-wide', label: 'Wide Container', kind: 'container', ratio: 1.0, maxWidth: 'none', isEnabled: true, emphasis: 1 },
  ],
  mobile: [
    { id: 'lay-grid-4', label: '4 Column Grid', kind: 'grid', columns: 4, gap: 12, isEnabled: true, emphasis: 2 },
    { id: 'lay-touch-pad', label: 'Touch Padding', kind: 'spacing', px: 20, isEnabled: true, emphasis: 1 },
    { id: 'lay-narrow', label: 'Mobile Container', kind: 'container', ratio: 1.0, maxWidth: '480px', isEnabled: true, emphasis: 1 },
  ],
  brand: [
    { id: 'lay-grid-6', label: '6 Column Grid', kind: 'grid', columns: 6, gap: 32, isEnabled: true, emphasis: 2 },
    { id: 'lay-generous', label: 'Generous Gap', kind: 'spacing', px: 120, isEnabled: true, emphasis: 2 },
  ],
};

/** 프로젝트별 맞춤 컬러 시드 */
const COLOR_PRESETS = {
  'proj-001': [
    { id: 'col-ink', label: 'Primary Ink', hex: '#14132B', role: 'primary', group: 'Brand', isEnabled: true, emphasis: 2 },
    { id: 'col-accent', label: 'Accent Violet', hex: '#4F46E5', role: 'accent', group: 'Brand', isEnabled: true, emphasis: 1 },
    { id: 'col-secondary', label: 'Secondary Neutral', hex: '#5A586E', role: 'secondary', group: 'Brand', isEnabled: true, emphasis: 1 },
    { id: 'col-bg', label: 'Background Tint', hex: '#FCFCFF', group: 'Surface', isEnabled: true, emphasis: 0 },
    { id: 'col-muted', label: 'Muted Grey', hex: '#7A798E', group: 'Neutral', isEnabled: false, emphasis: 0 },
  ],
  'proj-002': [
    { id: 'col-deep', label: 'Deep Navy', hex: '#0F172A', role: 'primary', group: 'Brand', isEnabled: true, emphasis: 2 },
    { id: 'col-signal', label: 'Signal Blue', hex: '#2563EB', role: 'accent', group: 'Data', isEnabled: true, emphasis: 2 },
    { id: 'col-ok', label: 'Success', hex: '#10B981', group: 'Data', isEnabled: true, emphasis: 1 },
    { id: 'col-warn', label: 'Warning', hex: '#F59E0B', group: 'Data', isEnabled: true, emphasis: 1 },
    { id: 'col-err', label: 'Error', hex: '#EF4444', group: 'Data', isEnabled: true, emphasis: 1 },
    { id: 'col-panel', label: 'Panel BG', hex: '#F8FAFC', group: 'Surface', isEnabled: true, emphasis: 0 },
  ],
  'proj-003': [
    { id: 'col-warm', label: 'Warm Beige', hex: '#E8DCC4', role: 'primary', group: 'Brand', isEnabled: true, emphasis: 2 },
    { id: 'col-terra', label: 'Terracotta', hex: '#C97D5D', role: 'accent', group: 'Brand', isEnabled: true, emphasis: 2 },
    { id: 'col-soft', label: 'Soft Cream', hex: '#FAF5EB', group: 'Surface', isEnabled: true, emphasis: 0 },
    { id: 'col-deep-brown', label: 'Deep Brown', hex: '#3E2C20', role: 'secondary', group: 'Brand', isEnabled: true, emphasis: 1 },
  ],
  'proj-004': [
    { id: 'col-vivid', label: 'Vivid Red', hex: '#E63946', role: 'primary', group: 'Brand', isEnabled: true, emphasis: 2 },
    { id: 'col-mustard', label: 'Mustard', hex: '#F4A261', role: 'accent', group: 'Brand', isEnabled: true, emphasis: 2 },
    { id: 'col-ink', label: 'Ink Black', hex: '#000000', role: 'secondary', group: 'Brand', isEnabled: true, emphasis: 1 },
    { id: 'col-off-white', label: 'Off White', hex: '#F1F1E8', group: 'Surface', isEnabled: true, emphasis: 0 },
  ],
};

/** 프로젝트별 그라디언트 */
const GRADIENT_PRESETS = {
  'proj-001': [
    { id: 'grad-indigo-dusk', label: 'Indigo Dusk', gradient: 'linear-gradient(180deg, #1E1B4B, #4F46E5)', isEnabled: true, emphasis: 2 },
    { id: 'grad-muted-sand', label: 'Muted Sand', gradient: 'linear-gradient(90deg, #E8E7F0, #D6D5E0)', isEnabled: false, emphasis: 0 },
  ],
  'proj-002': [
    { id: 'grad-data-sky', label: 'Data Sky', gradient: 'linear-gradient(135deg, #2563EB, #0EA5E9)', isEnabled: true, emphasis: 2 },
  ],
  'proj-003': [
    { id: 'grad-sunset', label: 'Sunset', gradient: 'linear-gradient(135deg, #F4A261, #E76F51)', isEnabled: true, emphasis: 2 },
    { id: 'grad-cream', label: 'Cream Wash', gradient: 'linear-gradient(180deg, #FAF5EB, #E8DCC4)', isEnabled: true, emphasis: 1 },
  ],
  'proj-004': [
    { id: 'grad-hot', label: 'Hot Mustard', gradient: 'radial-gradient(circle at 30% 30%, #F4A261, #E63946 70%)', isEnabled: true, emphasis: 2 },
  ],
};

/** 키비주얼은 연결된 reference 썸네일 중 일부 선택 */
const buildKeyVisuals = (project) =>
  getReferenceThumbnails(project.referenceIds, 6).map((url, i) => ({
    id: `kv-${project.id}-${i + 1}`,
    thumbnailUrl: url,
    caption: referencesById[project.referenceIds[i]]?.title,
    isEnabled: i < 4,
    emphasis: i === 0 ? 2 : i < 3 ? 1 : 0,
  }));

export const analysisResultsByProjectId = projects.reduce((acc, project) => {
  acc[project.id] = {
    id: `analysis-${project.id}`,
    projectId: project.id,
    status: 'done',
    updatedAt: project.createdAt,
    layers: {
      color: COLOR_PRESETS[project.id] || [],
      typography: TYPO_PRESETS.editorial, // 공통 — 프로젝트별 베리에이션은 추후 확장
      layout: LAYOUT_PRESETS[project.type] || [],
      gradient: GRADIENT_PRESETS[project.id] || [],
      keyVisual: buildKeyVisuals(project),
    },
  };
  return acc;
}, {});

export const getAnalysisResult = (projectId) => analysisResultsByProjectId[projectId];
