import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { TokenListItem } from './TokenListItem.jsx';
import { TokenDecisionTracePanel } from './TokenDecisionTracePanel.jsx';

/**
 * ColorSwatchList 컴포넌트
 *
 * 컬러 레이어의 토큰 목록을 TokenListItem으로 렌더링한다.
 * 선택적으로 `groupBy`를 지정하면 그룹 헤더와 함께 섹션을 나눈다.
 *
 * Props:
 * @param {array} tokens - [{ id, label, hex, role?, group?, isEnabled, decisionRationale? }] [Required]
 * @param {function} onChange - (id, patch) => void [Optional]
 * @param {boolean} isGrouped - group 필드 기준으로 섹션 분리 [Optional, 기본값: false]
 * @param {array} references - TP6 출처 썸네일용 reference 풀 [Optional]
 * @param {string} defaultExpandedId - 마운트 시점에 자동으로 펼쳐진 토큰 id [Optional]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <ColorSwatchList
 *   tokens={ [{ id: 'p', label: 'Primary', hex: '#14132B', isEnabled: true }] }
 *   onChange={ (id, patch) => updateToken(id, patch) }
 * />
 */
export function ColorSwatchList({ tokens, onChange, isGrouped = false, references = [], defaultExpandedId = null, sx }) {
  const [expandedId, setExpandedId] = useState(defaultExpandedId);

  const renderItem = (token, isLastInGroup) => {
    const hasRationale = !!token.decisionRationale || (token.sourceReferenceIds || []).length > 0;
    const isExpanded = expandedId === token.id;
    return (
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
          onToggleEnabled={ (next) => onChange?.(token.id, { isEnabled: next }) }
          trailing={ hasRationale ? (
            <IconButton
              size="small"
              aria-label={ isExpanded ? '결정 근거 닫기' : '결정 근거 보기' }
              onClick={ () => setExpandedId(isExpanded ? null : token.id) }
              sx={ {
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                transition: 'transform 150ms',
              } }
              title={ `from ${(token.decisionRationale?.whichReferences || token.sourceReferenceIds || []).length} refs` }
            >
              <ExpandMoreIcon fontSize="small" />
            </IconButton>
          ) : null }
        />
        <Collapse in={ isExpanded }>
          <TokenDecisionTracePanel
            decisionRationale={ token.decisionRationale || (token.sourceReferenceIds ? {
              whichReferences: token.sourceReferenceIds,
              whichLayers: ['color'],
              whyChosen: '(과거 데이터 — decisionRationale 없음, 출처만 표시)',
            } : null) }
            references={ references }
            sx={ { mx: 2, mb: 1 } }
          />
        </Collapse>
        { !isLastInGroup && <Divider sx={ { mx: 2 } } /> }
      </Box>
    );
  };

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
