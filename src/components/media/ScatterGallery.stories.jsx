import { ScatterGallery } from './ScatterGallery.jsx';
import { ALL_IMAGES, TOKENS_BY_SRC } from '../../utils/exampleImageTokens.js';

export default {
  title: 'Custom Component/6. Landing & Auth/ScatterGallery',
  component: ScatterGallery,
  parameters: { layout: 'fullscreen' },
};

/** 랜딩 히어로 배경. 흩뿌린 썸네일이 커서를 따라 조금씩 밀린다 */
export const Scatter = {
  args: {
    images: ALL_IMAGES,
    tokensBySrc: TOKENS_BY_SRC,
    sx: { height: 520 },
  },
};

/** 추출 토큰 툴팁을 켠 모습 */
export const WithTooltip = {
  args: {
    images: ALL_IMAGES,
    tokensBySrc: TOKENS_BY_SRC,
    hasTooltip: true,
    centerKeepout: 120,
    sx: { height: 520 },
  },
};
