/**
 * exampleImageTokens
 *
 * `src/assets/example/*` 19 장 + `exampleTokens.json` 의 T1 결과를 한 곳에서 빌드해
 * 랜딩 / 데모 / Storybook 어디서든 동일한 풀을 import 해 쓰도록 한다.
 *
 * 5 개 파일에 흩어져있던 동일한 Vite glob + 매핑 로직 통합 (2026-04-30).
 */

import exampleTokensJson from '../data/exampleTokens.json';

/* Vite glob — 빌드 시점에 example 이미지 번들링 */
const imageModules = import.meta.glob('../assets/example/*.{jpg,jpeg,png}', {
  eager: true,
  query: '?url',
  import: 'default',
});

/** basename → 번들된 URL */
export const URL_BY_BASENAME = (() => {
  const out = {};
  for (const [filePath, url] of Object.entries(imageModules)) {
    out[filePath.split('/').pop()] = url;
  }
  return out;
})();

/** 모든 example 이미지의 번들 URL 배열 */
export const ALL_IMAGES = Object.values(imageModules);

/**
 * 번들 URL → { title, colors, tags } 매핑 (T1 결과 lookup).
 * tags 는 4 개로 자른 상태.
 */
export const TOKENS_BY_SRC = (() => {
  const out = {};
  for (const [filePath, url] of Object.entries(imageModules)) {
    const basename = filePath.split('/').pop();
    const t = exampleTokensJson[basename];
    if (!t) continue;
    out[url] = {
      title: t.title,
      colors: t.dominantColors,
      tags: (t.tags || []).slice(0, 4),
    };
  }
  return out;
})();

/** basename 1 개로부터 single demo entry 추출 (랜딩 stage 1 / stage 2 데모 카드 빌드용). */
export function getExampleByBasename(basename) {
  const t = exampleTokensJson[basename];
  const src = URL_BY_BASENAME[basename];
  if (!t || !src) return null;
  return {
    src,
    title: t.title,
    tags: (t.tags || []).slice(0, 3),
    dominantColors: (t.dominantColors || []).slice(0, 5),
  };
}
