import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';

import { defaultTheme, darkTheme } from './styles/themes';
import { MuseStoreProvider, useSettingsSlice } from './store';
import { AuthProvider } from './hooks/auth';
import {
  ArchiveRoute,
  ProjectListRoute,
  ProjectCreateRoute,
  ProjectDetailRoute,
  SettingsRoute,
  AdminRoute,
  AppShellLayout,
} from './pages';
import AuthPage from './pages/auth/AuthPage';
import AuthGuard from './pages/auth/AuthGuard';

/** settings.themeMode 구독해서 light/dark/system 테마 선택 (system: OS prefers-color-scheme 추종) */
function ThemedApp({ children }) {
  const { settings } = useSettingsSlice();
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const mode = settings?.themeMode || 'system';
  const resolvedDark = mode === 'system' ? prefersDark : mode === 'dark';
  const theme = resolvedDark ? darkTheme : defaultTheme;
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <MuseStoreProvider>
        <ThemedApp>
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route element={<AuthGuard><AppShellLayout /></AuthGuard>}>
                <Route path="/" element={<Navigate to="/archive" replace />} />
                {/* /archive, /projects 는 AppShellLayout 안에서 keep-alive 마운트되므로 여기서 element 미지정 */}
                <Route path="/archive" element={null} />
                <Route path="/projects" element={null} />
                <Route path="/projects/new" element={<ProjectCreateRoute />} />
                <Route path="/projects/:id" element={<ProjectDetailRoute />} />
                <Route path="/settings" element={<SettingsRoute />} />
                <Route path="/admin" element={<AdminRoute />} />
              </Route>
              <Route path="*" element={<Navigate to="/archive" replace />} />
            </Routes>
          </BrowserRouter>
        </ThemedApp>
      </MuseStoreProvider>
    </AuthProvider>
  );
}

export default App;
