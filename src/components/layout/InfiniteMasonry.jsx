import Masonry from '@mui/lab/Masonry';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useInfiniteScroll } from './useInfiniteScroll.js';

/**
 * InfiniteMasonry 컴포넌트
 *
 * MUI Masonry를 기반으로 한 인피니트 스크롤 그리드.
 * 하단 sentinel이 뷰포트에 들어오면 `onLoadMore`가 호출되어 추가 아이템을 요청한다.
 * 기본적으로 반응형 컬럼을 지원하며, MUSE의 아카이브/레퍼런스 선택 UI에 사용된다.
 *
 * Props:
 * @param {array} items - 렌더링할 아이템 배열 [Required]
 * @param {function} renderItem - (item, index) => ReactNode, 각 아이템 렌더 함수 [Required]
 * @param {function} onLoadMore - 다음 페이지 요청 콜백 [Optional]
 * @param {boolean} hasMore - 추가 로드 가능 여부 [Optional, 기본값: false]
 * @param {boolean} isLoading - 현재 로딩 중인지 (중복 호출 방지) [Optional, 기본값: false]
 * @param {number|object} columns - Masonry 컬럼 수 또는 반응형 객체 [Optional, 기본값: { xs: 2, sm: 3, md: 4 }]
 * @param {number} spacing - 아이템 간 간격 (8px 단위) [Optional, 기본값: 2]
 * @param {string} keyExtractor - 아이템에서 key를 뽑을 필드명 (없으면 index 사용) [Optional, 기본값: 'id']
 * @param {node} emptyContent - items 비어있을 때 표시할 콘텐츠 [Optional]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <InfiniteMasonry
 *   items={ references }
 *   renderItem={ (ref) => <ImageCard key={ref.id} src={ref.url} tags={ref.tags} /> }
 *   onLoadMore={ loadMore }
 *   hasMore={ hasMore }
 *   isLoading={ isLoading }
 * />
 */
export function InfiniteMasonry({
  items,
  renderItem,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  columns = { xs: 2, sm: 3, md: 4 },
  spacing = 2,
  keyExtractor = 'id',
  emptyContent,
  sx,
}) {
  const sentinelRef = useInfiniteScroll({
    onLoadMore,
    hasMore,
    isEnabled: !isLoading,
  });

  if (!items?.length && !isLoading) {
    return (
      <Box sx={ { py: 8, textAlign: 'center', ...sx } }>
        { emptyContent || (
          <Typography variant="body2" color="text.secondary">
            표시할 항목이 없습니다
          </Typography>
        ) }
      </Box>
    );
  }

  return (
    <Box sx={ { width: '100%', ...sx } }>
      <Masonry columns={ columns } spacing={ spacing }>
        { items.map((item, index) => {
          const key = item?.[keyExtractor] ?? index;
          return <Box key={ key }>{ renderItem(item, index) }</Box>;
        }) }
      </Masonry>

      {/* Sentinel — Masonry 바깥에 두어 컬럼 계산에 간섭 없음 */}
      <Box
        ref={ sentinelRef }
        sx={ {
          height: 1,
          width: '100%',
          mt: spacing,
        } }
        aria-hidden
      />

      { isLoading && (
        <Box
          sx={ {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: 4,
            gap: 1.5,
          } }
        >
          <CircularProgress size={ 20 } thickness={ 4 } />
          <Typography variant="body2" color="text.secondary">
            불러오는 중
          </Typography>
        </Box>
      ) }

      { !hasMore && items?.length > 0 && !isLoading && (
        <Box sx={ { py: 4, textAlign: 'center' } }>
          <Typography variant="caption" color="text.secondary">
            모든 항목을 불러왔습니다
          </Typography>
        </Box>
      ) }
    </Box>
  );
}
