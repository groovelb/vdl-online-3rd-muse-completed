import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { defaultTheme as theme } from './styles/themes';
import { MuseStoreProvider } from './store';
import {
  ArchiveRoute,
  ProjectListRoute,
  ProjectCreateRoute,
  ProjectDetailRoute,
  SettingsRoute,
} from './pages';

function App() {
  return (
    <MuseStoreProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route index element={<Navigate to="/archive" replace />} />
            <Route path="/archive" element={<ArchiveRoute />} />
            <Route path="/projects" element={<ProjectListRoute />} />
            <Route path="/projects/new" element={<ProjectCreateRoute />} />
            <Route path="/projects/:id" element={<ProjectDetailRoute />} />
            <Route path="/settings" element={<SettingsRoute />} />
            <Route path="*" element={<Navigate to="/archive" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </MuseStoreProvider>
  );
}

export default App;
