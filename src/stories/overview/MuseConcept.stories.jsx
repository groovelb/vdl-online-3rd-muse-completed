import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { DocumentTitle, PageContainer, SectionTitle } from '../../components/storybookDocumentation';
import { references } from '../../data/muse/references.js';
import { AI_TASKS } from '../../data/muse/aiTasks.js';
import { analysisResultsByProjectId } from '../../data/muse/analysisResults.js';
import { storyLink } from './storyIndex.js';

export default {
  title: 'Overview/MUSE/10 Concept & Flow',
  parameters: { layout: 'padded' },
};

/** 웨비나 슬라이드(cases.js, content.js)에서 옮긴 컨셉. 값은 슬라이드 SSOT를 그대로 쓴다. */
const CONCEPT = {
  experiment: 'UX driven vibe coding',
  subtitle: '기획에서 UX 설계로 가는 정석적 흐름이 프론트 로직과 DB 연동까지 제어',
  desc: 'Figma를 건너뛰고, 텍스트 문서로만 UX 플로우와 API 스펙을 학습',
  approach: '로직 먼저',
  frame: { name: '화면에 찍히는 것만', oneLiner: '"사용자가 만족한다"는 못 씁니다. 화면에서 일어나는 일만 적습니다' },
  metaLearning: null,
};

/** 흐름 표. doc 은 문서 헤딩, artifact 는 파일 경로, storyTitle 은 storyIndex.js 로 링크를 만들 title. */
const FLOW_ROWS = [
  {
    stage: '기획',
    decided: '4개 super-theme 페인포인트에서 핵심 기능 6종(필수)을 도출',
    artifact: 'docs/muse/01-project-summary.md',
    storyTitle: 'Overview/MUSE/01 Project Summary',
  },
  {
    stage: 'UX',
    decided: '4개 시나리오, 데이터 사전 6종, 컴포넌트 리스트를 문서 표로 확정',
    artifact: 'docs/muse/02-ux-flow.md',
    storyTitle: 'Overview/MUSE/02 UX Flow',
  },
  {
    stage: '비주얼 디렉션',
    decided: 'Primary near-black, radius 규칙(클리커블만 둥글게), elevation 0',
    artifact: 'docs/muse/03-visual-direction.md',
    storyTitle: 'Overview/MUSE/03 Visual Direction',
  },
  {
    stage: '재료 준비',
    decided: 'UX 사전 → Supabase 테이블 1:1 매핑, API 계약, RLS 정책, Edge Function 계약',
    artifact: 'docs/muse/04-data-bridge.md, appendix-db-schema.md, appendix-api-integration.md',
    storyTitle: 'Overview/MUSE/08 Data Bridge',
  },
  {
    stage: '화면',
    decided: '화면 ↔ 컴포넌트 맵(재활용 20 / 수정 2 / 신규 14)을 부록으로 확정 후 구현',
    artifact: 'docs/muse/appendix-screen-component-map.md',
    storyTitle: 'Overview/MUSE/Appendix/Screen Component Map',
  },
];

/** 증거 표. status 는 '있음' | '파생' | '없음'. */
const EVIDENCE_ROWS = [
  {
    id: 'E1',
    item: '과업과 1:1인 UX 시나리오(화면에서 일어나는 일만)',
    source: '02-ux-flow.md 유저 시나리오 4종',
    status: '있음',
    note: '',
  },
  {
    id: 'E2',
    item: '데이터 모델과 이름 사전',
    source: '02-ux-flow.md 데이터 모델 활용 표(데이터명/코드 식별자/테이블명/생성 책임 페이지)',
    status: '있음',
    note: '',
  },
  {
    id: 'E3',
    item: '페이지 리스트, 계층 트리 ↔ 실제 라우트',
    source: '02-ux-flow.md 페이지 리스트 표 ↔ src/pages',
    status: '있음',
    note: 'PageComposition 스토리(라우트 트리)와 함께 대조 가능',
  },
  {
    id: 'E4',
    item: 'API 스펙, DB 스키마, 인증, RLS, Edge Function 문서',
    source: '부록 5종 전부 존재. 표를 복제하지 않고 각 부록 페이지로 링크',
    status: '있음',
    note: '',
    links: [
      'Overview/MUSE/Appendix/API Integration',
      'Overview/MUSE/Appendix/Auth Design',
      'Overview/MUSE/Appendix/DB Schema',
      'Overview/MUSE/Appendix/RLS Policies',
      'Overview/MUSE/Appendix/Edge Functions',
    ],
  },
  {
    id: 'E5',
    item: '문서 → 코드 대응(스키마 파일, 클라이언트, 훅)',
    source: 'src/lib/supabase.js, src/lib/museDb.js, src/hooks/auth/*, src/hooks/data/*',
    status: '있음',
    note: 'appendix-api-integration.md 파일 구조 표가 목록',
  },
  {
    id: 'E6',
    item: '화면 컴포넌트 맵(시나리오 단계 ↔ 컴포넌트)',
    source: 'A~H 그룹(재활용 20 / 수정 2 / 신규 14). 표를 복제하지 않고 부록 페이지로 링크',
    status: '있음',
    note: '',
    links: ['Overview/MUSE/Appendix/Screen Component Map', 'Overview/MUSE/04 Project Structure'],
  },
  {
    id: 'E7',
    item: 'Figma·목업 없이 진행한 증거(문서 결정 현황, work-log)',
    source: 'docs/work-log/001~003 (Phase1~3), docs/muse에 figma/mockup 파일 0건',
    status: '파생',
    note: '"Figma 없이 진행했다"는 명시적 선언 문서는 저장소에 없음. work-log 001~003이 문서 단계별 승인 게이트로 진행한 이력을 보여줌',
  },
];

const STATUS_COLOR = { 있음: 'success', 파생: 'info', 없음: 'default' };

/** 시나리오 ↔ 화면 ↔ 데이터 ↔ API 대응 표. 02-ux-flow.md, 04-data-bridge.md, appendix-api-integration.md 에서 파생. */
const SCENARIO_ROWS = [
  {
    scenario: '1. 레퍼런스 아카이빙',
    screen: 'Archive',
    data: 'Reference (W)',
    api: 'reference_items insert/update, Storage references 버킷, Anthropic 자동 태깅',
  },
  {
    scenario: '2. 프로젝트 생성 5-step',
    screen: 'ProjectCreate',
    data: 'Project, ProjectReference, AnalysisResult (W), Reference (R)',
    api: 'projects/project_references insert·update 단계별, analysis_results insert(Step4)',
  },
  {
    scenario: '3. 토큰 확인 + 결정 추적',
    screen: 'ProjectDetail',
    data: 'AnalysisResult (R, 편집 D), Reference (R)',
    api: 'analysis_results update (isEnabled/emphasis)',
  },
  {
    scenario: '4. 모드별 Export',
    screen: 'ProjectDetail Export',
    data: 'Project (R), AnalysisResult (R), Reference (R)',
    api: 'DB 업데이트 없음, R만으로 ZIP 구성',
  },
];

/** 문서 → 코드 파일 대응 표. appendix-api-integration.md 파일 구조 절에서 파생. */
const DOC_TO_CODE_ROWS = [
  { doc: 'appendix-api-integration.md 파일 구조', target: 'src/lib/supabase.js', role: 'client singleton + session listener' },
  { doc: 'appendix-api-integration.md 파일 구조', target: 'src/utils/supabaseError.js', role: 'Supabase 에러 코드 → 한국어 메시지' },
  { doc: 'appendix-db-schema.md 테이블 상세', target: 'supabase/migrations/*.sql', role: 'DDL 실제 적용분' },
  { doc: 'appendix-edge-functions.md 함수 계약', target: 'anthropic-messages (Edge Function)', role: 'T1/T2/T3 Anthropic 프록시' },
  { doc: '02-ux-flow.md 데이터 모델 활용 ↔ 04-data-bridge.md', target: 'src/lib/museDb.js', role: 'DB snake_case ↔ 프론트 camelCase 매퍼' },
];

/** references.js, aiTasks.js, analysisResults.js 를 import 해 계산한 실데이터 개수. */
const DATA_COUNTS = [
  { label: '레퍼런스 더미 (references.js)', count: `${ references.length }건` },
  { label: 'AI 작업 프롬프트 (aiTasks.js)', count: `${ AI_TASKS.length }종` },
  { label: '분석 결과 더미 (analysisResults.js)', count: `${ Object.keys(analysisResultsByProjectId).length }건` },
];

/** 슬라이드 사고 지도(thinking/muse.js) 대응. A는 결정, B는 필연(잠긴 것). */
const THINKING_ROWS = [
  { decision: 'A1', label: '결정의 출처와 이유를 남기는 도구', evidence: '01-project-summary.md 배경 및 목적, TokenDecisionTracePanel.jsx' },
  { decision: 'A2', label: '새 화면 없이 기존 입력 지점에 질문', evidence: '01-project-summary.md MUSE 해결 접근, ProjectCreateWizard' },
  { decision: 'A3', label: '데이터 6종과 생성 책임 페이지 고정', evidence: '02-ux-flow.md 데이터 모델 활용, schemas.js, supabase/migrations' },
  { decision: 'A4', label: '프로젝트 생성은 5단계 위자드', evidence: '02-ux-flow.md 시나리오 2 단계별, 04-data-bridge.md' },
  { decision: 'A5', label: '신규는 14개, 나머지는 재활용', evidence: '02-ux-flow.md 컴포넌트 리스트, appendix-screen-component-map.md' },
  { decision: 'A8', label: '태그 어휘를 5레이어 프리셋으로', evidence: 'work-log 013, muse_tags_preset.json' },
];

/** 없는 것 목록. */
const MISSING_ITEMS = [
  'Figma 파일 또는 목업 이미지: 저장소에 없음. 대신 01~04 + appendix 6종 텍스트 문서만으로 진행한 이력(work-log 001~003)을 근거로 씀',
  '"Figma 없이 하기로 했다"는 명시적 의사결정 문서: 저장소에 없음. 부재 자체(파일 0건)를 증거로 기록',
];

/**
 * 상태 Chip
 *
 * Props:
 * @param {string} status - '있음' | '파생' | '없음' [Required]
 */
function StatusChip({ status }) {
  return <Chip label={ status } size="small" color={ STATUS_COLOR[status] || 'default' } />;
}

/**
 * 스토리 링크. storyIndex.js 의 storyLink(title) 로 실제 주소를 만든다.
 * 없는 title 이면 글자만 남긴다(링크 없이 표시).
 *
 * Props:
 * @param {string} title - 스토리북 title 문자열 [Required]
 * @param {node} children - 링크 텍스트 [Optional, 기본값: title]
 */
function StoryRef({ title, children }) {
  const href = storyLink(title);
  if (!href) {
    return (
      <Typography component="span" variant="caption" sx={ { color: 'text.disabled' } }>
        { children || title }
      </Typography>
    );
  }
  return (
    <Typography
      component="a"
      href={ href }
      target="_top"
      variant="caption"
      sx={ { color: 'info.main', textDecoration: 'underline' } }
    >
      { children || title }
    </Typography>
  );
}

export const Default = {
  render: () => (
    <PageContainer>
      <DocumentTitle
        title="10 컨셉과 재료 흐름"
        note="UX driven vibe coding / 로직 먼저"
        brandName="MUSE"
        systemName="Concept Audit"
      />

      <SectionTitle
        title="웨비나 컨셉"
        description={ `실험: ${ CONCEPT.experiment }\n부제: ${ CONCEPT.subtitle }\n슬라이드 desc: ${ CONCEPT.desc }\n갈래: ${ CONCEPT.approach } · 프레임: ${ CONCEPT.frame.name }(${ CONCEPT.frame.oneLiner })` }
      >
        <Typography variant="body2" sx={ { mt: 1 } }>
          MUSE는 01~04 기획 문서와 appendix 6종(API/Auth/DB/Edge Function/RLS/화면 맵)이 프론트 로직과 Supabase 연동까지 그대로 이어진다.
          02-ux-flow.md의 데이터 모델 활용 표가 04-data-bridge.md의 테이블 목록, appendix-db-schema.md의 DDL로 글자 단위로 이어지고,
          appendix-screen-component-map.md의 컴포넌트 목록이 src/components 구현으로 이어진다. 저장소에 Figma나 목업 이미지 파일은 없다.
        </Typography>
      </SectionTitle>

      <SectionTitle title="흐름: 기획에서 화면까지">
        <TableContainer sx={ { border: '1px solid', borderColor: 'divider' } }>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>단계</TableCell>
                <TableCell>여기서 정한 것</TableCell>
                <TableCell>남긴 것</TableCell>
                <TableCell>보는 곳</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              { FLOW_ROWS.map((row) => (
                <TableRow key={ row.stage }>
                  <TableCell>{ row.stage }</TableCell>
                  <TableCell>{ row.decided }</TableCell>
                  <TableCell>
                    <Typography variant="caption">{ row.artifact }</Typography>
                  </TableCell>
                  <TableCell>
                    <StoryRef title={ row.storyTitle }>보기</StoryRef>
                  </TableCell>
                </TableRow>
              )) }
            </TableBody>
          </Table>
        </TableContainer>
      </SectionTitle>

      <SectionTitle title="컨셉 증거">
        <TableContainer sx={ { border: '1px solid', borderColor: 'divider' } }>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>항목</TableCell>
                <TableCell>저장소 근거</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>비고</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              { EVIDENCE_ROWS.map((row) => (
                <TableRow key={ row.id }>
                  <TableCell>{ row.id }. { row.item }</TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={ { display: 'block' } }>{ row.source }</Typography>
                    { row.links && (
                      <Stack sx={ { mt: 0.5 } } spacing={ 0.25 }>
                        { row.links.map((linkTitle) => (
                          <StoryRef key={ linkTitle } title={ linkTitle } />
                        )) }
                      </Stack>
                    ) }
                  </TableCell>
                  <TableCell>
                    <StatusChip status={ row.status } />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{ row.note }</Typography>
                  </TableCell>
                </TableRow>
              )) }
            </TableBody>
          </Table>
        </TableContainer>
      </SectionTitle>

      <SectionTitle title="컨셉별 상세" description="C-4: 시나리오가 화면과 데이터, API로 그대로 이어지는지 문서와 코드를 나란히 대조한다.">
        <Typography variant="subtitle2" sx={ { mt: 2, mb: 1 } }>시나리오 ↔ 화면 ↔ 데이터 ↔ API</Typography>
        <TableContainer sx={ { border: '1px solid', borderColor: 'divider' } }>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>시나리오</TableCell>
                <TableCell>화면</TableCell>
                <TableCell>데이터</TableCell>
                <TableCell>API / DB</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              { SCENARIO_ROWS.map((row) => (
                <TableRow key={ row.scenario }>
                  <TableCell>{ row.scenario }</TableCell>
                  <TableCell>{ row.screen }</TableCell>
                  <TableCell>
                    <Typography variant="caption">{ row.data }</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{ row.api }</Typography>
                  </TableCell>
                </TableRow>
              )) }
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="subtitle2" sx={ { mt: 3, mb: 1 } }>문서 → 코드 파일 대응</Typography>
        <TableContainer sx={ { border: '1px solid', borderColor: 'divider' } }>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>문서</TableCell>
                <TableCell>코드</TableCell>
                <TableCell>역할</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              { DOC_TO_CODE_ROWS.map((row) => (
                <TableRow key={ row.target }>
                  <TableCell>
                    <Typography variant="caption">{ row.doc }</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{ row.target }</Typography>
                  </TableCell>
                  <TableCell>{ row.role }</TableCell>
                </TableRow>
              )) }
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="subtitle2" sx={ { mt: 3, mb: 1 } }>데이터 개수(실데이터 import 계산)</Typography>
        <Stack direction="row" spacing={ 2 } flexWrap="wrap" useFlexGap>
          { DATA_COUNTS.map((item) => (
            <Box key={ item.label } sx={ { border: '1px solid', borderColor: 'divider', px: 2, py: 1 } }>
              <Typography variant="caption" color="text.secondary">{ item.label }</Typography>
              <Typography variant="body2" sx={ { fontWeight: 700 } }>{ item.count }</Typography>
            </Box>
          )) }
        </Stack>
      </SectionTitle>

      <SectionTitle title="없는 것">
        <Stack spacing={ 1 }>
          { MISSING_ITEMS.map((text) => (
            <Typography key={ text } variant="body2">{ text }</Typography>
          )) }
        </Stack>
      </SectionTitle>

      <SectionTitle title="슬라이드 사고 지도 대응" description="VDL thinking/muse.js 의 결정(A) 중 이 컨셉과 닿는 것만.">
        <TableContainer sx={ { border: '1px solid', borderColor: 'divider' } }>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>결정</TableCell>
                <TableCell>라벨</TableCell>
                <TableCell>이 페이지의 근거</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              { THINKING_ROWS.map((row) => (
                <TableRow key={ row.decision }>
                  <TableCell>{ row.decision }</TableCell>
                  <TableCell>{ row.label }</TableCell>
                  <TableCell>
                    <Typography variant="caption">{ row.evidence }</Typography>
                  </TableCell>
                </TableRow>
              )) }
            </TableBody>
          </Table>
        </TableContainer>
      </SectionTitle>

      <Typography variant="caption" color="text.secondary" sx={ { display: 'block', mt: 4 } }>
        이 페이지의 모든 표는 저장소의 문서, 데이터, 스크립트에서 파생했다. 저장소 밖 자료는 쓰지 않았다.
      </Typography>
    </PageContainer>
  ),
};
