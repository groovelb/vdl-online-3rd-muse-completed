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
    light: '#FCFCFE',
    main: '#F3F3F6',
    dark: '#D7D6DC',
    contrastText: '#17161E',
  },
  secondary: {
    light: '#B7B6BD',
    main: '#97969E',
    dark: '#7E7D88',
    contrastText: '#17161E',
  },

  error: { light: '#ef5350', main: '#f44336', dark: '#d32f2f', contrastText: '#FFFFFF' },
  warning: { light: '#ffb74d', main: '#ffa726', dark: '#fb8c00', contrastText: '#17161E' },
  success: { light: '#81c784', main: '#66bb6a', dark: '#4caf50', contrastText: '#17161E' },
  info: {
    light: '#818CF8',
    main: '#6366F1',
    dark: '#4F46E5',
    contrastText: '#FFFFFF',
  },

  text: {
    primary: '#F3F3F6',
    secondary: '#97969E',
    disabled: 'rgba(243, 243, 246, 0.38)',
  },

  background: {
    default: '#121118',
    paper: '#1D1C25',
  },

  divider: 'rgba(243, 243, 246, 0.10)',

  action: {
    active: 'rgba(243, 243, 246, 0.54)',
    hover: 'rgba(243, 243, 246, 0.06)',
    selected: 'rgba(243, 243, 246, 0.10)',
    disabled: 'rgba(243, 243, 246, 0.26)',
    disabledBackground: 'rgba(243, 243, 246, 0.08)',
    focus: 'rgba(243, 243, 246, 0.12)',
  },

  grey: {
    50: '#17161E',
    100: '#1D1C25',
    200: '#2D2C36',
    300: '#3E3D48',
    400: '#5E5D68',
    500: '#7E7D88',
    600: '#97969E',
    700: '#B7B6BD',
    800: '#D7D6DC',
    900: '#F3F3F6',
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
  atmosphere: 'linear-gradient(to bottom, #121118 0%, #1D1C25 100%)',
  textColor: palette.text.primary,
  textSecondary: palette.text.secondary,
  dividerColor: palette.divider,
  progressTrackColor: 'rgba(243, 243, 246, 0.08)',
  progressBarColor: palette.primary.main,
};

export default darkTheme;
