import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { RefImage } from '../media/RefImage.jsx';

/** 모드별 최소 글자수 — concept=0(스킵 가능), system=30, handoff=50 */
const MIN_LENGTH_BY_MODE = { concept: 0, system: 30, handoff: 50 };

const PLACEHOLDER_BY_MODE = {
  concept: `예:
- 에디토리얼 대시보드 레이아웃
- 모듈형 그리드 + 부드러운 라운드로 모던하게
- 레트로 종이 질감 배경, 고정 위치`,
  system: `예:
- 에디토리얼 대시보드 레이아웃
- 모듈형 그리드 사이를 부드러운 라운드로 모던하게
- 레트로 종이 질감 배경을 fixed 로 깔기`,
  handoff: `예:
- 에디토리얼 대시보드 레이아웃 (12컬럼 모듈 그리드)
- 부드러운 라운드(8~12px)로 모던한 톤
- 레트로 종이 질감 배경, fixed 포지션`,
};

/**
 * RefinementNotesField 컴포넌트 (Step 3)
 *
 * 프로젝트 생성 위자드 Step 3 — 레퍼런스 본 후 활용 노트 textarea.
 * 모드별 최소 글자수 차등 (concept=0 / system=30 / handoff=50).
 * userNotes 는 T3 합성 시 HIGHEST PRIORITY 로 적용됨.
 *
 * 동작 흐름:
 * 1. 상단에 선택된 레퍼런스 썸네일 row 표시 (사용자 시각 참조)
 * 2. textarea — 가이드 박스(어느 ref의 무엇을 활용 / 강조 / 변형) 함께
 * 3. 모드별 minLength 미충족 시 isValid=false, 부모가 [분석 시작 →] 버튼 비활성
 *
 * Props:
 * @param {string} value - 현재 활용 노트 [Required]
 * @param {function} onChange - (next) => void [Required]
 * @param {Array<{id, thumbnailUrl, title?}>} selectedRefs - 선택된 레퍼런스 [Optional]
 * @param {'concept'|'system'|'handoff'} mode - TP2 모드. minLength 차등 [Optional, 기본값: 'system']
 * @param {boolean} disabled - 비활성 [Optional, 기본값: false]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <RefinementNotesField
 *   value={ userNotes }
 *   onChange={ setUserNotes }
 *   selectedRefs={ selectedRefs }
 *   mode={ projectMode }
 * />
 */
export function RefinementNotesField({
  value,
  onChange,
  selectedRefs = [],
  mode = 'system',
  disabled = false,
  sx,
}) {
  const minLen = MIN_LENGTH_BY_MODE[mode] ?? 30;
  const charCount = (value || '').length;
  const isValid = charCount >= minLen;
  const placeholder = PLACEHOLDER_BY_MODE[mode] || PLACEHOLDER_BY_MODE.system;

  const helperText = minLen === 0
    ? `${charCount} / 300 (선택 사항 — 답하면 합성 디테일 ↑)`
    : `${charCount} / 300 (최소 ${minLen}자, 현재 ${isValid ? '✓' : `${minLen - charCount}자 부족`})`;

  return (
    <Box sx={ { display: 'flex', flexDirection: 'column', gap: 2, ...sx } }>
      {/* 상단: 선택된 ref 썸네일 row */}
      { selectedRefs.length > 0 && (
        <Box>
          <Typography variant="caption" sx={ { display: 'block', mb: 0.75, color: 'text.secondary' } }>
            선택된 레퍼런스 ({ selectedRefs.length })
          </Typography>
          <Box sx={ { display: 'flex', gap: 1, flexWrap: 'wrap' } }>
            { selectedRefs.map((r) => (
              <Box
                key={ r.id }
                title={ r.title || r.id }
                sx={ {
                  width: 56,
                  height: 56,
                  borderRadius: 1,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  flexDirection: 'column',
                } }
              >
                { r.thumbnailUrl && (
                  <RefImage
                    src={ r.thumbnailUrl }
                    storagePath={ r.storagePath }
                    alt={ r.id }
                  />
                ) }
              </Box>
            )) }
          </Box>
        </Box>
      ) }

      {/* textarea */}
      <TextField
        label="활용 노트"
        placeholder={ placeholder }
        value={ value }
        onChange={ (e) => onChange?.(e.target.value) }
        disabled={ disabled }
        fullWidth
        multiline
        minRows={ 4 }
        maxRows={ 8 }
        inputProps={ { maxLength: 300 } }
        helperText={ helperText }
        error={ minLen > 0 && charCount > 0 && !isValid }
      />

      {/* 가이드 박스 */}
      <Box
        sx={ {
          p: 2,
          borderRadius: 1.5,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        } }
      >
        <Typography
          variant="caption"
          sx={ {
            display: 'block',
            mb: 1,
            fontWeight: 600,
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          } }
        >
          💡 활용 노트 작성 가이드
        </Typography>
        <Typography variant="body2" sx={ { mb: 1, color: 'text.secondary' } }>
          큰 느낌과 구조부터. 픽셀 단위 디테일은 지금 적지 않아도 됩니다.
        </Typography>
        <Box component="ul" sx={ { m: 0, pl: 2.5, display: 'flex', flexDirection: 'column', gap: 0.75 } }>
          <Box component="li">
            <Typography variant="body2">
              <strong>전체 장르·무드</strong> — 예: "Editorial Dashboard Layout"
            </Typography>
          </Box>
          <Box component="li">
            <Typography variant="body2">
              <strong>핵심 스타일 방향</strong> — 예: "Refined radius + modular grid for modernism"
            </Typography>
          </Box>
          <Box component="li">
            <Typography variant="body2">
              <strong>분위기·구조 결정</strong> — 예: "Retro paper-grained background, fixed position"
            </Typography>
          </Box>
        </Box>
        <Box sx={ { mt: 1.5, pt: 1.5, borderTop: '1px dashed', borderColor: 'divider' } }>
          <Typography variant="caption" sx={ { color: 'text.secondary' } }>
            <strong>나쁜 예</strong>: "예쁘게" / "트렌디하게" (느낌만 추상적)
            <br />
            <strong>좋은 예</strong>: 장르 + 스타일 방향 + 구조·배경 결정 (3줄이면 충분)
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
