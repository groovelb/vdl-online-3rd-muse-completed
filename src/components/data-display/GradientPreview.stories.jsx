import { useState } from 'react';
import Box from '@mui/material/Box';
import { GradientPreview } from './GradientPreview';

export default {
  title: 'Component/5. Data Display/GradientPreview',
  component: GradientPreview,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

const BASE_TOKENS = [
  {
    id: 'sunrise',
    label: 'Sunrise',
    gradient: 'linear-gradient(135deg, #FEE2F5, #FEF9C3)',
    stops: [{ offset: 0, color: '#FEE2F5' }, { offset: 1, color: '#FEF9C3' }],
    isEnabled: true,
    emphasis: 1,
  },
  {
    id: 'indigo-dusk',
    label: 'Indigo Dusk',
    gradient: 'linear-gradient(180deg, #1E1B4B, #4F46E5)',
    stops: [{ offset: 0, color: '#1E1B4B' }, { offset: 1, color: '#4F46E5' }],
    isEnabled: true,
    emphasis: 2,
  },
  {
    id: 'muted-sand',
    label: 'Muted Sand',
    gradient: 'linear-gradient(90deg, #E8E7F0, #D6D5E0)',
    stops: [{ offset: 0, color: '#E8E7F0' }, { offset: 1, color: '#D6D5E0' }],
    isEnabled: false,
    emphasis: 0,
  },
  {
    id: 'radial',
    label: 'Accent Radial',
    gradient: 'radial-gradient(circle at 30% 30%, #6366F1, #14132B 70%)',
    isEnabled: true,
    emphasis: 1,
  },
];

export const Default = {
  render: () => {
    const [tokens, setTokens] = useState(BASE_TOKENS);
    return (
      <Box sx={ { maxWidth: 720 } }>
        <GradientPreview
          tokens={ tokens }
          onChange={ (id, patch) =>
            setTokens((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
          }
        />
      </Box>
    );
  },
};
