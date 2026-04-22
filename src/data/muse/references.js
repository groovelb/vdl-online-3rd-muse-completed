/**
 * MUSE — References 더미 데이터
 *
 * `src/data/muse/dummyImage/` 아래의 실제 이미지(reference1~28)를 정적 import해서 연결.
 * Vite가 각 import를 번들 URL로 변환하므로 개발/빌드 모두에서 안전하게 로드된다.
 *
 * 이미지 교체:
 *   - 같은 파일명을 유지하면 코드 수정 불필요 (파일만 바꿔치기)
 *   - 파일 수가 늘어나면 아래 IMAGES 배열에 항목만 추가
 *
 * @type {import('./schemas.js').Reference[]}
 */

// 정적 import — reference18~21만 .jpeg, 나머지는 .jpg
import ref1 from './dummyImage/reference1.jpg';
import ref2 from './dummyImage/reference2.jpg';
import ref3 from './dummyImage/reference3.jpg';
import ref4 from './dummyImage/reference4.jpg';
import ref5 from './dummyImage/reference5.jpg';
import ref6 from './dummyImage/reference6.jpg';
import ref7 from './dummyImage/reference7.jpg';
import ref8 from './dummyImage/reference8.jpg';
import ref9 from './dummyImage/reference9.jpg';
import ref10 from './dummyImage/reference10.jpg';
import ref11 from './dummyImage/reference11.jpg';
import ref12 from './dummyImage/reference12.jpg';
import ref13 from './dummyImage/reference13.jpg';
import ref14 from './dummyImage/reference14.jpg';
import ref15 from './dummyImage/reference15.jpg';
import ref16 from './dummyImage/reference16.jpg';
import ref17 from './dummyImage/reference17.jpg';
import ref18 from './dummyImage/reference18.jpeg';
import ref19 from './dummyImage/reference19.jpeg';
import ref20 from './dummyImage/reference20.jpeg';
import ref21 from './dummyImage/reference21.jpeg';
import ref22 from './dummyImage/reference22.jpg';
import ref23 from './dummyImage/reference23.jpg';
import ref24 from './dummyImage/reference24.jpg';
import ref25 from './dummyImage/reference25.jpg';
import ref26 from './dummyImage/reference26.jpg';
import ref27 from './dummyImage/reference27.jpg';
import ref28 from './dummyImage/reference28.jpg';

const IMAGES = [
  ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, ref10,
  ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref19, ref20,
  ref21, ref22, ref23, ref24, ref25, ref26, ref27, ref28,
];

const TAG_POOL = [
  'Muted', 'Warm', 'Deep', 'Soft', 'Bold',
  'Editorial', 'Minimal', 'Gradient', 'Brutal', 'Swiss',
  'Mono', 'Pastel', 'Neon', 'Earth', 'Ocean',
];

const COLOR_POOL = [
  '#14132B', '#4F46E5', '#FCFCFF', '#5A586E', '#E0B5A3',
  '#FEE2F5', '#FEF9C3', '#1E1B4B', '#D6D5E0', '#6366F1',
];

const TITLE_POOL = [
  'Editorial Layout', 'Brutalist Poster', 'Swiss Grid', 'Muted Portrait',
  'Gradient Mesh', 'Minimal UI', 'Dark Dashboard', 'Neon Sign',
  'Pastel Mobile', 'Earth Tone', 'Spatial Render', 'Ocean Scape',
];

const pad = (n) => String(n).padStart(3, '0');

/** 결정적 날짜 — index만으로 재현 */
const makeDate = (idx) => {
  const base = new Date('2026-01-01').getTime();
  const offset = idx * 24 * 60 * 60 * 1000 * 3; // 3일 간격
  return new Date(base + offset).toISOString().slice(0, 10);
};

export const references = IMAGES.map((url, i) => {
  const id = `ref-${pad(i + 1)}`;
  return {
    id,
    source: i % 5 === 0 ? 'url' : 'file',
    thumbnailUrl: url,
    tags: [
      TAG_POOL[i % TAG_POOL.length],
      TAG_POOL[(i * 3) % TAG_POOL.length],
      TAG_POOL[(i * 7) % TAG_POOL.length],
    ],
    dominantColors: [
      COLOR_POOL[i % COLOR_POOL.length],
      COLOR_POOL[(i * 3) % COLOR_POOL.length],
    ],
    createdAt: makeDate(i),
    title: TITLE_POOL[i % TITLE_POOL.length],
  };
});

/** id로 빠르게 찾기 위한 map */
export const referencesById = Object.fromEntries(references.map((r) => [r.id, r]));

/** 특정 id 묶음의 thumbnail 배열만 뽑기 (프로젝트 카드 썸네일 등) */
export const getReferenceThumbnails = (ids, maxCount = 4) =>
  ids
    .slice(0, maxCount)
    .map((id) => referencesById[id]?.thumbnailUrl)
    .filter(Boolean);
