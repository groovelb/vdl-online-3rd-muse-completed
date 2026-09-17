import AuthPage from '../../pages/auth/AuthPage';
import { signedOutParams } from '../decorators/museDecorators.jsx';

/**
 * Landing Page (AuthPage) — 비로그인 진입 페이지
 *
 * GNB(AppShell) → Hero(ScatterGallery) → PROBLEM → SOLUTION → HOW IT WORKS → PERSONAS → CTA
 * → AuthDialog (signin/signup 팝업).
 *
 * 실제 production AuthPage 를 그대로 마운트.
 * 라우터와 세션은 전역 데코레이터가 하나만 만든다. 여기서는 `parameters` 로 주소와 로그인 상태만 고른다.
 */
export default {
  title: 'Page/Landing',
  component: AuthPage,
  parameters: {
    layout: 'fullscreen',
    ...signedOutParams,
    docs: {
      description: {
        component: `
랜딩 페이지(\`/auth\`) 의 production 컴포넌트 그대로 렌더.

- Hero: ScatterGallery + MUSE 워드마크
- 5 섹션: PROBLEM / SOLUTION / HOW IT WORKS / PERSONAS / CTA
- AppShell + GNB (다른 라우트와 동일 구조)
- CTA / GNB 우측 버튼 → AuthDialog 팝업
        `,
      },
    },
  },
};

export const Default = {
  render: () => <AuthPage />,
};
