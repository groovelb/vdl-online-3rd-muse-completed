import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { alpha } from '@mui/material/styles';
import { useSignIn, useSignUp } from '../../hooks/auth';
import { AuthHeroBackdrop } from './AuthHeroBackdrop.jsx';

/**
 * AuthPage — 로그인/회원가입 통합 페이지
 *
 * Hero(z-depth parallax + MUSE 타이포) → 스크롤 시 하단 폼 등장.
 * 베타 안내는 로그인 후 BetaNoticeDialog 가 1회 모달로 노출.
 */
function AuthPage() {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const formRef = useRef(null);

  const { signIn, loading: signingIn, error: signInError } = useSignIn();
  const { signUp, loading: signingUp, error: signUpError } = useSignUp();

  const loading = signingIn || signingUp;
  const error = signInError || signUpError;

  // body 스크롤이 가능하도록 명시 (다른 페이지에서 hidden 처리하는 경우 대비)
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'signin') {
      const { ok } = await signIn({ email, password });
      if (ok) navigate('/', { replace: true });
    } else {
      const { ok, data } = await signUp({ email, password });
      if (!ok) return;
      if (data?.session) {
        navigate('/', { replace: true });
        return;
      }
      const { ok: signedIn } = await signIn({ email, password });
      if (signedIn) navigate('/', { replace: true });
    }
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Box
      sx={ {
        minHeight: '100vh',
        width: '100%',
        backgroundColor: 'background.default',
      } }
    >
      {/* Hero */}
      <Box sx={ { position: 'relative' } }>
        <AuthHeroBackdrop heightVh={ 100 } />
        <IconButton
          onClick={ scrollToForm }
          aria-label="아래로 스크롤"
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

      {/* Form — 컨테이너 없는 ambient floating 레이아웃 */}
      <Box
        ref={ formRef }
        sx={ {
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 3, md: 6 },
          py: { xs: 8, md: 14 },
        } }
      >
        <Stack
          spacing={ { xs: 6, md: 8 } }
          sx={ { width: '100%', maxWidth: 720 } }
        >
          {/* 헤더 */}
          <Box sx={ { textAlign: 'center' } }>
            <Typography
              component="h2"
              sx={ {
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.05,
                color: 'text.primary',
              } }
            >
              { mode === 'signin' ? '바이브 디자인 시작하세요' : 'MUSE 시작하기' }
            </Typography>
            <Typography
              sx={ {
                mt: 2,
                fontSize: { xs: '1.05rem', md: '1.25rem' },
                color: 'text.secondary',
                fontWeight: 400,
              } }
            >
              { mode === 'signin' ? '계정 정보로 로그인하세요' : '이메일로 간편하게 가입할 수 있어요' }
            </Typography>
          </Box>

          {/* 탭 — 텍스트 키운 미니멀 */}
          <Tabs
            value={ mode }
            onChange={ (_, v) => setMode(v) }
            variant="fullWidth"
            sx={ {
              '& .MuiTab-root': {
                fontSize: '1.125rem',
                fontWeight: 600,
                textTransform: 'none',
                minHeight: 56,
                flex: 1,
                maxWidth: 'none',
              },
            } }
          >
            <Tab label="로그인" value="signin" />
            <Tab label="회원가입" value="signup" />
          </Tabs>

          {/* 폼 — standard variant, 큰 인풋, 컨테이너 없음 */}
          <Box component="form" onSubmit={ handleSubmit }>
            <Stack spacing={ { xs: 4, md: 5 } }>
              <AmbientInput
                type="email"
                label="이메일"
                value={ email }
                onChange={ (e) => setEmail(e.target.value) }
                autoComplete="email"
              />
              <AmbientInput
                type="password"
                label={ mode === 'signup' ? '비밀번호 (6자 이상)' : '비밀번호' }
                value={ password }
                onChange={ (e) => setPassword(e.target.value) }
                autoComplete={ mode === 'signin' ? 'current-password' : 'new-password' }
              />

              { error && (
                <Alert severity="error" sx={ { fontSize: '1rem', py: 1.5, borderRadius: 2 } }>
                  { error }
                </Alert>
              ) }

              <Button
                type="submit"
                variant="contained"
                disabled={ loading }
                fullWidth
                sx={ {
                  mt: { xs: 2, md: 3 },
                  py: 2.25,
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  borderRadius: 999,
                  textTransform: 'none',
                  letterSpacing: '-0.01em',
                  boxShadow: (theme) => `0 12px 40px ${ alpha(theme.palette.primary.main, 0.35) }`,
                  '&:hover': {
                    boxShadow: (theme) => `0 16px 50px ${ alpha(theme.palette.primary.main, 0.5) }`,
                  },
                } }
              >
                { loading ? '처리 중...' : (mode === 'signin' ? '로그인' : '회원가입') }
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

/**
 * AmbientInput — 컨테이너 없이 underline 만으로 떠 있는 큰 인풋
 * standard variant + 큰 폰트 + 두꺼운 underline + label float
 */
function AmbientInput({ label, type, value, onChange, autoComplete }) {
  return (
    <TextField
      variant="standard"
      type={ type }
      label={ label }
      value={ value }
      onChange={ onChange }
      required
      fullWidth
      autoComplete={ autoComplete }
      slotProps={ {
        inputLabel: {
          sx: {
            fontSize: '1.125rem',
            fontWeight: 500,
            color: 'text.secondary',
            '&.Mui-focused': { color: 'primary.main' },
          },
        },
        input: {
          sx: {
            fontSize: '1.5rem',
            fontWeight: 500,
            letterSpacing: '-0.01em',
            py: 1.5,
            '&:before': { borderBottomWidth: '1.5px' },
            '&:hover:not(.Mui-disabled):before': { borderBottomWidth: '2px' },
            '&:after': { borderBottomWidth: '2.5px' },
          },
        },
      } }
    />
  );
}

export default AuthPage;
