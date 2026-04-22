import { useCallback, useState } from 'react';
import { ArchivePage } from './ArchivePage';
import { references as allReferences } from '../../data/muse';

export default {
  title: 'Page/ArchivePage',
  component: ArchivePage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

/** 썸네일로 페이지 카드 형식에 맞춘 reference → page item 변환 */
const toPageItem = (ref) => ({
  id: ref.id,
  src: ref.thumbnailUrl,
  title: ref.title,
  tags: ref.tags,
});

const INITIAL_PAGE_SIZE = 18;
const LOAD_PAGE_SIZE = 12;

export const Default = {
  render: () => {
    const [items, setItems] = useState(() =>
      allReferences.slice(0, INITIAL_PAGE_SIZE).map(toPageItem),
    );
    const [hasMore, setHasMore] = useState(allReferences.length > INITIAL_PAGE_SIZE);
    const [isLoading, setIsLoading] = useState(false);

    const handleLoadMore = useCallback(() => {
      if (isLoading || !hasMore) return;
      setIsLoading(true);
      setTimeout(() => {
        setItems((prev) => {
          const next = allReferences
            .slice(prev.length, prev.length + LOAD_PAGE_SIZE)
            .map(toPageItem);
          const total = prev.length + next.length;
          if (total >= allReferences.length) setHasMore(false);
          return [...prev, ...next];
        });
        setIsLoading(false);
      }, 600);
    }, [isLoading, hasMore]);

    return (
      <ArchivePage
        references={ items }
        hasMore={ hasMore }
        isLoading={ isLoading }
        onLoadMore={ handleLoadMore }
        onUploadFile={ () => {} }
        onNewProject={ () => {} }
      />
    );
  },
};

export const EmptyState = {
  render: () => (
    <ArchivePage
      references={ [] }
      onUploadFile={ () => {} }
      onNewProject={ () => {} }
    />
  ),
};
