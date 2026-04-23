import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

const STATUS_COLOR = {
  pending: 'text.disabled',
  running: 'info.main',
  done: 'success.main',
  error: 'error.main',
};

const STATUS_LABEL = {
  pending: '대기',
  running: '분석 중',
  done: '완료',
  error: '오류',
};

/** 상태별 아이콘 */
const StatusIcon = ({ status }) => {
  if (status === 'running') return <CircularProgress size={ 16 } thickness={ 5 } />;
  if (status === 'done') return <CheckCircleIcon fontSize="small" sx={ { color: STATUS_COLOR.done } } />;
  if (status === 'error') return <ErrorOutlineIcon fontSize="small" sx={ { color: STATUS_COLOR.error } } />;
  return <RadioButtonUncheckedIcon fontSize="small" sx={ { color: STATUS_COLOR.pending } } />;
};

/**
 * AnalysisProgress 컴포넌트
 *
 * MUSE 프로젝트 생성 시 자동 토큰 분석 진행 상태를 보여주는 카드.
 * 레이어(color/typography/layout/gradient/visualDirection)별로 단계 상태를 표시하고,
 * 전체 진행률을 상단에 Linear bar로 집계한다.
 *
 * Props:
 * @param {array} layers - [{ key, label, status: 'pending'|'running'|'done'|'error', progress?: 0-1, message? }] [Required]
 * @param {function} onCancel - 취소 버튼 클릭 시 [Optional]
 * @param {function} onRetry - 오류 상태에서 재시도 [Optional]
 * @param {string} title - 카드 제목 [Optional, 기본값: '레퍼런스 분석 중']
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <AnalysisProgress
 *   layers={ [
 *     { key: 'color', label: '컬러', status: 'done' },
 *     { key: 'typography', label: '타이포', status: 'running', progress: 0.4 },
 *     { key: 'layout', label: '레이아웃', status: 'pending' },
 *   ] }
 *   onCancel={ () => abort() }
 * />
 */
export function AnalysisProgress({
  layers = [],
  onCancel,
  onRetry,
  title = '레퍼런스 분석 중',
  sx,
}) {
  const total = layers.length;
  const doneCount = layers.filter((l) => l.status === 'done').length;
  const runningLayer = layers.find((l) => l.status === 'running');
  const hasError = layers.some((l) => l.status === 'error');
  const isAllDone = total > 0 && doneCount === total;

  // 전체 진행률 — done 수 + 현재 running의 progress를 가중 평균
  const overallProgress = total === 0
    ? 0
    : Math.min(
      100,
      ((doneCount + (runningLayer?.progress ?? 0)) / total) * 100,
    );

  const subtitle = hasError
    ? '일부 레이어에서 오류가 발생했습니다'
    : isAllDone
      ? '분석이 완료되었습니다'
      : runningLayer?.message || '레이어별로 토큰을 추출하고 있습니다';

  return (
    <Box
      sx={ {
        width: '100%',
        maxWidth: 520,
        bgcolor: 'background.paper',
        borderRadius: 3,
        p: 4,
        ...sx,
      } }
    >
      {/* Header */}
      <Box sx={ { mb: 3 } }>
        <Typography variant="h6" sx={ { fontWeight: 600, mb: 0.5 } }>
          { title }
        </Typography>
        <Typography variant="body2" color="text.secondary">
          { subtitle }
        </Typography>
      </Box>

      {/* Overall progress */}
      <Box sx={ { mb: 3 } }>
        <Box sx={ { display: 'flex', justifyContent: 'space-between', mb: 1 } }>
          <Typography variant="caption" color="text.secondary">
            전체 진행률
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={ { fontFamily: 'monospace' } }>
            { doneCount } / { total } · { Math.round(overallProgress) }%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={ overallProgress }
          color={ hasError ? 'error' : isAllDone ? 'success' : 'primary' }
          sx={ { height: 6, borderRadius: 999 } }
        />
      </Box>

      {/* Layer list */}
      <Box sx={ { display: 'flex', flexDirection: 'column', gap: 1.5 } }>
        { layers.map((layer) => (
          <Box
            key={ layer.key }
            sx={ {
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 1.5,
              py: 1,
              borderRadius: 2,
              bgcolor: layer.status === 'running' ? 'action.hover' : 'transparent',
              transition: 'background-color 0.2s',
            } }
          >
            <StatusIcon status={ layer.status } />
            <Box sx={ { flex: 1, minWidth: 0 } }>
              <Typography
                variant="body2"
                sx={ {
                  fontWeight: 500,
                  color: layer.status === 'pending' ? 'text.disabled' : 'text.primary',
                } }
              >
                { layer.label }
              </Typography>
              { layer.message && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={ { display: 'block' } }
                >
                  { layer.message }
                </Typography>
              ) }
            </Box>
            <Typography
              variant="caption"
              sx={ {
                fontFamily: 'monospace',
                color: STATUS_COLOR[layer.status],
                minWidth: 50,
                textAlign: 'right',
              } }
            >
              { STATUS_LABEL[layer.status] }
            </Typography>
          </Box>
        )) }
      </Box>

      {/* Actions */}
      { (onCancel || onRetry) && (
        <Box sx={ { display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 } }>
          { hasError && onRetry && (
            <Button variant="contained" color="primary" onClick={ onRetry }>
              다시 시도
            </Button>
          ) }
          { !isAllDone && onCancel && (
            <Button variant="text" color="inherit" onClick={ onCancel }>
              취소
            </Button>
          ) }
        </Box>
      ) }
    </Box>
  );
}
