import { useState } from 'react';
import Box from '@mui/material/Box';
import { ColorSwatchList } from './ColorSwatchList';

export default {
  title: 'Component/5. Data Display/ColorSwatchList',
  component: ColorSwatchList,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    tokens: { control: 'object' },
    isGrouped: { control: 'boolean' },
    onChange: { action: 'change' },
  },
};

const BASE_TOKENS = [
  { id: 'ink', label: 'Primary Ink', hex: '#14132B', group: 'Brand', isEnabled: true, emphasis: 2 },
  { id: 'accent', label: 'Accent Violet', hex: '#4F46E5', group: 'Brand', isEnabled: true, emphasis: 1 },
  { id: 'bg', label: 'Background Tint', hex: '#FCFCFF', group: 'Surface', isEnabled: true, emphasis: 0 },
  { id: 'paper', label: 'Paper Tint', hex: '#F8F8FC', group: 'Surface', isEnabled: true, emphasis: 0 },
  { id: 'muted', label: 'Muted Grey', hex: '#7A798E', group: 'Neutral', isEnabled: false, emphasis: 0 },
];

export const Default = {
  render: () => {
    const [tokens, setTokens] = useState(BASE_TOKENS);
    return (
      <Box sx={ { maxWidth: 720 } }>
        <ColorSwatchList
          tokens={ tokens }
          onChange={ (id, patch) =>
            setTokens((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
          }
        />
      </Box>
    );
  },
};

export const Grouped = {
  render: () => {
    const [tokens, setTokens] = useState(BASE_TOKENS);
    return (
      <Box sx={ { maxWidth: 720 } }>
        <ColorSwatchList
          tokens={ tokens }
          isGrouped
          onChange={ (id, patch) =>
            setTokens((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
          }
        />
      </Box>
    );
  },
};
