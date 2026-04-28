import TextField from '@mui/material/TextField';

/**
 * IntentGuideField 컴포넌트 (TP3 — Step 1)
 *
 * 프로젝트 한 줄 의도 textarea. 가이드 박스는 Step 3 (RefinementNotesField) 에 집중하기 위해 제거.
 * Step 1 은 placeholder + helperText 만으로 가벼운 시작점 역할.
 *
 * Props:
 * @param {string} value - 현재 의도 텍스트 [Required]
 * @param {function} onChange - (next) => void [Required]
 * @param {string} label - textarea 라벨 [Optional, 기본값: '한 줄 의도']
 * @param {string} placeholder - textarea placeholder [Optional]
 * @param {boolean} disabled - 비활성 [Optional, 기본값: false]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <IntentGuideField value={ intent } onChange={ setIntent } />
 */
export function IntentGuideField({
  value,
  onChange,
  label = '한 줄 의도',
  placeholder = '예: 차분한 다크 무드의 핀테크 대시보드, 데이터 가독성 우선',
  disabled = false,
  sx,
}) {
  const charCount = (value || '').length;

  return (
    <TextField
      label={ label }
      placeholder={ placeholder }
      value={ value }
      onChange={ (e) => onChange?.(e.target.value) }
      disabled={ disabled }
      fullWidth
      multiline
      minRows={ 2 }
      maxRows={ 4 }
      inputProps={ { maxLength: 120 } }
      helperText={ `${charCount} / 120 — 무드 / 사용자 맥락 / 시각 방향 / 제약을 한 줄에` }
      sx={ sx }
    />
  );
}
