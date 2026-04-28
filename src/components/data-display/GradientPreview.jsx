import { useState } from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { TokenListItem } from './TokenListItem.jsx';
import { TokenDecisionTracePanel } from './TokenDecisionTracePanel.jsx';

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
export function GradientPreview({ tokens, onChange, references = [], sx }) {
  const [expandedId, setExpandedId] = useState(null);

  const formatValue = (token) => {
    if (token.stops?.length) {
      return token.stops.map((s) => s.color).join(' → ');
    }
    return token.gradient?.length > 42
      ? `${token.gradient.slice(0, 42)}…`
      : token.gradient;
  };

  return (
    <Box sx={ { width: '100%', bgcolor: 'background.paper', borderRadius: 3, py: 1, ...sx } }>
      { tokens.map((token, i) => {
        const hasRationale = !!token.decisionRationale;
        const isExpanded = expandedId === token.id;
        return (
          <Box key={ token.id }>
            <Box sx={ { position: 'relative' } }>
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
              { hasRationale && (
                <IconButton
                  size="small"
                  aria-label={ isExpanded ? '결정 근거 닫기' : '결정 근거 보기' }
                  onClick={ () => setExpandedId(isExpanded ? null : token.id) }
                  sx={ {
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 150ms',
                  } }
                >
                  <ExpandMoreIcon fontSize="small" />
                </IconButton>
              ) }
            </Box>
            <Collapse in={ isExpanded }>
              <TokenDecisionTracePanel
                decisionRationale={ token.decisionRationale }
                references={ references }
                sx={ { mx: 2, mb: 1 } }
              />
            </Collapse>
            { i < tokens.length - 1 && <Divider sx={ { mx: 2 } } /> }
          </Box>
        );
      }) }
    </Box>
  );
}
