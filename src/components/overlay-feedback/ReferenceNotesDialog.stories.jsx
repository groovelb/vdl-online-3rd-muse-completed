import { ReferenceNotesDialog } from './ReferenceNotesDialog.jsx';
import { references, projects } from '../../data/muse';

const project = projects[0];
const usedReferences = references.filter((r) => (project.referenceIds || []).includes(r.id));
const useLayersByRef = Object.fromEntries(
  (project.selectedRefs || []).map((s) => [s.id, s.useLayers || []]),
);

export default {
  title: 'Custom Component/1. Reference & Tagging/ReferenceNotesDialog',
  component: ReferenceNotesDialog,
  parameters: { layout: 'fullscreen' },
};

/** 레퍼런스마다 어디를 가져올지 적어 두는 자리 */
export const Default = {
  args: {
    open: true,
    onClose: () => {},
    usedReferences,
    useLayersByRef,
    initialNotes: { [usedReferences[0]?.id]: '왼쪽 위 여백과 대비를 그대로 쓰고 싶다' },
    onSave: async () => {},
  },
};

/** 아직 아무 노트도 없는 상태 */
export const Empty = {
  args: {
    open: true,
    onClose: () => {},
    usedReferences,
    useLayersByRef,
    initialNotes: {},
    onSave: async () => {},
  },
};
