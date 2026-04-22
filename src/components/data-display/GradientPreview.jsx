import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { TokenListItem } from './TokenListItem.jsx';

/**
 * GradientPreview 컴포넌트
 *
 * 그라디언트 토큰 목록을 TokenListItem으로 렌더링.
 * Preview 슬롯에 실제 gradient CSS를 적용한 스와치를 표시한다.
 *
 * Props:
 * @param {array} tokens - [{ id, label, gradient, stops?, isEnabled, emphasis }] [Required]
 *   - `gradient`: CSS gradient 문자열 (e.g. 'linear-gradient(135deg, #FEE2F5, #FEF9C3)')
 *   - `stops`: (선택) [{ offset, color }] 배열 — value 슬롯에 요약 표시
 * @param {function} onChange - (id, patch) => void [Optional]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <GradientPreview
 *   tokens={ [{
 *     id: 'sunrise',
 *     label: 'Sunrise',
 *     gradient: 'linear-gradient(135deg, #FEE2F5, #FEF9C3)',
 *     isEnabled: true,
 *     emphasis: 1,
 *   }] }
 *   onChange={ updateToken }
 * />
 */
export function GradientPreview({ tokens, onChange, sx }) {
  const formatValue = (token) => {
    if (token.stops?.length) {
      return token.stops.map((s) => s.color).join(' → ');
    }
    // gradient 문자열이 길면 앞부분만 노출
    return token.gradient?.length > 42
      ? `${token.gradient.slice(0, 42)}…`
      : token.gradient;
  };

  return (
    <Box sx={ { width: '100%', bgcolor: 'background.paper', borderRadius: 3, py: 1, ...sx } }>
      { tokens.map((token, i) => (
        <Box key={ token.id }>
          <TokenListItem
            preview={
              <Box
                sx={ {
                  width: 48,
                  height: 48,
                  borderRadius: 1.5,
                  background: token.gradient,
                  border: '1px solid',
                  borderColor: 'divider',
                } }
              />
            }
            label={ token.label }
            value={ formatValue(token) }
            isEnabled={ token.isEnabled }
            emphasis={ token.emphasis }
            onToggleEnabled={ (next) => onChange?.(token.id, { isEnabled: next }) }
            onChangeEmphasis={ (next) => onChange?.(token.id, { emphasis: next }) }
          />
          { i < tokens.length - 1 && <Divider sx={ { mx: 2 } } /> }
        </Box>
      )) }
    </Box>
  );
}
