import { DesignMdPreview } from './DesignMdPreview.jsx';
import { projects, analysisResultsByProjectId } from '../../data/muse';

const project = projects[0];
const layers = analysisResultsByProjectId[project.id]?.layers;

export default {
  title: 'Custom Component/4. AI Flow & Output/DesignMdPreview',
  component: DesignMdPreview,
  parameters: { layout: 'padded' },
};

/** 시스템 모드 산출물 전체. 토큰과 결정 로그가 한 문서로 묶인다 */
export const Full = {
  args: { project, layers, variant: 'full' },
};

/** 붙여넣기용 원문만 */
export const Raw = {
  args: { project, layers, variant: 'raw' },
};

/** 화면용 요약 */
export const Showcase = {
  args: { project, layers, variant: 'showcase' },
};
