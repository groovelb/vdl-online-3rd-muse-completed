import { ProjectListRoute } from './ProjectListRoute.jsx';
import { routerAuthParams } from '../stories/decorators/museDecorators.jsx';

export default {
  title: 'Custom Component/7. Shell & Routes/ProjectListRoute',
  component: ProjectListRoute,
  parameters: { layout: 'fullscreen', ...routerAuthParams },
};

/** 프로젝트 목록을 라우트에 꽂는 껍데기 */
export const Default = {
  args: {},
};
