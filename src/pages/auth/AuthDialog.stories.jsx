import { AuthDialog } from './AuthDialog.jsx';
import { signedOutParams } from '../../stories/decorators/museDecorators.jsx';

export default {
  title: 'Custom Component/6. Landing & Auth/AuthDialog',
  component: AuthDialog,
  parameters: { layout: 'fullscreen', ...signedOutParams },
};

/** 로그인 탭 */
export const SignIn = {
  args: { open: true, onClose: () => {}, initialMode: 'signin' },
};

/** 가입 탭 */
export const SignUp = {
  args: { open: true, onClose: () => {}, initialMode: 'signup' },
};
