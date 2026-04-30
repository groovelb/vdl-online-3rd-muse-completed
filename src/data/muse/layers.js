/**
 * MUSE layer 정의 단일 진실 원천
 *
 * 5 개 파일에 흩어져있던 layer 라벨 / 키 정의 통합 (2026-04-30).
 *  - ProjectCreateWizard, ProjectDetailPage, LandingSolutionStage2, ReferenceNotesDialog,
 *    ReferenceLayerChipRow 가 각자 정의하던 LAYER_LABEL / LAYERS / LAYER_DEFS 를 흡수.
 */

/** 짧은 한국어 라벨 (chip / 컴팩트 UI 용) */
export const LAYER_LABEL = {
  color: '색',
  typography: '타이포',
  layout: '레이아웃',
  gradient: '그라디언트',
  visualDirection: '무드',
  components: '컴포넌트',
};

/**
 * 분석 결과 4 layer + visualDirection (CategoryTab 용 카테고리 배열).
 *  ProjectDetailPage / LandingSolutionStage2 의 좌측 탭에서 사용.
 *  designMd 탭이 필요하면 LAYERS_WITH_DESIGN_MD 사용.
 */
export const ANALYSIS_LAYERS = [
  { id: 'color', label: '컬러' },
  { id: 'typography', label: '타이포' },
  { id: 'layout', label: '레이아웃' },
  { id: 'gradient', label: '그라디언트' },
  { id: 'visualDirection', label: '비주얼 디렉션' },
];

/** 위 + DESIGN.md 탭 (system mode 결과 화면 / 랜딩 stage 2) */
export const ANALYSIS_LAYERS_WITH_DESIGN_MD = [
  ...ANALYSIS_LAYERS,
  { id: 'designMd', label: 'DESIGN.md' },
];

/**
 * ReferenceLayerChipRow 의 레이어 차용 chip 정의.
 *  label 은 짧은 1-2 자, short 는 동일 (현재 둘 다 동일하지만 분리 유지 — 추후 차등 라벨 가능)
 */
export const LAYER_CHIP_DEFS_BASE = [
  { key: 'color', label: '색', short: '색' },
  { key: 'typography', label: '타이포', short: '타이포' },
  { key: 'layout', label: '레이아웃', short: '레이아웃' },
  { key: 'gradient', label: '그라디언트', short: '그라디언트' },
  { key: 'visualDirection', label: '무드', short: '무드' },
];

/** system 모드 한정 — 컴포넌트 결합 차용 chip (DESIGN.md components 축) */
export const LAYER_CHIP_DEF_COMPONENTS = {
  key: 'components',
  label: '컴포넌트',
  short: '컴포넌트',
};

/** 토큰 편집 패널 카테고리 정의 (key + 한국어 label, MUSE_LAYERS 의 옛 명칭) */
export const TOKEN_LAYER_CATEGORIES = [
  { key: 'color', label: '컬러' },
  { key: 'typography', label: '타이포그래피' },
  { key: 'layout', label: '레이아웃' },
  { key: 'gradient', label: '그라디언트' },
  { key: 'visualDirection', label: '비주얼 디렉션' },
];
