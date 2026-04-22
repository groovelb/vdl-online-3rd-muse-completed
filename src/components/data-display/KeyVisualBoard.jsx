import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import CloseIcon from '@mui/icons-material/Close';

const EMPHASIS_LABEL = { 0: 'Low', 1: 'Mid', 2: 'High' };

/**
 * KeyVisualBoard 컴포넌트
 *
 * 키비주얼 레이어 — 다른 프리뷰들과 달리 "토큰"이 아닌 **이미지 집합**.
 * TokenListItem 대신 카드 그리드로 렌더링한다.
 * 각 카드에 on/off 스위치, emphasis 사이클 토글, 제거 버튼 오버레이.
 *
 * Props:
 * @param {array} items - [{ id, thumbnailUrl, caption?, isEnabled, emphasis }] [Required]
 * @param {function} onChange - (id, patch) => void [Optional]
 * @param {function} onRemove - (id) => void [Optional]
 * @param {object} columns - Grid size (기본: { xs: 6, sm: 4, md: 3 }) [Optional]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <KeyVisualBoard
 *   items={ [{ id: 'kv-1', thumbnailUrl: '/img.jpg', caption: 'Hero shot', isEnabled: true, emphasis: 2 }] }
 *   onChange={ updateItem }
 *   onRemove={ removeItem }
 * />
 */
export function KeyVisualBoard({
  items,
  onChange,
  onRemove,
  columns = { xs: 6, sm: 4, md: 3 },
  sx,
}) {
  const cycleEmphasis = (current) => ((current + 1) % 3);

  if (!items?.length) {
    return (
      <Box sx={ { py: 6, textAlign: 'center', color: 'text.secondary', ...sx } }>
        <Typography variant="body2">키비주얼이 선택되지 않았습니다</Typography>
      </Box>
    );
  }

  return (
    <Box sx={ { width: '100%', ...sx } }>
      <Grid container spacing={ 2 }>
        { items.map((item) => (
          <Grid key={ item.id } size={ columns }>
            <Box
              sx={ {
                position: 'relative',
                aspectRatio: '4 / 3',
                borderRadius: 3,
                overflow: 'hidden',
                backgroundImage: `url(${item.thumbnailUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: 'grey.200',
                opacity: item.isEnabled ? 1 : 0.4,
                outline: '2px solid',
                outlineOffset: 0,
                outlineColor: item.emphasis === 2 ? 'info.main' : 'transparent',
                transition: 'opacity 0.2s, outline-color 0.2s',
              } }
            >
              {/* Top-right remove */}
              { onRemove && (
                <Tooltip title="제거" arrow>
                  <IconButton
                    size="small"
                    onClick={ () => onRemove(item.id) }
                    sx={ {
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'background.paper',
                      boxShadow: 1,
                      '&:hover': { bgcolor: 'background.default' },
                    } }
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              ) }

              {/* Bottom bar: emphasis + switch */}
              <Box
                sx={ {
                  position: 'absolute',
                  left: 8,
                  right: 8,
                  bottom: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                  px: 1,
                  py: 0.5,
                  borderRadius: 999,
                  bgcolor: 'rgba(252, 252, 255, 0.9)',
                  backdropFilter: 'blur(8px)',
                } }
              >
                <Tooltip title="강조도 변경" arrow>
                  <Box
                    component="button"
                    onClick={ () =>
                      onChange?.(item.id, { emphasis: cycleEmphasis(item.emphasis ?? 1) })
                    }
                    sx={ {
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      color: 'text.primary',
                      px: 0.5,
                    } }
                  >
                    { EMPHASIS_LABEL[item.emphasis ?? 1] }
                  </Box>
                </Tooltip>
                <Switch
                  size="small"
                  checked={ item.isEnabled }
                  onChange={ (e) => onChange?.(item.id, { isEnabled: e.target.checked }) }
                  color="primary"
                />
              </Box>

              {/* Optional caption */}
              { item.caption && (
                <Box
                  sx={ {
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    px: 1,
                    py: 0.25,
                    borderRadius: 999,
                    bgcolor: 'rgba(20, 19, 43, 0.6)',
                    color: 'common.white',
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    maxWidth: 'calc(100% - 56px)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  } }
                >
                  { item.caption }
                </Box>
              ) }
            </Box>
          </Grid>
        )) }
      </Grid>
    </Box>
  );
}
