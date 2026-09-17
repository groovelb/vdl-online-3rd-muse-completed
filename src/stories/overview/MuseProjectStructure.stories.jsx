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
  // Context / Provider
  MuseStoreProvider: 'Provider · 레퍼런스·프로젝트·분석 결과 전역 상태',
  AuthProvider: 'Provider · 로그인 세션 상태',

  // Hooks
  useScrollProgress: 'Hook · 스크롤 진행도 구독',
  useStaggeredSequence: 'Hook · 순차 등장 타이밍',
  useInfiniteScroll: 'Hook · 화면 끝 감지 후 이어 불러오기',
  useReferenceArchive: 'Hook · 아카이브 검색·필터·업로드 상태',
  useAppShell: 'Hook · 앱 셸 반응형 상태',
  useAuth: 'Hook · 로그인 상태 소비',
  useSnackbar: 'Hook · 알림 표시',

  // Data
  layers: 'Data · 레이어 키와 라벨 단일 출처',
  muse_tags_preset: 'Data · 레이어별 태그 어휘 프리셋',
  landingStage2Analysis: 'Data · 랜딩 산출물 미리보기용 분석 결과',
  references: 'Data · 더미 레퍼런스 26장',
  projects: 'Data · 더미 프로젝트와 레퍼런스 큐레이션',
  analysisResults: 'Data · 프로젝트별 토큰 묶음 더미',
  userSettings: 'Data · 사용자 설정 기본값',
  aiTasks: 'Data · 자동 태깅·추천·분석 태스크 정의',
  schemas: 'Data · 데이터 타입 정의(JSDoc)',
  exampleTokens: 'Data · 예시 이미지의 추출 결과',
  layoutTaxonomyData: 'Data · 레이아웃 아키타입 사전',
  componentTokenMap: 'Data · 컴포넌트와 디자인 토큰 매핑',
  ruleRelationships: 'Data · 규칙과 스킬 관계 그래프',
  projectStructure: 'Data · 프로젝트 구조 자동 생성 데이터',
};

/** Context/Provider 이름 패턴 */
const isContextName = (name) => /Context$|Provider$/.test(name);

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
    if (isContextName(child.name)) {
      out[child.name] = DESCRIPTIONS[child.name] || 'Context/Provider';
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
            지금 트리는 가입·랜딩 갈래만 따라간다. 나머지 화면은 라우트 표에서 간접으로 연결돼 자동 추적에 잡히지 않는다.
            화면 전체 목록은 02 UX Flow 2.1절을 본다.
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
