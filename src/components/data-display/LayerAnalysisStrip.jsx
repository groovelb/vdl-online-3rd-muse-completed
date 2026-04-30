import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

const DEFAULT_LAYER_LABELS = ['Color', 'Typography', 'Layout', 'Gradient', 'Visual Direction'];

/**
 * LayerAnalysisStrip 컴포넌트
 *
 * 레퍼런스 / 미디어 카드 하단에 부착되는 가벼운 진행 strip. AnalysisProgress 의 풀스크린
 * 변형이 부담스러운 자리(카드 footer / inline 데모) 에서 사용. overlay 가 아닌 일반 stack
 * 흐름이라 카드 위에 떠있지 않고 자연스럽게 따라 붙는다.
 *
 * 레이아웃: ANALYZING n/N + 굵기 2px LinearProgress + per-layer 행 (status icon + 라벨)
 *
 * Props:
 * @param {('pending'|'running'|'done')[]} layerStatuses - 레이어별 상태 배열 [Required]
 * @param {string[]} layerLabels - 레이어 라벨 배열 (layerStatuses 와 길이 일치) [Optional, 기본값: ['Color', 'Typography', 'Layout', 'Gradient', 'Visual Direction']]
 * @param {string} headerLabel - 상단 monospace eyebrow 텍스트 [Optional, 기본값: 'ANALYZING']
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <LayerAnalysisStrip
 *   layerStatuses={ ['done', 'done', 'running', 'pending', 'pending'] }
 * />
 */
export function LayerAnalysisStrip({
  layerStatuses,
  layerLabels = DEFAULT_LAYER_LABELS,
  headerLabel = 'ANALYZING',
  sx,
}) {
  const total = layerStatuses?.length || 0;
  const doneCount = (layerStatuses || []).filter((s) => s === 'done').length;
  const overall = total === 0 ? 0 : (doneCount / total) * 100;

  return (
    <Box
      sx={ {
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        ...sx,
      } }
    >
      <Typography
        variant="caption"
        sx={ {
          display: 'block',
          fontFamily: 'monospace',
          fontSize: '0.62rem',
          letterSpacing: '0.18em',
          color: 'text.secondary',
        } }
      >
        { headerLabel } · { doneCount }/{ total }
      </Typography>
      <LinearProgress
        variant="determinate"
        value={ overall }
        sx={ {
          height: 2,
          borderRadius: 0,
          bgcolor: 'action.hover',
        } }
      />
      <Box sx={ { display: 'flex', flexDirection: 'column', gap: 1 } }>
        { (layerStatuses || []).map((status, i) => {
          const Icon = status === 'done' ? CheckCircleIcon : RadioButtonUncheckedIcon;
          const color = status === 'done'
            ? 'success.main'
            : status === 'running'
              ? 'text.primary'
              : 'text.disabled';
          return (
            <Box
              key={ i }
              sx={ {
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: '0.78rem',
                color,
                fontWeight: status === 'running' ? 600 : 400,
              } }
            >
              { status === 'running'
                ? <CircularProgress size={ 12 } thickness={ 5 } />
                : <Icon sx={ { fontSize: 14 } } /> }
              <Box component="span">
                { layerLabels[i] || `Layer ${ i + 1 }` }
              </Box>
            </Box>
          );
        }) }
      </Box>
    </Box>
  );
}
