import { useCallback, useState } from 'react';
import { ArchivePage } from './ArchivePage';
import { references as allReferences } from '../../data/muse';
import { withAppShell } from './_appShellDecorator.jsx';

export default {
  title: 'Page/ArchivePage',
  component: ArchivePage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [withAppShell],
};

/** Store Mode: fixtures 기반 쇼케이스. 업로드 버튼은 로컬 dispatch only (Supabase 호출 없음, Storybook 전용) */
export const StoreMode = {
  render: () => (
    <ArchivePage
      useStoreMode
      onNewProject={ () => {} }
    />
  ),
};

/** 외부 주입 — 기존 스토리 호환 */
export const Default = {
  render: () => {
    const [items, setItems] = useState(() => allReferences.slice(0, 18));
    const [hasMore, setHasMore] = useState(allReferences.length > 18);
    const [isLoading, setIsLoading] = useState(false);

    const handleLoadMore = useCallback(() => {
      if (isLoading || !hasMore) return;
      setIsLoading(true);
      setTimeout(() => {
        setItems((prev) => {
          const next = allReferences.slice(prev.length, prev.length + 12);
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
