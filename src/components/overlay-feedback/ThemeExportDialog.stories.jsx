import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { ThemeExportDialog } from './ThemeExportDialog';

export default {
  title: 'Component/9. Overlay & Feedback/ThemeExportDialog',
  component: ThemeExportDialog,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

/** MUSE가 실제 export할 법한 full theme 샘플 */
const MUSE_THEME_SAMPLE = {
  palette: {
    mode: 'light',
    primary: {
      main: '#14132B',
      light: '#2D2B5A',
      dark: '#0A091A',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#5A586E',
      light: '#7A798E',
      dark: '#3A384E',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#4F46E5',
      light: '#6366F1',
      dark: '#3730A3',
    },
    text: {
      primary: '#14132B',
      secondary: '#7A798E',
    },
    background: {
      default: '#FCFCFF',
      paper: '#F8F8FC',
    },
    divider: 'rgba(20, 19, 43, 0.08)',
  },
  typography: {
    fontFamily: '"Pretendard Variable", sans-serif',
    h1: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 700,
      fontSize: 'clamp(3rem, 6vw, 6rem)',
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 600,
      fontSize: 'clamp(2rem, 4vw, 3.5rem)',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7,
    },
  },
  shape: {
    borderRadius: 0,
  },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 999 } } },
    MuiCard: { styleOverrides: { root: { borderRadius: 24 } } },
  },
};

const MINIMAL_THEME = {
  palette: {
    primary: { main: '#4F46E5' },
    background: { default: '#FCFCFF' },
  },
};

const INVALID_THEME = {
  palette: {
    background: { default: '#FCFCFF' },
  },
};

/** 기본 — MUSE full theme */
export const Default = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <Box sx={ { minHeight: 400 } }>
        <Button variant="contained" onClick={ () => setOpen(true) }>
          Export 다이얼로그 열기
        </Button>
        <ThemeExportDialog
          open={ open }
          onClose={ () => setOpen(false) }
          themeObject={ MUSE_THEME_SAMPLE }
          fileName="muse-theme.js"
        />
      </Box>
    );
  },
};

/** 최소 theme */
export const Minimal = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <Box sx={ { minHeight: 400 } }>
        <ThemeExportDialog
          open={ open }
          onClose={ () => setOpen(false) }
          themeObject={ MINIMAL_THEME }
        />
      </Box>
    );
  },
};

/** 필수 토큰 누락 경고 */
export const MissingRequired = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <Box sx={ { minHeight: 400 } }>
        <ThemeExportDialog
          open={ open }
          onClose={ () => setOpen(false) }
          themeObject={ INVALID_THEME }
        />
      </Box>
    );
  },
};
