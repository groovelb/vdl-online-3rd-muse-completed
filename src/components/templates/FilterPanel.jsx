import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SearchBar } from '../input/SearchBar.jsx';
import { REPRESENTATIVE_COLORS, isSimilarColor } from '../../utils/colorSimilarity';

const DESIGN_LAYER_KEYS = ['typography', 'layout', 'gradient'];
const VISUAL_DIRECTION_KEYS = ['genre', 'style', 'subject'];
const DESIGN_LAYER_LABELS = [
  { key: 'typography', label: '타이포' },
  { key: 'layout', label: '레이아웃' },
  { key: 'gradient', label: '그라디언트' },
];
const VISUAL_DIRECTION_LABELS = [
  { key: 'genre', label: '장르' },
  { key: 'style', label: '스타일' },
  { key: 'subject', label: '주제' },
];

/** 필터 카테고리 Accordion — 접기/펼치기 */
function FilterAccordion({ label, count, defaultExpanded = false, children }) {
  return (
    <Accordion
      defaultExpanded={ defaultExpanded }
      disableGutters
      elevation={ 0 }
      sx={ {
        bgcolor: 'transparent',
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:before': { display: 'none' },
        '&:last-of-type': { borderBottom: 'none' },
      } }
    >
      <AccordionSummary
        expandIcon={ <ExpandMoreIcon fontSize="small" /> }
        sx={ { px: 0, minHeight: 40, '& .MuiAccordionSummary-content': { my: 1 } } }
      >
        <Typography
          variant="overline"
          sx={ { fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em', color: 'text.primary' } }
        >
          { label }
          { count > 0 && (
            <Box component="span" sx={ { ml: 1, color: 'primary.main', fontSize: '0.7rem' } }>
              { count }
            </Box>
          ) }
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={ { px: 0, pt: 0, pb: 2, display: 'flex', flexDirection: 'column', gap: 1.5 } }>
        { children }
      </AccordionDetails>
    </Accordion>
  );
}

/** 서브 행 (타이포 / 레이아웃 / 그라디언트 / 장르 / 스타일 / 주제 레벨) */
function FilterSubRow({ label, children }) {
  return (
    <Box sx={ { display: 'flex', alignItems: 'flex-start', gap: 1.5 } }>
      <Typography
        variant="caption"
        sx={ { minWidth: 64, pt: 0.75, color: 'text.secondary', fontSize: '0.72rem' } }
      >
        { label }
      </Typography>
      <Box sx={ { display: 'flex', flexWrap: 'wrap', gap: 0.5 } }>
        { children }
      </Box>
    </Box>
  );
}

function buildLayeredTags(references) {
  const buckets = {
    typography: new Set(),
    layout: new Set(),
    gradient: new Set(),
    genre: new Set(),
    style: new Set(),
    subject: new Set(),
  };
  references.forEach((r) => {
    const t = r.tags || {};
    (t.typography || []).forEach((x) => buckets.typography.add(x));
    (t.layout || []).forEach((x) => buckets.layout.add(x));
    (t.gradient || []).forEach((x) => buckets.gradient.add(x));
    const vd = t.visualDirection || {};
    (vd.genre || []).forEach((x) => buckets.genre.add(x));
    (vd.style || []).forEach((x) => buckets.style.add(x));
    (vd.subject || []).forEach((x) => buckets.subject.add(x));
  });
  return Object.fromEntries(Object.entries(buckets).map(([k, s]) => [k, [...s].sort()]));
}

function buildRepresentativeCounts(references) {
  return REPRESENTATIVE_COLORS
    .map((rep) => {
      const count = references.filter((r) =>
        (r.dominantColors || []).some((hex) => isSimilarColor(rep.hex, hex)),
      ).length;
      return { ...rep, count };
    })
    .filter((rep) => rep.count > 0);
}

/**
 * FilterPanel 컴포넌트
 *
 * 레퍼런스 컬렉션에 대한 검색 + 색상 + 레이어별 태그 필터링 UI.
 *
 * 동작 흐름:
 * 1. 상단 검색바에 키워드를 입력하면 상위 화면이 필터된 결과를 렌더링한다
 * 2. references로부터 자동으로 대표 색상환과 레이어별 태그 목록을 계산한다
 * 3. 사용자가 색상 스와치 또는 태그 칩을 클릭하면 activeColors / activeTags가 토글된다
 * 4. 활성 필터가 하나라도 있으면 "필터 초기화" 버튼이 하단에 나타난다
 * 5. 필터 상태는 상위에서 관리 (controlled) — 패널은 순수 표시 + 이벤트 전달만 담당
 *
 * Props:
 * @param {array} references - 전체 레퍼런스 배열 (필터 소스) [Required]
 * @param {string} searchTerm - 현재 검색어 [Required]
 * @param {function} onSearchTermChange - (nextTerm) => void [Required]
 * @param {string[]} activeTags - 활성화된 태그 배열 [Required]
 * @param {function} onToggleTag - (tag) => void [Required]
 * @param {string[]} activeColors - 활성화된 색상 hex 배열 [Required]
 * @param {function} onToggleColor - (hex) => void [Required]
 * @param {function} onResetColors - () => void, "모두 보기" 클릭 시 색상 필터 해제 [Optional]
 * @param {function} onResetFilters - () => void [Required]
 * @param {number} filteredCount - 현재 필터 결과 개수 [Required]
 * @param {number} totalCount - 전체 개수 [Required]
 * @param {object} sx - 컨테이너 추가 스타일 [Optional]
 *
 * Example usage:
 * <FilterPanel
 *   references={ references }
 *   searchTerm={ searchTerm }
 *   onSearchTermChange={ setSearchTerm }
 *   activeTags={ activeTags }
 *   onToggleTag={ toggleTag }
 *   activeColors={ activeColors }
 *   onToggleColor={ toggleColor }
 *   onResetFilters={ resetAllFilters }
 *   filteredCount={ filtered.length }
 *   totalCount={ references.length }
 * />
 */
export function FilterPanel({
  references,
  searchTerm,
  onSearchTermChange,
  activeTags,
  onToggleTag,
  activeColors,
  onToggleColor,
  onResetColors,
  onResetFilters,
  filteredCount,
  totalCount,
  sx,
}) {
  const layeredTags = useMemo(() => buildLayeredTags(references), [references]);
  const hasAnyTag = useMemo(
    () => Object.values(layeredTags).some((arr) => arr.length > 0),
    [layeredTags],
  );
  const representativeCounts = useMemo(
    () => buildRepresentativeCounts(references),
    [references],
  );

  const totalActiveFilters = activeTags.length + activeColors.length;

  const countForKeys = (keys) =>
    activeTags.filter((t) => keys.some((k) => layeredTags[k]?.includes(t))).length;

  const hasDesignLayer = DESIGN_LAYER_KEYS.some((k) => layeredTags[k]?.length > 0);
  const hasVisualDirection = VISUAL_DIRECTION_KEYS.some((k) => layeredTags[k]?.length > 0);

  return (
    <Box sx={ sx }>
      <SearchBar
        value={ searchTerm }
        placeholder="제목 또는 태그 검색"
        onChange={ onSearchTermChange }
        onClear={ () => onSearchTermChange('') }
        isFullWidth
      />
      { (hasAnyTag || representativeCounts.length > 0) && (
        <Box sx={ { mt: 2 } }>
          { /* 색상 — 대표 색상환 기반, 선택 시 주변색 유사도 매칭 */ }
          { representativeCounts.length > 0 && (
            <FilterAccordion label="색상" count={ activeColors.length }>
              <Box sx={ { display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' } }>
                { /* "모두 보기" — 색상 필터가 비어있을 때 활성 표시, 클릭 시 색상 필터 해제 */ }
                <Box
                  onClick={ () => activeColors.length > 0 && onResetColors?.() }
                  title="모두 보기 (색상 필터 해제)"
                  sx={ {
                    position: 'relative',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'conic-gradient(from 0deg, #ff5b5b, #ffbd2e, #6dd86d, #4cc4ff, #b56bff, #ff5bd0, #ff5b5b)',
                    cursor: activeColors.length > 0 ? 'pointer' : 'default',
                    border: activeColors.length === 0 ? '3px solid' : '1px solid',
                    borderColor: activeColors.length === 0 ? 'primary.main' : 'divider',
                    boxShadow: activeColors.length === 0 ? '0 0 0 2px rgba(99,102,241,0.25)' : 'none',
                    transition: 'border-color 150ms, border-width 150ms, box-shadow 150ms',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box',
                  } }
                >
                  <Box
                    sx={ {
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      bgcolor: 'background.default',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    } }
                  >
                    <Typography
                      sx={ { fontSize: '0.55rem', fontWeight: 700, lineHeight: 1, color: 'text.primary' } }
                    >
                      All
                    </Typography>
                  </Box>
                </Box>

                { representativeCounts.map(({ hex, label, count }) => {
                  const isActive = activeColors.includes(hex);
                  return (
                    <Box
                      key={ hex }
                      onClick={ () => onToggleColor(hex) }
                      title={ `${label} · ${count}장` }
                      sx={ {
                        position: 'relative',
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: hex,
                        cursor: 'pointer',
                        border: isActive ? '3px solid' : '1px solid',
                        borderColor: isActive ? 'primary.main' : 'divider',
                        boxSizing: 'border-box',
                        boxShadow: isActive ? '0 0 0 2px rgba(99,102,241,0.25)' : 'none',
                        transition: 'border-color 150ms, border-width 150ms, box-shadow 150ms',
                        '&:hover': {
                          borderColor: isActive ? 'primary.main' : 'text.secondary',
                        },
                      } }
                    >
                      { isActive && (
                        <Box
                          sx={ {
                            position: 'absolute',
                            top: -6,
                            right: -6,
                            minWidth: 18,
                            height: 18,
                            px: 0.5,
                            borderRadius: '9px',
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          } }
                        >
                          { count }
                        </Box>
                      ) }
                    </Box>
                  );
                }) }
              </Box>
              <Typography variant="caption" color="text.secondary">
                대표 색 선택 시 유사 계열 레퍼런스가 함께 필터링됩니다
              </Typography>
            </FilterAccordion>
          ) }

          { hasDesignLayer && (
            <FilterAccordion label="디자인 레이어" count={ countForKeys(DESIGN_LAYER_KEYS) }>
              { DESIGN_LAYER_LABELS
                .filter(({ key }) => layeredTags[key]?.length > 0)
                .map(({ key, label }) => (
                  <FilterSubRow key={ key } label={ label }>
                    { layeredTags[key].map((tag) => (
                      <Chip
                        key={ tag }
                        label={ tag }
                        size="small"
                        color={ activeTags.includes(tag) ? 'primary' : 'default' }
                        variant={ activeTags.includes(tag) ? 'filled' : 'outlined' }
                        onClick={ () => onToggleTag(tag) }
                        sx={ { height: 26, fontSize: '0.72rem' } }
                      />
                    )) }
                  </FilterSubRow>
                )) }
            </FilterAccordion>
          ) }

          { hasVisualDirection && (
            <FilterAccordion label="비주얼 디렉션" count={ countForKeys(VISUAL_DIRECTION_KEYS) }>
              { VISUAL_DIRECTION_LABELS
                .filter(({ key }) => layeredTags[key]?.length > 0)
                .map(({ key, label }) => (
                  <FilterSubRow key={ key } label={ label }>
                    { layeredTags[key].map((tag) => (
                      <Chip
                        key={ tag }
                        label={ tag }
                        size="small"
                        color={ activeTags.includes(tag) ? 'primary' : 'default' }
                        variant={ activeTags.includes(tag) ? 'filled' : 'outlined' }
                        onClick={ () => onToggleTag(tag) }
                        sx={ { height: 26, fontSize: '0.72rem' } }
                      />
                    )) }
                  </FilterSubRow>
                )) }
            </FilterAccordion>
          ) }

          { totalActiveFilters > 0 && (
            <Button size="small" variant="text" onClick={ onResetFilters } sx={ { mt: 2 } }>
              필터 초기화 ({ totalActiveFilters })
            </Button>
          ) }
        </Box>
      ) }
      <Typography variant="caption" color="text.secondary" sx={ { display: 'block', mt: 1.5 } }>
        { filteredCount } / { totalCount } 개 표시됨
      </Typography>
    </Box>
  );
}
