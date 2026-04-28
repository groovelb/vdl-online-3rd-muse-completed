import { useState } from 'react';
import Box from '@mui/material/Box';
import { ReferenceLayerChipRow } from './ReferenceLayerChipRow.jsx';

export default {
  title: 'Card / ReferenceLayerChipRow',
  component: ReferenceLayerChipRow,
  parameters: { layout: 'centered' },
};

export const AutoMode = {
  render: () => (
    <Box sx={ { width: 360 } }>
      <ReferenceLayerChipRow autoLayers={ ['color', 'typography'] } onChange={ () => {} } />
    </Box>
  ),
};

export const ManualAllOn = {
  render: () => (
    <Box sx={ { width: 360 } }>
      <ReferenceLayerChipRow
        autoLayers={ ['color'] }
        value={ ['color', 'typography', 'layout', 'gradient', 'visualDirection'] }
        onChange={ () => {} }
      />
    </Box>
  ),
};

export const ManualOnlyColor = {
  render: () => (
    <Box sx={ { width: 360 } }>
      <ReferenceLayerChipRow
        autoLayers={ ['typography', 'layout'] }
        value={ ['color'] }
        onChange={ () => {} }
      />
    </Box>
  ),
};

export const Locked = {
  render: () => (
    <Box sx={ { width: 360 } }>
      <ReferenceLayerChipRow
        autoLayers={ ['color', 'typography'] }
        value={ ['color'] }
        onChange={ () => {} }
        locked
      />
    </Box>
  ),
};

export const Interactive = {
  render: () => {
    const [value, setValue] = useState([]);
    return (
      <Box sx={ { width: 360 } }>
        <ReferenceLayerChipRow
          autoLayers={ ['color', 'layout'] }
          value={ value }
          onChange={ setValue }
        />
        <Box sx={ { mt: 2, fontSize: 12, fontFamily: 'monospace', color: 'text.secondary' } }>
          state: { JSON.stringify(value) }
        </Box>
      </Box>
    );
  },
};
