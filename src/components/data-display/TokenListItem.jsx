import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';

const EMPHASIS_OPTIONS = [
  { value: 0, label: 'Low', hint: '약' },
  { value: 1, label: 'Mid', hint: '중' },
  { value: 2, label: 'High', hint: '강' },
];

/**
 * TokenListItem 컴포넌트
 *
 * MUSE 프로젝트 상세 화면에서 각 레이어(컬러/타이포/레이아웃/그라디언트/키비주얼)의
 * 토큰 한 건을 표현하는 공통 행 컴포넌트.
 *
 * 구성: [preview 48x48] [label + value] [emphasis (Low/Mid/High)] [on/off switch]
 *
 * - `isEnabled=false`면 행 전체가 dimmed 처리됨 (opacity 0.4, 편집 가능은 유지)
 * - emphasis 토글은 항상 활성 — 비활성 토큰도 강조값 유지하도록 함
 * - preview는 slot 패턴: 컬러 스와치, 타이포 샘플, 그라디언트 박스 등 임의 노드 주입
 *
 * Props:
 * @param {node} preview - 좌측 48x48 프리뷰 영역 (ReactNode) [Required]
 * @param {string} label - 토큰 이름/역할 [Required]
 * @param {string} value - 토큰 값 (HEX, px, 폰트명 등 문자열 표현) [Optional]
 * @param {boolean} isEnabled - 토큰 활성화 상태 [Optional, 기본값: true]
 * @param {number} emphasis - 강조도 0|1|2 [Optional, 기본값: 1]
 * @param {function} onToggleEnabled - 활성화 토글 (nextEnabled) => void [Optional]
 * @param {function} onChangeEmphasis - 강조도 변경 (nextEmphasis) => void [Optional]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <TokenListItem
 *   preview={ <Box sx={{ width: 48, height: 48, bgcolor: '#4F46E5', borderRadius: 1.5 }} /> }
 *   label="Accent Violet"
 *   value="#4F46E5"
 *   isEnabled={ token.isEnabled }
 *   emphasis={ token.emphasis }
 *   onToggleEnabled={ (next) => updateToken(id, { isEnabled: next }) }
 *   onChangeEmphasis={ (next) => updateToken(id, { emphasis: next }) }
 * />
 */
export function TokenListItem({
  preview,
  label,
  value,
  isEnabled = true,
  emphasis = 1,
  onToggleEnabled,
  onChangeEmphasis,
  sx,
}) {
  const handleEmphasisChange = (_event, next) => {
    if (next === null || next === undefined) return;
    onChangeEmphasis?.(next);
  };

  return (
    <Box
      sx={ {
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2,
        py: 1.5,
        borderRadius: 3,
        transition: 'background-color 0.15s, opacity 0.15s',
        '&:hover': {
          backgroundColor: 'action.hover',
        },
        ...sx,
      } }
    >
      {/* 1. Preview (48x48) */}
      <Box
        sx={ {
          flex: '0 0 auto',
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isEnabled ? 1 : 0.4,
          transition: 'opacity 0.15s',
        } }
      >
        { preview }
      </Box>

      {/* 2. Label + Value */}
      <Box
        sx={ {
          flex: '1 1 auto',
          minWidth: 0,
          opacity: isEnabled ? 1 : 0.4,
          transition: 'opacity 0.15s',
        } }
      >
        <Typography
          variant="body2"
          sx={ {
            fontWeight: 500,
            color: 'text.primary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          } }
        >
          { label }
        </Typography>
        { value && (
          <Typography
            variant="caption"
            sx={ {
              display: 'block',
              fontFamily: 'monospace',
              color: 'text.secondary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            } }
          >
            { value }
          </Typography>
        ) }
      </Box>

      {/* 3. Emphasis toggle (항상 활성) */}
      <ToggleButtonGroup
        value={ emphasis }
        exclusive
        size="small"
        onChange={ handleEmphasisChange }
        aria-label="강조도"
        sx={ {
          flex: '0 0 auto',
          '& .MuiToggleButton-root': {
            px: 1.25,
            py: 0.25,
            fontSize: '0.7rem',
            fontWeight: 500,
            textTransform: 'none',
            border: '1px solid',
            borderColor: 'divider',
            color: 'text.secondary',
            '&.Mui-selected': {
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': { backgroundColor: 'primary.light' },
            },
          },
        } }
      >
        { EMPHASIS_OPTIONS.map((opt) => (
          <Tooltip key={ opt.value } title={ `강조 ${opt.hint}` } arrow>
            <ToggleButton value={ opt.value } aria-label={ opt.label }>
              { opt.label }
            </ToggleButton>
          </Tooltip>
        )) }
      </ToggleButtonGroup>

      {/* 4. On/Off switch */}
      <Switch
        checked={ isEnabled }
        onChange={ (e) => onToggleEnabled?.(e.target.checked) }
        size="small"
        color="primary"
        sx={ { flex: '0 0 auto' } }
        aria-label="토큰 활성화"
      />
    </Box>
  );
}
