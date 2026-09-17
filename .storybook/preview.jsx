import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { darkTheme, defaultTheme } from '../src/styles/themes';
import { MuseStoreProvider } from '../src/store';
import { StoryAuthProvider } from '../src/stories/decorators/StoryAuthProvider.jsx';

// Dark Reader 차단 — 확장이 페이지 색을 임의로 반전시키지 않도록 opt-out
if (typeof document !== 'undefined' && !document.querySelector('meta[name="darkreader-lock"]')) {
  const darkreaderLock = document.createElement('meta');
  darkreaderLock.name = 'darkreader-lock';
  document.head.appendChild(darkreaderLock);
}

// Google Fonts 로드 (Material Symbols + 기본 폰트)
const googleFonts = [
  // Material Symbols
  'Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200',
  'Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200',
  'Material+Symbols+Sharp:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200',
  // Default Theme Font
  'Outfit:wght@300;400;500;600;700;800;900',
];

googleFonts.forEach((font) => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${font}&display=swap`;
  document.head.appendChild(link);
});

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  // 툴바에서 라이트와 다크를 바꿔 본다. 배경과 글자가 같은 색이 되는지 눈으로 확인하는 용도.
  globalTypes: {
    theme: {
      description: '테마',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
    options: {
      storySort: {
        order: [
          'Overview',
          ['Introduction', 'For Designers', 'MUSE', 'Page Composition', 'Rule Relationships', 'UX Intent Map'],
          'Style',
          ['Overview', 'Colors', 'Typography', 'Icons', 'Spacing', 'Component Tokens'],
          'Custom Component',
          [
            '0. Hierarchy',
            '1. Reference & Tagging',
            '2. Project & Wizard',
            '3. Archive & Filter',
            '4. AI Flow & Output',
            '5. Token Decision',
            '6. Landing & Auth',
            '7. Shell & Routes',
            '8. Adapted Starter',
          ],
          'Component',
          [
            '1. Typography',
            '2. Container',
            '3. Card',
            '4. Media',
            '5. Data Display',
            '6. In-page Navigation',
            '7. Input & Control',
            '8. Layout',
            '9. Overlay & Feedback',
            '10. Navigation',
          ],
          'Interactive',
          ['12. Scroll'],
          'Common',
          'Template',
          'Page',
          'Test Data',
        ],
        method: 'alphabetical',
      },
    },
  },
  decorators: [
    /**
     * 라우터, 세션, 스토어, 테마를 한곳에서 채운다.
     *
     * 라우터는 여기 하나뿐이다. 스토리가 따로 Router 를 감싸면 react-router 가
     * "You cannot render a <Router> inside another <Router>" 로 터진다.
     * 경로가 필요한 스토리는 `parameters.router` 로 요청한다.
     *   router.initialEntries  진입 주소 (기본 ['/archive'])
     *   router.path            `/projects/:id` 처럼 매칭이 필요할 때의 경로 패턴
     * 로그인 상태는 `parameters.auth` 로 바꾼다.
     *   auth.isAuthenticated (기본 true) · auth.isAdmin (기본 false)
     */
    (StoryFn, context) => {
      const Story = StoryFn;
      const theme = context.globals.theme === 'dark' ? darkTheme : defaultTheme;
      const router = context.parameters?.router ?? {};
      const auth = context.parameters?.auth ?? {};
      const initialEntries = router.initialEntries ?? ['/archive'];

      const content = router.path
        ? (
          <Routes>
            <Route path={router.path} element={<Story />} />
          </Routes>
        )
        : <Story />;

      return (
        <MemoryRouter initialEntries={initialEntries}>
          <StoryAuthProvider
            isAuthenticated={auth.isAuthenticated ?? true}
            isAdmin={auth.isAdmin ?? false}
          >
            <MuseStoreProvider seed="fixtures">
              <ThemeProvider theme={theme}>
                <CssBaseline />
                <div style={{ width: '100%', paddingTop: '40px' }}>
                  {content}
                </div>
              </ThemeProvider>
            </MuseStoreProvider>
          </StoryAuthProvider>
        </MemoryRouter>
      );
    },
  ],
};

export default preview;
