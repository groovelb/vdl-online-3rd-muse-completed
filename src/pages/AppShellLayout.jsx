import { Outlet } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell.jsx';
import { MuseNav } from './MuseNav.jsx';
import { UserMenu } from './UserMenu.jsx';

/**
 * AppShellLayout — Protected 라우트 공통 레이아웃
 *
 * AppShell 이 내장한 GNB 에 MuseNav(좌: 로고+링크)와 UserMenu(우: 아바타)를 주입하고,
 * 중첩된 라우트의 실제 페이지는 <Outlet /> 자리에 렌더된다.
 *
 * 페이지 템플릿은 이 쉘을 포함하지 않는다. PageContainer 이하의 본문만 책임진다.
 */
export function AppShellLayout() {
  return (
    <AppShell
      logo={ <MuseNav /> }
      headerPersistent={ <UserMenu /> }
    >
      <Outlet />
    </AppShell>
  );
}
