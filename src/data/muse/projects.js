import { getReferenceThumbnails } from './references.js';

/**
 * MUSE — Projects 더미 데이터
 *
 * 각 프로젝트의 referenceIds는 `src/data/muse/dummyImage/` 이미지 풀(ref-001~ref-028)에서 고름.
 * 썸네일은 projectsWithThumbnails에서 references의 thumbnailUrl로 자동 파생.
 *
 * @type {import('./schemas.js').Project[]}
 */
export const projects = [
  {
    id: 'proj-001',
    name: 'Editorial Minimal',
    intent: '흑백 대비 · 라지 타이포 · 넉넉한 여백의 매거진 톤',
    type: 'landing',
    referenceIds: ['ref-001', 'ref-002', 'ref-003', 'ref-004', 'ref-005', 'ref-006'],
    createdAt: '2026-04-20',
  },
  {
    id: 'proj-002',
    name: 'Fintech Dashboard',
    intent: '데이터 밀도 높은 대시보드, 차분한 블루 기조',
    type: 'dashboard',
    referenceIds: ['ref-007', 'ref-008', 'ref-009', 'ref-010', 'ref-011'],
    createdAt: '2026-04-18',
  },
  {
    id: 'proj-003',
    name: 'Lifestyle App',
    intent: '따뜻한 톤 모바일 앱, 일상적인 질감',
    type: 'mobile',
    referenceIds: ['ref-012', 'ref-013', 'ref-014', 'ref-015', 'ref-016'],
    createdAt: '2026-04-15',
  },
  {
    id: 'proj-004',
    name: 'Studio Brand',
    intent: '브랜딩 · 대담한 컬러 · 한정된 타이포',
    type: 'brand',
    referenceIds: ['ref-017', 'ref-018', 'ref-019', 'ref-020', 'ref-021', 'ref-022', 'ref-023'],
    createdAt: '2026-04-10',
  },
];

export const projectsById = Object.fromEntries(projects.map((p) => [p.id, p]));

/** 프로젝트 카드에 꽂을 수 있도록 썸네일 URL까지 조립된 형태 */
export const projectsWithThumbnails = projects.map((p) => ({
  ...p,
  thumbnails: getReferenceThumbnails(p.referenceIds, 4),
}));
