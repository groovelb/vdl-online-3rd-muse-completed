/**
 * landingCopy
 *
 * 랜딩 페이지(AuthPage + Hero + 섹션 5 + AuthDialog) 의 사용자 노출 텍스트 단일 진실 원천.
 * 컴포넌트는 이 파일에서만 텍스트를 임포트한다. 로컬라이제이션 분리 / QA 일괄 검수 / 카피 변경 추적 용이.
 */

export const COMMON = {
  brand: 'MUSE',
  scrollDownAria: '아래로 스크롤',
  closeAria: '닫기',
};

export const LANDING_GNB = {
  signin: '로그인',
  signup: '시작하기',
};

export const HERO = {
  desktopTitle: '바이브 디자인을 위한 영감을 관리하세요.',
  desktopSubtitle: '디자인 레퍼런스 아카이브 + 토큰 추출',
  mobileSubtitle: '바이브 디자인을 위한 영감을 관리하세요.',
  cta: '시작하기',
};

/**
 * PROBLEM
 * Hero 가 흡수한 1 문장 만 남김. 4 카드 섹션은 폐기.
 */
export const PROBLEM = {
  title: '레퍼런스로 만든 AI 의 디자인, 얼마나 이해하고 계신가요?',
};

export const SOLUTION_STAGE_1 = {
  eyebrow: '01 · INPUT LAYER',
  title: '정확한 분류 체계로 레퍼런스를 관리하세요',
  lede: '업로드 한 장이 들어오면 같은 5 layer 격자 (color, typography, layout, gradient, visual direction) 로 자동 분류됩니다. 분류가 같아야 비교, 합성, 추적이 가능합니다.',
  caption: '모든 레퍼런스가 동일한 격자 위에 정렬됩니다.',
  layerLabels: {
    color: 'Color',
    typography: 'Typography',
    layout: 'Layout',
    gradient: 'Gradient',
    visualDirection: 'Visual Direction',
  },
};

export const SOLUTION_STAGE_2 = {
  eyebrow: '02 · OUTPUT LAYER',
  title: '의도에 맞게 분석된 레퍼런스를 AI에게 학습시키세요',
  lede: '추출된 토큰과 결정 추적을 DESIGN.md ZIP 으로 export. Claude, Gemini, ChatGPT 어디에 붙여넣어도 의도까지 이해한 코드를 받을 수 있습니다.',
  caption: 'DESIGN.md ZIP 을 그대로 붙여넣으면, AI 가 의도까지 이해한 코드를 출력합니다.',
  brands: [
    { name: 'Claude',  org: 'Anthropic', color: '#DA7756' },
    { name: 'Gemini',  org: 'Google',    color: '#4285F4' },
    { name: 'ChatGPT', org: 'OpenAI',    color: '#10A37F' },
  ],
};

export const HOW_IT_WORKS = {
  eyebrow: 'HOW IT WORKS',
  title: '레퍼런스 → 결정 추적 가능한 토큰. 4 단계.',
  lede: '3 분 안에 첫 프로젝트의 결정 로그까지.',
  stepLabel: 'STEP',
  steps: [
    {
      key: 'upload',
      title: '레퍼런스 업로드',
      body: '드래그 앤 드롭으로 이미지 저장. 자동으로 5 레이어 태그 + dominant colors 가 추출되어 아카이브에 들어간다.',
    },
    {
      key: 'mode',
      title: '모드 + 의도 작성',
      body: '컨셉 / 시스템 중 모드 선택. 한 줄 의도 작성. 이 의도가 모든 후속 결정의 기준이 된다.',
    },
    {
      key: 'curate',
      title: '추천 + 큐레이션',
      body: 'AI 가 의도에 맞는 레퍼런스 Top-N 을 추천. 각 레퍼런스에서 어떤 레이어를 가져올지 사용자가 chip 으로 큐레이션.',
    },
    {
      key: 'export',
      title: '토큰 + 결정 로그 출력',
      body: 'DTCG 토큰 + DESIGN.md + decision-trace.md 동시 출력. Cursor / Claude Code / Lovable 에 그대로 투입.',
    },
  ],
};

export const PERSONAS = {
  eyebrow: "WHO IT'S FOR",
  title: '네 가지 사용자 모두를 같은 의도 모델로.',
  lede: '역할이 달라도 결정 추적은 동일한 가치를 만든다.',
  modeLabel: '추천 모드',
  items: [
    {
      code: 'P1',
      label: '비디자이너 PM / 창업자',
      quote: '디자이너 없이도 프로토타입을 만들고 싶다.',
      mode: '컨셉 잡기',
    },
    {
      code: 'P2',
      label: '시니어 디자이너',
      quote: 'AI 는 내 craft 를 못 대체한다. 그래도 가속은 필요하다.',
      mode: '시스템 빌드',
    },
    {
      code: 'P3',
      label: '디자인 시스템 엔지니어',
      quote: '토큰을 코드로 가져오는 데 30 % 가 사라진다.',
      mode: '시스템 빌드',
    },
    {
      code: 'P4',
      label: 'AI 코딩 헤비유저',
      quote: 'DESIGN.md 줘도 AI 가 결정 근거를 무시한다.',
      mode: '시스템 빌드',
    },
  ],
};

export const CTA = {
  title: '오늘 본 레퍼런스, 그대로 흘려보내지 마세요.',
  lede: '이메일 하나면 충분합니다. 첫 프로젝트의 결정 로그까지 30 초 안에 받아보실 수 있어요.',
  primary: '지금 시작하기',
  secondary: '이미 계정이 있나요?',
};

export const AUTH_DIALOG = {
  signin: {
    title: 'MUSE 시작하기',
    subtitle: '계정 정보로 로그인하세요',
    submit: '로그인',
  },
  signup: {
    title: 'MUSE 시작하기',
    subtitle: '이메일로 간편하게 가입할 수 있어요',
    submit: '회원가입',
  },
  tabs: {
    signin: '로그인',
    signup: '회원가입',
  },
  inputs: {
    email: '이메일',
    passwordSignin: '비밀번호',
    passwordSignup: '비밀번호 (6자 이상)',
  },
  submitting: '처리 중...',
};
