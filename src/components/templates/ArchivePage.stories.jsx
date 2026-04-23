import { useCallback, useState } from 'react';
import Button from '@mui/material/Button';
import { ArchivePage } from './ArchivePage';
import { references as allReferences } from '../../data/muse';
import { resetMuseStore } from '../../store';

export default {
  title: 'Page/ArchivePage',
  component: ArchivePage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

/** Store Mode: 업로드 → 실제 T1 호출 → store 반영. 새로고침해도 localStorage에 유지 */
export const StoreMode = {
  render: () => (
    <div>
      <div style={ { position: 'fixed', bottom: 16, right: 16, zIndex: 2000 } }>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          onClick={ () => {
            resetMuseStore();
            window.location.reload();
          } }
        >
          Store 초기화 + 새로고침
        </Button>
      </div>
      <ArchivePage
        useStoreMode
        onNewProject={ () => {} }
      />
    </div>
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
