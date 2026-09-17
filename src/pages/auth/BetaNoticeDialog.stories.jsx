import { BetaNoticeDialog } from './BetaNoticeDialog.jsx';
import { routerAuthParams } from '../../stories/decorators/museDecorators.jsx';

export default {
  title: 'Custom Component/6. Landing & Auth/BetaNoticeDialog',
  component: BetaNoticeDialog,
  parameters: { layout: 'fullscreen', ...routerAuthParams },
};

/** 처음 들어온 사용자에게 한 번 보여 주는 베타 안내 */
export const Default = {
  args: {},
};
