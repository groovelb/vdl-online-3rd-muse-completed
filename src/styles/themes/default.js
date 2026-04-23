/**
 * Default Theme — MUSE Visual Direction
 *
 * MUSE 프로젝트의 기본 디자인 토큰.
 * docs/muse/03-visual-direction.md 의 설계 원칙을 구현한다.
 *
 * ## 핵심 철학 (MUSE)
 * - **Image-First Neutral**: Primary는 near-black `#14132B` — 레퍼런스 이미지/토큰이 주인공
 * - **Subtle Tint**: 완벽한 흰/검 제거, 바이올렛 틴트는 은은하게만
 * - **Sharp by default, Round on clickables**: 전역 borderRadius=0 유지, 클리커블만 pill/24px
 * - **Dimmed Tinted Shadow**: offset 없는 blur 기반 그림자, 색은 near-black 틴트로 일관
 * - **Accent Sparingly**: 바이올렛 `#4F46E5`는 "분석 중" 등 필수 강조에만 소량 사용
 */

import { createTheme } from '@mui/material/styles';

// ============================================================
// 1. Color Tokens (색상 토큰)
// ============================================================
const palette = {
  mode: 'light',
  // 브랜드 색상 — Image-First Neutral (near-black with subtle violet tint)
  primary: {
    light: '#2D2B5A',
    main: '#14132B',
    dark: '#0A091A',
    contrastText: '#FFFFFF',
  },
  secondary: {
    light: '#7A798E',
    main: '#5A586E',
    dark: '#3A384E',
    contrastText: '#FFFFFF',
  },

  // 상태 색상 (Feedback) — MUI 기본 유지
  error: {
    light: '#ef5350',
    main: '#d32f2f',
    dark: '#c62828',
    contrastText: '#FFFFFF',
  },
  warning: {
    light: '#ff9800',
    main: '#ed6c02',
    dark: '#e65100',
    contrastText: '#FFFFFF',
  },
  success: {
    light: '#4caf50',
    main: '#2e7d32',
    dark: '#1b5e20',
    contrastText: '#FFFFFF',
  },
  // info = MUSE Accent (필수 강조용 바이올렛, 소량 사용)
  info: {
    light: '#6366F1',
    main: '#4F46E5',
    dark: '#3730A3',
    contrastText: '#FFFFFF',
  },

  // 텍스트 색상 — Primary와 동일축 near-black (ink 개념)
  text: {
    primary: '#14132B',
    secondary: '#7A798E',
    disabled: 'rgba(20, 19, 43, 0.38)',
  },

  // 배경 색상 — 은은한 블루-바이올렛 틴트 (완벽한 흰색 회피)
  background: {
    default: '#FCFCFF',
    paper: '#F8F8FC',
  },

  // 구분선 — near-black 저투명
  divider: 'rgba(20, 19, 43, 0.08)',

  // 액션 상태 — near-black 틴트로 일관
  action: {
    active: 'rgba(20, 19, 43, 0.54)',
    hover: 'rgba(20, 19, 43, 0.04)',
    selected: 'rgba(20, 19, 43, 0.06)',
    disabled: 'rgba(20, 19, 43, 0.26)',
    disabledBackground: 'rgba(20, 19, 43, 0.08)',
    focus: 'rgba(20, 19, 43, 0.12)',
  },

  // Grey 스케일 — 바이올렛 틴트 재정의 (기존 MUI grey 대체)
  grey: {
    50: '#FAFAFD',
    100: '#F3F3F9',
    200: '#E8E7F0',
    300: '#D6D5E0',
    400: '#B5B4C2',
    500: '#9493A3',
    600: '#7A798E',
    700: '#5A586E',
    800: '#3A384E',
    900: '#14132B',
  },
};

// ============================================================
// 2. Typography Tokens (타이포그래피 토큰)
// ============================================================
const typography = {
  // 기본 폰트 패밀리
  fontFamily: [
    '"Pretendard Variable"',
    'Pretendard',
    '-apple-system',
    'BlinkMacSystemFont',
    'system-ui',
    'Roboto',
    '"Helvetica Neue"',
    '"Segoe UI"',
    '"Apple SD Gothic Neo"',
    '"Noto Sans KR"',
    '"Malgun Gothic"',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
    'sans-serif',
  ].join(','),

  // 헤딩 폰트 패밀리
  headingFontFamily: '"Outfit", "Pretendard Variable", Pretendard, sans-serif',

  // 폰트 크기 기준
  fontSize: 14,
  htmlFontSize: 16,

  // 폰트 굵기
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 700,

  // 헤딩 스타일 — MUSE: fluid 대형화 + 덜 무거운 weight
  h1: {
    fontFamily: '"Outfit", "Pretendard Variable", Pretendard, sans-serif',
    fontWeight: 700,
    fontSize: 'clamp(3rem, 6vw, 6rem)', // 48px ~ 96px
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontFamily: '"Outfit", "Pretendard Variable", Pretendard, sans-serif',
    fontWeight: 600,
    fontSize: 'clamp(2rem, 4vw, 3.5rem)', // 32px ~ 56px
    lineHeight: 1.15,
    letterSpacing: '-0.02em',
  },
  h3: {
    fontFamily: '"Outfit", "Pretendard Variable", Pretendard, sans-serif',
    fontWeight: 600,
    fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', // 24px ~ 32px
    lineHeight: 1.25,
    letterSpacing: '-0.01em',
  },
  h4: {
    fontFamily: '"Outfit", "Pretendard Variable", Pretendard, sans-serif',
    fontWeight: 600,
    fontSize: '1.5rem',      // 24px
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h5: {
    fontFamily: '"Outfit", "Pretendard Variable", Pretendard, sans-serif',
    fontWeight: 600,
    fontSize: '1.25rem',     // 20px
    lineHeight: 1.4,
    letterSpacing: '0',
  },
  h6: {
    fontFamily: '"Outfit", "Pretendard Variable", Pretendard, sans-serif',
    fontWeight: 500,
    fontSize: '1.125rem',    // 18px
    lineHeight: 1.4,
    letterSpacing: '0',
  },

  // 본문 스타일 — 넉넉한 line-height로 정보 밀도 낮추기
  body1: {
    fontSize: '1rem',        // 16px
    lineHeight: 1.7,
    letterSpacing: '0',
  },
  body2: {
    fontSize: '0.875rem',    // 14px
    lineHeight: 1.7,
    letterSpacing: '0',
  },

  // 부제목
  subtitle1: {
    fontSize: '1.125rem',    // 18px
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '0',
  },
  subtitle2: {
    fontSize: '0.875rem',    // 14px
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '0',
  },

  // 기타
  button: {
    fontSize: '0.9375rem',   // 15px
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '0',
    textTransform: 'none',
  },
  caption: {
    fontSize: '0.75rem',     // 12px
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '0.02em',
  },
  overline: {
    fontSize: '0.75rem',     // 12px
    fontWeight: 500,
    lineHeight: 2,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
};

// ============================================================
// 3. Spacing Token (간격 토큰)
// ============================================================
const spacing = 8; // 기본 단위: 8px

// ============================================================
// 4. Shape Token (모양 토큰)
// ============================================================
const shape = {
  borderRadius: 0, // Sharp corners (0px)
};

// ============================================================
// 5. Shadow Tokens (그림자 토큰) — MUSE near-black 틴트
// ============================================================
const customShadows = {
  none: 'none',
  sm: '0 0 12px rgba(20, 19, 43, 0.05)',
  md: '0 0 16px rgba(20, 19, 43, 0.07)',
  lg: '0 8px 24px rgba(20, 19, 43, 0.08)',
  xl: '0 16px 40px rgba(20, 19, 43, 0.10)',
};

// ============================================================
// 6. Breakpoints (브레이크포인트)
// ============================================================
const breakpoints = {
  values: {
    xs: 0,      // 모바일
    sm: 600,    // 태블릿 세로
    md: 900,    // 태블릿 가로
    lg: 1200,   // 데스크톱
    xl: 1536,   // 대형 데스크톱
  },
};

// ============================================================
// 7. Z-Index (레이어 순서)
// ============================================================
const zIndex = {
  mobileStepper: 1000,
  fab: 1050,
  speedDial: 1050,
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500,
};

// ============================================================
// 8. Transitions (전환 효과)
// ============================================================
const transitions = {
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195,
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
};

// ============================================================
// 9. Component Overrides (컴포넌트 오버라이드)
// ============================================================
const components = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        scrollbarWidth: 'thin',
      },
    },
  },
  // 최상위 면 — elevation 전 레벨 shadow 제거 (flat)
  MuiPaper: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        boxShadow: 'none',
      },
      elevation0: { boxShadow: 'none' },
      elevation1: { boxShadow: 'none' },
      elevation2: { boxShadow: 'none' },
      elevation3: { boxShadow: 'none' },
      elevation4: { boxShadow: 'none' },
    },
  },
  MuiAppBar: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: { boxShadow: 'none', backgroundImage: 'none' },
    },
  },
  MuiCard: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: {
        borderRadius: 24,
        boxShadow: 'none',
        backgroundImage: 'none',
      },
    },
  },
  MuiDialog: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      paper: {
        borderRadius: 24,
        boxShadow: 'none',
      },
    },
  },
  // 클리커블 요소 — pill + 사이즈 업 + elevation 제거
  MuiButton: {
    defaultProps: {
      disableElevation: true,
      disableRipple: false,
    },
    styleOverrides: {
      root: {
        borderRadius: 999,
        textTransform: 'none',
        paddingInline: 32,
        paddingBlock: 10,
        boxShadow: 'none',
        transition: 'background-color 150ms, border-color 150ms, color 150ms',
        '&:hover': { boxShadow: 'none', transform: 'none' },
        '&:active': { transform: 'none' },
      },
      sizeLarge: {
        paddingInline: 36,
        paddingBlock: 14,
        fontSize: '0.95rem',
      },
      sizeSmall: {
        paddingInline: 20,
        paddingBlock: 6,
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: 999,
        transition: 'background-color 150ms, color 150ms',
        '&:hover': { transform: 'none' },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 999,
      },
    },
  },
  // 입력 요소 — 16px radius, padding 확대, 내부 input 사이즈 업
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: 16,
      },
      input: {
        paddingBlock: 16,
        paddingInline: 18,
      },
      multiline: {
        padding: 0,
      },
    },
  },
  MuiFilledInput: {
    styleOverrides: {
      root: {
        borderRadius: 16,
      },
      input: {
        paddingBlock: 16,
        paddingInline: 18,
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      variant: 'outlined',
    },
  },
  MuiTabs: {
    styleOverrides: {
      root: { minHeight: 48 },
    },
  },
};

// ============================================================
// Theme 생성
// ============================================================
const defaultTheme = createTheme({
  palette,
  typography,
  spacing,
  shape,
  breakpoints,
  zIndex,
  transitions,
  components,
});

// 커스텀 속성 추가 (타입 확장 없이 접근 가능하도록)
defaultTheme.customShadows = customShadows;

/**
 * 대시보드 스타일 설정 (Default)
 */
defaultTheme.dashboard = {
  style: 'default',
  iconStyle: 'outlined',
  iconWeight: 400,
  cardBorderRadius: 24,
  cardColors: [
    'linear-gradient(to bottom, #F8F8FC 0%, #F8F8FC 100%)',
    'linear-gradient(to bottom, #F8F8FC 0%, #F8F8FC 100%)',
    'linear-gradient(to bottom, #F8F8FC 0%, #F8F8FC 100%)',
    'linear-gradient(to bottom, #F8F8FC 0%, #F8F8FC 100%)',
    'linear-gradient(to bottom, #F8F8FC 0%, #F8F8FC 100%)',
    'linear-gradient(to bottom, #F8F8FC 0%, #F8F8FC 100%)',
  ],
  subCardColors: [
    'linear-gradient(to bottom, #F3F3F9 0%, #F3F3F9 100%)',
    'linear-gradient(to bottom, #F3F3F9 0%, #F3F3F9 100%)',
    'linear-gradient(to bottom, #F3F3F9 0%, #F3F3F9 100%)',
    'linear-gradient(to bottom, #F3F3F9 0%, #F3F3F9 100%)',
    'linear-gradient(to bottom, #F3F3F9 0%, #F3F3F9 100%)',
    'linear-gradient(to bottom, #F3F3F9 0%, #F3F3F9 100%)',
  ],
  textColor: palette.text.primary,
  textSecondary: palette.text.secondary,
  textShadow: '0 0 0 rgba(20, 19, 43, 0)',
  backdropFilter: 'blur(0px)',
  WebkitBackdropFilter: 'blur(0px)',
  border: '1px solid transparent',
  borderColor: 'transparent',
  shadow: customShadows.lg,
  subBorder: '1px solid rgba(20, 19, 43, 0.06)',
  subShadow: '0 0 0 rgba(20, 19, 43, 0)',
  subBackdropFilter: 'blur(0px)',
  subBorderRadius: 16,
  dividerColor: 'rgba(20, 19, 43, 0.08)',
  progressHeight: 6,
  progressTrackColor: 'rgba(20, 19, 43, 0.06)',
  progressBarColor: palette.primary.main,
  progressGradient: false,
  progressBorderRadius: 999,
  background: '#FCFCFF',
  atmosphere: 'linear-gradient(to bottom, #FCFCFF 0%, #F8F8FC 100%)',
  atmosphereOpacity: 0,
  accentColor: '#4F46E5', // MUSE Accent (info.main) — 필수 강조용
  accentColors: {
    wind: '#4DB6AC',
    humidity: '#FFB74D',
    uvIndex: '#FF8A65',
    pressure: '#64B5F6',
  },
  blobs: null,
};

export default defaultTheme;

// 개별 토큰 내보내기 (문서화용)
export {
  palette,
  typography,
  spacing,
  shape,
  customShadows,
  breakpoints,
  zIndex,
  transitions,
  components,
};
