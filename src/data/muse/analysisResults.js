import { projects } from './projects.js';

/**
 * MUSE — 프로젝트별 분석 결과 더미
 *
 * 2026-04-22 v2: keyVisual 레이어 제거, visualDirection(Markdown) 레이어 추가.
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

/** 모든 프로젝트 fixture 가 공유하는 단일 layout preset (type 폐기 후 통합) */
const DEFAULT_LAYOUT_PRESET = [
  { id: 'lay-grid-12', label: '12 Column Grid', kind: 'grid', columns: 12, gap: 24, isEnabled: true, emphasis: 2 },
  { id: 'lay-section-gap', label: 'Section Gap', kind: 'spacing', px: 96, isEnabled: true, emphasis: 2 },
  { id: 'lay-card-pad', label: 'Card Padding', kind: 'spacing', px: 24, isEnabled: true, emphasis: 1 },
  { id: 'lay-hero', label: 'Hero Container', kind: 'container', ratio: 0.9, maxWidth: '1440px', isEnabled: true, emphasis: 1 },
];

const COLOR_PRESETS = {
  'proj-001': [
    {
      id: 'col-ink',
      label: 'Primary Ink',
      hex: '#14132B',
      role: 'primary',
      group: 'Brand',
      isEnabled: true,
      emphasis: 2,
      sourceReferenceIds: ['ref-001', 'ref-003'],
      decisionRationale: {
        whichReferences: ['ref-001', 'ref-003'],
        whichLayers: ['color'],
        whyChosen: '"흑백 대비 · 매거진 톤" 의도 매칭. 가장 짙고 채도 낮은 값',
        alternativesConsidered: [
          { value: '#000000', reason: '순흑은 매거진 톤보다 너무 강함' },
          { value: '#1F1B3D', reason: 'ref-001 dominantColors 후보였으나 채도 약간 높아 탈락' },
        ],
      },
    },
    {
      id: 'col-accent',
      label: 'Accent Violet',
      hex: '#4F46E5',
      role: 'accent',
      group: 'Brand',
      isEnabled: true,
      emphasis: 1,
      sourceReferenceIds: ['ref-002'],
      decisionRationale: {
        whichReferences: ['ref-002'],
        whichLayers: ['color'],
        whyChosen: 'ref-002 dominantColors[1]에서 추출. accent 역할에 충분한 채도',
      },
    },
    { id: 'col-secondary', label: 'Secondary Neutral', hex: '#5A586E', role: 'secondary', group: 'Brand', isEnabled: true, emphasis: 1, sourceReferenceIds: ['ref-001'] },
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

/** Visual Direction MD — visual_direction_template.md 형식으로 프로젝트별 채워둔 샘플 */
const VISUAL_DIRECTION_MD = {
  'proj-001': {
    markdown: `# Editorial Minimal — Visual Direction

> MUSE 레퍼런스 분석의 산출물 중 **맥락 기반 비주얼 디렉션**.
> 토큰 수치는 별도 \`tokens.json\` 참조.

---

## 1. 프로젝트 개요
- **프로젝트명**: Editorial Minimal
- **프로젝트 유형**: landing
- **한 문장 의도**: 흑백 대비 · 라지 타이포 · 넉넉한 여백의 매거진 톤
- **분석 레퍼런스 수**: 6장

## 2. 전체 방향성
Magazine과 Swiss 편집 전통을 기반으로, 절제된 무채 팔레트 위에 대형 세리프 헤드라인을 얹어 정적인 긴장감을 만든다.

## 3. Visual Direction 태그
- **장르**: Retro
- **스타일**: Magazine, Swiss
- **비주얼 주인공**: Typography-Hero, Editorial-Collage

## 4. 톤 & 무드 서술
- 흑백을 기본으로 바이올렛 틴트를 아주 은은하게만 섞어 차가운 중립을 유지
- 세리프 디스플레이로 대문자 헤드라인, 본문은 고밀도 Pretendard 조판
- 섹션 간 여백은 과장되게, 내부는 촘촘하게 — 리듬 대비
- 이미지는 grayscale + 입자감으로 인쇄물 감성 보강

## 5. 구현 가이드라인
- 버튼·카드 모서리는 최소 rounding (클리커블만 pill)
- 그림자는 평평한 오프셋 블러만, 컬러는 near-black 틴트
- 그리드는 12컬럼 고정, Gap은 24px
- h1/h2는 \`clamp()\` 기반 fluid 타이포

## 6. 피해야 할 요소
- 네온·비비드 컬러 전면 금지
- 3D 렌더링 일러스트 배제
- 글래스모피즘·뉴모피즘 스타일 배제
`,
    tags: {
      genre: ['Retro'],
      style: ['Magazine', 'Swiss'],
      subject: ['Typography-Hero', 'Editorial-Collage'],
    },
  },
  'proj-002': {
    markdown: `# Fintech Dashboard — Visual Direction

## 1. 프로젝트 개요
- **프로젝트명**: Fintech Dashboard
- **프로젝트 유형**: dashboard
- **한 문장 의도**: 데이터 밀도 높은 대시보드, 차분한 블루 기조

## 2. 전체 방향성
Swiss 정보 밀도 전통을 따르되 다크 톤 위에 Signal Blue 한 점만 남겨 데이터 하이라이트에 집중.

## 3. Visual Direction 태그
- **장르**: (없음)
- **스타일**: Swiss, Glassmorphic
- **비주얼 주인공**: UI-Mockup, Dense-Dashboard-Visual

## 4. 톤 & 무드 서술
- Deep Navy 바탕에 패널은 살짝 투명한 글래스 톤
- Signal Blue는 핵심 지표에만, 보조 데이터는 저채도
- 16컬럼 좁은 그리드, 패널 간 갭 16px로 밀도 극대화
- 글로우·그림자 최소화, 정보 밀도가 장식을 대체
`,
    tags: {
      genre: [],
      style: ['Swiss', 'Glassmorphic'],
      subject: ['UI-Mockup'],
    },
  },
  'proj-003': {
    markdown: `# Lifestyle App — Visual Direction

## 1. 프로젝트 개요
- **프로젝트명**: Lifestyle App
- **프로젝트 유형**: mobile
- **한 문장 의도**: 따뜻한 톤 모바일 앱, 일상적인 질감

## 2. 전체 방향성
Earth 팔레트와 Hand-Drawn 일러스트를 중심으로 일상의 따뜻한 공기감 전달.

## 3. Visual Direction 태그
- **장르**: Retro
- **스타일**: Claymorphic
- **비주얼 주인공**: Hand-Drawn, Portrait-Photo

## 4. 톤 & 무드 서술
- Warm Beige 바탕에 Terracotta로 포인트
- 카드·버튼은 Claymorphic 느낌의 soft rounded, 매트한 그림자
- 이미지는 Grainy-Visual 필터로 아날로그 감
- 타이포는 Humanist Sans, 본문 line-height 1.7 이상
`,
    tags: {
      genre: ['Retro'],
      style: ['Claymorphic'],
      subject: ['Hand-Drawn', 'Portrait-Photo'],
    },
  },
  'proj-004': {
    markdown: `# Studio Brand — Visual Direction

## 1. 프로젝트 개요
- **프로젝트명**: Studio Brand
- **프로젝트 유형**: brand
- **한 문장 의도**: 브랜딩 · 대담한 컬러 · 한정된 타이포

## 2. 전체 방향성
Neubrutalism × Risograph 교차점. 강한 블록 컬러와 거친 인쇄 질감으로 기억에 남는 인상.

## 3. Visual Direction 태그
- **장르**: Risograph
- **스타일**: Neubrutalism
- **비주얼 주인공**: Typography-Hero, Abstract-Shape

## 4. 톤 & 무드 서술
- Vivid Red × Mustard의 원색 면 분할
- 두꺼운 검정 아웃라인, 평평한 오프셋 그림자
- 단일 Display 세리프로 브랜드 워드마크 고정
- 거친 종이 노이즈를 전역 배경에 얹음
`,
    tags: {
      genre: ['Risograph'],
      style: ['Neubrutalism'],
      subject: ['Typography-Hero', 'Abstract-Shape'],
    },
  },
};

export const analysisResultsByProjectId = projects.reduce((acc, project) => {
  acc[project.id] = {
    id: `analysis-${project.id}`,
    projectId: project.id,
    status: 'done',
    updatedAt: project.createdAt,
    layers: {
      color: COLOR_PRESETS[project.id] || [],
      typography: TYPO_PRESETS.editorial,
      layout: DEFAULT_LAYOUT_PRESET,
      gradient: GRADIENT_PRESETS[project.id] || [],
      visualDirection: VISUAL_DIRECTION_MD[project.id] || {
        markdown: '# Visual Direction\n\n(not yet generated)',
        tags: { genre: [], style: [], subject: [] },
      },
    },
  };
  return acc;
}, {});

export const getAnalysisResult = (projectId) => analysisResultsByProjectId[projectId];
