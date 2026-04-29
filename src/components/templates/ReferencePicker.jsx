import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { ImageCard } from '../card/ImageCard.jsx';
import { ReferenceLayerChipRow } from '../card/ReferenceLayerChipRow.jsx';
import { useInfiniteScroll } from '../layout/useInfiniteScroll.js';
import { flattenTags } from '../../data/muse';

/**
 * ReferencePicker 컴포넌트
 *
 * 프로젝트 생성 Step 2에서 사용. 추천 레퍼런스와 전체 아카이브를 탭으로 구분해
 * 다중 선택할 수 있다. 태그 칩 필터 지원.
 *
 * Props:
 * @param {array} recommended - 추천 레퍼런스 [{ id, src, title?, tags? }] [Optional]
 * @param {array} archive - 전체 아카이브 [{ id, src, title?, tags? }] [Required]
 * @param {string[]} selectedIds - 현재 선택된 id 배열 [Required]
 * @param {function} onChange - (nextIds) => void [Required]
 * @param {string[]} tagFilter - 활성화된 태그 배열 [Optional, 기본값: []]
 * @param {function} onTagFilterChange - (nextTags) => void [Optional]
 * @param {function} onLoadMore - 아카이브 더 불러오기 [Optional]
 * @param {boolean} hasMore - 아카이브 추가 로드 가능 여부 [Optional, 기본값: false]
 * @param {boolean} isLoading - 로딩 중 [Optional, 기본값: false]
 * @param {object} referenceLayerMap - TP4 자동: { [refId]: layers[] } [Optional]
 * @param {Array} selectedRefs - TP4 사용자 큐레이션: [{id, useLayers}] [Optional]
 * @param {function} onUseLayersChange - TP4 (id, layers) => void [Optional]
 * @param {'concept'|'system'|'handoff'} mode - 추천/큐레이션 chip 셋 결정 (system/handoff 면 components chip 추가) [Optional, 기본값: 'system']
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <ReferencePicker
 *   recommended={ recommended }
 *   archive={ archive }
 *   selectedIds={ ids }
 *   onChange={ setIds }
 * />
 */
export function ReferencePicker({
  recommended = [],
  archive,
  selectedIds,
  onChange,
  tagFilter = [],
  onTagFilterChange,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  referenceLayerMap = {},
  selectedRefs = [],
  onUseLayersChange,
  mode = 'system',
  sx,
}) {
  const [tab, setTab] = useState(recommended.length ? 'recommended' : 'archive');

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const toggleId = (id, next) => {
    if (next) {
      onChange?.([...selectedIds, id]);
    } else {
      onChange?.(selectedIds.filter((x) => x !== id));
    }
  };

  const allTags = useMemo(() => {
    const set = new Set();
    archive.forEach((ref) => flattenTags(ref).forEach((t) => set.add(t)));
    return [...set];
  }, [archive]);

  const visibleArchive = useMemo(() => {
    if (!tagFilter.length) return archive;
    return archive.filter((ref) => {
      const refTags = flattenTags(ref);
      return tagFilter.every((t) => refTags.includes(t));
    });
  }, [archive, tagFilter]);

  const toggleTag = (tag) => {
    if (!onTagFilterChange) return;
    const next = tagFilter.includes(tag)
      ? tagFilter.filter((t) => t !== tag)
      : [...tagFilter, tag];
    onTagFilterChange(next);
  };

  const currentList = tab === 'recommended' ? recommended : visibleArchive;

  /** 선택된 id → archive ∪ recommended 에서 메타 조회 (썸네일 스트립용) */
  const selectedItems = useMemo(() => {
    const map = new Map();
    archive.forEach((r) => map.set(r.id, r));
    recommended.forEach((r) => map.set(r.id, r));
    return selectedIds.map((id) => map.get(id)).filter(Boolean);
  }, [selectedIds, archive, recommended]);

  return (
    <Box sx={ { width: '100%', ...sx } }>
      {/* 선택된 레퍼런스 — 우하단 viewport-fixed 플로팅 스트립 (바톰 네비 위)
          상시 보이도록 fixed, 선택 0개면 미렌더 */}
      { selectedItems.length > 0 && (
        <Box
          sx={ {
            position: 'fixed',
            right: { xs: 16, md: 24, lg: 40 },
            // 바톰 네비(BOTTOM_BAR_HEIGHT=88) 위에 16px 띄움
            bottom: { xs: 96, md: 104 },
            zIndex: (theme) => theme.zIndex.appBar - 1,
            maxWidth: { xs: 'calc(100vw - 32px)', md: '60vw', lg: 720 },
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            boxShadow: (theme) => theme.customShadows.sm,
            backdropFilter: 'blur(8px)',
            p: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            overflowX: 'auto',
            '&::-webkit-scrollbar': { height: 6 },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 3 },
          } }
        >
          { selectedItems.map((item) => (
            <Box
              key={ item.id }
              sx={ {
                position: 'relative',
                flexShrink: 0,
                width: 56,
                height: 56,
              } }
            >
              <Box
                component="img"
                src={ item.src }
                alt={ item.title || '' }
                decoding="async"
                sx={ {
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 2,
                  display: 'block',
                } }
              />
              <IconButton
                size="small"
                aria-label="선택 해제"
                onClick={ () => toggleId(item.id, false) }
                sx={ {
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  width: 20,
                  height: 20,
                  bgcolor: 'rgba(20,19,43,0.85)',
                  color: 'common.white',
                  '&:hover': { bgcolor: 'error.main' },
                } }
              >
                <CloseIcon sx={ { fontSize: 12 } } />
              </IconButton>
            </Box>
          )) }
        </Box>
      ) }

      {/* Header: 탭 + 선택 카운터 */}
      <Box
        sx={ {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
          gap: 2,
        } }
      >
        <Tabs
          value={ tab }
          onChange={ (_e, v) => setTab(v) }
          textColor="primary"
          indicatorColor="primary"
        >
          { recommended.length > 0 && (
            <Tab value="recommended" label={ `추천 (${recommended.length})` } />
          ) }
          <Tab value="archive" label={ `아카이브 (${archive.length})` } />
        </Tabs>

        <Typography variant="body2" color="text.secondary">
          { selectedIds.length }개 선택됨
        </Typography>
      </Box>

      {/* Tag filter (archive 탭에서만) */}
      { tab === 'archive' && allTags.length > 0 && (
        <Box
          sx={ {
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.75,
            mb: 2,
            alignItems: 'center',
          } }
        >
          <Typography variant="caption" color="text.secondary" sx={ { mr: 0.5 } }>
            태그
          </Typography>
          { allTags.map((tag) => {
            const isActive = tagFilter.includes(tag);
            return (
              <Chip
                key={ tag }
                label={ tag }
                size="small"
                onClick={ () => toggleTag(tag) }
                color={ isActive ? 'primary' : 'default' }
                variant={ isActive ? 'filled' : 'outlined' }
              />
            );
          }) }
          { tagFilter.length > 0 && (
            <Button
              size="small"
              variant="text"
              onClick={ () => onTagFilterChange?.([]) }
              sx={ { ml: 1 } }
            >
              초기화
            </Button>
          ) }
        </Box>
      ) }

      {/* Grid — 고정 aspect-ratio CSS Grid 로 Masonry 의 측정 jitter 제거.
          각 셀의 미디어 영역은 mediaRatio 4/5 로 잠겨 이미지 load 와 무관하게 높이 고정 */}
      { currentList.length === 0 ? (
        <Box sx={ { py: 6, textAlign: 'center' } }>
          <Typography color="text.secondary" variant="body2">
            { tab === 'recommended'
              ? '추천 레퍼런스가 없습니다. 프로젝트 의도를 더 자세히 입력해보세요.'
              : tagFilter.length > 0
                ? '선택한 태그와 일치하는 항목이 없습니다.'
                : '아카이브에 레퍼런스가 없습니다.' }
          </Typography>
        </Box>
      ) : (
        <Box
          sx={ {
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(4, 1fr)',
              lg: 'repeat(5, 1fr)',
              xl: 'repeat(6, 1fr)',
            },
            gap: 2,
            alignItems: 'start',
          } }
        >
          { currentList.map((item) => {
            const isSelected = selectedSet.has(item.id);
            const autoLayers = referenceLayerMap[item.id] || [];
            const userCuration = selectedRefs.find((r) => r.id === item.id)?.useLayers || [];
            return (
              <Box key={ item.id }>
                <ImageCard
                  src={ item.src }
                  title={ item.title }
                  mediaRatio="4/5"
                  isSelectable
                  isSelected={ isSelected }
                  onToggleSelect={ (next) => toggleId(item.id, next) }
                />
                { isSelected && onUseLayersChange && (
                  <Box onClick={ (e) => e.stopPropagation() } sx={ { mt: 0.5 } }>
                    <ReferenceLayerChipRow
                      autoLayers={ autoLayers.length > 0 ? autoLayers : ['color', 'typography'] }
                      value={ userCuration }
                      onChange={ (layers) => onUseLayersChange(item.id, layers) }
                      mode={ mode }
                    />
                  </Box>
                ) }
              </Box>
            );
          }) }
        </Box>
      ) }

      {/* 무한 스크롤 sentinel — archive 탭에서만 활성 */}
      <InfiniteScrollSentinel
        onLoadMore={ onLoadMore }
        hasMore={ tab === 'archive' && hasMore }
        isLoading={ isLoading }
      />
    </Box>
  );
}

/** 무한 스크롤 sentinel — IntersectionObserver 진입 시 onLoadMore */
function InfiniteScrollSentinel({ onLoadMore, hasMore, isLoading }) {
  const sentinelRef = useInfiniteScroll({
    onLoadMore,
    hasMore: !!hasMore,
    isEnabled: !!onLoadMore,
  });
  if (!hasMore) return null;
  return (
    <Box ref={ sentinelRef } sx={ { height: 32, mt: 2 } }>
      { isLoading && (
        <Typography variant="caption" color="text.secondary" sx={ { display: 'block', textAlign: 'center' } }>
          더 불러오는 중…
        </Typography>
      ) }
    </Box>
  );
}
