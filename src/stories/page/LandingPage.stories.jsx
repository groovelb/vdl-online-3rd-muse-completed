import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../hooks/auth';
import AuthPage from '../../pages/auth/AuthPage';

/**
 * Landing Page (AuthPage) — 비로그인 진입 페이지
 *
 * GNB(AppShell) → Hero(ScatterGallery) → PROBLEM → SOLUTION → HOW IT WORKS → PERSONAS → CTA
 * → AuthDialog (signin/signup 팝업).
 *
 * 항상 light 테마 고정. 실제 production AuthPage 를 그대로 마운트.
 * Storybook 환경에서 react-router 와 AuthProvider 가 필요하므로 데코레이터로 감싼다.
 */
export default {
  title: 'Page/Landing',
  component: AuthPage,
  parameters: {
    layout: 'fullscreen',
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
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/auth']}>
        <AuthProvider>
          <Story />
        </AuthProvider>
      </MemoryRouter>
    ),
  ],
};

export const Default = {
  render: () => <AuthPage />,
};
