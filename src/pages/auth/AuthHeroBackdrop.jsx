import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme, alpha } from '@mui/material/styles';
import { FloatingImageGallery } from '../../components/media/FloatingImageGallery.jsx';

/** Vite glob — assets/example/*.jpg|jpeg|png 빌드 시점 번들 */
const imageModules = import.meta.glob('../../assets/example/*.{jpg,jpeg,png}', {
  eager: true,
  query: '?url',
  import: 'default',
});
const ALL_IMAGES = Object.values(imageModules);

/**
 * AuthHeroBackdrop
 *
 * 로그인/가입 페이지 hero. Three.js 기반 z-depth 갤러리(FloatingImageGallery) 위에
 * 큰 MUSE 타이포 + 서브카피를 얹고, 페이지 스크롤에 따라 로고가 위로 빠진다.
 *
 * - 데스크탑: WebGL 인터랙티브(드래그/휠/마우스 패럴랙스) + 자동 드리프트
 * - 모바일(md 미만): 정적 그리드로 폴백 (배터리/터치 끊김 회피)
 *
 * Props:
 * @param {number} heightVh - hero 높이(vh) [Optional, 기본값: 100]
 *
 * Example usage:
 * <AuthHeroBackdrop />
 */
export function AuthHeroBackdrop({ heightVh = 100 }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [scrollY, setScrollY] = useState(0);

  // 모바일 폴백용 정적 12장 (셔플 없이 앞에서 자르기 — 시각 일관성)
  const mobilePicked = useMemo(() => ALL_IMAGES.slice(0, 12), []);

  useEffect(() => {
    let raf = 0;
    const update = () => { raf = 0; setScrollY(window.scrollY); };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // 모바일 폴백
  if (isMobile) {
    return (
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
        <Box
          sx={ {
            position: 'absolute',
            inset: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 1,
            p: 2,
            opacity: 0.45,
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
                filter: 'blur(2px)',
              } }
            />
          )) }
        </Box>
        <Box
          sx={ {
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            background: `radial-gradient(ellipse at center, ${ alpha(theme.palette.background.default, 0.85) } 0%, ${ alpha(theme.palette.background.default, 0.4) } 60%, transparent 100%)`,
            py: 6,
            px: 4,
          } }
        >
          <Typography
            sx={ {
              fontSize: 'clamp(64px, 18vw, 120px)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1,
              color: 'text.primary',
            } }
          >
            MUSE
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={ { mt: 2 } }>
            디자인 레퍼런스 아카이브 + 토큰 추출
          </Typography>
        </Box>
      </Box>
    );
  }

  // 데스크탑: Three.js 무한 갤러리
  return (
    <Box sx={ { position: 'relative', width: '100%', height: `${ heightVh }vh`, overflow: 'hidden' } }>
      <FloatingImageGallery
        images={ ALL_IMAGES }
        backgroundColor={ theme.palette.background.default }
        count={ 80 }
        planeSize={ 360 }
        autoDriftZ={ -1.4 }
        isInteractive
        hasParallax
        sx={ { position: 'absolute', inset: 0 } }
      />

      {/* 중앙 MUSE 로고 — 페이지 스크롤과 함께 위로 이동 (opacity 유지) */}
      <Box
        sx={ {
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          transform: `translate3d(0, ${ -scrollY * 0.5 }px, 0)`,
          willChange: 'transform',
          zIndex: 50,
          pointerEvents: 'none',
        } }
      >
        <Typography
          component="h1"
          sx={ {
            fontSize: 'clamp(120px, 22vw, 280px)',
            fontWeight: 800,
            letterSpacing: '-0.05em',
            lineHeight: 0.9,
            color: 'text.primary',
            mixBlendMode: theme.palette.mode === 'dark' ? 'screen' : 'multiply',
          } }
        >
          MUSE
        </Typography>
      </Box>

      {/* 하단 페이드 — 폼 영역과 자연 연결 */}
      <Box
        sx={ {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '40%',
          background: `linear-gradient(180deg, transparent 0%, ${ theme.palette.background.default } 60%, ${ theme.palette.background.default } 100%)`,
          zIndex: 40,
          pointerEvents: 'none',
        } }
      />

      {/* 하단 sub-brand message — typography 계층: h2(메인 메시지) + body1(보조) */}
      <Box
        sx={ {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: { xs: 80, md: 96 },
          textAlign: 'center',
          px: 3,
          zIndex: 45,
          pointerEvents: 'none',
        } }
      >
        <Typography
          variant="h2"
          component="p"
          sx={ {
            color: 'text.primary',
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
          } }
        >
          무드보드를 디자인 토큰으로.
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={ { mt: 2, fontWeight: 500 } }
        >
          디자인 레퍼런스 아카이브 + 토큰 추출
        </Typography>
      </Box>
    </Box>
  );
}
