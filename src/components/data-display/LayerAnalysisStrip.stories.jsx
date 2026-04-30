import Box from '@mui/material/Box';
import { LayerAnalysisStrip } from './LayerAnalysisStrip';

export default {
  title: 'Component/5. Data Display/LayerAnalysisStrip',
  component: LayerAnalysisStrip,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
## LayerAnalysisStrip

레퍼런스 / 미디어 카드 하단에 부착되는 가벼운 진행 strip. \`AnalysisProgress\` 의 풀스크린 변형이
부담스러운 자리(카드 footer / inline 데모) 에서 사용. **overlay 가 아닌 일반 stack 흐름** 이라
카드 위에 떠있지 않고 자연스럽게 따라 붙는다.

### 구성
\`\`\`
ANALYZING n/N
[━━━━━━━━━━] LinearProgress 2px
✓ Color
◯ Typography  ← spinner (running)
○ Layout      ← muted (pending)
○ Gradient
○ Visual Direction
\`\`\`

### 사용처
- \`ReferenceCard\` (state=1, analyzingVariant='strip')
- 랜딩 Solution Stage 1
- T1 진행 표시가 필요한 모든 위치
        `,
      },
    },
  },
  argTypes: {
    layerStatuses: {
      control: 'object',
      description: "('pending'|'running'|'done')[] 레이어별 상태",
    },
    layerLabels: {
      control: 'object',
      description: '레이어 라벨 배열',
    },
    headerLabel: {
      control: 'text',
      description: '상단 monospace 라벨',
    },
  },
};

const Wrap = ({ children }) => (
  <Box sx={ { width: 320, maxWidth: '100%' } }>{ children }</Box>
);

/** 모든 layer pending — 진입 전 */
export const Docs = {
  args: {
    layerStatuses: ['pending', 'pending', 'pending', 'pending', 'pending'],
  },
  render: (args) => <Wrap><LayerAnalysisStrip { ...args } /></Wrap>,
};

/** 첫 layer 만 running */
export const Starting = {
  args: {
    layerStatuses: ['running', 'pending', 'pending', 'pending', 'pending'],
  },
  render: (args) => <Wrap><LayerAnalysisStrip { ...args } /></Wrap>,
};

/** 절반 정도 진행 — 3 done / 1 running / 1 pending */
export const HalfDone = {
  args: {
    layerStatuses: ['done', 'done', 'done', 'running', 'pending'],
  },
  render: (args) => <Wrap><LayerAnalysisStrip { ...args } /></Wrap>,
};

/** 모두 완료 */
export const Complete = {
  args: {
    layerStatuses: ['done', 'done', 'done', 'done', 'done'],
  },
  render: (args) => <Wrap><LayerAnalysisStrip { ...args } /></Wrap>,
};

/** 커스텀 라벨 — typography / spacing / rounded 만 */
export const CustomLabels = {
  args: {
    layerStatuses: ['done', 'running', 'pending'],
    layerLabels: ['Typography', 'Spacing', 'Rounded'],
    headerLabel: 'TOKEN SYNTH',
  },
  render: (args) => <Wrap><LayerAnalysisStrip { ...args } /></Wrap>,
};
