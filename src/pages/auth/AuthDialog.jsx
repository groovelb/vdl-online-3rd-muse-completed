import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Alert from '@mui/material/Alert';
import CloseIcon from '@mui/icons-material/Close';
import { useSignIn, useSignUp } from '../../hooks/auth';
import { COMMON, AUTH_DIALOG } from './landingCopy.js';

/**
 * AuthDialog — 로그인 / 회원가입 팝업
 *
 * 기존 AuthPage 인라인 폼을 Dialog 로 분리한 버전.
 *
 * Props:
 * @param {boolean} open - 다이얼로그 오픈 여부 [Required]
 * @param {function} onClose - 닫기 콜백 [Required]
 * @param {'signin'|'signup'} initialMode - 시작 탭 [Optional, 기본값: 'signin']
 *
 * Example usage:
 * <AuthDialog open={ open } onClose={ () => setOpen(false) } initialMode="signup" />
 */
export function AuthDialog({ open, onClose, initialMode = 'signin' }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const [info, setInfo] = useState(null);

  const { signIn, loading: signingIn, error: signInError } = useSignIn();
  const { signUp, loading: signingUp, error: signUpError } = useSignUp();

  const loading = signingIn || signingUp;
  const error = signInError || signUpError;

  // open 될 때마다 initialMode 동기화
  useEffect(() => {
    if (open) setMode(initialMode);
  }, [open, initialMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInfo(null);
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
      // mailer_autoconfirm OFF 인 경우: 메일 확인 안내 후 종료
      setInfo('가입 확인 메일을 보냈습니다. 메일함을 확인하고 인증 링크를 눌러주세요.');
    }
  };

  return (
    <Dialog
      open={ open }
      onClose={ loading ? undefined : onClose }
      maxWidth="sm"
      fullWidth
      slotProps={ { paper: { sx: { borderRadius: 4, p: { xs: 3, md: 5 }, position: 'relative' } } } }
    >
      <IconButton
        onClick={ onClose }
        aria-label={ COMMON.closeAria }
        disabled={ loading }
        sx={ { position: 'absolute', top: 16, right: 16, color: 'text.secondary' } }
      >
        <CloseIcon />
      </IconButton>

      <Stack spacing={ { xs: 4, md: 5 } } sx={ { width: '100%' } }>
        <Box sx={ { textAlign: 'center', mt: 1 } }>
          <Typography
            component="h2"
            sx={ {
              fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              color: 'text.primary',
            } }
          >
            { AUTH_DIALOG[mode].title }
          </Typography>
          <Typography
            sx={ {
              mt: 1.5,
              fontSize: { xs: '0.95rem', md: '1.05rem' },
              color: 'text.secondary',
              fontWeight: 400,
            } }
          >
            { AUTH_DIALOG[mode].subtitle }
          </Typography>
        </Box>

        <Tabs
          value={ mode }
          onChange={ (_, v) => { setMode(v); setInfo(null); } }
          variant="fullWidth"
          sx={ {
            '& .MuiTab-root': {
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              minHeight: 48,
              flex: 1,
              maxWidth: 'none',
            },
          } }
        >
          <Tab label={ AUTH_DIALOG.tabs.signin } value="signin" />
          <Tab label={ AUTH_DIALOG.tabs.signup } value="signup" />
        </Tabs>

        <Box component="form" onSubmit={ handleSubmit }>
          <Stack spacing={ { xs: 3, md: 4 } }>
            <AmbientInput
              type="email"
              label={ AUTH_DIALOG.inputs.email }
              value={ email }
              onChange={ (e) => setEmail(e.target.value) }
              autoComplete="email"
            />
            <AmbientInput
              type="password"
              label={ mode === 'signup' ? AUTH_DIALOG.inputs.passwordSignup : AUTH_DIALOG.inputs.passwordSignin }
              value={ password }
              onChange={ (e) => setPassword(e.target.value) }
              autoComplete={ mode === 'signin' ? 'current-password' : 'new-password' }
            />

            { error && (
              <Alert severity="error" sx={ { fontSize: '0.95rem', py: 1.25, borderRadius: 2 } }>
                { error }
              </Alert>
            ) }
            { !error && info && (
              <Alert severity="success" sx={ { fontSize: '0.95rem', py: 1.25, borderRadius: 2 } }>
                { info }
              </Alert>
            ) }

            <Button
              type="submit"
              variant="contained"
              disabled={ loading }
              fullWidth
              disableElevation
              sx={ {
                mt: 1,
                py: 1.75,
                fontSize: '1.05rem',
                fontWeight: 700,
                textTransform: 'none',
                letterSpacing: '-0.01em',
              } }
            >
              { loading ? AUTH_DIALOG.submitting : AUTH_DIALOG[mode].submit }
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Dialog>
  );
}

/**
 * AmbientInput — 컨테이너 없이 underline 만으로 떠 있는 큰 인풋
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
            fontSize: '1rem',
            fontWeight: 500,
            color: 'text.secondary',
            '&.Mui-focused': { color: 'primary.main' },
          },
        },
        input: {
          sx: {
            fontSize: '1.25rem',
            fontWeight: 500,
            letterSpacing: '-0.01em',
            py: 1.25,
            '&:before': { borderBottomWidth: '1.5px' },
            '&:hover:not(.Mui-disabled):before': { borderBottomWidth: '2px' },
            '&:after': { borderBottomWidth: '2.5px' },
          },
        },
      } }
    />
  );
}
