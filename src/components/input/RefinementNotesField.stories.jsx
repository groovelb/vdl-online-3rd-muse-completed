import { useState } from 'react';
import Box from '@mui/material/Box';
import { RefinementNotesField } from './RefinementNotesField.jsx';
import { references } from '../../data/muse';

export default {
  title: 'Input / RefinementNotesField',
  component: RefinementNotesField,
  parameters: { layout: 'padded' },
};

const sampleRefs = references.slice(0, 4).map((r) => ({
  id: r.id,
  thumbnailUrl: r.thumbnailUrl,
  title: r.title,
}));

export const Empty_Concept = {
  name: 'Empty (concept 모드 — 스킵 가능)',
  render: () => {
    const [value, setValue] = useState('');
    return (
      <Box sx={ { maxWidth: 720 } }>
        <RefinementNotesField
          value={ value }
          onChange={ setValue }
          selectedRefs={ sampleRefs }
          mode="concept"
        />
      </Box>
    );
  },
};

export const Empty_System = {
  name: 'Empty (system 모드 — 30자 미충족)',
  render: () => {
    const [value, setValue] = useState('');
    return (
      <Box sx={ { maxWidth: 720 } }>
        <RefinementNotesField
          value={ value }
          onChange={ setValue }
          selectedRefs={ sampleRefs }
          mode="system"
        />
      </Box>
    );
  },
};

export const Filled_System = {
  name: 'Filled (system 30자 통과)',
  render: () => {
    const [value, setValue] = useState('ref-002의 짙은 색을 primary로, ref-005 grid 레이아웃 강조');
    return (
      <Box sx={ { maxWidth: 720 } }>
        <RefinementNotesField
          value={ value }
          onChange={ setValue }
          selectedRefs={ sampleRefs }
          mode="system"
        />
      </Box>
    );
  },
};

export const Filled_System_Long = {
  name: 'Filled (system 50자+ref-id)',
  render: () => {
    const [value, setValue] = useState(
      'ref-002.dominantColors[0]를 brand-primary로 매핑, ref-005.layout.columns 12 적용, 타이포는 ref-002 보다 가볍게',
    );
    return (
      <Box sx={ { maxWidth: 720 } }>
        <RefinementNotesField
          value={ value }
          onChange={ setValue }
          selectedRefs={ sampleRefs }
          mode="system"
        />
      </Box>
    );
  },
};

export const NoRefs = {
  name: '레퍼런스 없음',
  render: () => {
    const [value, setValue] = useState('');
    return (
      <Box sx={ { maxWidth: 720 } }>
        <RefinementNotesField
          value={ value }
          onChange={ setValue }
          mode="system"
        />
      </Box>
    );
  },
};

export const Disabled = {
  render: () => (
    <Box sx={ { maxWidth: 720 } }>
      <RefinementNotesField
        value="ref-002 색을 primary로"
        onChange={ () => {} }
        selectedRefs={ sampleRefs }
        mode="system"
        disabled
      />
    </Box>
  ),
};
