import Container from '@mui/material/Container';

/**
 * PageContainer
 *
 * 페이지의 메인 콘텐츠를 감싸는 컨테이너.
 *
 * variant 로 fluid / focus 두 가지 페이지 폭 모드를 선택한다.
 * - fluid: 뷰포트 전체 폭을 사용 (이미지 퍼스트 / 탐색 페이지). 좌우 padding 만 clamp 로 적용.
 * - focus: 좁은 maxWidth 로 중앙 집중 (생성/입력/설정 등 좁은 폼 페이지).
 * 둘 다 미지정 시 기존 동작(`maxWidth='xl'` MUI Container) 유지.
 *
 * Props:
 * @param {node} children - 콘텐츠 [Required]
 * @param {'fluid'|'focus'} [variant] - 페이지 폭 모드 [Optional]
 * @param {number} [focusMaxWidth] - focus variant 일 때 사용할 max-width(px) [Optional, 기본값: 720]
 * @param {string|bool} [maxWidth] - MUI Container maxWidth (variant 미지정 시 호환용) [Optional, 기본값: 'xl']
 * @param {boolean} [disableGutters] - 좌우 패딩 비활성화 [Optional, 기본값: false]
 * @param {object} [sx] - 추가 스타일 [Optional]
 *
 * Example usage:
 * <PageContainer variant="fluid"> ... </PageContainer>
 * <PageContainer variant="focus" focusMaxWidth={ 640 }> ... </PageContainer>
 */
export const PageContainer = ({
  children,
  variant,
  focusMaxWidth = 720,
  maxWidth = 'xl',
  disableGutters = false,
  sx,
  ...props
}) => {
  const isFluid = variant === 'fluid';
  const isFocus = variant === 'focus';
  const isVariantMode = isFluid || isFocus;

  const variantSx = isFluid
    ? {
      width: '100%',
      mx: 'auto',
      px: { xs: 2, md: 'clamp(16px, 2.5vw, 40px)' },
    }
    : isFocus
      ? {
        width: '100%',
        maxWidth: focusMaxWidth,
        mx: 'auto',
        px: { xs: 2.5, md: 4 },
      }
      : null;

  return (
    <Container
      maxWidth={ isVariantMode ? false : maxWidth }
      disableGutters={ isVariantMode ? true : disableGutters }
      sx={ {
        ...(variantSx || {}),
        ...sx,
      } }
      { ...props }
    >
      { children }
    </Container>
  );
};
