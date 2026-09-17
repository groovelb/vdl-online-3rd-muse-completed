import { UserMenu } from './UserMenu.jsx';
import { routerAuthParams } from '../stories/decorators/museDecorators.jsx';

export default {
  title: 'Custom Component/7. Shell & Routes/UserMenu',
  component: UserMenu,
  parameters: { layout: 'centered', ...routerAuthParams },
};

/** 계정과 화면 밝기를 다루는 오른쪽 위 메뉴 */
export const Default = {
  args: {},
};
