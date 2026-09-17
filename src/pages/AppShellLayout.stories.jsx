import { AppShellLayout } from './AppShellLayout.jsx';
import { routerAuthParams } from '../stories/decorators/museDecorators.jsx';

export default {
  title: 'Custom Component/7. Shell & Routes/AppShellLayout',
  component: AppShellLayout,
  parameters: { layout: 'fullscreen', ...routerAuthParams },
};

/** 모든 안쪽 화면을 두르는 셸. 네비와 사용자 메뉴를 셸에 꽂는다 */
export const Default = {
  args: {},
};
