import { useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import { ReferencePicker } from './ReferencePicker';
import { references as allReferences } from '../../data/muse';

export default {
  title: 'Template/ReferencePicker',
  component: ReferencePicker,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

const toPickerItem = (ref) => ({
  id: ref.id,
  src: ref.thumbnailUrl,
  title: ref.title,
  tags: ref.tags,
});

/** 첫 6개를 추천으로 간주 — 실제로는 의도 기반 AI 추천 */
const RECOMMENDED = allReferences.slice(0, 6).map(toPickerItem);
const ARCHIVE = allReferences.map(toPickerItem);

export const Default = {
  render: () => {
    const [selected, setSelected] = useState([]);
    const [tagFilter, setTagFilter] = useState([]);

    return (
      <Box sx={ { height: '80vh', overflowY: 'auto' } }>
        <ReferencePicker
          recommended={ RECOMMENDED }
          archive={ ARCHIVE.slice(0, 24) }
          selectedIds={ selected }
          onChange={ setSelected }
          tagFilter={ tagFilter }
          onTagFilterChange={ setTagFilter }
        />
      </Box>
    );
  },
};

export const WithInfiniteScroll = {
  render: () => {
    const INITIAL = 18;
    const [items, setItems] = useState(() => ARCHIVE.slice(0, INITIAL));
    const [hasMore, setHasMore] = useState(ARCHIVE.length > INITIAL);
    const [isLoading, setIsLoading] = useState(false);
    const [selected, setSelected] = useState([]);
    const [tagFilter, setTagFilter] = useState([]);

    const handleLoadMore = useCallback(() => {
      if (isLoading || !hasMore) return;
      setIsLoading(true);
      setTimeout(() => {
        setItems((prev) => {
          const next = ARCHIVE.slice(prev.length, prev.length + 12);
          if (prev.length + next.length >= ARCHIVE.length) setHasMore(false);
          return [...prev, ...next];
        });
        setIsLoading(false);
      }, 600);
    }, [isLoading, hasMore]);

    return (
      <Box sx={ { height: '80vh', overflowY: 'auto' } }>
        <ReferencePicker
          recommended={ [] }
          archive={ items }
          selectedIds={ selected }
          onChange={ setSelected }
          tagFilter={ tagFilter }
          onTagFilterChange={ setTagFilter }
          hasMore={ hasMore }
          isLoading={ isLoading }
          onLoadMore={ handleLoadMore }
        />
      </Box>
    );
  },
};

export const ArchiveOnly = {
  render: () => {
    const [selected, setSelected] = useState([]);
    return (
      <Box sx={ { height: '80vh', overflowY: 'auto' } }>
        <ReferencePicker
          archive={ ARCHIVE.slice(0, 12) }
          selectedIds={ selected }
          onChange={ setSelected }
        />
      </Box>
    );
  },
};

export const Empty = {
  render: () => (
    <Box sx={ { minHeight: 400 } }>
      <ReferencePicker
        archive={ [] }
        selectedIds={ [] }
        onChange={ () => {} }
      />
    </Box>
  ),
};
