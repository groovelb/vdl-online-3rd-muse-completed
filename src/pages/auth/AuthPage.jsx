import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useSignIn, useSignUp } from '../../hooks/auth';

/**
 * AuthPage — 로그인/회원가입 통합 페이지
 *
 * 탭 전환으로 signin / signup 모드 선택. 성공 시 / 로 이동 (AuthGuard 가 archive 로 리다이렉트).
 */
function AuthPage() {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [info, setInfo] = useState(null);
  const navigate = useNavigate();

  const { signIn, loading: signingIn, error: signInError } = useSignIn();
  const { signUp, loading: signingUp, error: signUpError } = useSignUp();

  const loading = signingIn || signingUp;
  const error = signInError || signUpError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInfo(null);
    if (mode === 'signin') {
      const { ok } = await signIn({ email, password });
      if (ok) navigate('/', { replace: true });
    } else {
      const { ok } = await signUp({ email, password });
      if (ok) {
        setInfo('회원가입 성공. 이메일 인증 링크를 확인해 주세요.');
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        background: 'radial-gradient(1200px 600px at 20% 10%, rgba(79, 70, 229, 0.06) 0%, transparent 60%), radial-gradient(900px 500px at 80% 90%, rgba(20, 19, 43, 0.05) 0%, transparent 55%), linear-gradient(180deg, #FCFCFF 0%, #F5F4FB 100%)',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 420 }}>
        <Stack spacing={3}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>MUSE</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              디자인 레퍼런스 아카이브 + 토큰 추출
            </Typography>
          </Box>

          <Tabs value={mode} onChange={(_, v) => setMode(v)} variant="fullWidth">
            <Tab label="로그인" value="signin" />
            <Tab label="회원가입" value="signup" />
          </Tabs>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                autoComplete="email"
              />
              <TextField
                type="password"
                placeholder={mode === 'signup' ? '비밀번호 (6자 이상)' : '비밀번호'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              />

              {error && <Alert severity="error">{error}</Alert>}
              {info && <Alert severity="success">{info}</Alert>}

              <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
                {loading ? '처리 중...' : (mode === 'signin' ? '로그인' : '회원가입')}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

export default AuthPage;
