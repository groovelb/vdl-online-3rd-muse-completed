import { useState } from 'react';
import Box from '@mui/material/Box';
import { ModeSelectCard } from './ModeSelectCard.jsx';

export default {
  title: 'Card / ModeSelectCard',
  component: ModeSelectCard,
  parameters: { layout: 'centered' },
};

const MODES = [
  { mode: 'concept', title: '컨셉 잡기', subtitle: '감을 잡고 싶다', description: '빠른 다양성 우선. T2 다양한 무드, T3 distinctive bias' },
  { mode: 'system', title: '디자인 시스템 만들기', subtitle: '정확한 토큰 필요', description: '일관성, 근거 우선. role 엄격, contrast 검증' },
];

/** Default — 3장 카드 grid, 미선택 상태 */
export const Default = {
  render: () => {
    const [selected, setSelected] = useState(null);
    return (
      <Box sx={ { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(220px, 280px))', gap: 2 } }>
        { MODES.map((m) => (
          <ModeSelectCard
            key={ m.mode }
            { ...m }
            isSelected={ selected === m.mode }
            onSelect={ setSelected }
          />
        )) }
      </Box>
    );
  },
};

export const ConceptSelected = {
  render: () => (
    <Box sx={ { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(220px, 280px))', gap: 2 } }>
      { MODES.map((m) => (
        <ModeSelectCard key={ m.mode } { ...m } isSelected={ m.mode === 'concept' } onSelect={ () => {} } />
      )) }
    </Box>
  ),
};

export const SystemSelected = {
  render: () => (
    <Box sx={ { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(220px, 280px))', gap: 2 } }>
      { MODES.map((m) => (
        <ModeSelectCard key={ m.mode } { ...m } isSelected={ m.mode === 'system' } onSelect={ () => {} } />
      )) }
    </Box>
  ),
};

export const Single = {
  render: () => (
    <ModeSelectCard
      mode="concept"
      title="컨셉 잡기"
      subtitle="감을 잡고 싶다"
      description="빠른 다양성 우선. T2 다양한 무드, T3 distinctive bias"
      isSelected
      onSelect={ () => {} }
      sx={ { width: 280 } }
    />
  ),
};
