import Typography from '@mui/material/Typography';
import { AppShell } from '../../components/layout/AppShell.jsx';

/**
 * 스토리북 전용 데코레이터.
 *
 * 라우터와 세션은 `.storybook/preview.jsx` 의 전역 데코레이터가 하나만 만든다.
 * 여기서 다시 감싸면 react-router 가 Router 중첩으로 터지므로, 경로와 로그인 상태는
 * 데코레이터가 아니라 `parameters` 로 요청한다. 아래 상수를 스토리의 `parameters` 에 펼쳐 쓴다.
 */

/** 로그인 상태에서 아카이브 주소로 연다 */
export const routerAuthParams = {
  router: { initialEntries: ['/archive'] },
  auth: { isAuthenticated: true, isAdmin: false },
};

/** 로그인 상태이면서 경로에 묶어 둔다. 라우트 안에서만 도는 컴포넌트용 */
export const routeBoundAuthParams = {
  router: { initialEntries: ['/archive'], path: '/archive' },
  auth: { isAuthenticated: true, isAdmin: false },
};

/** 관리자 상태에서 운영 주소로 연다 */
export const adminAuthParams = {
  router: { initialEntries: ['/admin'] },
  auth: { isAuthenticated: true, isAdmin: true },
};

/** 로그인 전 상태에서 소개 주소로 연다 */
export const signedOutParams = {
  router: { initialEntries: ['/auth'] },
  auth: { isAuthenticated: false, isAdmin: false },
};

/**
 * 리다이렉트를 확인하는 스토리용.
 *
 * `AuthGuard` 처럼 조건이 안 맞으면 `<Navigate>` 로 다른 주소로 보내는 컴포넌트는,
 * 라우트 없이 그냥 마운트하면 보낸 뒤에도 자기가 계속 붙어 있어 다시 보내기를 반복한다
 * (`state={{ from: location }}` 가 렌더마다 새 객체라 effect 가 매번 다시 돈다).
 * 실제 앱처럼 경로에 묶어 두면 다른 주소로 옮겨간 순간 스토리가 떨어져 나가 한 번으로 끝난다.
 */
export const guardRedirectParams = {
  router: { initialEntries: ['/archive'], path: '/archive' },
  auth: { isAuthenticated: false, isAdmin: false },
};

/** `/projects/:id` 를 실제로 매칭시켜 useParams 가 값을 받게 한다 */
export const projectRouteParams = {
  router: { initialEntries: ['/projects/proj-001'], path: '/projects/:id' },
  auth: { isAuthenticated: true, isAdmin: false },
};

/**
 * 템플릿 스토리를 앱 셸로 감싼다.
 *
 * 실제 앱에서는 `<AppShellLayout />` 이 라우트 레벨에서 셸을 감싸고 네비와 사용자 메뉴를 주입하지만,
 * 스토리는 간단한 로고 텍스트만 넣는다. 라우터는 전역 데코레이터가 이미 채웠다.
 */
export const withAppShell = (StoryFn) => {
  const Story = StoryFn;
  return (
    <AppShell
      logo={ <Typography variant="h6" sx={ { fontWeight: 700 } }>MUSE</Typography> }
    >
      <Story />
    </AppShell>
  );
};
