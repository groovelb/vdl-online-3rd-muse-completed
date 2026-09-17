import { ProjectCreateRoute } from './ProjectCreateRoute.jsx';
import { routerAuthParams } from '../stories/decorators/museDecorators.jsx';

export default {
  title: 'Custom Component/7. Shell & Routes/ProjectCreateRoute',
  component: ProjectCreateRoute,
  parameters: { layout: 'fullscreen', ...routerAuthParams },
};

/** 다섯 단계 생성 흐름을 라우트에 꽂고 끝나면 상세로 보낸다 */
export const Default = {
  args: {},
};
