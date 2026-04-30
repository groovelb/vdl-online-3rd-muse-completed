import { useMemo, useRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme, alpha } from '@mui/material/styles';
import { ScatterGallery } from '../../components/media/ScatterGallery.jsx';
import { useScrollProgress } from '../../hooks/useScrollProgress.js';
import { ALL_IMAGES, TOKENS_BY_SRC } from '../../utils/exampleImageTokens.js';
import { COMMON, HERO, PROBLEM } from './landingCopy.js';

/**
 * AuthHeroBackdrop
 *
 * Stack-pin hero — wrapper 200vh 안에 sticky bg(100vh) + content overlay(200vh).
 * BG 는 화면에 고정된 채 scatter ↔ 두 줄 horizontal flow 사이를 진행도(--p) 에 따라
 * 연속 lerp. 컨텐츠(로고/타이틀/CTA, 메인 질문) 는 일반 스크롤로 위 → 아래 흐름.
 *
 * 모바일(md 미만): pin 비활성, 두 모드를 단순 stack 으로 렌더.
 *
 * Props:
 * @param {function} onStart - hero CTA 클릭 시 호출 [Optional]
 * @param {function} onScrollNext - hero 끝까지 스크롤 트리거 [Optional]
 *
 * Example usage:
 *   <AuthHeroBackdrop onStart={ openSignup } onScrollNext={ scrollPastHero } />
 */
export function AuthHeroBackdrop({ onStart, onScrollNext }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const wrapperRef = useRef(null);
  const progressRef = useScrollProgress(wrapperRef);

  const scrollPastHero = () => {
    if (typeof onScrollNext === 'function') return onScrollNext();
    const el = wrapperRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().bottom + window.scrollY;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  if (isMobile) return <MobileHero onStart={ onStart } theme={ theme } />;

  return (
    <Box
      ref={ wrapperRef }
      sx={ {
        position: 'relative',
        width: '100%',
        height: '200vh',
      } }
    >
      {/* Sticky bg — 화면에 고정. ScatterGallery 가 progressRef 로 scatter↔flow 연속 lerp */}
      <Box
        sx={ {
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100%',
          overflow: 'hidden',
          zIndex: 0,
        } }
      >
        <ScatterGallery
          images={ ALL_IMAGES }
          progressRef={ progressRef }
          seed={ 12 }
          gridCols={ 6 }
          gridRows={ 4 }
          thumbnailMin={ 48 }
          thumbnailMax={ 104 }
          cursorRadius={ 240 }
          maxShift={ 16 }
          centerKeepout={ 220 }
          hasTooltip
          tooltipDelay={ 200 }
          tokensBySrc={ TOKENS_BY_SRC }
          flowGap={ 28 }
          flowRows={ 4 }
          flowSpeeds={ [-34, 42, -38, 46] }
          sx={ { position: 'absolute', inset: 0 } }
        />

        {/* 하단 페이드 — 다음 섹션과 자연 연결 */}
        <Box
          sx={ {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '32%',
            background: `linear-gradient(180deg, transparent 0%, ${ theme.palette.background.default } 75%, ${ theme.palette.background.default } 100%)`,
            pointerEvents: 'none',
          } }
        />

        {/* Scroll indicator — bg 와 함께 pin 됨, scatter 모드(--p < 0.4) 에서만 visible */}
        <IconButton
          onClick={ scrollPastHero }
          aria-label={ COMMON.scrollDownAria }
          sx={ {
            position: 'absolute',
            left: '50%',
            bottom: 32,
            transform: 'translateX(-50%)',
            zIndex: 60,
            color: 'text.secondary',
            backgroundColor: alpha(theme.palette.background.paper, 0.6),
            opacity: 'clamp(0, calc((0.4 - var(--p, 0)) * 6), 1)',
            '&:hover': {
              backgroundColor: alpha(theme.palette.background.paper, 0.9),
            },
            animation: 'authBounce 2s ease-in-out infinite',
            '@keyframes authBounce': {
              '0%, 100%': { transform: 'translate(-50%, 0)' },
              '50%':       { transform: 'translate(-50%, 8px)' },
            },
          } }
        >
          <KeyboardArrowDownIcon />
        </IconButton>
      </Box>

      {/* Content overlay — 자연 스크롤. 두 섹션이 위/아래로 흐름 */}
      <Box
        sx={ {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '200vh',
          zIndex: 5,
          pointerEvents: 'none',
        } }
      >
        {/* Mode A — 로고 / 메인 타이틀 / CTA */}
        <Box
          sx={ {
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          } }
        >
          <Box
            sx={ {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              textAlign: 'center',
              px: 3,
              pointerEvents: 'auto',
            } }
          >
            <Typography
              component="h1"
              sx={ {
                fontSize: 'clamp(64px, 10vw, 128px)',
                fontWeight: 800,
                letterSpacing: '-0.05em',
                lineHeight: 0.9,
                color: 'text.primary',
              } }
            >
              { COMMON.brand }
            </Typography>
            <Typography
              variant="h3"
              component="p"
              sx={ {
                color: 'text.primary',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                fontWeight: 600,
                wordBreak: 'keep-all',
                maxWidth: 720,
              } }
            >
              { HERO.desktopTitle }
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              disableElevation
              onClick={ onStart }
              sx={ {
                fontWeight: 700,
                fontSize: '1.25rem',
                px: 8,
                py: 2.5,
                mt: 2,
              } }
            >
              { HERO.cta }
            </Button>
          </Box>
        </Box>

        {/* Mode B — 메인 질문 */}
        <Box
          sx={ {
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          } }
        >
          <Typography
            component="h2"
            sx={ {
              fontSize: 'clamp(28px, 4.5vw, 56px)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.25,
              color: 'text.primary',
              textAlign: 'center',
              wordBreak: 'keep-all',
              maxWidth: 1080,
              px: 4,
              pointerEvents: 'auto',
            } }
          >
            { PROBLEM.title }
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

/* ============================================
 * MobileHero — pin 없이 두 모드 단순 stack
 * ============================================ */
function MobileHero({ onStart, theme }) {
  const mobilePicked = useMemo(() => ALL_IMAGES.slice(0, 12), []);

  return (
    <Box>
      <Box
        sx={ {
          position: 'relative',
          width: '100%',
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          py: 6,
        } }
      >
        <Box
          sx={ {
            position: 'absolute',
            inset: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 1,
            p: 2,
            opacity: 0.4,
          } }
        >
          { mobilePicked.slice(0, 9).map((src) => (
            <Box
              key={ src }
              component="img"
              src={ src }
              alt=""
              loading="lazy"
              sx={ {
                width: '100%',
                aspectRatio: '1',
                objectFit: 'cover',
                borderRadius: 2,
              } }
            />
          )) }
        </Box>
        <Box
          sx={ {
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            background: `radial-gradient(ellipse at center, ${ alpha(theme.palette.background.default, 0.85) } 0%, ${ alpha(theme.palette.background.default, 0.4) } 60%, transparent 100%)`,
            py: 6,
            px: 4,
          } }
        >
          <Typography
            sx={ {
              fontSize: 'clamp(56px, 16vw, 96px)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 0.9,
            } }
          >
            { COMMON.brand }
          </Typography>
          <Typography
            variant="h5"
            sx={ { fontWeight: 600, letterSpacing: '-0.02em', wordBreak: 'keep-all' } }
          >
            { HERO.mobileSubtitle }
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            disableElevation
            onClick={ onStart }
            sx={ {
              fontWeight: 700,
              fontSize: '1.125rem',
              px: 6,
              py: 2,
            } }
          >
            { HERO.cta }
          </Button>
        </Box>
      </Box>

      <Box
        sx={ {
          position: 'relative',
          width: '100%',
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          py: 6,
        } }
      >
        <Typography
          component="h2"
          sx={ {
            position: 'relative',
            zIndex: 2,
            fontSize: 'clamp(22px, 5.5vw, 34px)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.25,
            textAlign: 'center',
            wordBreak: 'keep-all',
            px: 3,
          } }
        >
          { PROBLEM.title }
        </Typography>
      </Box>
    </Box>
  );
}
