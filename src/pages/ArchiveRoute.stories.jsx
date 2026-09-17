import { ArchiveRoute } from './ArchiveRoute.jsx';
import { routerAuthParams } from '../stories/decorators/museDecorators.jsx';

export default {
  title: 'Custom Component/7. Shell & Routes/ArchiveRoute',
  component: ArchiveRoute,
  parameters: { layout: 'fullscreen', ...routerAuthParams },
};

/** 아카이브 화면을 라우트에 꽂는 얇은 껍데기. 이동만 맡는다 */
export const Default = {
  args: {},
};
