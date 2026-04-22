import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { InfiniteMasonry } from './InfiniteMasonry.jsx';
import Placeholder from '../../common/ui/Placeholder';

export default {
  title: 'Component/8. Layout/InfiniteMasonry',
  component: InfiniteMasonry,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
## InfiniteMasonry

MUI \`Masonry\`를 기반으로 한 인피니트 스크롤 그리드.

- \`IntersectionObserver\` 기반 sentinel로 뷰포트 진입 시 \`onLoadMore\` 호출
- Masonry 컬럼 계산에 간섭하지 않도록 sentinel은 Masonry 바깥에 배치
- 로딩 중에는 sentinel 옵저버가 일시 비활성화되어 중복 호출 방지
- 반응형 컬럼 지원 (\`xs/sm/md/lg\`), 기본 \`{ xs: 2, sm: 3, md: 4 }\`

### 용도

- MUSE 아카이브 인피니트 그리드
- 프로젝트 생성 시 레퍼런스 선택 패널
- 일반적인 카드/이미지 카탈로그
        `,
      },
    },
  },
  argTypes: {
    items: {
      control: 'object',
      description: '렌더링할 아이템 배열',
    },
    renderItem: {
      control: false,
      description: '각 아이템 렌더 함수 (item, index) => ReactNode',
    },
    onLoadMore: {
      action: 'loadMore',
      description: 'sentinel이 뷰포트에 들어왔을 때 호출',
    },
    hasMore: {
      control: 'boolean',
      description: '추가 로드 가능 여부',
    },
    isLoading: {
      control: 'boolean',
      description: '현재 로딩 중인지 여부',
    },
    columns: {
      control: 'object',
      description: 'Masonry 컬럼 수 또는 반응형 객체',
    },
    spacing: {
      control: { type: 'number', min: 0, max: 6 },
      description: '아이템 간 간격 (8px 단위)',
    },
    keyExtractor: {
      control: 'text',
      description: '아이템에서 key를 뽑을 필드명',
    },
    emptyContent: {
      control: false,
      description: 'items 비어있을 때 표시할 콘텐츠',
    },
  },
};

/** Mock 데이터 팩토리 (결정적 — index만으로 재현 가능) */
const makeMockItems = (start, count) =>
  Array.from({ length: count }, (_, i) => {
    const idx = start + i;
    return {
      id: `ref-${idx}`,
      index: idx,
      height: 120 + ((idx * 37) % 160),
    };
  });

/** 기본 — 점진 로드 (실제 인피니트 스크롤) */
export const Default = {
  render: () => {
    const [items, setItems] = useState(() => makeMockItems(0, 24));
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const handleLoadMore = useCallback(() => {
      if (isLoading || !hasMore) return;
      setIsLoading(true);
      // 실제 API 호출 흉내 — 600ms 딜레이
      setTimeout(() => {
        setItems((prev) => {
          const next = makeMockItems(prev.length, 12);
          const total = prev.length + next.length;
          if (total >= 72) setHasMore(false);
          return [...prev, ...next];
        });
        setIsLoading(false);
      }, 600);
    }, [isLoading, hasMore]);

    return (
      <Box sx={ { width: '100%', height: '70vh', overflowY: 'auto', px: 2 } }>
        <InfiniteMasonry
          items={ items }
          hasMore={ hasMore }
          isLoading={ isLoading }
          onLoadMore={ handleLoadMore }
          renderItem={ (item) => (
            <Placeholder.Box label={ `#${item.index}` } height={ item.height } />
          ) }
        />
      </Box>
    );
  },
};

/** 로딩 — 초기 비어있는 상태에서 자동 로드 */
export const InitiallyEmpty = {
  render: () => {
    const [items, setItems] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      setIsLoading(true);
      const t = setTimeout(() => {
        setItems(makeMockItems(0, 12));
        setIsLoading(false);
      }, 800);
      return () => clearTimeout(t);
    }, []);

    const handleLoadMore = useCallback(() => {
      if (isLoading || !hasMore) return;
      setIsLoading(true);
      setTimeout(() => {
        setItems((prev) => {
          const next = makeMockItems(prev.length, 12);
          if (prev.length + next.length >= 48) setHasMore(false);
          return [...prev, ...next];
        });
        setIsLoading(false);
      }, 600);
    }, [isLoading, hasMore]);

    return (
      <Box sx={ { width: '100%', height: '70vh', overflowY: 'auto', px: 2 } }>
        <InfiniteMasonry
          items={ items }
          hasMore={ hasMore }
          isLoading={ isLoading }
          onLoadMore={ handleLoadMore }
          renderItem={ (item) => (
            <Placeholder.Box label={ `#${item.index}` } height={ item.height } />
          ) }
        />
      </Box>
    );
  },
};

/** 빈 상태 — emptyContent 커스텀 */
export const EmptyState = {
  render: () => (
    <Box sx={ { width: '100%', px: 2 } }>
      <InfiniteMasonry
        items={ [] }
        hasMore={ false }
        isLoading={ false }
        renderItem={ () => null }
        emptyContent={ '아직 수집된 레퍼런스가 없습니다. 이미지를 드래그하거나 URL을 붙여넣어 보세요.' }
      />
    </Box>
  ),
};

/** 이미지 갤러리 — Placeholder.Media 조합 예시 */
export const ImageGallery = {
  render: () => {
    const [items, setItems] = useState(() =>
      Array.from({ length: 12 }, (_, i) => ({ id: `img-${i}`, index: i })),
    );
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const handleLoadMore = useCallback(() => {
      if (isLoading || !hasMore) return;
      setIsLoading(true);
      setTimeout(() => {
        setItems((prev) => {
          const next = Array.from({ length: 8 }, (_, i) => ({
            id: `img-${prev.length + i}`,
            index: prev.length + i,
          }));
          if (prev.length + next.length >= 40) setHasMore(false);
          return [...prev, ...next];
        });
        setIsLoading(false);
      }, 600);
    }, [isLoading, hasMore]);

    return (
      <Box sx={ { width: '100%', height: '70vh', overflowY: 'auto', px: 2 } }>
        <InfiniteMasonry
          items={ items }
          hasMore={ hasMore }
          isLoading={ isLoading }
          onLoadMore={ handleLoadMore }
          columns={ { xs: 2, sm: 3, md: 4 } }
          renderItem={ (item) => (
            <Placeholder.Media index={ item.index } category="abstract" />
          ) }
        />
      </Box>
    );
  },
};
