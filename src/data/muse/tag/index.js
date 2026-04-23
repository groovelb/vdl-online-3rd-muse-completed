/**
 * MUSE — Tag Preset helper
 *
 * `muse_tags_preset.json` 을 읽어 레이어/카테고리별 태그 목록·설명 접근을
 * 간단하게 제공. T1 prompt / tool schema / Reference tagging UI 모두 이 헬퍼에서 pull.
 *
 * 레이어 구조:
 *  - output_target: 'token'     → color / typography / layout / gradient
 *  - output_target: 'markdown'  → visual_direction (genre / style / subject 서브카테고리)
 */

import preset from './muse_tags_preset.json';

/** preset 원본 객체 */
export const MUSE_TAGS_PRESET = preset;

export const TOKEN_LAYERS = ['color', 'typography', 'layout', 'gradient'];
export const VISUAL_DIRECTION_CATEGORIES = ['genre', 'style', 'subject'];

/** layer → tag 객체 배열 ({ tag, description }) */
export function getLayerTagObjects(layer) {
  const data = preset.layers?.[layer];
  if (!data) return [];
  if (data.tags) return data.tags;
  // visual_direction은 categories 하위
  if (data.categories) {
    return Object.values(data.categories).flatMap((c) => c.tags);
  }
  return [];
}

/** layer → tag 이름 배열 */
export function getLayerTags(layer) {
  return getLayerTagObjects(layer).map((t) => t.tag);
}

/** tool schema용 enum 배열 (getLayerTags 동일) */
export const getLayerEnum = getLayerTags;

/** visual_direction.categories.{genre|style|subject} → 태그 객체 배열 */
export function getVisualDirectionTagObjects(category) {
  return preset.layers?.visual_direction?.categories?.[category]?.tags || [];
}

export function getVisualDirectionTags(category) {
  return getVisualDirectionTagObjects(category).map((t) => t.tag);
}

/** layer+tag → description 한 줄 */
export function getTagDescription(layer, tag) {
  // token 레이어
  const fromTokenLayer = preset.layers?.[layer]?.tags?.find((t) => t.tag === tag);
  if (fromTokenLayer) return fromTokenLayer.description;
  // visual_direction — 어느 카테고리인지 모를 때 전체 탐색
  if (layer === 'visual_direction' || VISUAL_DIRECTION_CATEGORIES.includes(layer)) {
    for (const cat of VISUAL_DIRECTION_CATEGORIES) {
      const match = getVisualDirectionTagObjects(cat).find((t) => t.tag === tag);
      if (match) return match.description;
    }
  }
  return null;
}

/**
 * Claude 시스템 프롬프트에 삽입할 레이어별 어휘 블록 생성.
 * @param {string[]} layers - 포함할 레이어 (기본: 전체)
 * @returns {string}
 */
export function renderVocabularyPrompt(layers = [...TOKEN_LAYERS, 'visual_direction']) {
  const blocks = layers.map((layer) => {
    const data = preset.layers?.[layer];
    if (!data) return '';

    if (data.tags) {
      const lines = data.tags.map((t) => `  - ${t.tag}: ${t.description}`).join('\n');
      return `### ${layer} (output: ${data.output_target})\n${lines}`;
    }
    if (data.categories) {
      const catBlocks = Object.entries(data.categories).map(([catName, cat]) => {
        const lines = cat.tags.map((t) => `  - ${t.tag}: ${t.description}`).join('\n');
        return `  [${catName}] ${cat.description}\n${lines}`;
      }).join('\n');
      return `### ${layer} (output: ${data.output_target})\n${catBlocks}`;
    }
    return '';
  });
  return blocks.filter(Boolean).join('\n\n');
}
