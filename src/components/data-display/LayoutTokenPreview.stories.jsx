import { useState } from 'react';
import Box from '@mui/material/Box';
import { LayoutTokenPreview } from './LayoutTokenPreview';

export default {
  title: 'Component/5. Data Display/LayoutTokenPreview',
  component: LayoutTokenPreview,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

const BASE_TOKENS = [
  { id: 'grid-12', label: '12 Column Grid', kind: 'grid', columns: 12, gap: 24, isEnabled: true, emphasis: 2 },
  { id: 'grid-4', label: '4 Column Bento', kind: 'grid', columns: 4, gap: 16, isEnabled: true, emphasis: 1 },
  { id: 'sp-section', label: 'Section Gap', kind: 'spacing', px: 96, isEnabled: true, emphasis: 2 },
  { id: 'sp-card', label: 'Card Padding', kind: 'spacing', px: 24, isEnabled: true, emphasis: 1 },
  { id: 'container-hero', label: 'Hero Container', kind: 'container', ratio: 0.9, maxWidth: '1440px', isEnabled: true, emphasis: 1 },
  { id: 'container-narrow', label: 'Narrow Reading', kind: 'container', ratio: 0.45, maxWidth: '720px', isEnabled: false, emphasis: 0 },
];

export const Default = {
  render: () => {
    const [tokens, setTokens] = useState(BASE_TOKENS);
    return (
      <Box sx={ { maxWidth: 760 } }>
        <LayoutTokenPreview
          tokens={ tokens }
          onChange={ (id, patch) =>
            setTokens((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
          }
        />
      </Box>
    );
  },
};
