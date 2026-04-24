import Typography from '@mui/material/Typography';
import { AppShell } from '../layout/AppShell.jsx';

/**
 * Storybook decorator — 템플릿 스토리를 AppShell 로 감싸는 shell.
 *
 * 실제 앱에서는 <AppShellLayout /> 이 라우트 레벨에서 AppShell 을 감싸고 MuseNav/UserMenu 를
 * 주입하지만, 스토리는 Router/Auth context 없이 독립 렌더되므로 간단한 로고 텍스트만 넣는다.
 */
export const withAppShell = (Story) => (
  <AppShell
    logo={ <Typography variant="h6" sx={ { fontWeight: 700 } }>MUSE</Typography> }
  >
    <Story />
  </AppShell>
);
