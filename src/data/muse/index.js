/**
 * MUSE Data — barrel export
 *
 * 모든 스토리/페이지 템플릿은 여기서 import해서 더미 데이터를 사용한다.
 * 실제 이미지/데이터 교체는 각 파일(references.js, projects.js …)에서 진행.
 */

export { references, referencesById, getReferenceThumbnails } from './references.js';
export { projects, projectsById, projectsWithThumbnails } from './projects.js';
export { analysisResultsByProjectId, getAnalysisResult } from './analysisResults.js';
export { defaultUserSettings } from './userSettings.js';
export {
  TAG_VOCABULARY,
  TASK_AUTO_TAG,
  TASK_RECOMMEND,
  TASK_ANALYZE_TOKENS,
  AI_TASKS,
  AI_TASKS_BY_ID,
  AI_WORKFLOW_DIAGRAM,
} from './aiTasks.js';
