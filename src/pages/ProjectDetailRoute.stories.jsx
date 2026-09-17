import { ProjectDetailRoute } from './ProjectDetailRoute.jsx';
import { projectRouteParams } from '../stories/decorators/museDecorators.jsx';

export default {
  title: 'Custom Component/7. Shell & Routes/ProjectDetailRoute',
  component: ProjectDetailRoute,
  parameters: { layout: 'fullscreen', ...projectRouteParams },
};

/** 주소의 id 로 프로젝트를 찾아 상세 화면에 넘긴다 */
export const Default = {
  args: {},
};
