import { useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import Button from '@mui/material/Button';

const DEFAULT_SEEDS = [
  '차분', '활기', '세련', '복고', '미니멀', '편안', '긴장',
  '따뜻함', '차가움', '대담', '절제', 'Y2K', '브루탈리즘',
];

const DEFAULT_EXAMPLES = [
  '차분한 다크 무드의 데이터 대시보드',
  'Y2K 풍 화려한 포스터',
  '편안한 톤의 라이프스타일 모바일 앱',
  '미니멀한 SaaS 랜딩 페이지',
  '대담한 컬러의 브랜드 사이트',
];

/**
 * IntentSeedField 컴포넌트 (TP3)
 *
 * 프로젝트 의도 입력 textarea + 시드 단어 chip + 예시 토글.
 * "빈칸 공포" 회피를 위해 사용자에게 출발점을 제공.
 *
 * 동작 흐름:
 * 1. textarea 빈 상태에서도 시드 칩 + "예시 보기" 토글 노출
 * 2. 시드 칩 클릭 → textarea 끝에 단어 prepend
 * 3. "예시 보기" 토글 → 5~7개 완성된 의도 문장 chip 노출, 클릭 시 textarea 치환
 * 4. value/onChange 는 textarea 와 동일 (제어 컴포넌트)
 *
 * Props:
 * @param {string} value - 현재 의도 텍스트 [Required]
 * @param {function} onChange - (next) => void [Required]
 * @param {string[]} seeds - 시드 단어 풀 [Optional, 기본값: DEFAULT_SEEDS]
 * @param {string[]} examples - 예시 의도 문장 풀 [Optional, 기본값: DEFAULT_EXAMPLES]
 * @param {string} label - textarea 라벨 [Optional, 기본값: '의도']
 * @param {string} placeholder - textarea placeholder [Optional]
 * @param {boolean} disabled - 비활성 [Optional, 기본값: false]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <IntentSeedField value={ intent } onChange={ setIntent } />
 */
export function IntentSeedField({
  value,
  onChange,
  seeds = DEFAULT_SEEDS,
  examples = DEFAULT_EXAMPLES,
  label = '의도',
  placeholder = '한 줄로 어떤 디자인을 만들지 적어주세요',
  disabled = false,
  sx,
}) {
  const [showExamples, setShowExamples] = useState(false);

  const handleSeedClick = (seed) => {
    if (disabled) return;
    const next = value
      ? (value.endsWith(' ') ? `${value}${seed} ` : `${value} ${seed} `)
      : `${seed} `;
    onChange?.(next);
  };

  const handleExampleClick = (example) => {
    if (disabled) return;
    onChange?.(example);
    setShowExamples(false);
  };

  return (
    <Box sx={ { display: 'flex', flexDirection: 'column', gap: 1.5, ...sx } }>
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
        inputProps={ { maxLength: 200 } }
      />

      <Box sx={ { display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' } }>
        <Typography
          variant="caption"
          sx={ {
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontSize: '0.7rem',
            fontWeight: 600,
          } }
        >
          🏷️ 시드 단어
        </Typography>
        <Box sx={ { display: 'flex', flexWrap: 'wrap', gap: 0.5, flex: 1 } }>
          { seeds.map((s) => (
            <Chip
              key={ s }
              label={ s }
              size="small"
              clickable={ !disabled }
              onClick={ () => handleSeedClick(s) }
              variant="outlined"
              sx={ { height: 22, fontSize: '0.7rem' } }
            />
          )) }
        </Box>
      </Box>

      <Box>
        <Button
          size="small"
          variant="text"
          onClick={ () => setShowExamples((v) => !v) }
          disabled={ disabled }
          sx={ { textTransform: 'none', alignSelf: 'flex-start', px: 0 } }
        >
          💡 { showExamples ? '예시 닫기' : '예시 보기' }
        </Button>
        <Collapse in={ showExamples }>
          <Box sx={ { display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 } }>
            { examples.map((ex) => (
              <Chip
                key={ ex }
                label={ ex }
                size="small"
                clickable={ !disabled }
                onClick={ () => handleExampleClick(ex) }
                variant="outlined"
                sx={ {
                  alignSelf: 'flex-start',
                  height: 24,
                  fontSize: '0.75rem',
                  borderStyle: 'dashed',
                } }
              />
            )) }
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
}
