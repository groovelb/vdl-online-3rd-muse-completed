import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { defaultTheme, darkTheme } from './styles/themes';
import { MuseStoreProvider, useSettingsSlice } from './store';
import { AuthProvider } from './hooks/auth';
import {
  ArchiveRoute,
  ProjectListRoute,
  ProjectCreateRoute,
  ProjectDetailRoute,
  SettingsRoute,
  AppShellLayout,
} from './pages';
import AuthPage from './pages/auth/AuthPage';
import AuthGuard from './pages/auth/AuthGuard';

/** settings.themeMode 구독해서 light/dark 테마 선택 */
function ThemedApp({ children }) {
  const { settings } = useSettingsSlice();
  const theme = settings?.themeMode === 'dark' ? darkTheme : defaultTheme;
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
                <Route path="/archive" element={<ArchiveRoute />} />
                <Route path="/projects" element={<ProjectListRoute />} />
                <Route path="/projects/new" element={<ProjectCreateRoute />} />
                <Route path="/projects/:id" element={<ProjectDetailRoute />} />
                <Route path="/settings" element={<SettingsRoute />} />
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
