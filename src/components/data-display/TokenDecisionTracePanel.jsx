import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { RefImage } from '../media/RefImage.jsx';

const LAYER_LABEL = {
  color: '색',
  typography: '타이포',
  layout: '레이아웃',
  gradient: '그라디언트',
  visualDirection: '무드',
  spacing: '간격',
  rounded: '라운드',
  elevation: '그림자',
  components: '컴포넌트',
};

/**
 * TokenDecisionTracePanel 컴포넌트 (TP6)
 *
 * 토큰 카드 클릭 시 펼쳐지는 출처 + 이유 + 대안 패널.
 * "AI가 정한 모든 결정의 이유를 추적할 수 있어야 한다" (T1 super-theme)
 *
 * Props:
 * @param {{whichReferences, whichLayers?, whyChosen, alternativesConsidered?}} decisionRationale - T3 출력의 토큰 단위 결정 로그 [Required]
 * @param {Array} [references] - 풀 references 목록 (썸네일 inline 표시용) [Optional]
 * @param {object} sx
 *
 * Example usage:
 * <TokenDecisionTracePanel
 *   decisionRationale={ token.decisionRationale }
 *   references={ allReferences }
 * />
 */
export function TokenDecisionTracePanel({ decisionRationale, references = [], sx }) {
  if (!decisionRationale) return null;
  const {
    whichReferences = [],
    whichLayers = [],
    whyChosen,
    appliedUserNotes,
    alternativesConsidered = [],
  } = decisionRationale;

  const refsWithThumb = whichReferences
    .map((id) => references.find((r) => r.id === id))
    .filter(Boolean);

  const rows = [];

  if (refsWithThumb.length > 0 || whichReferences.length > 0) {
    rows.push({
      key: 'sources',
      label: '출처',
      content: (
        <Box sx={ { display: 'flex', flexDirection: 'column', gap: 0.75 } }>
          { refsWithThumb.length > 0 ? (
            refsWithThumb.map((r) => (
              <Box key={ r.id } sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
                { r.thumbnailUrl && (
                  <Box sx={ { width: 32, height: 32, borderRadius: 0.75, overflow: 'hidden', border: '1px solid', borderColor: 'divider', flexShrink: 0 } }>
                    <RefImage
                      src={ r.thumbnailUrl }
                      storagePath={ r.storagePath }
                      alt={ r.title || r.id }
                    />
                  </Box>
                ) }
                <Typography variant="body2" sx={ { fontSize: 13 } }>
                  { r.title || r.id }
                </Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body2" sx={ { fontSize: 13, color: 'text.secondary' } }>
              { whichReferences.join(', ') }
            </Typography>
          ) }
          { whichLayers.length > 0 && (
            <Box sx={ { display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.25 } }>
              { whichLayers.map((l) => (
                <Chip
                  key={ l }
                  label={ LAYER_LABEL[l] || l }
                  size="small"
                  variant="outlined"
                  sx={ { height: 20, fontSize: '0.7rem' } }
                />
              )) }
            </Box>
          ) }
        </Box>
      ),
    });
  }

  if (whyChosen) {
    rows.push({
      key: 'why',
      label: '의도 매칭',
      content: (
        <Typography variant="body2" sx={ { fontSize: 13, lineHeight: 1.6 } }>
          { whyChosen }
        </Typography>
      ),
    });
  }

  if (appliedUserNotes) {
    rows.push({
      key: 'notes',
      label: '사용자 노트',
      content: (
        <Typography
          variant="body2"
          sx={ {
            fontSize: 13,
            lineHeight: 1.6,
            fontStyle: 'italic',
            color: 'primary.main',
          } }
        >
          “{ appliedUserNotes }”
        </Typography>
      ),
    });
  }

  if (alternativesConsidered.length > 0) {
    rows.push({
      key: 'alts',
      label: '다른 후보',
      content: (
        <Box sx={ { display: 'flex', flexDirection: 'column', gap: 0.5 } }>
          { alternativesConsidered.map((alt, i) => (
            <Box key={ i } sx={ { display: 'flex', gap: 1.5, alignItems: 'baseline' } }>
              <Typography variant="caption" sx={ { fontFamily: 'monospace', fontSize: 12, minWidth: 80 } }>
                { alt.value }
              </Typography>
              <Typography variant="caption" sx={ { color: 'text.secondary', fontSize: 12, lineHeight: 1.6 } }>
                { alt.reason }
              </Typography>
            </Box>
          )) }
        </Box>
      ),
    });
  }

  if (rows.length === 0) return null;

  return (
    <Box sx={ { mt: 1, ...sx } }>
      <Table size="small" sx={ { '& td': { borderColor: 'divider' } } }>
        <TableBody>
          { rows.map((row, i) => (
            <TableRow key={ row.key }>
              <TableCell
                sx={ {
                  width: 110,
                  verticalAlign: 'top',
                  py: 1.25,
                  px: 0,
                  borderBottom: i < rows.length - 1 ? '1px solid' : 0,
                } }
              >
                <Typography variant="caption" sx={ { fontWeight: 600, color: 'text.secondary', letterSpacing: '0.02em' } }>
                  { row.label }
                </Typography>
              </TableCell>
              <TableCell
                sx={ {
                  py: 1.25,
                  px: 0,
                  borderBottom: i < rows.length - 1 ? '1px solid' : 0,
                } }
              >
                { row.content }
              </TableCell>
            </TableRow>
          )) }
        </TableBody>
      </Table>
    </Box>
  );
}
