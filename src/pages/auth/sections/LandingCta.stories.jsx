import { LandingCta } from './LandingCta.jsx';

export default {
  title: 'Section/LandingCta',
  component: LandingCta,
  parameters: { layout: 'fullscreen' },
};

/** 마지막 가입 진입. 히어로와 같은 흩뿌린 배경을 다시 쓴다 */
export const Default = {
  args: {
    onStart: () => {},
    onSignIn: () => {},
  },
};
