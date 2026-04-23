import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { defaultTheme as theme } from './styles/themes';
import { MuseStoreProvider } from './store';
import { AuthProvider } from './hooks/auth';
import {
  ArchiveRoute,
  ProjectListRoute,
  ProjectCreateRoute,
  ProjectDetailRoute,
  SettingsRoute,
} from './pages';
import AuthPage from './pages/auth/AuthPage';
import AuthGuard from './pages/auth/AuthGuard';

function App() {
  return (
    <AuthProvider>
      <MuseStoreProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/" element={<AuthGuard><Navigate to="/archive" replace /></AuthGuard>} />
              <Route path="/archive" element={<AuthGuard><ArchiveRoute /></AuthGuard>} />
              <Route path="/projects" element={<AuthGuard><ProjectListRoute /></AuthGuard>} />
              <Route path="/projects/new" element={<AuthGuard><ProjectCreateRoute /></AuthGuard>} />
              <Route path="/projects/:id" element={<AuthGuard><ProjectDetailRoute /></AuthGuard>} />
              <Route path="/settings" element={<AuthGuard><SettingsRoute /></AuthGuard>} />
              <Route path="*" element={<Navigate to="/archive" replace />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </MuseStoreProvider>
    </AuthProvider>
  );
}

export default App;
