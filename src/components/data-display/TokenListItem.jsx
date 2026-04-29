import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';

/**
 * TokenListItem 컴포넌트
 *
 * MUSE 프로젝트 상세 화면에서 각 레이어(컬러/타이포/레이아웃/그라디언트/키비주얼)의
 * 토큰 한 건을 표현하는 공통 행 컴포넌트.
 *
 * 구성: [preview 48x48] [label + value] [on/off switch]
 *
 * - `isEnabled=false`면 행 전체가 dimmed 처리됨 (opacity 0.4, 편집 가능은 유지)
 * - preview는 slot 패턴: 컬러 스와치, 타이포 샘플, 그라디언트 박스 등 임의 노드 주입
 *
 * Props:
 * @param {node} preview - 좌측 48x48 프리뷰 영역 (ReactNode) [Required]
 * @param {string} label - 토큰 이름/역할 [Required]
 * @param {string} value - 토큰 값 (HEX, px, 폰트명 등 문자열 표현) [Optional]
 * @param {boolean} isEnabled - 토큰 활성화 상태 [Optional, 기본값: true]
 * @param {function} onToggleEnabled - 활성화 토글 (nextEnabled) => void [Optional]
 * @param {node} trailing - 우측 Switch 앞에 렌더할 보조 액션 (ReactNode) [Optional]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <TokenListItem
 *   preview={ <Box sx={{ width: 48, height: 48, bgcolor: '#4F46E5', borderRadius: 1.5 }} /> }
 *   label="Accent Violet"
 *   value="#4F46E5"
 *   isEnabled={ token.isEnabled }
 *   onToggleEnabled={ (next) => updateToken(id, { isEnabled: next }) }
 * />
 */
export function TokenListItem({
  preview,
  label,
  value,
  isEnabled = true,
  onToggleEnabled,
  trailing,
  sx,
}) {
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

      {/* 3. Trailing slot (예: 결정 근거 토글) */}
      { trailing && (
        <Box sx={ { flex: '0 0 auto', display: 'flex', alignItems: 'center' } }>
          { trailing }
        </Box>
      ) }

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
