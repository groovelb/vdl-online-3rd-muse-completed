/**
 * Dark Theme — MUSE Visual Direction (dark variant)
 *
 * default.js 의 palette 와 동일한 철학 유지하되 bg/text 반전.
 *   - Image-First Neutral: Primary 는 여전히 near-black 축이지만 dark 모드에선 밝은 쪽 (#F3F3F9)
 *   - Background: near-black ink 기반
 *   - Accent (violet) 는 그대로 유지 — 강조용
 *
 * typography / spacing / shape / breakpoints / components 오버라이드는 default 재사용.
 */

import { createTheme } from '@mui/material/styles';
import defaultTheme, {
  typography,
  spacing,
  shape,
  breakpoints,
  zIndex,
  transitions,
  components,
} from './default.js';

const palette = {
  mode: 'dark',

  primary: {
    light: '#FCFCFF',
    main: '#F3F3F9',
    dark: '#D6D5E0',
    contrastText: '#14132B',
  },
  secondary: {
    light: '#B5B4C2',
    main: '#9493A3',
    dark: '#7A798E',
    contrastText: '#14132B',
  },

  error: { light: '#ef5350', main: '#f44336', dark: '#d32f2f', contrastText: '#FFFFFF' },
  warning: { light: '#ffb74d', main: '#ffa726', dark: '#fb8c00', contrastText: '#14132B' },
  success: { light: '#81c784', main: '#66bb6a', dark: '#4caf50', contrastText: '#14132B' },
  info: {
    light: '#818CF8',
    main: '#6366F1',
    dark: '#4F46E5',
    contrastText: '#FFFFFF',
  },

  text: {
    primary: '#F3F3F9',
    secondary: '#9493A3',
    disabled: 'rgba(243, 243, 249, 0.38)',
  },

  background: {
    default: '#0F0E1C',
    paper: '#1A1932',
  },

  divider: 'rgba(243, 243, 249, 0.10)',

  action: {
    active: 'rgba(243, 243, 249, 0.54)',
    hover: 'rgba(243, 243, 249, 0.06)',
    selected: 'rgba(243, 243, 249, 0.10)',
    disabled: 'rgba(243, 243, 249, 0.26)',
    disabledBackground: 'rgba(243, 243, 249, 0.08)',
    focus: 'rgba(243, 243, 249, 0.12)',
  },

  grey: {
    50: '#14132B',
    100: '#1A1932',
    200: '#2A2944',
    300: '#3A384E',
    400: '#5A586E',
    500: '#7A798E',
    600: '#9493A3',
    700: '#B5B4C2',
    800: '#D6D5E0',
    900: '#F3F3F9',
  },
};

const darkTheme = createTheme({
  palette,
  typography,
  spacing,
  shape,
  breakpoints,
  zIndex,
  transitions,
  components,
});

// 커스텀 필드 상속
darkTheme.customShadows = defaultTheme.customShadows;
darkTheme.dashboard = {
  ...defaultTheme.dashboard,
  background: palette.background.default,
  atmosphere: 'linear-gradient(to bottom, #0F0E1C 0%, #1A1932 100%)',
  textColor: palette.text.primary,
  textSecondary: palette.text.secondary,
  dividerColor: palette.divider,
  progressTrackColor: 'rgba(243, 243, 249, 0.08)',
  progressBarColor: palette.primary.main,
};

export default darkTheme;
