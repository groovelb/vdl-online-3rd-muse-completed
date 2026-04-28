import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import { ImageCard } from '../card/ImageCard.jsx';
import { ReferenceLayerChipRow } from '../card/ReferenceLayerChipRow.jsx';
import { InfiniteMasonry } from '../layout/InfiniteMasonry.jsx';
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

  return (
    <Box sx={ { width: '100%', ...sx } }>
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

      {/* Grid */}
      <InfiniteMasonry
        items={ currentList }
        hasMore={ tab === 'archive' ? hasMore : false }
        isLoading={ tab === 'archive' ? isLoading : false }
        onLoadMore={ tab === 'archive' ? onLoadMore : undefined }
        columns={ { xs: 2, sm: 3, md: 4 } }
        spacing={ 2 }
        emptyContent={
          tab === 'recommended'
            ? '추천 레퍼런스가 없습니다. 프로젝트 의도를 더 자세히 입력해보세요.'
            : tagFilter.length > 0
              ? '선택한 태그와 일치하는 항목이 없습니다.'
              : '아카이브에 레퍼런스가 없습니다.'
        }
        renderItem={ (item) => {
          const isSelected = selectedSet.has(item.id);
          const autoLayers = referenceLayerMap[item.id] || [];
          const userCuration = selectedRefs.find((r) => r.id === item.id)?.useLayers || [];
          return (
            <Box>
              <ImageCard
                src={ item.src }
                title={ item.title }
                tags={ flattenTags(item).slice(0, 3) }
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
                  />
                </Box>
              ) }
            </Box>
          );
        } }
      />
    </Box>
  );
}
