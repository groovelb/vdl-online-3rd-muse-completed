import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Masonry from '@mui/lab/Masonry';
import { ReferenceCard } from './ReferenceCard';
import { URL_BY_BASENAME, getExampleByBasename } from '../../utils/exampleImageTokens.js';

/* exampleTokens 의 모든 basename 을 demo entry 로 변환 (hero 와 동일 풀) */
const ALL_EXAMPLES = Object.keys(URL_BY_BASENAME)
  .map(getExampleByBasename)
  .filter(Boolean);

const SAMPLE = ALL_EXAMPLES[0] || {
  src: '',
  title: 'Sample Reference',
  tags: ['minimal', 'editorial'],
  dominantColors: ['#1a1a1a', '#f5f5f5'],
};

export default {
  title: 'Component/3. Card/ReferenceCard',
  component: ReferenceCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
## ReferenceCard

\`ImageCard\` 합성 wrapper. \`state\` 머신(0|1|2) 에 따라 분기:

| state | 화면 |
|-------|------|
| **0** | 방금 업로드 — 이미지만 (tags / colors / title 비움) |
| **1** | 분석 중 — ImageCard + 하단 \`LayerAnalysisStrip\` |
| **2** | 완료 — tags / dominantColors / title 채워진 ImageCard, strip 사라짐 |

랜딩 Solution Stage 1, 아카이브 _tagInProgress 카드, T1 진행 표시 등 *분석 중인 레퍼런스*
가 필요한 모든 자리에서 동일한 외형으로 사용.

### 시퀀스 사용 예
\`useStaggeredSequence\` 훅과 함께 쓰면 여러 카드가 시간차로 0 → 1 → 2 진행하는
분석 데모를 만들 수 있다 (Sequence 스토리 참고).
        `,
      },
    },
  },
  argTypes: {
    src: { control: 'text' },
    title: { control: 'text' },
    tags: { control: 'object' },
    dominantColors: { control: 'object' },
    state: {
      control: { type: 'select' },
      options: [0, 1, 2],
      description: '0=빈 카드 / 1=분석 중 / 2=완료',
    },
    layerStatuses: { control: 'object' },
    layerLabels: { control: 'object' },
    mediaRatio: { control: 'text' },
  },
};

const CardSlot = ({ children }) => (
  <Box sx={ { width: 320, maxWidth: '100%' } }>{ children }</Box>
);

/** Docs — Storybook controls 에서 props 조작 */
export const Docs = {
  args: {
    src: SAMPLE.src,
    title: SAMPLE.title,
    tags: SAMPLE.tags,
    dominantColors: SAMPLE.dominantColors,
    state: 1,
    analyzingVariant: 'strip',
    layerStatuses: ['done', 'done', 'running', 'pending', 'pending'],
  },
  render: (args) => <CardSlot><ReferenceCard { ...args } /></CardSlot>,
};

/** State 0 — 막 업로드 됨 */
export const State0 = {
  args: {
    src: SAMPLE.src,
    title: SAMPLE.title,
    tags: SAMPLE.tags,
    dominantColors: SAMPLE.dominantColors,
    state: 0,
  },
  render: (args) => <CardSlot><ReferenceCard { ...args } /></CardSlot>,
};

/** State 1 strip — 분석 중 (랜딩 데모용 strip variant) */
export const State1Strip = {
  args: {
    src: SAMPLE.src,
    title: SAMPLE.title,
    state: 1,
    analyzingVariant: 'strip',
    layerStatuses: ['done', 'done', 'done', 'running', 'pending'],
  },
  render: (args) => <CardSlot><ReferenceCard { ...args } /></CardSlot>,
};

/** State 1 chip — 분석 중 (production 컴팩트 chip variant) */
export const State1Chip = {
  args: {
    src: SAMPLE.src,
    title: SAMPLE.title,
    state: 1,
    analyzingVariant: 'chip',
  },
  render: (args) => <CardSlot><ReferenceCard { ...args } /></CardSlot>,
};

/** Error — 태깅 실패 + 재시도 chip */
export const Error = {
  args: {
    src: SAMPLE.src,
    title: SAMPLE.title,
    state: 2,
    errorMessage: 'Anthropic API rate limit exceeded',
    onRetry: () => alert('retry'),
  },
  render: (args) => <CardSlot><ReferenceCard { ...args } /></CardSlot>,
};

/** State 2 — 완료 (tags + colors 노출) */
export const State2 = {
  args: {
    src: SAMPLE.src,
    title: SAMPLE.title,
    tags: SAMPLE.tags,
    dominantColors: SAMPLE.dominantColors,
    state: 2,
  },
  render: (args) => <CardSlot><ReferenceCard { ...args } /></CardSlot>,
};

/** Sequence — setInterval 로 0 → 1 → 2 자동 시연 */
function SequenceDemo({ src, title, tags, dominantColors }) {
  const LAYER_LABELS = ['Color', 'Typography', 'Layout', 'Gradient', 'Visual Direction'];
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % 14), 400);
    return () => clearInterval(id);
  }, []);

  // 0..1: state 0
  // 2..11: state 1, layerStatuses 점진 progression (5 layers × 2 ticks each)
  // 12..13: state 2
  let state = 0;
  let layerStatuses;
  if (tick >= 2 && tick < 12) {
    state = 1;
    const progress = tick - 2; // 0..9
    layerStatuses = LAYER_LABELS.map((_, i) => {
      const start = i * 2;
      const end = start + 2;
      if (progress < start) return 'pending';
      if (progress < end) return 'running';
      return 'done';
    });
  } else if (tick >= 12) {
    state = 2;
  }

  return (
    <CardSlot>
      <ReferenceCard
        src={ src }
        title={ title }
        tags={ tags }
        dominantColors={ dominantColors }
        state={ state }
        analyzingVariant="strip"
        layerStatuses={ layerStatuses }
      />
    </CardSlot>
  );
}

export const Sequence = {
  args: {
    src: SAMPLE.src,
    title: SAMPLE.title,
    tags: SAMPLE.tags,
    dominantColors: SAMPLE.dominantColors,
  },
  render: (args) => <SequenceDemo { ...args } />,
};

/** AllExamples — hero 에서 사용한 모든 example 이미지를 grid 로 노출 (state 2 = 완료된 카탈로그) */
export const AllExamples = {
  parameters: {
    docs: {
      description: {
        story: `\`src/assets/example/*\` 풀 의 **모든 ${ ALL_EXAMPLES.length } 장** 의 레퍼런스를 \`state=2\` (완료) 로 카드로 마운트한다. \`exampleTokens.json\` 의 실제 T1 결과(tags / dominantColors / title) 가 그대로 노출되어, hero scatter / Stage 1 demo 와 동일한 데이터 풀의 분석 결과 카탈로그 역할.`,
      },
    },
  },
  render: () => (
    <Box>
      <Typography
        variant="caption"
        sx={ {
          display: 'block',
          fontFamily: 'monospace',
          fontSize: '0.7rem',
          letterSpacing: '0.18em',
          color: 'text.secondary',
          mb: 2,
        } }
      >
        { ALL_EXAMPLES.length } REFERENCES · TAGGED
      </Typography>
      <Masonry columns={ { xs: 2, sm: 3, md: 3, lg: 4, xl: 6 } } spacing={ 2 }>
        { ALL_EXAMPLES.map((ex) => (
          <ReferenceCard
            key={ ex.src }
            src={ ex.src }
            title={ ex.title }
            tags={ ex.tags }
            dominantColors={ ex.dominantColors }
            state={ 2 }
          />
        )) }
      </Masonry>
    </Box>
  ),
};

/** AllExamplesAnalyzing — 같은 풀을 state=1 (분석 중) 로 — 진행률 다양하게 stagger */
export const AllExamplesAnalyzing = {
  parameters: {
    docs: {
      description: {
        story: '같은 example 풀을 \`state=1\` (분석 중) 로 마운트. 각 카드마다 다른 progress (1/5 ~ 5/5) 로 strip 노출.',
      },
    },
  },
  render: () => {
    const STATUSES_BY_PROGRESS = (done) => Array.from({ length: 5 }, (_, i) => {
      if (i < done) return 'done';
      if (i === done) return 'running';
      return 'pending';
    });
    return (
      <Box>
        <Typography
          variant="caption"
          sx={ {
            display: 'block',
            fontFamily: 'monospace',
            fontSize: '0.7rem',
            letterSpacing: '0.18em',
            color: 'text.secondary',
            mb: 2,
          } }
        >
          { ALL_EXAMPLES.length } REFERENCES · ANALYZING
        </Typography>
        <Masonry columns={ { xs: 2, sm: 3, md: 3, lg: 4, xl: 6 } } spacing={ 2 }>
          { ALL_EXAMPLES.map((ex, i) => (
            <ReferenceCard
              key={ ex.src }
              src={ ex.src }
              title={ ex.title }
              tags={ ex.tags }
              dominantColors={ ex.dominantColors }
              state={ 1 }
              analyzingVariant="strip"
              layerStatuses={ STATUSES_BY_PROGRESS(i % 5) }
            />
          )) }
        </Masonry>
      </Box>
    );
  },
};
