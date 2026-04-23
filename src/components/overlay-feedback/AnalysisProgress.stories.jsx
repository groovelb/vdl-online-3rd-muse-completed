import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { AnalysisProgress } from './AnalysisProgress';

export default {
  title: 'Component/9. Overlay & Feedback/AnalysisProgress',
  component: AnalysisProgress,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    layers: { control: 'object' },
    title: { control: 'text' },
    onCancel: { action: 'cancel' },
    onRetry: { action: 'retry' },
  },
};

const MUSE_LAYERS = [
  { key: 'color', label: '컬러' },
  { key: 'typography', label: '타이포그래피' },
  { key: 'layout', label: '레이아웃' },
  { key: 'gradient', label: '그라디언트' },
  { key: 'visualDirection', label: '비주얼 디렉션' },
];

/** 대기 상태 — 전부 pending */
export const AllPending = {
  args: {
    layers: MUSE_LAYERS.map((l) => ({ ...l, status: 'pending' })),
  },
};

/** 진행 중 — 일부 done, 하나 running */
export const InProgress = {
  args: {
    layers: [
      { ...MUSE_LAYERS[0], status: 'done' },
      { ...MUSE_LAYERS[1], status: 'done' },
      { ...MUSE_LAYERS[2], status: 'running', progress: 0.45, message: '8개 레이아웃 패턴을 분석하고 있습니다' },
      { ...MUSE_LAYERS[3], status: 'pending' },
      { ...MUSE_LAYERS[4], status: 'pending' },
    ],
  },
};

/** 완료 상태 */
export const AllDone = {
  args: {
    layers: MUSE_LAYERS.map((l) => ({ ...l, status: 'done' })),
  },
};

/** 오류 상태 — 재시도 액션 노출 */
export const WithError = {
  args: {
    layers: [
      { ...MUSE_LAYERS[0], status: 'done' },
      { ...MUSE_LAYERS[1], status: 'error', message: '타이포 분석 실패 — 이미지 해상도 부족' },
      { ...MUSE_LAYERS[2], status: 'done' },
      { ...MUSE_LAYERS[3], status: 'pending' },
      { ...MUSE_LAYERS[4], status: 'pending' },
    ],
  },
};

/** 시뮬레이션 — 자동 진행 (0.8s 간격으로 단계 전환) */
export const Simulation = {
  render: () => {
    const [layers, setLayers] = useState(
      MUSE_LAYERS.map((l, i) => ({ ...l, status: i === 0 ? 'running' : 'pending', progress: 0 })),
    );

    useEffect(() => {
      const timers = [];
      // 각 레이어를 순차 진행
      for (let i = 0; i < MUSE_LAYERS.length; i += 1) {
        timers.push(
          setTimeout(() => {
            setLayers((prev) =>
              prev.map((l, idx) => {
                if (idx === i) return { ...l, status: 'done', progress: 1 };
                if (idx === i + 1) return { ...l, status: 'running', progress: 0 };
                return l;
              }),
            );
          }, (i + 1) * 900),
        );
      }
      return () => timers.forEach(clearTimeout);
    }, []);

    return (
      <Box sx={ { display: 'flex', justifyContent: 'center' } }>
        <AnalysisProgress layers={ layers } onCancel={ () => {} } />
      </Box>
    );
  },
};
