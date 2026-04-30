import { useRef } from 'react';
import Box from '@mui/material/Box';
import { ReferenceCard } from '../../../components/card/ReferenceCard.jsx';
import { useStaggeredSequence } from '../../../hooks/useStaggeredSequence.js';
import { SectionShell } from './SectionShell.jsx';
import { SOLUTION_STAGE_1 } from '../landingCopy.js';
import { getExampleByBasename } from '../../../utils/exampleImageTokens.js';

/** Stage 1 데모: 3 장 — 모두 4:5 (1.25) 원본 비율 + 배경 꽉찬 vibrant 이미지 */
const DEMO_BASENAMES = [
  '213923458a6349a228e888fc5ce9bde5.jpg', // Bold Energetic Message (red, 736×920)
  '9a731d7608517e4bcd7f9716d5187424.jpg', // Bold Gradient Fintech Energy (1200×1500)
  '9bcda910a13720921bda897f0cabca08.jpg', // Neon Gradient Blur (1200×1500)
];

const DEMO_CARDS = DEMO_BASENAMES.map(getExampleByBasename).filter(Boolean);

const LAYER_LABELS = [
  SOLUTION_STAGE_1.layerLabels.color,
  SOLUTION_STAGE_1.layerLabels.typography,
  SOLUTION_STAGE_1.layerLabels.layout,
  SOLUTION_STAGE_1.layerLabels.gradient,
  SOLUTION_STAGE_1.layerLabels.visualDirection,
];

const STATE1_DURATION_MS = 2400;
const LAYER_STEP_MS = STATE1_DURATION_MS / (LAYER_LABELS.length + 1);

/**
 * elapsedInItem 으로부터 레이어별 status 배열 도출.
 *   layerIdx * STEP ≤ elapsed < (layerIdx + 1) * STEP → running
 *   elapsed < layerIdx * STEP → pending
 *   else → done
 */
function deriveLayerStatuses(elapsedMs) {
  return LAYER_LABELS.map((_, i) => {
    if (elapsedMs < i * LAYER_STEP_MS) return 'pending';
    if (elapsedMs < (i + 1) * LAYER_STEP_MS) return 'running';
    return 'done';
  });
}

export function LandingSolutionStage1() {
  const wrapperRef = useRef(null);
  const items = useStaggeredSequence({
    targetRef: wrapperRef,
    count: DEMO_CARDS.length,
    staggerMs: 600,
    durationMs: STATE1_DURATION_MS,
    threshold: 0.5,
  });

  return (
    <SectionShell
      title={ SOLUTION_STAGE_1.title }
      lede={ SOLUTION_STAGE_1.lede }
    >
      <Box
        ref={ wrapperRef }
        sx={ {
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: { xs: 4, md: 5 },
          alignItems: 'start',
        } }
      >
        { DEMO_CARDS.map((demo, i) => {
          const { state, elapsedInItem } = items[i] || { state: 0, elapsedInItem: 0 };
          const layerStatuses = state === 1
            ? deriveLayerStatuses(elapsedInItem)
            : undefined;
          return (
            <Box key={ demo.src }>
              <ReferenceCard
                src={ demo.src }
                title={ demo.title }
                tags={ demo.tags }
                dominantColors={ demo.dominantColors }
                state={ state }
                analyzingVariant="strip"
                layerStatuses={ layerStatuses }
                layerLabels={ LAYER_LABELS }
              />
            </Box>
          );
        }) }
      </Box>
    </SectionShell>
  );
}
