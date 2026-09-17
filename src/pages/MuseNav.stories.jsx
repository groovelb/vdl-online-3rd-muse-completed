import { MuseNav } from './MuseNav.jsx';
import { adminAuthParams, routerAuthParams } from '../stories/decorators/museDecorators.jsx';

export default {
  title: 'Custom Component/7. Shell & Routes/MuseNav',
  component: MuseNav,
  parameters: { layout: 'centered' },
};

/** 상단 이동 메뉴. 아카이브와 프로젝트를 오간다 */
export const Default = {
  parameters: { layout: 'centered', ...routerAuthParams },
  args: {},
};

/** 관리자에게만 보이는 항목이 하나 더 붙는다 */
export const Admin = {
  parameters: { layout: 'centered', ...adminAuthParams },
  args: {},
};
