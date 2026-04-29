import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { RefImage } from '../media/RefImage.jsx';

const LAYER_LABEL = {
  color: '색',
  typography: '타이포',
  layout: '레이아웃',
  gradient: '그라디언트',
  visualDirection: '무드',
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

  return (
    <Box
      sx={ {
        mt: 1,
        p: 2,
        borderRadius: 1.5,
        bgcolor: 'grey.50',
        border: '1px dashed',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        ...sx,
      } }
    >
      { /* 출처 */ }
      <Box>
        <Typography variant="caption" sx={ { fontWeight: 600, color: 'text.secondary', mr: 1 } }>
          📍 출처
        </Typography>
        { refsWithThumb.length > 0 ? (
          <Box sx={ { display: 'inline-flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center', verticalAlign: 'middle' } }>
            { refsWithThumb.map((r) => (
              <Box key={ r.id } sx={ { display: 'inline-flex', alignItems: 'center', gap: 0.5 } }>
                { r.thumbnailUrl && (
                  <Box sx={ { width: 28, height: 28, borderRadius: 0.75, overflow: 'hidden', border: '1px solid', borderColor: 'divider', flexShrink: 0 } }>
                    <RefImage
                      src={ r.thumbnailUrl }
                      storagePath={ r.storagePath }
                      alt={ r.id }
                    />
                  </Box>
                ) }
                <Typography variant="caption" sx={ { fontFamily: 'monospace', fontSize: 11 } }>
                  { r.id }
                </Typography>
              </Box>
            )) }
          </Box>
        ) : (
          <Typography variant="caption" sx={ { fontFamily: 'monospace' } }>
            { whichReferences.join(', ') }
          </Typography>
        ) }
        { whichLayers.length > 0 && (
          <Box sx={ { display: 'inline-flex', gap: 0.5, ml: 1.5 } }>
            { whichLayers.map((l) => (
              <Chip
                key={ l }
                label={ LAYER_LABEL[l] || l }
                size="small"
                sx={ { height: 18, fontSize: '0.65rem' } }
              />
            )) }
          </Box>
        ) }
      </Box>

      { /* 의도 매칭 이유 */ }
      { whyChosen && (
        <Box>
          <Typography variant="caption" sx={ { fontWeight: 600, color: 'text.secondary', mr: 1 } }>
            💡 의도 매칭
          </Typography>
          <Typography variant="body2" sx={ { display: 'inline', fontSize: 13 } }>
            { whyChosen }
          </Typography>
        </Box>
      ) }

      { /* 사용자 노트 반영 (Step 3 userNotes 직접 영향 토큰만) */ }
      { appliedUserNotes && (
        <Box
          sx={ {
            p: 1,
            borderRadius: 1,
            bgcolor: 'primary.50',
            borderLeft: '3px solid',
            borderColor: 'primary.main',
          } }
        >
          <Typography variant="caption" sx={ { fontWeight: 600, color: 'primary.main', mr: 1 } }>
            ✋ 사용자 노트 반영
          </Typography>
          <Typography variant="body2" sx={ { display: 'inline', fontSize: 13, fontStyle: 'italic' } }>
            "{ appliedUserNotes }"
          </Typography>
        </Box>
      ) }

      { /* 탈락 후보 */ }
      { alternativesConsidered.length > 0 && (
        <Box>
          <Typography variant="caption" sx={ { fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 } }>
            🚫 다른 후보
          </Typography>
          <Box component="ul" sx={ { m: 0, pl: 2.5, display: 'flex', flexDirection: 'column', gap: 0.5 } }>
            { alternativesConsidered.map((alt, i) => (
              <Box component="li" key={ i }>
                <Typography variant="caption" sx={ { fontFamily: 'monospace', fontSize: 11 } }>
                  { alt.value }
                </Typography>
                <Typography variant="caption" sx={ { ml: 1, color: 'text.secondary', fontSize: 11 } }>
                  ({ alt.reason })
                </Typography>
              </Box>
            )) }
          </Box>
        </Box>
      ) }
    </Box>
  );
}
