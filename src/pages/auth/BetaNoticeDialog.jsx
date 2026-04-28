import { useMemo, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import ScienceIcon from '@mui/icons-material/Science';
import { useAuth } from '../../hooks/auth';
import { BETA_LIMITS, isAdminUser } from '../../config/betaLimits';

const STORAGE_KEY_PREFIX = 'muse:beta-notice-seen:';

/**
 * BetaNoticeDialog
 *
 * 최초 로그인 직후 1회 표시되는 베타 안내 모달.
 * localStorage 에 user.id 별로 본 적 있는지 기록 → 다음 세션부턴 안 뜸.
 *
 * Example usage:
 * <BetaNoticeDialog />
 */
export function BetaNoticeDialog() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  // localStorage 조회를 render 시점에 파생값으로 계산 (setState-in-effect 회피)
  const open = useMemo(() => {
    if (!user || dismissed) return false;
    if (isAdminUser(user)) return false;
    try {
      return !localStorage.getItem(`${ STORAGE_KEY_PREFIX }${ user.id }`);
    } catch {
      return false;
    }
  }, [user, dismissed]);

  const close = () => {
    if (user) {
      try {
        localStorage.setItem(`${ STORAGE_KEY_PREFIX }${ user.id }`, '1');
      } catch {
        // ignore
      }
    }
    setDismissed(true);
  };

  return (
    <Dialog open={ open } onClose={ close } maxWidth="xs" fullWidth>
      <DialogTitle sx={ { pb: 1 } }>
        <Stack direction="row" alignItems="center" spacing={ 1.5 }>
          <Box
            sx={ {
              width: 40,
              height: 40,
              borderRadius: 1.5,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            } }
          >
            <ScienceIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h6" sx={ { fontWeight: 700, lineHeight: 1.2 } }>
              MUSE 베타에 오신 걸 환영합니다
            </Typography>
            <Typography variant="caption" color="text.secondary">
              본격 출시 전 사용량 제한이 적용된 점 양해 부탁드립니다.
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={ 2 }>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={ { mb: 1 } }>
              계정당 사용 가능 한도
            </Typography>
            <Stack spacing={ 1 }>
              <LimitRow
                label="레퍼런스"
                value={ `최대 ${ BETA_LIMITS.references }개` }
                hint="이미지 업로드 + 자동 태깅"
              />
              <LimitRow
                label="프로젝트"
                value={ `최대 ${ BETA_LIMITS.projects }개` }
                hint="레퍼런스 묶음 + 토큰 분석"
              />
            </Stack>
          </Box>
          <Typography variant="caption" color="text.secondary">
            한도에 도달하면 기존 항목을 삭제한 뒤 추가할 수 있습니다.
            정식 출시 시 한도가 상향되며, 베타 데이터는 그대로 유지됩니다.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={ { px: 3, pb: 2 } }>
        <Button onClick={ close } variant="contained" color="primary" fullWidth>
          시작하기
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function LimitRow({ label, value, hint }) {
  return (
    <Box
      sx={ {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        p: 1.5,
        borderRadius: 1.5,
        bgcolor: 'action.hover',
      } }
    >
      <Box>
        <Typography variant="body2" sx={ { fontWeight: 600 } }>{ label }</Typography>
        <Typography variant="caption" color="text.secondary">{ hint }</Typography>
      </Box>
      <Typography variant="body2" sx={ { fontWeight: 600, color: 'primary.main' } }>
        { value }
      </Typography>
    </Box>
  );
}
