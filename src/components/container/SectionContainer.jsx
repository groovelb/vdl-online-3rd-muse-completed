import Box from '@mui/material/Box';

/**
 * SectionContainer
 *
 * 페이지 내 각 섹션을 구분하는 컨테이너. 기본 100% 너비 + 반응형 상하 여백.
 *
 * variant 로 내부 콘텐츠의 폭 모드를 선택한다.
 * - fluid: 100% 너비 (탐색/그리드/풀-블리드 섹션). 기본 동작과 동일.
 * - focus: 좁은 maxWidth 로 중앙 집중 (좁은 폼·설정 섹션).
 * variant 미지정 시 기존 동작(width 100%) 유지 — 하위 호환.
 *
 * Props:
 * @param {node} children - 콘텐츠 [Required]
 * @param {'fluid'|'focus'} [variant] - 섹션 폭 모드 [Optional]
 * @param {number} [focusMaxWidth] - focus variant 의 max-width(px) [Optional, 기본값: 720]
 * @param {object} [sx] - 추가 스타일 [Optional]
 *
 * Example usage:
 * <SectionContainer variant="focus" focusMaxWidth={ 640 }> ... </SectionContainer>
 */
export const SectionContainer = ({
  children,
  variant,
  focusMaxWidth = 720,
  sx,
  ...props
}) => {
  const isFocus = variant === 'focus';

  return (
    <Box
      component="section"
      sx={ {
        width: '100%',
        py: { xs: 4, md: 6 },
        ...(isFocus
          ? { maxWidth: focusMaxWidth, mx: 'auto', px: { xs: 2.5, md: 4 } }
          : null),
        ...sx,
      } }
      { ...props }
    >
      { children }
    </Box>
  );
};
