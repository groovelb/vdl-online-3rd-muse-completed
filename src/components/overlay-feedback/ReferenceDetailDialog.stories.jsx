import { ReferenceDetailDialog } from './ReferenceDetailDialog.jsx';
import { references, flattenTags } from '../../data/muse';

const reference = references[0];

export default {
  title: 'Custom Component/1. Reference & Tagging/ReferenceDetailDialog',
  component: ReferenceDetailDialog,
  parameters: { layout: 'fullscreen' },
};

/** 카드를 열어 원본과 추출값을 함께 보는 화면 */
export const Default = {
  args: { reference, onClose: () => {} },
};

/** 현재 걸린 필터가 강조된 상태 */
export const WithActiveFilters = {
  args: {
    reference,
    onClose: () => {},
    activeTags: flattenTags(reference.tags).slice(0, 2),
    activeColors: (reference.dominantColors || []).slice(0, 1),
  },
};

/** 닫힌 상태 */
export const Closed = {
  args: { reference: null, onClose: () => {} },
};
