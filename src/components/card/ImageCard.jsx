import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { CustomCard } from './CustomCard';

/**
 * ImageCard 컴포넌트
 *
 * 그리드의 기본 아이템. CustomCard를 확장하여 구현.
 * Hover 시 위치 변경 효과 + 액션 버튼 / 선택 체크박스 표시.
 *
 * 동작 방식:
 * 1. 사용자가 카드에 마우스를 올리면 카드가 살짝 위로 이동
 * 2. Hover 상태에서 우측 상단에 기본 액션(좋아요) 또는 customOverlay 표시
 * 3. `isSelectable`일 경우 좌측 상단에 선택 체크박스 표시 (선택된 경우 항상 보임)
 * 4. `isSelected`일 때 primary 컬러 링으로 선택 상태 강조
 * 5. 카드 하단에 제목/태그 정보 상시 표시
 *
 * Props:
 * @param {string} src - 이미지 URL [Required]
 * @param {string} title - 이미지 제목/설명 [Optional]
 * @param {string[]} tags - 관련 태그 목록 (상위 3개 표시) [Optional]
 * @param {string[]} dominantColors - HEX 색상 배열 (상위 5개를 작은 원형 swatch 로 표시) [Optional, 기본값: []]
 * @param {function} onLike - 좋아요 버튼 클릭 핸들러 [Optional]
 * @param {boolean} hideActions - 기본 액션 버튼 숨김 여부 [Optional, 기본값: false]
 * @param {node} customOverlay - 커스텀 오버레이 요소 (hideActions와 함께 사용) [Optional]
 * @param {boolean} isSelectable - 선택 체크박스 표시 여부 [Optional, 기본값: false]
 * @param {boolean} isSelected - 현재 선택 상태 [Optional, 기본값: false]
 * @param {function} onToggleSelect - 선택 토글 핸들러 (nextSelected) => void [Optional]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <ImageCard
 *   src="/image.jpg"
 *   title="Beautiful landscape"
 *   tags={ ['nature', 'landscape'] }
 *   onLike={ () => handleLike() }
 * />
 *
 * // 선택 가능 모드 (ReferencePicker 등)
 * <ImageCard
 *   src="/image.jpg"
 *   tags={ ['Minimal', 'Blue'] }
 *   isSelectable
 *   isSelected={ picked.has(id) }
 *   onToggleSelect={ (next) => toggle(id, next) }
 * />
 */
export function ImageCard({
  src,
  title,
  tags = [],
  dominantColors = [],
  mediaRatio = 'auto',
  onLike,
  hideActions = false,
  customOverlay,
  isSelectable = false,
  isSelected = false,
  onToggleSelect,
  sx,
  ...props
}) {
  const handleToggle = (e) => {
    e.stopPropagation();
    onToggleSelect?.(!isSelected);
  };

  /** 우측 상단 액션 버튼 (기본: 좋아요) */
  const ActionButtons = (
    <Box
      className="action-buttons"
      sx={ {
        position: 'absolute',
        top: 8,
        right: 8,
        display: 'flex',
        gap: 0.5,
        opacity: 0,
        transition: 'opacity 0.2s',
      } }
    >
      <IconButton
        size="small"
        onClick={ (e) => {
          e.stopPropagation();
          onLike?.();
        } }
        sx={ {
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': { bgcolor: 'background.default' },
        } }
      >
        <FavoriteBorderIcon fontSize="small" />
      </IconButton>
    </Box>
  );

  /** 좌측 상단 선택 체크박스 (isSelectable일 때만) */
  const SelectCheckbox = isSelectable ? (
    <Box
      className="select-checkbox"
      onClick={ handleToggle }
      sx={ {
        position: 'absolute',
        top: 8,
        left: 8,
        // 선택됐거나 hover 상태일 때 보이도록
        opacity: isSelected ? 1 : 0,
        transition: 'opacity 0.2s',
      } }
    >
      <Checkbox
        checked={ isSelected }
        onChange={ (e) => {
          e.stopPropagation();
          onToggleSelect?.(e.target.checked);
        } }
        size="small"
        sx={ {
          p: 0.5,
          bgcolor: 'background.paper',
          borderRadius: '50%',
          boxShadow: 1,
          '&:hover': { bgcolor: 'background.default' },
        } }
      />
    </Box>
  ) : null;

  /** 오버레이 슬롯 결정 — isSelectable이 우선순위, 그 외엔 기존 로직 유지 */
  const overlaySlot = (
    <>
      { SelectCheckbox }
      { hideActions ? customOverlay : ActionButtons }
    </>
  );

  const hasContent = title || tags.length > 0 || dominantColors.length > 0;

  return (
    <CustomCard
      layout="vertical"
      mediaSrc={ src }
      mediaAlt={ title || 'Image asset' }
      mediaRatio={ mediaRatio }
      contentPadding={ hasContent ? 'sm' : 'none' }
      overlaySlot={ overlaySlot }
      onClick={ isSelectable ? handleToggle : props.onClick }
      sx={ {
        cursor: 'pointer',
        transition: 'outline-color 150ms',
        outline: '2px solid',
        outlineOffset: 0,
        outlineColor: isSelected ? 'info.main' : 'transparent',
        '&:hover': {
          '& .action-buttons': { opacity: 1 },
          '& .select-checkbox': { opacity: 1 },
        },
        border: 'none',
        boxShadow: 'none',
        ...sx,
      } }
      { ...props }
    >
      { hasContent && (
        <>
          { title && (
            <Typography
              variant="body2"
              sx={ {
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              } }
            >
              { title }
            </Typography>
          ) }
          { dominantColors.length > 0 && (
            <Box
              sx={ {
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mt: title ? 2 : 0,
              } }
            >
              { dominantColors.slice(0, 5).map((hex, i) => (
                <Box
                  key={ `${hex}-${i}` }
                  title={ hex }
                  sx={ {
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    bgcolor: hex,
                    border: '1px solid',
                    borderColor: 'divider',
                    flexShrink: 0,
                  } }
                />
              )) }
            </Box>
          ) }
          { tags.length > 0 && (
            <Box
              sx={ {
                display: 'flex',
                flexWrap: 'wrap',
                gap: 0.5,
                mt: (title || dominantColors.length) ? 2 : 0,
              } }
            >
              { tags.slice(0, 3).map((tag) => (
                <Chip
                  key={ tag }
                  label={ tag }
                  size="small"
                  sx={ {
                    height: 20,
                    fontSize: '0.7rem',
                  } }
                />
              )) }
            </Box>
          ) }
        </>
      ) }
    </CustomCard>
  );
}
