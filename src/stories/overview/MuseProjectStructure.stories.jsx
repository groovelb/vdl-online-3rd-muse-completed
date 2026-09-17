import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  DocumentTitle,
  PageContainer,
  TreeNode,
} from '../../components/storybookDocumentation';
import projectStructure from '../../data/projectStructure.js';

export default {
  title: 'Overview/MUSE/04 Project Structure',
  parameters: {
    layout: 'padded',
  },
};

/**
 * 컴포넌트가 아닌 항목(Hook / Context / Data)의 목적과 역할 설명.
 * 파일 이름 또는 export 이름을 키로 쓴다. 없는 키는 종류만 표시한다.
 */
const DESCRIPTIONS = {
  // Context / Provider / Store
  AuthProvider: 'Provider · 로그인 세션을 앱 전체에 공급',
  MuseStoreProvider: 'Provider · 레퍼런스·프로젝트·분석 결과 전역 상태',
  museStore: 'Store · 서버 데이터를 한곳에서 읽고 쓰는 슬라이스 묶음',

  // Hooks
  useAuth: 'Hook · 로그인 상태와 사용자 정보 구독',
  useSignIn: 'Hook · 로그인 요청',
  useSignUp: 'Hook · 가입 요청',
  useSignOut: 'Hook · 로그아웃 요청',
  useReferenceArchive: 'Hook · 아카이브 검색·필터·업로드 상태',
  useInfiniteScroll: 'Hook · 화면 끝 감지 후 이어 불러오기',
  useScrollProgress: 'Hook · 스크롤 진행도 구독',
  useStaggeredSequence: 'Hook · 순차 등장 타이밍',
  useAppShell: 'Hook · 앱 셸 반응형 상태',
  useSnackbar: 'Hook · 알림 표시',

  // Data
  index: 'Data · 더미 데이터 배럴 (data/muse/index.js)',
  layers: 'Data · 레이어 키와 라벨 단일 출처',
  muse_tags_preset: 'Data · 레이어별 태그 어휘 프리셋',
  landingStage2Analysis: 'Data · 랜딩 출력 갈래가 쓰는 분석 결과',
  references: 'Data · 더미 레퍼런스 26장',
  projects: 'Data · 더미 프로젝트와 레퍼런스 큐레이션',
  analysisResults: 'Data · 프로젝트별 토큰 묶음 더미',
  userSettings: 'Data · 사용자 설정 기본값',
  aiTasks: 'Data · 자동 태깅·추천·분석 태스크 정의',
  schemas: 'Data · 데이터 타입 정의(JSDoc)',
  exampleTokens: 'Data · 예시 이미지의 자동 태깅 결과',
  layoutTaxonomyData: 'Data · 레이아웃 아키타입 사전',
  componentTokenMap: 'Data · 컴포넌트와 디자인 토큰 매핑',
  ruleRelationships: 'Data · 규칙과 스킬 관계 그래프',
  projectStructure: 'Data · 프로젝트 구조 자동 생성 데이터',
};

/** Context / Provider / Store 이름 패턴. 자식을 펼치지 않고 설명만 남긴다 */
const isContextName = (name) => /Context$|Provider$|Store$/.test(name);

/**
 * 트리 노드를 TreeNode 가 받는 중첩 객체로 바꾼다.
 * 컴포넌트는 중첩 객체로, Context·Hook·Data 는 설명 문자열 리프로 표시한다.
 *
 * @param {object} node - projectStructure 의 노드
 * @returns {object} TreeNode 용 중첩 객체
 */
function nodeToTree(node) {
  const out = {};
  const nameCount = {};

  for (const child of node.children || []) {
    // 다른 가지에서 이미 펼친 파일은 참조 리프로만 표시한다
    if (child.ref) {
      out[child.name + ' (참조)'] = '이미 펼친 가지';
      continue;
    }
    if (isContextName(child.name)) {
      out[child.name] = DESCRIPTIONS[child.name] || 'Context/Provider/Store';
      continue;
    }
    let key = child.name;
    if (nameCount[key] !== undefined) {
      nameCount[key] += 1;
      key = `${child.name}#${nameCount[key]}`;
    } else {
      nameCount[key] = 0;
    }
    out[key] = nodeToTree(child);
  }

  for (const h of node.hooks || []) {
    out[h.name] = DESCRIPTIONS[h.name] || 'Hook';
  }

  for (const d of node.data || []) {
    out[d.name] = DESCRIPTIONS[d.name] || 'Data';
  }

  return out;
}

/** Project Structure: App.jsx 를 루트로 한 전체 구조 트리 탐색기 */
export const Default = {
  render: () => {
    const root = projectStructure.root;
    const tree = nodeToTree(root);

    return (
      <>
        <DocumentTitle
          title="Project Structure"
          status="Available"
          note="App.jsx 를 루트로 한 컴포넌트 포함 관계"
          brandName="Design System"
          systemName="MUSE"
          version="1.0"
        />
        <PageContainer>
          <Typography variant="h4" sx={ { fontWeight: 700, mb: 1 } }>
            Project Structure
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={ { mb: 1 } }>
            클릭하여 펼치기/접기 | <code>src/App.jsx</code> · 재생성: <code>pnpm generate-structure</code>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={ { mb: 1 } }>
            컴포넌트는 중첩 구조로, 컴포넌트가 아닌 항목(Hook · Context · Data)은 목적과 역할 설명을 단 리프로 표시한다.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={ { mb: 3 } }>
            배럴과 동적 import 까지 따라가므로 여섯 화면이 모두 트리에 들어온다.
            같은 컴포넌트가 여러 가지에 나오면 처음 한 번만 펼치고 나머지는 참조로 접는다.
          </Typography>

          <Box sx={ { p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 } }>
            <Box sx={ { fontFamily: 'monospace' } }>
              <TreeNode keyName={ root.name } value={ tree } depth={ 0 } defaultOpen />
            </Box>
          </Box>
        </PageContainer>
      </>
    );
  },
};
