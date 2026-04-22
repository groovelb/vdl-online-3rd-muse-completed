import { useState } from 'react';
import Box from '@mui/material/Box';
import { TypographyPreview } from './TypographyPreview';

export default {
  title: 'Component/5. Data Display/TypographyPreview',
  component: TypographyPreview,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

const BASE_TOKENS = [
  {
    id: 'h1',
    label: 'Display Heading',
    fontFamily: 'Outfit, sans-serif',
    fontWeight: 700,
    fontSize: 'clamp(48px, 6vw, 96px)',
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    isEnabled: true,
    emphasis: 2,
  },
  {
    id: 'h2',
    label: 'Section Heading',
    fontFamily: 'Outfit, sans-serif',
    fontWeight: 600,
    fontSize: 'clamp(32px, 4vw, 56px)',
    lineHeight: 1.15,
    letterSpacing: '-0.02em',
    isEnabled: true,
    emphasis: 1,
  },
  {
    id: 'body',
    label: 'Body',
    fontFamily: 'Pretendard Variable, sans-serif',
    fontWeight: 400,
    fontSize: '16px',
    lineHeight: 1.7,
    isEnabled: true,
    emphasis: 1,
  },
  {
    id: 'caption',
    label: 'Caption',
    fontFamily: 'Pretendard Variable, sans-serif',
    fontWeight: 500,
    fontSize: '12px',
    lineHeight: 1.5,
    letterSpacing: '0.02em',
    isEnabled: false,
    emphasis: 0,
  },
];

export const Default = {
  render: () => {
    const [tokens, setTokens] = useState(BASE_TOKENS);
    return (
      <Box sx={ { maxWidth: 760 } }>
        <TypographyPreview
          tokens={ tokens }
          onChange={ (id, patch) =>
            setTokens((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
          }
        />
      </Box>
    );
  },
};
