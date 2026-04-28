import Box from '@mui/material/Box';
import { AnalysisConfirmBox } from './AnalysisConfirmBox.jsx';

export default {
  title: 'OverlayFeedback / AnalysisConfirmBox',
  component: AnalysisConfirmBox,
  parameters: { layout: 'padded' },
};

const sampleRefs = [
  { id: 'ref-002', useLayers: ['color', 'typography'] },
  { id: 'ref-005', useLayers: ['layout'] },
  { id: 'ref-013', useLayers: [] }, // 자동 = 전체 레이어
];

export const ConceptMode = {
  render: () => (
    <Box sx={ { maxWidth: 640 } }>
      <AnalysisConfirmBox
        mode="concept"
        intent="Y2K 풍 화려한 포스터"
        selectedRefs={ sampleRefs }
        estimatedCost="~$0.008"
        onConfirm={ () => {} }
        onEdit={ () => {} }
      />
    </Box>
  ),
};

export const SystemMode = {
  render: () => (
    <Box sx={ { maxWidth: 640 } }>
      <AnalysisConfirmBox
        mode="system"
        intent="차분한 다크 무드의 데이터 대시보드"
        selectedRefs={ sampleRefs }
        estimatedCost="~$0.012"
        onConfirm={ () => {} }
        onEdit={ () => {} }
      />
    </Box>
  ),
};

export const HandoffMode = {
  render: () => (
    <Box sx={ { maxWidth: 640 } }>
      <AnalysisConfirmBox
        mode="handoff"
        intent="MUI 기반 클린 SaaS 랜딩"
        selectedRefs={ [
          { id: 'ref-001', useLayers: ['color'] },
          { id: 'ref-002', useLayers: ['typography', 'layout'] },
        ] }
        estimatedCost="~$0.014"
        onConfirm={ () => {} }
        onEdit={ () => {} }
      />
    </Box>
  ),
};

export const Disabled = {
  render: () => (
    <Box sx={ { maxWidth: 640 } }>
      <AnalysisConfirmBox
        mode="system"
        intent="차분한 다크"
        selectedRefs={ sampleRefs }
        estimatedCost="~$0.012"
        onConfirm={ () => {} }
        onEdit={ () => {} }
        disabled
      />
    </Box>
  ),
};
