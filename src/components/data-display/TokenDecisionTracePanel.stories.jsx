import { TokenDecisionTracePanel } from './TokenDecisionTracePanel.jsx';
import { references, projects, analysisResultsByProjectId } from '../../data/muse';

const layers = analysisResultsByProjectId[projects[0].id]?.layers;
const sample = (layers?.color || []).find((t) => t.decisionRationale) || null;

export default {
  title: 'Custom Component/5. Token Decision/TokenDecisionTracePanel',
  component: TokenDecisionTracePanel,
  parameters: { layout: 'padded' },
};

/** 토큰 하나의 출처, 고른 이유, 탈락 후보를 펼친 모습 */
export const Default = {
  args: {
    decisionRationale: sample?.decisionRationale,
    references,
  },
};

/** 출처 레퍼런스를 넘기지 않았을 때. 썸네일 없이 글만 남는다 */
export const WithoutThumbnails = {
  args: {
    decisionRationale: sample?.decisionRationale,
    references: [],
  },
};
