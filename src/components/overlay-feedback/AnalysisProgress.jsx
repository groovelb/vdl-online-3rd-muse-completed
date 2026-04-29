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

/** 레이어별 "지금 무엇을 하고 있는지" 자세한 설명 */
const LAYER_DETAIL = {
  color: {
    running: '레퍼런스 팔레트를 클러스터링하고 primary / secondary / accent 역할을 의도에 맞게 배정합니다',
    done: '프로젝트 팔레트 + 역할 배정 완료',
    pending: '레퍼런스에서 추출된 hex 값을 의도 기반으로 재구성할 예정',
    error: '팔레트 합성 실패',
  },
  typography: {
    running: '레퍼런스의 타이포 관찰값을 display / heading / body / caption 위계로 통합합니다',
    done: '타이포 위계 + variant 매핑 완료',
    pending: '폰트 패밀리 · 크기 · 행간을 프로젝트 스케일로 정렬할 예정',
    error: '타이포 합성 실패',
  },
  layout: {
    running: '격자 · 여백 수치를 프로젝트 유형 (landing / dashboard / ...) 컨텍스트로 조율합니다',
    done: '레이아웃 토큰 (grid / spacing / container) 구성 완료',
    pending: 'columns · gap · padding 을 의도에 맞게 통합할 예정',
    error: '레이아웃 합성 실패',
  },
  gradient: {
    running: '레퍼런스 그라디언트를 선별하고 팔레트와의 정합성을 확인합니다',
    done: '그라디언트 토큰 선정 완료',
    pending: '팔레트로부터 정합성 있는 그라디언트를 구성할 예정',
    error: '그라디언트 합성 실패',
  },
  visualDirection: {
    running: '의도와 레퍼런스 태그 집계를 바탕으로 비주얼 디렉션 문서를 작성합니다',
    done: '비주얼 디렉션 Markdown 작성 완료',
    pending: '톤 · 구현 가이드 · 피해야 할 요소를 서술할 예정',
    error: '비주얼 디렉션 작성 실패',
  },
  spacing: {
    running: 'spacing scale (xs/sm/md/lg/xl) 을 의도와 레퍼런스 리듬에서 도출합니다',
    done: 'spacing scale 정의 완료',
    pending: 'spacing 단위 (px/rem) 을 일관 스케일로 정렬할 예정',
    error: 'spacing scale 합성 실패',
  },
  rounded: {
    running: 'rounded scale (sm/md/lg) 를 브랜드 톤 (소프트 ↔ 기하학) 에 맞춰 결정합니다',
    done: 'rounded scale 정의 완료',
    pending: 'border radius 스케일을 결정할 예정',
    error: 'rounded scale 합성 실패',
  },
  components: {
    running: 'button-primary / card / input 등 UI 컴포넌트를 토큰 레퍼런스 ({path}) 로 결합합니다',
    done: '컴포넌트 결합 완료 (DESIGN.md 호환)',
    pending: '토큰 레퍼런스 문법으로 컴포넌트를 정의할 예정',
    error: '컴포넌트 결합 실패 (token-ref 위반)',
  },
};

/** 상태별 아이콘 — 크게 */
const StatusIcon = ({ status, size = 28 }) => {
  if (status === 'running') return <CircularProgress size={ size - 6 } thickness={ 4.5 } />;
  if (status === 'done') return <CheckCircleIcon sx={ { fontSize: size, color: STATUS_COLOR.done } } />;
  if (status === 'error') return <ErrorOutlineIcon sx={ { fontSize: size, color: STATUS_COLOR.error } } />;
  return <RadioButtonUncheckedIcon sx={ { fontSize: size, color: STATUS_COLOR.pending } } />;
};

/**
 * AnalysisProgress — 크고 자세한 분석 진행 UI
 *
 * Props:
 * @param {array} layers - [{ key, label, status, progress?, message? }] [Required]
 * @param {function} onCancel [Optional]
 * @param {function} onRetry [Optional]
 * @param {string} title [Optional]
 * @param {string} intent [Optional] - 프로젝트 의도 문장
 * @param {object} sx [Optional]
 */
export function AnalysisProgress({
  layers = [],
  onCancel,
  onRetry,
  title = '레퍼런스 분석 중',
  intent,
  sx,
}) {
  const total = layers.length;
  const doneCount = layers.filter((l) => l.status === 'done').length;
  const runningLayer = layers.find((l) => l.status === 'running');
  const hasError = layers.some((l) => l.status === 'error');
  const isAllDone = total > 0 && doneCount === total;

  const overallProgress = total === 0
    ? 0
    : Math.min(100, ((doneCount + (runningLayer?.progress ?? 0)) / total) * 100);

  return (
    <Box
      sx={ {
        width: '100%',
        maxWidth: 760,
        py: { xs: 5, md: 8 },
        px: { xs: 3, md: 6 },
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        ...sx,
      } }
    >
      {/* Header — 큼직, 여유 */}
      <Box sx={ { textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 2 } }>
        <Typography
          variant="overline"
          sx={ { fontSize: '0.72rem', letterSpacing: '0.2em', color: 'text.secondary' } }
        >
          { hasError ? 'ERROR' : isAllDone ? 'COMPLETE' : 'ANALYZING' }
        </Typography>
        <Typography
          variant="h3"
          sx={ { fontWeight: 600, letterSpacing: '-0.02em' } }
        >
          { title }
        </Typography>
        { intent && (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={ {
              maxWidth: 560,
              mx: 'auto',
              fontStyle: 'italic',
              fontSize: '1.02rem',
              lineHeight: 1.6,
            } }
          >
            &ldquo;{ intent }&rdquo;
          </Typography>
        ) }
      </Box>

      {/* Progress — 굵직한 막대 + 카운터 */}
      <Box sx={ { display: 'flex', flexDirection: 'column', gap: 1.5 } }>
        <Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' } }>
          <Typography variant="caption" sx={ { letterSpacing: '0.1em', color: 'text.secondary' } }>
            전체 진행
          </Typography>
          <Typography
            variant="h6"
            sx={ { fontFamily: 'monospace', fontWeight: 500, color: 'text.primary' } }
          >
            { doneCount }
            <Box component="span" sx={ { color: 'text.disabled', mx: 0.5 } }>/</Box>
            { total }
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={ overallProgress }
          color={ hasError ? 'error' : isAllDone ? 'success' : 'primary' }
          sx={ {
            height: 4,
            borderRadius: 0,
            bgcolor: 'rgba(20,19,43,0.06)',
          } }
        />
      </Box>

      {/* 레이어 카드 5개 — 각각 크게, 설명 풍부하게 */}
      <Box sx={ { display: 'flex', flexDirection: 'column', gap: 2 } }>
        { layers.map((layer) => {
          const detail = LAYER_DETAIL[layer.key]?.[layer.status] || layer.message;
          const isActive = layer.status === 'running';
          const isDone = layer.status === 'done';
          const isError = layer.status === 'error';
          return (
            <Box
              key={ layer.key }
              sx={ {
                display: 'flex',
                alignItems: 'flex-start',
                gap: 3,
                p: { xs: 2.5, md: 3 },
                borderRadius: 3,
                border: '1px solid',
                borderColor: isActive
                  ? 'primary.main'
                  : isError
                    ? 'error.light'
                    : 'divider',
                bgcolor: isActive ? 'rgba(79,70,229,0.04)' : 'transparent',
                transition: 'border-color 300ms, background-color 300ms',
              } }
            >
              {/* 아이콘 */}
              <Box sx={ {
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              } }>
                <StatusIcon status={ layer.status } size={ 28 } />
              </Box>

              {/* 본문 */}
              <Box sx={ { flex: 1, minWidth: 0, pt: 0.5 } }>
                <Box sx={ {
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 2,
                  mb: 0.5,
                } }>
                  <Typography
                    variant="h6"
                    sx={ {
                      fontWeight: 500,
                      fontSize: '1.08rem',
                      color: layer.status === 'pending' ? 'text.disabled' : 'text.primary',
                    } }
                  >
                    { layer.label }
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={ {
                      fontFamily: 'monospace',
                      fontSize: '0.72rem',
                      letterSpacing: '0.08em',
                      color: STATUS_COLOR[layer.status],
                      textTransform: 'uppercase',
                    } }
                  >
                    { STATUS_LABEL[layer.status] }
                  </Typography>
                </Box>
                { detail && (
                  <Typography
                    variant="body2"
                    color={ isDone || isActive ? 'text.secondary' : 'text.disabled' }
                    sx={ { lineHeight: 1.6, fontSize: '0.88rem' } }
                  >
                    { detail }
                  </Typography>
                ) }
              </Box>
            </Box>
          );
        }) }
      </Box>

      {/* Actions */}
      { (onCancel || onRetry) && (
        <Box sx={ { display: 'flex', justifyContent: 'center', gap: 2, mt: 2 } }>
          { hasError && onRetry && (
            <Button variant="contained" color="primary" size="large" onClick={ onRetry }>
              다시 시도
            </Button>
          ) }
          { !isAllDone && onCancel && (
            <Button variant="text" color="inherit" size="large" onClick={ onCancel }>
              취소
            </Button>
          ) }
        </Box>
      ) }
    </Box>
  );
}
