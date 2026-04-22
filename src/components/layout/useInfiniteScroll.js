import { useEffect, useRef } from 'react';

/**
 * useInfiniteScroll
 *
 * IntersectionObserver 기반 무한 스크롤 훅.
 * 반환된 `sentinelRef`를 리스트 마지막 요소 근처의 DOM 노드에 연결하면,
 * 해당 노드가 뷰포트에 들어올 때 `onLoadMore`가 호출된다.
 *
 * Params:
 * @param {object} options
 * @param {function} options.onLoadMore - sentinel이 뷰포트에 들어왔을 때 호출 [Required]
 * @param {boolean} options.hasMore - 추가로 불러올 데이터가 있는지 [Optional, 기본값: true]
 * @param {boolean} options.isEnabled - 옵저버 활성화 여부 (로딩 중 일시 정지 등) [Optional, 기본값: true]
 * @param {string}  options.rootMargin - IntersectionObserver rootMargin [Optional, 기본값: '200px']
 * @returns {React.RefObject} sentinel DOM 노드에 연결할 ref
 *
 * Example usage:
 * const sentinelRef = useInfiniteScroll({ onLoadMore: loadMore, hasMore });
 * return <div ref={sentinelRef} />;
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore = true,
  isEnabled = true,
  rootMargin = '200px',
}) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!isEnabled || !hasMore) return undefined;
    const node = sentinelRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          onLoadMore?.();
        }
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isEnabled, hasMore, onLoadMore, rootMargin]);

  return sentinelRef;
}
