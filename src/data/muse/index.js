/**
 * MUSE Data — barrel export
 *
 * 모든 스토리/페이지 템플릿은 여기서 import해서 더미 데이터를 사용한다.
 * 실제 이미지/데이터 교체는 각 파일(references.js, projects.js …)에서 진행.
 */

export {
  references,
  referencesById,
  getReferenceThumbnails,
  flattenTags,
} from './references.js';
export { projects, projectsById, projectsWithThumbnails } from './projects.js';
export { analysisResultsByProjectId, getAnalysisResult } from './analysisResults.js';
export { defaultUserSettings } from './userSettings.js';

// AI 태스크 정의
export {
  TASK_AUTO_TAG,
  TASK_RECOMMEND,
  TASK_ANALYZE_TOKENS,
  TASK_ANALYZE_CONCEPT,
  AI_TASKS,
  AI_TASKS_BY_ID,
  AI_WORKFLOW_DIAGRAM,
} from './aiTasks.js';

// 태그 preset helper
export {
  MUSE_TAGS_PRESET,
  TOKEN_LAYERS,
  VISUAL_DIRECTION_CATEGORIES,
  getLayerTags,
  getLayerEnum,
  getLayerTagObjects,
  getVisualDirectionTags,
  getVisualDirectionTagObjects,
  getTagDescription,
  renderVocabularyPrompt,
} from './tag/index.js';
