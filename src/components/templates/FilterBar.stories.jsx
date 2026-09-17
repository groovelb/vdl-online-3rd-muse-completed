import { useState } from 'react';
import { FilterBar } from './FilterBar.jsx';
import { references, flattenTags } from '../../data/muse';

const availableTags = Array.from(
  new Set(references.flatMap((r) => flattenTags(r.tags))),
).slice(0, 12);

export default {
  title: 'Custom Component/3. Archive & Filter/FilterBar',
  component: FilterBar,
  parameters: { layout: 'padded' },
};

/** 검색어, 태그, 정렬, 보기 모드를 지역 상태로 잡은 데모 */
function FilterBarDemo() {
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');

  const toggleTag = (tag) => setSelectedTags(
    selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag],
  );

  return (
    <FilterBar
      searchValue={ search }
      onSearchChange={ setSearch }
      availableTags={ availableTags }
      selectedTags={ selectedTags }
      onTagToggle={ toggleTag }
      onClearFilters={ () => { setSearch(''); setSelectedTags([]); } }
      sortBy={ sortBy }
      onSortChange={ setSortBy }
      viewMode={ viewMode }
      onViewModeChange={ setViewMode }
      resultCount={ references.length }
    />
  );
}

/** 검색, 태그, 정렬, 보기 모드를 한 줄에 모은 막대 */
export const Default = {
  render: () => <FilterBarDemo />,
};
