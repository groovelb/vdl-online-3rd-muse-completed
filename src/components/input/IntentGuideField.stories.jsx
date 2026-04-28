import { useState } from 'react';
import Box from '@mui/material/Box';
import { IntentGuideField } from './IntentGuideField.jsx';

export default {
  title: 'Input / IntentGuideField',
  component: IntentGuideField,
  parameters: { layout: 'centered' },
};

export const Empty = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <Box sx={ { width: 560 } }>
        <IntentGuideField value={ value } onChange={ setValue } />
      </Box>
    );
  },
};

export const Filled = {
  render: () => {
    const [value, setValue] = useState('차분한 다크 무드의 핀테크 대시보드, 데이터 가독성 우선');
    return (
      <Box sx={ { width: 560 } }>
        <IntentGuideField value={ value } onChange={ setValue } />
      </Box>
    );
  },
};

export const NearLimit = {
  render: () => {
    const [value, setValue] = useState(
      '신규 사용자 온보딩용 모바일 앱, 따뜻하고 친근한 톤, 일러스트 포인트 가능, 다크모드 지원, 접근성 AAA',
    );
    return (
      <Box sx={ { width: 560 } }>
        <IntentGuideField value={ value } onChange={ setValue } />
      </Box>
    );
  },
};

export const Disabled = {
  render: () => (
    <Box sx={ { width: 560 } }>
      <IntentGuideField value="차분한 다크 무드" onChange={ () => {} } disabled />
    </Box>
  ),
};
