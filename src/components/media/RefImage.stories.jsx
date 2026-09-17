import { RefImage } from './RefImage.jsx';
import { references } from '../../data/muse';

export default {
  title: 'Custom Component/1. Reference & Tagging/RefImage',
  component: RefImage,
  parameters: { layout: 'centered' },
};

/** 레퍼런스 이미지를 안전하게 건다. 주소가 만료되면 한 번 다시 서명해 붙인다 */
export const Default = {
  args: {
    src: references[0].thumbnailUrl,
    alt: references[0].id,
    sx: { width: 280, height: 210, objectFit: 'cover' },
  },
};

/** 주소가 없으면 아무것도 그리지 않는다 */
export const Empty = {
  args: { src: null, alt: 'empty' },
};
