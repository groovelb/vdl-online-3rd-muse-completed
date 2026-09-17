import { AdminRoute } from './AdminRoute.jsx';
import { adminAuthParams, routerAuthParams } from '../stories/decorators/museDecorators.jsx';

export default {
  title: 'Custom Component/7. Shell & Routes/AdminRoute',
  component: AdminRoute,
  parameters: { layout: 'fullscreen' },
};

/** 운영과 감사를 위한 화면. 관리자 역할일 때만 열린다 */
export const Admin = {
  parameters: { layout: 'fullscreen', ...adminAuthParams },
  args: {},
};

/** 일반 계정으로 들어오면 되돌려 보낸다 */
export const NotAdmin = {
  parameters: { layout: 'fullscreen', ...routerAuthParams },
  args: {},
};
