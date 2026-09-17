/**
 * MUSE 조립 순서
 *
 * 리서치에서 시작해 Supabase 연결로 끝나는 일곱 단계. 각 단계가 어떤 자료를 먹고
 * 어떤 화면으로 나오는지 한곳에 모은다.
 *
 * 쓰는 곳:
 *  - `Overview/MUSE/09 Domain Knowledge & Research` (단계별 자료와 링크)
 *  - `Custom Component/0. Hierarchy` (화면 계층 위에 단계 라벨)
 *
 * `storyTitles` 는 스토리북 title 문자열이다. 링크는 읽는 쪽에서 만든다.
 */

/** @type {Array<{id:string,no:number,title:string,summary:string,sources:string[],storyTitles:string[]}>} */
export const assemblySteps = [
  {
    id: 'research',
    no: 1,
    title: '리서치',
    summary: '무엇이 문제인지 52건 출처로 확인하고 네 갈래로 묶는다. 이후 모든 결정의 근거가 된다.',
    sources: [
      'docs/research/01-design-md-painpoints-raw.md',
      'docs/research/02-painpoints-qualitative-analysis.md',
      'docs/research/03-product-priority-roadmap.md',
      'docs/research/04-ux-intervention-roadmap.md',
      'docs/work-log/001~003',
    ],
    storyTitles: ['Overview/MUSE/01 Project Summary'],
  },
  {
    id: 'model',
    no: 2,
    title: '데이터 모델',
    summary: '다루는 대상 여섯을 정하고 이름을 한 번만 짓는다. 타입 정의와 더미 데이터가 같은 이름을 쓴다.',
    sources: [
      'src/data/muse/schemas.js',
      'src/data/muse/references.js',
      'src/data/muse/projects.js',
      'src/data/muse/userSettings.js',
      'docs/muse/02-ux-flow.md',
    ],
    storyTitles: ['Overview/MUSE/02 UX Flow', 'Overview/MUSE/05 Reference Data'],
  },
  {
    id: 'tagging',
    no: 3,
    title: '태깅 어휘와 화면',
    summary: '레이어별 태그 어휘를 프리셋으로 고정하고, 그 어휘만 고르는 입력과 카드를 만든다.',
    sources: [
      'src/data/muse/tag/muse_tags_preset.json',
      'src/data/muse/layers.js',
      'docs/taxonomy-v0.4.md',
      'docs/taxonomy-index.md',
    ],
    storyTitles: [
      'Custom Component/1. Reference & Tagging/ReferenceCard',
      'Custom Component/1. Reference & Tagging/ReferenceLayerChipRow',
      'Custom Component/1. Reference & Tagging/ReferenceDetailDialog',
    ],
  },
  {
    id: 'ai',
    no: 4,
    title: 'AI 흐름',
    summary: '태깅, 추천, 토큰 합성 세 태스크의 입력과 출력 형식을 정하고 결정 근거를 함께 받게 한다.',
    sources: [
      'src/data/muse/aiTasks.js',
      'src/data/muse/analysisResults.js',
      'src/data/exampleTokens.json',
      'docs/spec/design-md-alpha.md',
      'docs/research/06-platform-output-design-strategy.md',
    ],
    storyTitles: [
      'Custom Component/4. AI Flow & Output/AnalysisProgress',
      'Custom Component/4. AI Flow & Output/DesignMdPreview',
      'Overview/MUSE/Appendix/AI Tasks',
    ],
  },
  {
    id: 'archive',
    no: 5,
    title: '아카이브',
    summary: '모은 레퍼런스를 폭에 맞춰 늘어놓고 검색, 태그, 대표색 세 축으로 좁힌다.',
    sources: ['src/data/muse/references.js', 'src/data/muse/dummyImage'],
    storyTitles: [
      'Custom Component/3. Archive & Filter/ArchivePage',
      'Custom Component/3. Archive & Filter/FilterPanel',
      'Custom Component/3. Archive & Filter/InfiniteMasonry',
    ],
  },
  {
    id: 'compose',
    no: 6,
    title: '프로젝트 조합',
    summary: '모드와 의도를 받고 레퍼런스마다 쓸 레이어를 골라 토큰을 합성한다. 토큰마다 근거가 붙는다.',
    sources: [
      'src/data/muse/projects.js',
      'src/data/muse/analysisResults.js',
      'src/data/landingStage2Analysis.json',
      'docs/muse/03-visual-direction.md',
    ],
    storyTitles: [
      'Custom Component/2. Project & Wizard/ProjectCreateWizard',
      'Custom Component/5. Token Decision/TokenDecisionTracePanel',
      'Overview/MUSE/06 Content Data',
    ],
  },
  {
    id: 'supabase',
    no: 7,
    title: 'Supabase 연결',
    summary: '이름 사전을 테이블로 옮기고 소유자 기준 접근 규칙과 서버 함수를 붙인다.',
    sources: [
      'docs/muse/04-data-bridge.md',
      'docs/muse/appendix-db-schema.md',
      'docs/muse/appendix-rls-policies.md',
      'docs/muse/appendix-auth-design.md',
      'docs/muse/appendix-edge-functions.md',
      'docs/muse/appendix-api-integration.md',
    ],
    storyTitles: [
      'Custom Component/6. Landing & Auth/AuthGuard',
      'Custom Component/7. Shell & Routes/AdminRoute',
    ],
  },
];

/** 단계 id 로 찾기 */
export const assemblyStepById = Object.fromEntries(assemblySteps.map((s) => [s.id, s]));

/**
 * 학습시킨 도메인 지식 목록.
 *
 * 이름 / 내용 / 출처 / 흘러간 곳 / 보이는 곳 다섯 칸으로 적는다.
 * `step` 은 위 조립 순서의 id 다.
 */
export const knowledgeSources = [
  {
    name: 'schemas.js',
    path: 'src/data/muse/schemas.js',
    what: '다루는 대상 여섯과 토큰 타입 21종의 정의',
    origin: '기획 02 UX Flow 의 데이터 모델을 타입으로 옮김',
    flowedTo: '더미 데이터, 스토어, AI 태스크 출력 검증',
    seenAt: 'Overview/MUSE/05 Reference Data',
    step: 'model',
  },
  {
    name: 'muse_tags_preset.json',
    path: 'src/data/muse/tag/muse_tags_preset.json',
    what: '레이어별 태그 어휘와 각 어휘의 뜻',
    origin: '레이아웃·타이포 분류 체계를 좁혀 만든 프리셋',
    flowedTo: '자동 태깅 프롬프트, 필터, 랜딩 어휘 띠',
    seenAt: 'Overview/MUSE/05 Reference Data',
    step: 'tagging',
  },
  {
    name: 'layers.js',
    path: 'src/data/muse/layers.js',
    what: '레이어 키와 자리별 라벨 네 벌',
    origin: '다섯 파일에 흩어져 있던 라벨을 통합',
    flowedTo: '탭, chip, 편집 패널, 랜딩 설명',
    seenAt: 'Overview/MUSE/06 Content Data',
    step: 'tagging',
  },
  {
    name: 'references.js',
    path: 'src/data/muse/references.js',
    what: '태그와 추출값이 붙은 더미 레퍼런스 26장',
    origin: '실제 이미지 26장에 프리셋 어휘를 규칙대로 배분',
    flowedTo: '아카이브, 추천, 랜딩 배경',
    seenAt: 'Overview/MUSE/05 Reference Data',
    step: 'archive',
  },
  {
    name: 'projects.js',
    path: 'src/data/muse/projects.js',
    what: '모드와 의도, 레퍼런스 큐레이션을 가진 프로젝트 8건',
    origin: '위자드 다섯 단계의 산출 형태를 손으로 채운 예',
    flowedTo: '목록 카드, 상세 화면, 분석 결과 연결',
    seenAt: 'Overview/MUSE/05 Reference Data',
    step: 'compose',
  },
  {
    name: 'aiTasks.js',
    path: 'src/data/muse/aiTasks.js',
    what: '태깅·추천·토큰 합성 태스크의 입력, 출력 스키마, 모델',
    origin: '실제 호출에 쓰는 프롬프트와 스키마를 그대로 옮김',
    flowedTo: '분석 진행 화면, 산출물 문서, 플레이그라운드',
    seenAt: 'Overview/MUSE/Appendix/AI Tasks',
    step: 'ai',
  },
  {
    name: 'analysisResults.js',
    path: 'src/data/muse/analysisResults.js',
    what: '프로젝트별 레이어 토큰과 결정 근거 더미',
    origin: '토큰 합성 태스크의 출력 형태를 손으로 채운 예',
    flowedTo: '토큰 편집, 근거 펼침, 내보내기',
    seenAt: 'Overview/MUSE/05 Reference Data',
    step: 'compose',
  },
  {
    name: 'userSettings.js',
    path: 'src/data/muse/userSettings.js',
    what: '모델, 저장 방식, 화면 밝기, 자동 태깅 기본값',
    origin: '설정 화면의 네 축을 기본값으로 고정',
    flowedTo: '설정 화면, 스토어 초기값',
    seenAt: 'Overview/MUSE/05 Reference Data',
    step: 'model',
  },
  {
    name: 'exampleTokens.json',
    path: 'src/data/exampleTokens.json',
    what: '예시 이미지 19장의 자동 태깅 실제 결과',
    origin: '실제 모델 호출로 뽑은 제목·대표색·태그',
    flowedTo: '랜딩 배경 툴팁, 데모 카드',
    seenAt: 'Overview/MUSE/07 Assets',
    step: 'ai',
  },
  {
    name: 'landingStage2Analysis.json',
    path: 'src/data/landingStage2Analysis.json',
    what: '랜딩이 보여 주는 산출물 예시. 토큰 27개와 근거',
    origin: '실제 합성 결과를 랜딩용으로 한 벌 고정',
    flowedTo: '랜딩 출력 갈래 화면',
    seenAt: 'Overview/MUSE/06 Content Data',
    step: 'compose',
  },
  {
    name: '페인포인트 정성 리서치',
    path: 'docs/research/01~04',
    what: '52건 출처, 네 갈래 문제, 개입 지점 여섯',
    origin: '공개 기사와 커뮤니티 인용을 모아 3라운드로 분석',
    flowedTo: '기획 01 배경, 입력 지점 설계, 성공 지표',
    seenAt: 'Overview/MUSE/01 Project Summary',
    step: 'research',
  },
  {
    name: '스토리북 등록 계획',
    path: 'docs/research/05-storybook-registration-plan.md',
    what: '무엇을 어떤 분류로 등록할지의 기준',
    origin: '컴포넌트가 늘면서 분류가 흐려진 것을 정리한 문서',
    flowedTo: '지금의 Custom Component 여덟 갈래',
    seenAt: 'Custom Component/0. Hierarchy',
    step: 'research',
  },
  {
    name: '플랫폼 산출물 설계',
    path: 'docs/research/06-platform-output-design-strategy.md',
    what: '외부 도구가 받아 쓰는 산출물의 형태',
    origin: '코딩 도구가 결정 근거를 무시하는 문제에서 출발',
    flowedTo: '모드별 내보내기, 설계 문서 형식',
    seenAt: 'Custom Component/4. AI Flow & Output/ThemeExportDialog',
    step: 'ai',
  },
  {
    name: '설계 문서 규격',
    path: 'docs/spec/design-md-alpha.md',
    what: '토큰과 결정 로그를 담는 문서 규격',
    origin: '외부 규격을 참고해 이 프로젝트용으로 정리',
    flowedTo: '산출물 미리보기와 내보내기 본문',
    seenAt: 'Custom Component/4. AI Flow & Output/DesignMdPreview',
    step: 'ai',
  },
  {
    name: '레이아웃 분류 체계',
    path: 'docs/taxonomy-v0.4.md · docs/taxonomy-index.md',
    what: '레이아웃 아키타입과 카테고리 사전',
    origin: '레이아웃 어휘를 한 벌로 묶은 사전',
    flowedTo: '시각 방향 03 2절 아키타입, 태그 어휘',
    seenAt: 'Overview/MUSE/03 Visual Direction',
    step: 'tagging',
  },
  {
    name: '기획 결정 기록',
    path: 'docs/work-log/001~003',
    what: '기획 세 단계에서 무엇을 왜 정했는지',
    origin: '실제 작업 세션 기록',
    flowedTo: '기획 문서 3종의 결정 현황 근거',
    seenAt: 'Overview/MUSE/01 Project Summary',
    step: 'research',
  },
  {
    name: '데이터 다리 문서',
    path: 'docs/muse/04-data-bridge.md',
    what: '이름 사전이 어느 테이블이 되고 언제 갱신되는지',
    origin: '기획 02 의 이름 사전을 서버 쪽으로 이은 문서',
    flowedTo: '테이블 설계, 스토어 매핑',
    seenAt: 'Overview/MUSE/02 UX Flow',
    step: 'supabase',
  },
  {
    name: 'Supabase 부록 6종',
    path: 'docs/muse/appendix-*.md',
    what: '테이블 6개, 접근 규칙, 서버 함수, 가입 흐름, 외부 호출',
    origin: '실제 마이그레이션과 정책에서 역으로 정리',
    flowedTo: '스토어 질의, 가드, 관리자 화면',
    seenAt: 'Custom Component/7. Shell & Routes/AdminRoute',
    step: 'supabase',
  },
];
