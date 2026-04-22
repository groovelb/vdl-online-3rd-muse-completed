import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { TokenListItem } from './TokenListItem.jsx';

/**
 * ColorSwatchList 컴포넌트
 *
 * 컬러 레이어의 토큰 목록을 TokenListItem으로 렌더링한다.
 * 선택적으로 `groupBy`를 지정하면 그룹 헤더와 함께 섹션을 나눈다.
 *
 * Props:
 * @param {array} tokens - [{ id, label, hex, role?, group?, isEnabled, emphasis }] [Required]
 * @param {function} onChange - (id, patch) => void [Optional]
 * @param {boolean} isGrouped - group 필드 기준으로 섹션 분리 [Optional, 기본값: false]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <ColorSwatchList
 *   tokens={ [{ id: 'p', label: 'Primary', hex: '#14132B', isEnabled: true, emphasis: 2 }] }
 *   onChange={ (id, patch) => updateToken(id, patch) }
 * />
 */
export function ColorSwatchList({ tokens, onChange, isGrouped = false, sx }) {
  const renderItem = (token, isLastInGroup) => (
    <Box key={ token.id }>
      <TokenListItem
        preview={
          <Box
            sx={ {
              width: 48,
              height: 48,
              borderRadius: 1.5,
              backgroundColor: token.hex,
              border: '1px solid',
              borderColor: 'divider',
            } }
          />
        }
        label={ token.label }
        value={ token.hex }
        isEnabled={ token.isEnabled }
        emphasis={ token.emphasis }
        onToggleEnabled={ (next) => onChange?.(token.id, { isEnabled: next }) }
        onChangeEmphasis={ (next) => onChange?.(token.id, { emphasis: next }) }
      />
      { !isLastInGroup && <Divider sx={ { mx: 2 } } /> }
    </Box>
  );

  if (!isGrouped) {
    return (
      <Box sx={ { width: '100%', bgcolor: 'background.paper', borderRadius: 3, py: 1, ...sx } }>
        { tokens.map((token, i) => renderItem(token, i === tokens.length - 1)) }
      </Box>
    );
  }

  const groups = tokens.reduce((acc, token) => {
    const key = token.group || '기타';
    (acc[key] = acc[key] || []).push(token);
    return acc;
  }, {});

  return (
    <Box sx={ { width: '100%', ...sx } }>
      { Object.entries(groups).map(([groupName, groupTokens]) => (
        <Box key={ groupName } sx={ { mb: 3 } }>
          <Typography
            variant="caption"
            sx={ {
              display: 'block',
              px: 2,
              mb: 1,
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            } }
          >
            { groupName }
          </Typography>
          <Box sx={ { bgcolor: 'background.paper', borderRadius: 3, py: 1 } }>
            { groupTokens.map((token, i) => renderItem(token, i === groupTokens.length - 1)) }
          </Box>
        </Box>
      )) }
    </Box>
  );
}
