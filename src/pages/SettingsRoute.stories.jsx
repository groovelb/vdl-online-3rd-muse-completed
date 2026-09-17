import { SettingsRoute } from './SettingsRoute.jsx';
import { routerAuthParams } from '../stories/decorators/museDecorators.jsx';

export default {
  title: 'Custom Component/7. Shell & Routes/SettingsRoute',
  component: SettingsRoute,
  parameters: { layout: 'fullscreen', ...routerAuthParams },
};

/** 설정 화면을 라우트에 꽂고 현재 계정을 넘긴다 */
export const Default = {
  args: {},
};
