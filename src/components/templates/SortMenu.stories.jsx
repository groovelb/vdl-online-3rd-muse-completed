import { useState } from 'react';
import { SortMenu } from './SortMenu.jsx';

export default {
  title: 'Custom Component/3. Archive & Filter/SortMenu',
  component: SortMenu,
  parameters: { layout: 'centered' },
};

/** 고른 값을 기억하는 데모 */
function SortMenuDemo() {
  const [value, setValue] = useState('newest');
  return <SortMenu value={ value } onChange={ setValue } />;
}

/** 목록 정렬 기준을 고르는 작은 메뉴 */
export const Default = {
  render: () => <SortMenuDemo />,
};
