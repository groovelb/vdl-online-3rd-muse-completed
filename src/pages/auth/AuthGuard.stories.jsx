import Typography from '@mui/material/Typography';
import AuthGuard from './AuthGuard.jsx';
import { guardRedirectParams, routeBoundAuthParams } from '../../stories/decorators/museDecorators.jsx';

export default {
  title: 'Custom Component/6. Landing & Auth/AuthGuard',
  component: AuthGuard,
  parameters: { layout: 'centered' },
};

/** 가드가 통과시켰을 때 보이는 내용 */
function Protected() {
  return <Typography variant="h6">로그인해야 보이는 내용</Typography>;
}

/** 로그인 상태면 감싼 내용을 그대로 보여 준다 */
export const SignedIn = {
  parameters: { layout: 'centered', ...routeBoundAuthParams },
  render: () => (
    <AuthGuard>
      <Protected />
    </AuthGuard>
  ),
};

/** 로그인 전이면 소개 화면으로 되돌려 보낸다. 옮겨간 뒤에는 이 화면이 떨어져 나간다 */
export const SignedOut = {
  parameters: { layout: 'centered', ...guardRedirectParams },
  render: () => (
    <AuthGuard>
      <Protected />
    </AuthGuard>
  ),
};
