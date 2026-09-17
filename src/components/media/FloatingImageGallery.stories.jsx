import { FloatingImageGallery } from './FloatingImageGallery.jsx';
import { ALL_IMAGES } from '../../utils/exampleImageTokens.js';

export default {
  title: 'Custom Component/6. Landing & Auth/FloatingImageGallery',
  component: FloatingImageGallery,
  parameters: { layout: 'fullscreen' },
};

/** 3차원 공간에 떠 있는 레퍼런스. 드래그와 휠로 카메라를 움직인다 */
export const Default = {
  args: {
    images: ALL_IMAGES,
    count: 30,
    isInteractive: true,
    sx: { height: 520 },
  },
};

/** 조작 없이 천천히 흘러가는 배경용 */
export const AutoDrift = {
  args: {
    images: ALL_IMAGES,
    count: 30,
    isInteractive: false,
    autoDriftZ: -1.2,
    sx: { height: 520 },
  },
};
