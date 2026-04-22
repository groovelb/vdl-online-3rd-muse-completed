import { useState } from 'react';
import Box from '@mui/material/Box';
import { KeyVisualBoard } from './KeyVisualBoard';
import { placeholderSvg } from '../../common/ui/Placeholder';

export default {
  title: 'Component/5. Data Display/KeyVisualBoard',
  component: KeyVisualBoard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    items: { control: 'object' },
    onChange: { action: 'change' },
    onRemove: { action: 'remove' },
  },
};

const BASE_ITEMS = [
  { id: 'kv-1', thumbnailUrl: placeholderSvg(800, 600), caption: 'Hero shot', isEnabled: true, emphasis: 2 },
  { id: 'kv-2', thumbnailUrl: placeholderSvg(800, 600), caption: 'Detail', isEnabled: true, emphasis: 1 },
  { id: 'kv-3', thumbnailUrl: placeholderSvg(800, 600), isEnabled: true, emphasis: 1 },
  { id: 'kv-4', thumbnailUrl: placeholderSvg(800, 600), caption: 'Alternate', isEnabled: false, emphasis: 0 },
];

export const Default = {
  render: () => {
    const [items, setItems] = useState(BASE_ITEMS);
    return (
      <Box sx={ { maxWidth: 960 } }>
        <KeyVisualBoard
          items={ items }
          onChange={ (id, patch) =>
            setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)))
          }
          onRemove={ (id) => setItems((prev) => prev.filter((it) => it.id !== id)) }
        />
      </Box>
    );
  },
};

export const Empty = {
  render: () => (
    <Box sx={ { maxWidth: 960 } }>
      <KeyVisualBoard items={ [] } />
    </Box>
  ),
};
