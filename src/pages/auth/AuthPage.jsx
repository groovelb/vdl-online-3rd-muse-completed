import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { alpha, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { defaultTheme } from '../../styles/themes';
import { AppShell } from '../../components/layout/AppShell.jsx';
import { AuthHeroBackdrop } from './AuthHeroBackdrop.jsx';
import { AuthDialog } from './AuthDialog.jsx';
import { COMMON, LANDING_GNB } from './landingCopy.js';
import { LandingProblem } from './sections/LandingProblem.jsx';
import { LandingSolution } from './sections/LandingSolution.jsx';
import { LandingHowItWorks } from './sections/LandingHowItWorks.jsx';
import { LandingPersonas } from './sections/LandingPersonas.jsx';
import { LandingCta } from './sections/LandingCta.jsx';

/**
 * AuthPage — 랜딩 + 가입 진입 페이지
 *
 * Hero(scatter gallery + MUSE 타이포)
 * → PROBLEM → SOLUTION → HOW IT WORKS → PERSONAS → CTA
 * → AuthDialog (signin/signup 팝업)
 *
 * 항상 light 테마 고정.
 */
function AuthPage() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const nextSectionRef = useRef(null);

  // body 스크롤 가능 보장
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const openSignup = () => { setAuthMode('signup'); setAuthOpen(true); };
  const openSignin = () => { setAuthMode('signin'); setAuthOpen(true); };

  const scrollToNext = () => {
    nextSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <ThemeProvider theme={ defaultTheme }>
      <CssBaseline />
      <AppShell
        isHeaderGhost={ true }
        logo={ (
          <Box sx={ { display: 'flex', alignItems: 'center', gap: 4 } }>
            <Typography
              variant="h6"
              sx={ { fontWeight: 700, color: 'text.primary', letterSpacing: '-0.02em' } }
            >
              { COMMON.brand }
            </Typography>
          </Box>
        ) }
        headerPersistent={ (
          <Box sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
            <Button
              variant="text"
              onClick={ openSignin }
              sx={ { fontWeight: 500, color: 'text.primary' } }
            >
              { LANDING_GNB.signin }
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={ openSignup }
              disableElevation
              sx={ { fontWeight: 600 } }
            >
              { LANDING_GNB.signup }
            </Button>
          </Box>
        ) }
      >
        {/* Hero */}
        <Box sx={ { position: 'relative' } }>
          <AuthHeroBackdrop heightVh={ 100 } />
          <IconButton
            onClick={ scrollToNext }
            aria-label={ COMMON.scrollDownAria }
            sx={ {
              position: 'absolute',
              left: '50%',
              bottom: 32,
              transform: 'translateX(-50%)',
              zIndex: 60,
              color: 'text.secondary',
              backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.6),
              backdropFilter: 'blur(8px)',
              '&:hover': {
                backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.9),
              },
              animation: 'authBounce 2s ease-in-out infinite',
              '@keyframes authBounce': {
                '0%, 100%': { transform: 'translate(-50%, 0)' },
                '50%': { transform: 'translate(-50%, 8px)' },
              },
            } }
          >
            <KeyboardArrowDownIcon />
          </IconButton>
        </Box>

        {/* 랜딩 섹션들 */}
        <Box ref={ nextSectionRef }>
          <LandingProblem />
          <LandingSolution />
          <LandingHowItWorks />
          <LandingPersonas />
          <LandingCta onStart={ openSignup } onSignIn={ openSignin } />
        </Box>

        <AuthDialog
          open={ authOpen }
          onClose={ () => setAuthOpen(false) }
          initialMode={ authMode }
        />
      </AppShell>
    </ThemeProvider>
  );
}

export default AuthPage;
