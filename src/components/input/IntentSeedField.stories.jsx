import { useState } from 'react';
import Box from '@mui/material/Box';
import { IntentSeedField } from './IntentSeedField.jsx';

export default {
  title: 'Input / IntentSeedField',
  component: IntentSeedField,
  parameters: { layout: 'centered' },
};

export const Empty = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <Box sx={ { width: 480 } }>
        <IntentSeedField value={ value } onChange={ setValue } />
      </Box>
    );
  },
};

export const WithSeedClicked = {
  render: () => {
    const [value, setValue] = useState('차분 미니멀ish ');
    return (
      <Box sx={ { width: 480 } }>
        <IntentSeedField value={ value } onChange={ setValue } />
      </Box>
    );
  },
};

export const Filled = {
  render: () => {
    const [value, setValue] = useState('차분한 다크 무드의 데이터 대시보드');
    return (
      <Box sx={ { width: 480 } }>
        <IntentSeedField value={ value } onChange={ setValue } />
      </Box>
    );
  },
};

export const Disabled = {
  render: () => (
    <Box sx={ { width: 480 } }>
      <IntentSeedField value="차분한 다크 무드" onChange={ () => {} } disabled />
    </Box>
  ),
};
