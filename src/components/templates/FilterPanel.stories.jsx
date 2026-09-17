import { useState } from 'react';
import { FilterPanel } from './FilterPanel.jsx';
import { references } from '../../data/muse';

export default {
  title: 'Custom Component/3. Archive & Filter/FilterPanel',
  component: FilterPanel,
  parameters: { layout: 'padded' },
};

/** 검색어, 태그, 대표색 세 축을 지역 상태로 잡아 실제 조작을 보여 주는 데모 */
function FilterPanelDemo() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTags, setActiveTags] = useState([]);
  const [activeColors, setActiveColors] = useState([]);

  const toggle = (list, setList) => (value) => setList(
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
  );

  return (
    <FilterPanel
      references={ references }
      searchTerm={ searchTerm }
      onSearchTermChange={ setSearchTerm }
      activeTags={ activeTags }
      onToggleTag={ toggle(activeTags, setActiveTags) }
      activeColors={ activeColors }
      onToggleColor={ toggle(activeColors, setActiveColors) }
      onResetColors={ () => setActiveColors([]) }
      onResetFilters={ () => { setSearchTerm(''); setActiveTags([]); setActiveColors([]); } }
      filteredCount={ references.length }
      totalCount={ references.length }
      sx={ { width: 240 } }
    />
  );
}

/** 아카이브 왼쪽에 붙어 따라오는 필터. 검색, 레이어별 태그, 대표색 세 축 */
export const Default = {
  render: () => <FilterPanelDemo />,
};
