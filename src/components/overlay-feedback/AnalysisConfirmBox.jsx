import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';

const MODE_META = {
  concept: { emoji: '🎨', label: '컨셉 잡기' },
  system: { emoji: '🏗️', label: '디자인 시스템' },
  handoff: { emoji: '🎯', label: '코드 직행' },
};

const LAYER_LABEL = {
  color: '색',
  typography: '타이포',
  layout: '레이아웃',
  gradient: '그라디언트',
  visualDirection: '무드',
};

/**
 * AnalysisConfirmBox 컴포넌트 (TP5)
 *
 * 프로젝트 생성 Step 3 "분석 시작" 직전 사용자가 자기 입력을 한 번 더 확인하는 박스.
 * "내가 보낸 의도"를 마지막으로 검증해 결과 받고 후회하는 일을 줄인다.
 *
 * 표시 항목:
 *   - 모드 (TP2)
 *   - 의도 텍스트 (TP3)
 *   - 우선 레이어 요약 (TP4 selectedRefs.useLayers 집계)
 *   - 예상 비용 (mode 별 estimate)
 *
 * Props:
 * @param {string} mode - 'concept'|'system'|'handoff' [Required]
 * @param {string} intent - 의도 문장 [Required]
 * @param {Array<{id, useLayers}>} selectedRefs - TP4 큐레이션 [Required]
 * @param {string} [estimatedCost] - 예상 비용 텍스트 [Optional]
 * @param {function} onConfirm - "분석 시작" 클릭 [Required]
 * @param {function} onEdit - "수정하기" 클릭 (Step 1로 돌아가기) [Required]
 * @param {boolean} disabled - 비활성 [Optional]
 *
 * Example usage:
 * <AnalysisConfirmBox
 *   mode="system"
 *   intent="차분한 다크 무드의 데이터 대시보드"
 *   selectedRefs={ selectedRefs }
 *   estimatedCost="~$0.012"
 *   onConfirm={ runAnalyze }
 *   onEdit={ goToStep1 }
 * />
 */
export function AnalysisConfirmBox({
  mode = 'system',
  intent,
  selectedRefs = [],
  estimatedCost,
  onConfirm,
  onEdit,
  disabled = false,
  sx,
}) {
  const meta = MODE_META[mode] || MODE_META.system;

  // 레이어별 사용 ref 수 집계
  const layerCounts = ['color', 'typography', 'layout', 'gradient', 'visualDirection'].map((key) => {
    const count = selectedRefs.filter((r) => {
      const layers = Array.isArray(r.useLayers) ? r.useLayers : [];
      return layers.length === 0 || layers.includes(key); // 빈 배열 = 자동(전체 레이어 사용)
    }).length;
    return { key, count };
  }).filter((x) => x.count > 0);

  return (
    <Box
      sx={ {
        p: { xs: 2.5, md: 3.5 },
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
        ...sx,
      } }
    >
      <Typography variant="overline" sx={ { fontSize: '0.75rem', letterSpacing: '0.08em', color: 'text.secondary' } }>
        이렇게 합성합니다
      </Typography>

      <Box sx={ { display: 'flex', flexDirection: 'column', gap: 1.5 } }>
        <Row label="📌 모드" value={ `${meta.emoji} ${meta.label}` } />
        <Row label="📌 의도" value={ intent || '(미입력)' } />
        <Row
          label="📌 우선 레이어"
          value={
            layerCounts.length > 0 ? (
              <Box sx={ { display: 'flex', flexWrap: 'wrap', gap: 0.5 } }>
                { layerCounts.map((l) => (
                  <Chip
                    key={ l.key }
                    label={ `${LAYER_LABEL[l.key]} (${l.count}장)` }
                    size="small"
                    sx={ { height: 20, fontSize: '0.7rem' } }
                  />
                )) }
              </Box>
            ) : '(자동)'
          }
        />
        { estimatedCost && (
          <Row label="📌 예상 비용" value={ estimatedCost } />
        ) }
      </Box>

      <Box sx={ { display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 1 } }>
        <Button onClick={ onEdit } disabled={ disabled } variant="text">
          수정하기
        </Button>
        <Button
          onClick={ onConfirm }
          disabled={ disabled }
          variant="contained"
          color="primary"
        >
          분석 시작 →
        </Button>
      </Box>
    </Box>
  );
}

function Row({ label, value }) {
  return (
    <Box sx={ { display: 'grid', gridTemplateColumns: '120px 1fr', gap: 1, alignItems: 'baseline' } }>
      <Typography variant="caption" sx={ { color: 'text.secondary', fontWeight: 600 } }>
        { label }
      </Typography>
      { typeof value === 'string'
        ? <Typography variant="body2">{ value }</Typography>
        : <Box>{ value }</Box> }
    </Box>
  );
}
