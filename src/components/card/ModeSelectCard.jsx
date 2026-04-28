import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/**
 * ModeSelectCard 컴포넌트 (TP2)
 *
 * 프로젝트 생성 첫 화면에서 모드 3개 (컨셉/시스템/코드직행) 중 하나를 선택하는 카드.
 * 한 번의 모드 선택이 T2 추천 정렬 + T3 합성 톤 + Export default 모두 분기시킨다.
 *
 * 동작 흐름:
 * 1. 카드 클릭 시 onSelect(mode) 호출
 * 2. selectedMode 와 일치하면 active 시각 (border + bg 강조)
 * 3. 호버 시 미세 lift 효과
 *
 * Props:
 * @param {string} mode - 'concept' | 'system' | 'handoff' [Required]
 * @param {string} title - 카드 제목 (예: "🎨 컨셉 잡기") [Required]
 * @param {string} subtitle - 카드 부제 (예: "감을 잡고 싶다") [Required]
 * @param {string} description - 카드 설명 (예: "빠른 다양성 우선") [Required]
 * @param {boolean} isSelected - 현재 선택 상태 [Optional, 기본값: false]
 * @param {function} onSelect - (mode) => void 클릭 콜백 [Required]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <ModeSelectCard
 *   mode="concept"
 *   title="🎨 컨셉 잡기"
 *   subtitle="감을 잡고 싶다"
 *   description="빠른 다양성 우선"
 *   isSelected={ mode === 'concept' }
 *   onSelect={ setMode }
 * />
 */
export function ModeSelectCard({
  mode,
  title,
  subtitle,
  description,
  isSelected = false,
  onSelect,
  sx,
}) {
  return (
    <Box
      role="button"
      tabIndex={ 0 }
      aria-pressed={ isSelected }
      onClick={ () => onSelect?.(mode) }
      onKeyDown={ (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.(mode);
        }
      } }
      sx={ {
        cursor: 'pointer',
        p: { xs: 3, md: 4 },
        borderRadius: 2,
        border: isSelected ? '2px solid' : '1px solid',
        borderColor: isSelected ? 'primary.main' : 'divider',
        bgcolor: isSelected ? 'primary.50' : 'background.paper',
        transition: 'border-color 150ms, background-color 150ms, transform 150ms',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        minHeight: 200,
        boxSizing: 'border-box',
        '&:hover': {
          borderColor: isSelected ? 'primary.main' : 'text.secondary',
          transform: 'translateY(-2px)',
        },
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: 2,
        },
        ...sx,
      } }
    >
      <Typography variant="h5" sx={ { fontWeight: 700, letterSpacing: '-0.01em' } }>
        { title }
      </Typography>
      <Typography variant="body2" sx={ { color: 'text.primary', fontWeight: 500 } }>
        { subtitle }
      </Typography>
      <Typography variant="caption" sx={ { color: 'text.secondary', fontSize: '0.85rem', mt: 'auto' } }>
        { description }
      </Typography>
    </Box>
  );
}
