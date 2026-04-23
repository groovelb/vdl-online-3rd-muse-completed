/**
 * MUSE — References 더미 데이터
 *
 * `dummyImage/reference{N}.jpg|jpeg` 27장을 정적 import해 thumbnailUrl로 연결.
 * tags는 preset(muse_tags_preset.json) 기반 레이어별 중첩 구조.
 * 결정적(deterministic) 패턴으로 태그 배분 — seed 없이도 일관 재현.
 *
 * 이미지 교체:
 *   - 같은 파일명으로 바꿔치기하면 코드 수정 불필요
 *   - 파일 추가 시 IMAGES 배열에 import 한 줄 추가
 *
 * @type {import('./schemas.js').Reference[]}
 */

import {
  getLayerTags,
  getVisualDirectionTags,
} from './tag/index.js';

// reference1.jpg 제거됨 (sess 010), ref-001은 reference2.jpg로 매핑
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
  ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, ref10,
  ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref19, ref20,
  ref21, ref22, ref23, ref24, ref25, ref26, ref27, ref28,
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

const makeDate = (idx) => {
  const base = new Date('2026-01-01').getTime();
  const offset = idx * 24 * 60 * 60 * 1000 * 3;
  return new Date(base + offset).toISOString().slice(0, 10);
};

/** 결정적 샘플링: pool에서 idx 기반으로 count개 뽑기 (중복 없음) */
const pickDeterministic = (pool, idx, count, step = 1) => {
  if (!pool.length || count <= 0) return [];
  const out = [];
  const seen = new Set();
  let cursor = idx * step;
  for (let i = 0; i < count && i < pool.length; i += 1) {
    let k = (cursor + i * (step + 1)) % pool.length;
    let guard = 0;
    while (seen.has(k) && guard < pool.length) {
      k = (k + 1) % pool.length;
      guard += 1;
    }
    seen.add(k);
    out.push(pool[k]);
  }
  return out;
};

const COLOR_TAGS = getLayerTags('color');
const TYPO_TAGS = getLayerTags('typography');
const LAYOUT_TAGS = getLayerTags('layout');
const GRADIENT_TAGS = getLayerTags('gradient');
const GENRE_TAGS = getVisualDirectionTags('genre');
const STYLE_TAGS = getVisualDirectionTags('style');
const SUBJECT_TAGS = getVisualDirectionTags('subject');

/** 이미지 인덱스로부터 각 레이어에 몇 개의 태그를 줄지 결정 */
const tagCountForIndex = (i, base = 2, range = 2) =>
  ((i % range) + base); // 2~3개

export const references = IMAGES.map((url, i) => {
  const id = `ref-${pad(i + 1)}`;
  return {
    id,
    source: i % 5 === 0 ? 'url' : 'file',
    thumbnailUrl: url,
    tags: {
      color: pickDeterministic(COLOR_TAGS, i, tagCountForIndex(i), 3),
      typography: pickDeterministic(TYPO_TAGS, i, 1 + (i % 2), 5),
      layout: pickDeterministic(LAYOUT_TAGS, i, 1 + (i % 2), 4),
      gradient: pickDeterministic(GRADIENT_TAGS, i, i % 2, 2), // 0~1개 (그라디언트 없는 이미지도 많음)
      visualDirection: {
        genre: pickDeterministic(GENRE_TAGS, i, 1, 3),
        style: pickDeterministic(STYLE_TAGS, i, 1, 5),
        subject: pickDeterministic(SUBJECT_TAGS, i, 1, 2),
      },
    },
    dominantColors: [
      COLOR_POOL[i % COLOR_POOL.length],
      COLOR_POOL[(i * 3) % COLOR_POOL.length],
    ],
    createdAt: makeDate(i),
    title: TITLE_POOL[i % TITLE_POOL.length],
  };
});

export const referencesById = Object.fromEntries(references.map((r) => [r.id, r]));

export const getReferenceThumbnails = (ids, maxCount = 4) =>
  ids
    .slice(0, maxCount)
    .map((id) => referencesById[id]?.thumbnailUrl)
    .filter(Boolean);

/**
 * 레이어별 중첩 tags를 flat string[] 로 변환.
 * 기존 코드(필터·검색)에서 `ref.tags`가 배열이라고 가정한 곳에 어댑터로 사용.
 * @param {import('./schemas.js').Reference} ref
 * @returns {string[]}
 */
export function flattenTags(ref) {
  const t = ref?.tags;
  if (!t) return [];
  if (Array.isArray(t)) return t; // 구버전 호환
  return [
    ...(t.color || []),
    ...(t.typography || []),
    ...(t.layout || []),
    ...(t.gradient || []),
    ...(t.visualDirection?.genre || []),
    ...(t.visualDirection?.style || []),
    ...(t.visualDirection?.subject || []),
  ];
}
