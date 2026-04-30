import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { defaultTheme } from '../../styles/themes';
import { AppShell } from '../../components/layout/AppShell.jsx';
import { AuthHeroBackdrop } from './AuthHeroBackdrop.jsx';
import { AuthDialog } from './AuthDialog.jsx';
import { COMMON, LANDING_GNB } from './landingCopy.js';
import { LandingSolutionStage1 } from './sections/LandingSolutionStage1.jsx';
import { LandingTagFlow } from './sections/LandingTagFlow.jsx';
import { LandingSolutionStage2 } from './sections/LandingSolutionStage2.jsx';
import { LandingCta } from './sections/LandingCta.jsx';

/**
 * AuthPage — 랜딩 + 가입 진입 페이지
 *
 * Hero (stack-pin: scatter ↔ blurred marquee + 메인 질문)
 * → SOLUTION → HOW IT WORKS → PERSONAS → CTA
 * → AuthDialog (signin/signup 팝업)
 *
 * 항상 light 테마 고정.
 */
function AuthPage() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const nextSectionRef = useRef(null);
  const lenisRef = useRef(null);

  // body 스크롤 가능 보장
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = prev; };
  }, []);

  /** Lenis smooth scroll. AuthDialog 열리면 일시 중단 (배경 스크롤 잠금). */
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
    });
    lenisRef.current = lenis;

    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (authOpen) lenis.stop();
    else lenis.start();
  }, [authOpen]);

  const openSignup = () => { setAuthMode('signup'); setAuthOpen(true); };
  const openSignin = () => { setAuthMode('signin'); setAuthOpen(true); };

  const scrollPastHero = () => {
    const target = nextSectionRef.current;
    if (!target) return;
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target, { offset: 0 });
    } else {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <AppShell
        isHeaderGhost={true}
        logo={(
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: '-0.02em' }}
            >
              {COMMON.brand}
            </Typography>
          </Box>
        )}
        headerPersistent={(
          <Button
            variant="contained"
            color="primary"
            onClick={openSignup}
            disableElevation
            sx={{ fontWeight: 600 }}
          >
            {LANDING_GNB.signup}
          </Button>
        )}
      >
        <AuthHeroBackdrop onStart={openSignup} onScrollNext={scrollPastHero} />

        {/* 랜딩 섹션들 */}
        <Box ref={nextSectionRef}>
          <LandingSolutionStage1 />
          <LandingTagFlow />
          <LandingSolutionStage2 />
          <LandingCta onStart={openSignup} onSignIn={openSignin} />
        </Box>

        <AuthDialog
          open={authOpen}
          onClose={() => setAuthOpen(false)}
          initialMode={authMode}
        />
      </AppShell>
    </ThemeProvider>
  );
}

export default AuthPage;
