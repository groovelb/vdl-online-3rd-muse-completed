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
};

export const PROBLEM = {
  eyebrow: 'THE PROBLEM',
  title: 'AI 가 만든 디자인, 과연 내 결정이 들어갔을까요?',
  lede: '도구 대부분이 사용자에게서 결정의 주도권을 가져갑니다. 시장 발화 52 건에서 반복적으로 발견된 4 가지 패턴입니다.',
  /**
   * 각 item: T1~T4 super-theme 매핑
   * tag      = 짧은 한글 레이블
   * headline = 친근한 합니다체 한 줄 결론
   * body     = 그래서 사용자가 어떻게 되는지 풀어 쓰기 (합니다체)
   */
  items: [
    {
      tag: '결정 근거',
      headline: '디자인의 이유를 모릅니다.',
      body: '왜 이 색을 primary 로 잡았는지, 왜 이 폰트를 골랐는지. AI 는 결과는 주지만 근거는 비워둡니다. 그러니 누구한테 인계하든, 나중에 다시 손대든, 매번 처음부터 다시 설명해야 합니다.',
    },
    {
      tag: '단일 입력',
      headline: '레퍼런스가 있어도 비슷해집니다.',
      body: '도구 대부분이 입력을 하나만 받습니다. 여러 레퍼런스를 섞어서 의도에 맞게 합성하는 일, 디자이너가 진짜 잘하는 일이 작동할 자리가 없습니다.',
    },
    {
      tag: '통제권',
      headline: '결과를 내가 원하는 모양으로 다듬기 어렵습니다.',
      body: '비용도, 편집도, 외부 도구 연동도, 어느 하나 내 손에 들어와 있지 않습니다. "한 번 더 시도해 볼까" 라는 자유가 점점 사라집니다.',
    },
    {
      tag: '크래프트',
      headline: '결과보다 방식을 먼저 디자인해야 합니다.',
      body: '디자이너가 잘하는 건 결과물 자체가 아니라 그걸 만들어 내는 방식입니다. 망설임, 판단, 브랜드 어휘. 이 자리를 비워둔 채 결과만 뽑아주는 도구는 결국 안 쓰게 됩니다.',
    },
  ],
};

export const SOLUTION = {
  eyebrow: 'THE SOLUTION',
  title: '결과가 아니라 결정 을 디자인한다.',
  lede: 'MUSE 는 사용자 의도를 UX 의 입력 지점마다 박고, 모든 결정을 추적 가능하게 만든다.',
  items: [
    {
      key: 'intent',
      title: '의도가 박힌 UX',
      body: '레퍼런스 업로드, 모드 선택, 추천 카드, 활용 노트. 6 개 입력 지점에 "왜?" 가 끼워져 있다. 사용자의 의도가 모든 결정의 입력으로 명시 된다.',
    },
    {
      key: 'trace',
      title: '결정 추적',
      body: '모든 토큰에 출처 레퍼런스 + 의도 매칭 이유 + 탈락 후보가 자동 노출. 결과만 보는 게 아니라, 어떤 결정 위에서 그 결과가 나왔는지 추적할 수 있다.',
    },
    {
      key: 'mode',
      title: '모드 분기',
      body: '컨셉 잡기 / 시스템 빌드. 모드에 따라 추천 정렬, 합성 톤, export default 가 모두 분기. 사용 맥락이 결과의 톤을 결정한다.',
    },
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
  title: '결정의 출처가 박힌 디자인 시스템, 30 초 안에 시작.',
  lede: '이메일 하나로 첫 프로젝트의 결정 로그까지 받아보세요.',
  primary: '지금 시작하기',
  secondary: '이미 계정이 있나요?',
};

export const AUTH_DIALOG = {
  signin: {
    title: '바이브 디자인 시작하세요',
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
