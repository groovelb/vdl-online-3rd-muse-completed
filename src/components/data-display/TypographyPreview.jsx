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
 * 타이포 토큰을 문자열 summary로 포맷 (value 슬롯용)
 * @param {object} token - { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing }
 * @returns {string}
 */
const formatTypoValue = (token) => {
  const parts = [];
  if (token.fontFamily) parts.push(token.fontFamily);
  if (token.fontWeight) parts.push(String(token.fontWeight));
  if (token.fontSize) {
    const ls = token.letterSpacing ? ` ls ${token.letterSpacing}` : '';
    const lh = token.lineHeight ? `/${token.lineHeight}` : '';
    parts.push(`${token.fontSize}${lh}${ls}`);
  }
  return parts.join(' · ');
};

/**
 * TypographyPreview 컴포넌트
 *
 * 타이포그래피 토큰 목록을 TokenListItem으로 렌더링.
 * Preview 슬롯에 실제 폰트 스타일로 샘플 문자를 그려 **시각 비교 가능**.
 *
 * Props:
 * @param {array} tokens - [{ id, label, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, sampleText?, isEnabled, emphasis }] [Required]
 * @param {function} onChange - (id, patch) => void [Optional]
 * @param {string} defaultSample - 모든 토큰 공통 샘플 텍스트 [Optional, 기본값: 'Aa']
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <TypographyPreview
 *   tokens={ [{ id: 'h1', label: 'Display', fontFamily: 'Outfit', fontWeight: 700, fontSize: '56px', isEnabled: true, emphasis: 2 }] }
 *   onChange={ updateToken }
 * />
 */
export function TypographyPreview({ tokens, onChange, defaultSample = 'Aa', references = [], sx }) {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <Box sx={ { width: '100%', bgcolor: 'background.paper', borderRadius: 3, py: 1, ...sx } }>
      { tokens.map((token, i) => {
        const hasRationale = !!token.decisionRationale;
        const isExpanded = expandedId === token.id;
        return (
          <Box key={ token.id }>
            <TokenListItem
              preview={
                <Typography
                  sx={ {
                    fontFamily: token.fontFamily,
                    fontWeight: token.fontWeight,
                    fontSize: 28,
                    lineHeight: 1,
                    letterSpacing: token.letterSpacing,
                    color: 'text.primary',
                  } }
                >
                  { token.sampleText || defaultSample }
                </Typography>
              }
              label={ token.label }
              value={ formatTypoValue(token) }
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
                >
                  <ExpandMoreIcon fontSize="small" />
                </IconButton>
              ) : null }
            />
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
