import { AuthHeroBackdrop } from './AuthHeroBackdrop.jsx';

export default {
  title: 'Custom Component/6. Landing & Auth/AuthHeroBackdrop',
  component: AuthHeroBackdrop,
  parameters: { layout: 'fullscreen' },
};

/** 랜딩 첫 화면. 흩뿌린 레퍼런스가 배경을 채우고 진입 버튼이 얹힌다 */
export const Default = {
  args: {
    onStart: () => {},
    onScrollNext: () => {},
  },
};
