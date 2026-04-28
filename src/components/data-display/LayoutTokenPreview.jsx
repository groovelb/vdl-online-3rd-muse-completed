import { useState } from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { TokenListItem } from './TokenListItem.jsx';
import { TokenDecisionTracePanel } from './TokenDecisionTracePanel.jsx';

/** 그리드 mini-diagram — 컬럼 수 시각화 */
const GridDiagram = ({ columns = 4 }) => (
  <Box
    sx={ {
      width: 48,
      height: 48,
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: '2px',
      p: '3px',
      borderRadius: 1.5,
      border: '1px solid',
      borderColor: 'divider',
    } }
  >
    { Array.from({ length: columns }, (_, i) => (
      <Box key={ i } sx={ { bgcolor: 'action.selected', borderRadius: 0.5 } } />
    )) }
  </Box>
);

/** 스페이싱 mini-diagram — 두 블록 사이 간격 시각화 */
const SpacingDiagram = ({ px = 16 }) => {
  // 4 ~ 64px 범위 안에 매핑
  const visible = Math.max(2, Math.min(px / 2, 24));
  return (
    <Box
      sx={ {
        width: 48,
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: `${visible}px`,
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: 'divider',
      } }
    >
      <Box sx={ { width: 8, height: 24, bgcolor: 'primary.main', borderRadius: 0.5 } } />
      <Box sx={ { width: 8, height: 24, bgcolor: 'primary.main', borderRadius: 0.5 } } />
    </Box>
  );
};

/** 컨테이너 mini-diagram — 너비 비율 시각화 */
const ContainerDiagram = ({ ratio = 0.7 }) => (
  <Box
    sx={ {
      width: 48,
      height: 48,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 1.5,
      border: '1px solid',
      borderColor: 'divider',
    } }
  >
    <Box
      sx={ {
        width: `${ratio * 100}%`,
        height: 18,
        bgcolor: 'action.selected',
        borderRadius: 0.5,
      } }
    />
  </Box>
);

const DIAGRAM_BY_KIND = {
  grid: GridDiagram,
  spacing: SpacingDiagram,
  container: ContainerDiagram,
};

const formatLayoutValue = (token) => {
  switch (token.kind) {
    case 'grid':
      return `${token.columns} columns · gap ${token.gap ?? '-'}px`;
    case 'spacing':
      return `${token.px}px`;
    case 'container':
      return `${Math.round((token.ratio ?? 0) * 100)}% · max ${token.maxWidth ?? '-'}`;
    default:
      return token.value || '';
  }
};

/**
 * LayoutTokenPreview 컴포넌트
 *
 * 레이아웃 토큰(grid/spacing/container)의 mini-diagram 프리뷰.
 *
 * Props:
 * @param {array} tokens - [{ id, label, kind: 'grid'|'spacing'|'container', columns?, gap?, px?, ratio?, maxWidth?, isEnabled, emphasis }] [Required]
 * @param {function} onChange - (id, patch) => void [Optional]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <LayoutTokenPreview
 *   tokens={ [
 *     { id: 'grid-12', label: '12 Column Grid', kind: 'grid', columns: 12, gap: 24, isEnabled: true, emphasis: 2 },
 *     { id: 'sp-section', label: 'Section Gap', kind: 'spacing', px: 96, isEnabled: true, emphasis: 1 },
 *   ] }
 *   onChange={ updateToken }
 * />
 */
export function LayoutTokenPreview({ tokens, onChange, references = [], sx }) {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <Box sx={ { width: '100%', bgcolor: 'background.paper', borderRadius: 3, py: 1, ...sx } }>
      { tokens.map((token, i) => {
        const Diagram = DIAGRAM_BY_KIND[token.kind] || (() => null);
        const hasRationale = !!token.decisionRationale;
        const isExpanded = expandedId === token.id;
        return (
          <Box key={ token.id }>
            <Box sx={ { position: 'relative' } }>
              <TokenListItem
                preview={ <Diagram { ...token } /> }
                label={ token.label }
                value={ formatLayoutValue(token) }
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
