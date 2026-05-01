import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import {
  LAYER_CHIP_DEFS_BASE as LAYER_DEFS_BASE,
  LAYER_CHIP_DEF_COMPONENTS as LAYER_DEF_COMPONENTS,
} from '../../data/muse/layers.js';

/**
 * ReferenceLayerChipRow 컴포넌트 (TP4)
 *
 * 프로젝트 생성 Step 2 추천 카드에 노출되는 "이 레퍼런스의 어느 레이어를 가져올지" chip row.
 * T2 가 추천한 referenceLayer 가 자동 활성화 — 사용자가 토글로 큐레이션 변경 가능.
 *
 * 동작 흐름:
 * 1. autoLayers (T2 referenceLayer) 가 default active
 * 2. 사용자가 chip 토글 시 onChange(useLayers) 호출 → manual mode 진입
 * 3. "자동" 칩으로 다시 자동 모드 복귀
 * 4. 잠금 시 시각적으로 비활성 (분석 시작 후)
 *
 * Props:
 * @param {string[]} autoLayers - T2 가 자동 추천한 layer 1~2개 [Required]
 * @param {string[]} value - 현재 선택된 useLayers (빈 배열 = 자동) [Optional, 기본값: []]
 * @param {function} onChange - (nextLayers) => void [Required]
 * @param {boolean} locked - 분석 시작 후 잠김 [Optional, 기본값: false]
 * @param {'concept'|'system'} mode - 활성 chip 셋 결정. system 이면 'components' chip 추가 [Optional, 기본값: 'system']
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <ReferenceLayerChipRow
 *   autoLayers={ ['color', 'typography'] }
 *   value={ selectedRefs[id]?.useLayers || [] }
 *   onChange={ (layers) => setUseLayers(id, layers) }
 *   mode="system"
 * />
 */
export function ReferenceLayerChipRow({
  autoLayers = [],
  value = [],
  onChange,
  locked = false,
  mode = 'system',
  sx,
}) {
  const LAYER_DEFS = mode === 'concept'
    ? LAYER_DEFS_BASE
    : [...LAYER_DEFS_BASE, LAYER_DEF_COMPONENTS];
  const isAuto = !value || value.length === 0;
  const effective = isAuto ? autoLayers : value;

  const toggleLayer = (key) => {
    if (locked) return;
    const base = isAuto ? [...autoLayers] : [...value];
    const next = base.includes(key)
      ? base.filter((l) => l !== key)
      : [...base, key];
    onChange?.(next);
  };

  const resetToAuto = () => {
    if (locked) return;
    onChange?.([]);
  };

  return (
    <Box sx={ { display: 'flex', flexDirection: 'column', gap: 0.5, ...sx } }>
      <Box sx={ { display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' } }>
        <Typography
          variant="caption"
          sx={ {
            fontSize: '0.65rem',
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            mr: 0.5,
          } }
        >
          { isAuto ? '자동' : '수동' }
        </Typography>
        { LAYER_DEFS.map((l) => {
          const isActive = effective.includes(l.key);
          return (
            <Chip
              key={ l.key }
              label={ l.label }
              size="small"
              clickable={ !locked }
              onClick={ () => toggleLayer(l.key) }
              color={ isActive ? 'primary' : 'default' }
              variant={ isActive ? 'filled' : 'outlined' }
              sx={ {
                height: 22,
                fontSize: '0.68rem',
                opacity: locked ? 0.6 : 1,
              } }
            />
          );
        }) }
      </Box>
      { !isAuto && !locked && (
        <Chip
          label="자동으로 되돌리기"
          size="small"
          variant="outlined"
          onClick={ resetToAuto }
          sx={ { alignSelf: 'flex-start', height: 18, fontSize: '0.65rem' } }
        />
      ) }
    </Box>
  );
}
