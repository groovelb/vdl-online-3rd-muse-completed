import React from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
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
import uxFlowRaw from '../../../docs/muse/02-ux-flow.md?raw';
import rlsRaw from '../../../docs/muse/appendix-rls-policies.md?raw';
import edgeRaw from '../../../docs/muse/appendix-edge-functions.md?raw';
import apiRaw from '../../../docs/muse/appendix-api-integration.md?raw';
import screenMapRaw from '../../../docs/muse/appendix-screen-component-map.md?raw';
import museStoreRaw from '../../store/museStore.jsx?raw';
import museDbRaw from '../../lib/museDb.js?raw';

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
};

/** 의사결정 흐름 격자의 열. 왼쪽 결정이 오른쪽 스펙과 화면이 된다. */
const STAGES = [
  { key: 'plan', label: '기획', doc: '01' },
  { key: 'ux', label: 'UX 시나리오', doc: '02 1절' },
  { key: 'model', label: '데이터 모델', doc: '02 3절' },
  { key: 'schema', label: '스키마 · 권한', doc: 'appendix DB · RLS' },
  { key: 'api', label: 'API · 엣지', doc: 'appendix API · Edge' },
  { key: 'screen', label: '화면', doc: 'appendix 화면 맵' },
];

/**
 * 의사결정 흐름 격자의 행. 스레드 하나가 결정 하나의 전파 경로다.
 * 칸은 짧은 라벨 한 줄과 근거 절만 둔다. null 은 그 단계에 결정이 없다는 뜻.
 */
const FLOW_THREADS = [
  {
    key: 'archive', name: '레퍼런스\n수집 · 태깅', stripe: 'primary.main',
    nodes: [
      { label: '영감 이미지를 모아 태그가 붙은 상태로 둔다', ref: '01 5절 과업 1' },
      { label: '올리면 빈 카드가 먼저 서고 태깅이 비동기로 돈다', ref: '02 1.1 단계 2~3' },
      { label: 'Reference: 소스, 레이어별 태그, 대표색, 추출값', ref: '02 3.1' },
      { label: 'reference_items, owner-only 정책', ref: 'init_schema.sql, rls_policies.sql' },
      { label: 'insert 후 같은 row update, Storage references 버킷', ref: '04 2절 시나리오 1' },
      { label: 'FileDropzone, InfiniteMasonry, ReferenceCard', ref: '화면 맵 B', story: 'Custom Component/7. Shell & Routes/ArchiveRoute' },
    ],
  },
  {
    key: 'wizard', name: '프로젝트\n생성 5단계', stripe: 'info.main',
    nodes: [
      { label: '의도와 레퍼런스를 단계마다 골라 결정을 좁힌다', ref: '01 5절 과업 2' },
      { label: '모드, 의도, 레이어, 노트, 분석 실행 다섯 단계', ref: '02 1.2' },
      { label: 'Project, ProjectReference W, Reference R', ref: '02 1.2 다루는 대상' },
      { label: 'projects, project_references, owner-via-join', ref: 'rls_policies.sql' },
      { label: 'Step 0~3 insert · update, Step 4 분석 insert', ref: '04 2절 시나리오 2' },
      { label: 'ProjectCreateWizard, ReferencePicker, AnalysisProgress', ref: '화면 맵 C · D', story: 'Custom Component/2. Project & Wizard/ProjectCreateWizard' },
    ],
  },
  {
    key: 'recommend', name: '레퍼런스\n추천', stripe: 'warning.main',
    nodes: [
      null,
      { label: 'Step 2에서 추천과 아카이브를 함께 고른다', ref: '02 5절 ReferencePicker' },
      null,
      null,
      { label: 'anthropic-messages t2-recommend', ref: 'appendix Edge Functions 함수 계약' },
      { label: 'ReferencePicker(신규, templates)', ref: '화면 맵 C', story: 'Custom Component/2. Project & Wizard/ReferencePicker' },
    ],
  },
  {
    key: 'trace', name: '결정의\n출처 · 이유', stripe: 'secondary.main',
    nodes: [
      { label: '토큰마다 출처와 이유가 함께 남는다', ref: '01 1절 한 줄 요약' },
      { label: '근거를 펼치고 끄기와 강조로 다듬는다', ref: '02 1.3 단계 3~4' },
      { label: 'AnalysisResult: decisionRationale, isEnabled, emphasis', ref: '02 3.1 비고' },
      { label: 'analysis_results, layers jsonb, owner-via-join', ref: 'init_schema.sql, rls_policies.sql' },
      { label: 'analysis_results update, anthropic-messages t3-analyze-tokens', ref: '04 2절 시나리오 3' },
      { label: 'TokenListItem, TokenDecisionTracePanel', ref: '화면 맵 E · F', story: 'Custom Component/5. Token Decision/TokenDecisionTracePanel' },
    ],
  },
  {
    key: 'auth', name: '인증 · 권한', stripe: 'success.main',
    nodes: [
      { label: '무엇을 해 주는 도구인지 보고 계정을 만든다', ref: '01 5절 과업 5' },
      { label: '가입하면 계정과 기본 설정이 함께 생긴다', ref: '02 1.5 단계 4' },
      { label: 'User(auth.users + profiles), UserSettings', ref: '02 3.2 이름 사전' },
      { label: 'profiles, user_settings, handle_new_user 트리거', ref: 'auth_profiles.sql' },
      { label: 'supabase.auth, useSignUp · useSignIn · useSignOut', ref: 'appendix API Integration 파일 구조' },
      { label: 'AuthHero, LoginForm, SignUpForm, AuthGuard', ref: '화면 맵 H', story: 'Custom Component/6. Landing & Auth/AuthPage' },
    ],
  },
];

/**
 * 문서 원문에서 헤딩 아래 첫 표를 꺼낸다. 표를 페이지에 복사하지 않고 raw import 를 자른다.
 *
 * @param {string} raw - 마크다운 원문 [Required]
 * @param {string} heading - 찾을 헤딩 문자열 (예: '### 3.2 데이터 모델 활용') [Required]
 * @returns {string[][]} 머리 행을 포함한 셀 배열. 백틱은 떼어 낸다
 */
function tableAfter(raw, heading) {
  const start = raw.indexOf(heading);
  if (start < 0) return [];
  const rows = [];
  for (const line of raw.slice(start + heading.length).split('\n')) {
    const text = line.trim();
    if (!text.startsWith('|')) {
      if (rows.length) break;
      continue;
    }
    if (/^\|[\s|:-]+\|$/.test(text)) continue;
    rows.push(text.replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim().replace(/`/g, '')));
  }
  return rows;
}

/** 02 3.1 대상 정의: [이름, 식별자, 주요 속성, 영속성] */
const DEFINITION_ROWS = tableAfter(uxFlowRaw, '### 3.1 대상 정의').slice(1);
/** 02 3.2 이름 사전: [데이터명, 한국어, 코드 식별자, 예상 테이블명, 생성 책임 페이지] */
const DICT_TABLE = tableAfter(uxFlowRaw, '### 3.2 데이터 모델 활용');
const DICT_HEAD = DICT_TABLE[0] || [];
const DICT_ROWS = DICT_TABLE.slice(1);
/** appendix RLS 정책 매트릭스: [테이블, SELECT, INSERT, UPDATE, DELETE, 패턴] */
const RLS_ROWS = tableAfter(rlsRaw, '## 정책 매트릭스').slice(1);
/** appendix Edge Functions 함수 목록의 첫 열(함수명)과 계약에 적힌 task 이름 */
const EDGE_FUNCTION = (tableAfter(edgeRaw, '## 함수 목록')[1] || [''])[0];
const EDGE_TASKS = [...new Set(edgeRaw.match(/t\d-[a-z-]+/g) || [])];
/** appendix API Integration 파일 구조: [파일, 역할] */
const API_FILE_ROWS = tableAfter(apiRaw, '## 파일 구조').slice(1);

/** supabase/migrations 원문. 파일 이름순으로 적용 순서와 같다. */
const MIGRATIONS = Object.entries(
  import.meta.glob('../../../supabase/migrations/*.sql', { eager: true, query: '?raw', import: 'default' })
)
  .map(([path, sql]) => ({ file: path.split('/').pop(), sql }))
  .sort((a, b) => a.file.localeCompare(b.file));

/**
 * 마이그레이션 원문에서 테이블 하나의 사실을 모은다.
 *
 * @param {string} table - 테이블 이름 (예: 'reference_items') [Required]
 * @returns {object} { file, touched, policies, pattern }
 */
function tableFacts(table) {
  const created = MIGRATIONS.find((item) => item.sql.includes(`create table public.${table}`));
  const touched = MIGRATIONS.filter((item) => item.sql.includes(table)).length;
  const policies = MIGRATIONS
    .flatMap((item) => [...item.sql.matchAll(/create policy "([a-z_]+)"/g)].map((hit) => hit[1]))
    .filter((name) => name.startsWith(`${ table }_`));
  const pattern = (RLS_ROWS.find((row) => row[0] === table) || [])[5] || '';
  return { file: created ? created.file : '', touched, policies, pattern };
}

/**
 * 화면 맵 문서의 그룹 표에서 컴포넌트 이름을 꺼낸다.
 *
 * @param {string} groupHeading - 그룹 헤딩 앞부분 (예: '## B.') [Required]
 * @returns {string[]} 컴포넌트 이름 목록
 */
function componentNames(groupHeading) {
  return tableAfter(screenMapRaw, groupHeading).slice(1).map((row) => row[0]);
}

/**
 * 대상 하나를 템플릿에 넣어 전개한다. 단계는 모든 대상이 같고, 슬롯 값만 대상마다 바뀐다.
 *
 * @param {string} name - 데이터명 (예: 'Reference') [Required]
 * @param {object} extra - { edge, edgeRef, group, groupLabel } 대상마다 다른 출처 [Required]
 * @returns {object[]} 블록 목록
 */
function buildBlocks(name, extra) {
  const dict = DICT_ROWS.find((row) => row[0] === name) || [];
  const definition = DEFINITION_ROWS.find((row) => row[1] === name) || [];
  const table = dict[3] || '';
  const facts = tableFacts(table);
  const hook = API_FILE_ROWS.find((row) => row[1].includes(name)) || [];
  const slice = (museStoreRaw.match(new RegExp(`export function (use${ name }\\w*Slice)`)) || [])[1] || '';
  const mappers = [...museDbRaw.matchAll(new RegExp(`export (?:async )?function (map${ name }\\w+)`, 'g'))].map((hit) => hit[1]);
  const names = componentNames(extra.group);
  return [
    { step: '1. 대상 정의', slot: definition[2], ref: '02 3.1 대상 정의' },
    { step: '2. 이름 사전', slot: `${ dict[2] } → ${ table }`, ref: `02 3.2 · 생성 책임 ${ dict[4] }` },
    { step: '3. 테이블', slot: `create table public.${ table }`, ref: `${ facts.file } 외 ${ facts.touched - 1 }개 마이그레이션` },
    { step: '4. RLS 정책', slot: `${ facts.pattern } 정책 ${ facts.policies.length }개`, ref: 'appendix RLS 정책 매트릭스', title: facts.policies.join(', ') },
    { step: '5. 엣지 함수', slot: extra.edge, ref: extra.edgeRef },
    { step: '6. 훅 계약', slot: hook[0], ref: `appendix API Integration · ${ hook[1] || '' }` },
    { step: '7. 스토어 슬라이스', slot: slice, ref: 'src/store/museStore.jsx' },
    { step: '8. DB 매퍼', slot: mappers.join(' · '), ref: 'src/lib/museDb.js snake_case ↔ camelCase' },
    { step: '9. 컴포넌트', slot: `${ extra.groupLabel } ${ names.length }개`, ref: names.join(', '), title: names.join(', ') },
  ];
}

const REFERENCE_BLOCKS = buildBlocks('Reference', {
  edge: `${ EDGE_FUNCTION } ${ EDGE_TASKS[0] }`,
  edgeRef: 'appendix Edge Functions 함수 계약',
  group: '## B.',
  groupLabel: '화면 맵 B Archive',
});
const PROJECT_BLOCKS = buildBlocks('Project', {
  edge: null,
  edgeRef: '04 2절 Step 0~3은 클라이언트가 직접 insert · update',
  group: '## C.',
  groupLabel: '화면 맵 C Project',
});

/** 스택으로 그리지 않은 나머지 대상은 이름 사전의 테이블명만 남긴다. */
const REST_ENTITIES = DICT_ROWS.filter((row) => row[0] !== 'Reference' && row[0] !== 'Project');

/**
 * 격자 칸 하나. 결정 라벨과 근거를 짧게 보여 준다.
 *
 * Props:
 * @param {object} node - { label, ref, story? } 또는 null [Required]
 * @param {string} stripe - 스레드 색 토큰 경로 [Required]
 */
function FlowCell({ node, stripe }) {
  if (!node) {
    return <Box sx={ { minHeight: 64, border: 1, borderStyle: 'dashed', borderColor: 'divider', opacity: 0.5 } } />;
  }
  return (
    <Box sx={ { minHeight: 64, borderLeft: 4, borderColor: stripe, bgcolor: 'background.paper', px: 1, py: 0.75, boxShadow: 1 } }>
      <Typography variant="caption" component="div" sx={ { fontWeight: 600, lineHeight: 1.3 } }>{ node.label }</Typography>
      <Typography variant="caption" component="div" color="text.secondary" sx={ { fontFamily: 'monospace', fontSize: 10 } }>
        { node.ref }
      </Typography>
      { node.story && <StoryRef title={ node.story }>스토리 보기</StoryRef> }
    </Box>
  );
}

/**
 * 템플릿 블록 하나. 단계(고정)는 외곽선, 대상마다 바뀌는 이름(슬롯)은 채운다.
 *
 * Props:
 * @param {object} block - { step, slot, ref, title? } [Required]
 */
function TemplateBlock({ block }) {
  return (
    <Box title={ block.title || block.ref } sx={ { border: 1, borderColor: 'divider', px: 1, py: 0.5, mb: 0.5 } }>
      <Stack direction="row" spacing={ 1 } alignItems="baseline" flexWrap="wrap" useFlexGap>
        <Typography variant="caption" sx={ { fontWeight: 600, minWidth: 108 } }>{ block.step }</Typography>
        { block.slot ? (
          <Box sx={ { bgcolor: 'info.main', color: 'info.contrastText', px: 0.75, py: 0.25 } }>
            <Typography variant="caption" sx={ { fontFamily: 'monospace', fontWeight: 700 } }>{ block.slot }</Typography>
          </Box>
        ) : (
          <Box sx={ { border: 1, borderStyle: 'dashed', borderColor: 'divider', px: 0.75, py: 0.25 } }>
            <Typography variant="caption" color="text.secondary">해당 없음</Typography>
          </Box>
        ) }
      </Stack>
      <Typography variant="caption" component="div" color="text.secondary" sx={ { fontSize: 10 } } noWrap>
        { block.ref }
      </Typography>
    </Box>
  );
}

/**
 * 템플릿 한 벌: 입력(이름 사전 행) → 블록 스택 → 출력(화면 컴포넌트).
 *
 * Props:
 * @param {string} title - 대상 이름 [Required]
 * @param {string} repeat - 반복 횟수 설명 [Required]
 * @param {string[]} inputs - 왼쪽 입력 목록 [Required]
 * @param {object[]} blocks - TemplateBlock 목록 [Required]
 * @param {string} outputLabel - 결과 화면 설명 [Required]
 * @param {string} outputStory - 결과 화면 스토리 title [Required]
 */
function TemplateStack({ title, repeat, inputs, blocks, outputLabel, outputStory }) {
  return (
    <Grid container spacing={ 2 } alignItems="stretch">
      <Grid size={ { xs: 12, md: 3 } }>
        <Typography variant="overline" color="text.secondary">입력: 02 3.2 이름 사전</Typography>
        { inputs.map((text) => (
          <Typography key={ text } variant="caption" component="div" sx={ { fontFamily: 'monospace', py: 0.25 } }>
            { text }
          </Typography>
        )) }
      </Grid>
      <Grid size={ { xs: 12, md: 6 } }>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline">
          <Typography variant="overline" color="text.secondary">{ title }</Typography>
          <Typography variant="caption" color="text.secondary">{ repeat }</Typography>
        </Stack>
        { blocks.map((block) => <TemplateBlock key={ block.step } block={ block } />) }
      </Grid>
      <Grid size={ { xs: 12, md: 3 } }>
        <Typography variant="overline" color="text.secondary">출력</Typography>
        <Typography variant="caption" component="div">{ outputLabel }</Typography>
        <StoryRef title={ outputStory }>스토리 보기</StoryRef>
      </Grid>
    </Grid>
  );
}

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
    note: '위 템플릿 구성의 입력 열이 이 표의 행이다',
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
    item: '문서 → 코드 대응(스키마 파일, 클라이언트, 스토어, 매퍼)',
    source: 'supabase/migrations, src/lib/supabase.js, src/lib/museDb.js, src/store/museStore.jsx',
    status: '있음',
    note: '템플릿 구성의 3 · 4 · 7 · 8 블록이 이 파일들에서 뽑은 값이다',
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

/** references.js, aiTasks.js, analysisResults.js 를 import 해 계산한 실데이터 개수. */
const DATA_COUNTS = [
  { label: '레퍼런스 더미 (references.js)', count: `${ references.length }건` },
  { label: 'AI 작업 프롬프트 (aiTasks.js)', count: `${ AI_TASKS.length }종` },
  { label: '분석 결과 더미 (analysisResults.js)', count: `${ Object.keys(analysisResultsByProjectId).length }건` },
];

/** 슬라이드 사고 지도(thinking/muse.js) 대응. A는 결정. */
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
  '템플릿 6번 블록의 src/hooks/data/*: 문서 계약만 있고 파일은 없음. 실제 구현은 7번(스토어 슬라이스)과 8번(DB 매퍼)이 맡는다',
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

      <SectionTitle
        title="의사결정 흐름"
        description="왼쪽 결정이 오른쪽 스펙과 화면이 된다. 행 하나가 결정 하나의 전파 경로다"
      >
        <Box sx={ { overflowX: 'auto' } }>
          <Box sx={ { display: 'grid', gridTemplateColumns: '92px repeat(6, minmax(160px, 1fr))', columnGap: 1, rowGap: 1, minWidth: 1100 } }>
            <Box />
            { STAGES.map((stage) => (
              <Box key={ stage.key } sx={ { borderBottom: 2, borderColor: 'text.primary', pb: 0.5 } }>
                <Typography variant="subtitle2">{ stage.label }</Typography>
                <Typography variant="caption" color="text.secondary" sx={ { fontFamily: 'monospace' } }>{ stage.doc }</Typography>
              </Box>
            )) }
            { FLOW_THREADS.map((thread) => (
              <React.Fragment key={ thread.key }>
                <Box sx={ { display: 'flex', alignItems: 'center' } }>
                  <Typography variant="subtitle2" sx={ { color: thread.stripe, whiteSpace: 'pre-line', lineHeight: 1.3 } }>
                    { thread.name }
                  </Typography>
                </Box>
                { thread.nodes.map((node, index) => (
                  <FlowCell key={ `${ thread.key }-${ STAGES[index].key }` } node={ node } stripe={ thread.stripe } />
                )) }
              </React.Fragment>
            )) }
          </Box>
        </Box>
        <Typography variant="caption" color="text.secondary" component="div" sx={ { mt: 1 } }>
          점선 칸은 그 단계에 결정이 없다는 뜻이다. 추천 스레드는 기획과 데이터 모델 없이 엣지 함수와 화면에서만 나타난다.
        </Typography>
      </SectionTitle>

      <SectionTitle
        title="템플릿 구성"
        description="대상 하나를 넣으면 같은 아홉 단계가 그대로 돈다. 외곽선 블록은 모든 대상에 같은 단계, 채운 블록은 대상마다 바뀌는 이름(슬롯)"
      >
        <Stack spacing={ 4 }>
          <TemplateStack
            title="Reference 전개"
            repeat={ `× ${ DICT_ROWS.length } 대상` }
            inputs={ DICT_HEAD.map((head, index) => `${ head }: ${ (DICT_ROWS.find((row) => row[0] === 'Reference') || [])[index] }`) }
            blocks={ REFERENCE_BLOCKS }
            outputLabel="Archive 화면(수집 · 태깅 · 필터)"
            outputStory="Custom Component/1. Reference & Tagging/ImageCard"
          />
          <TemplateStack
            title="Project 전개"
            repeat={ `× ${ DICT_ROWS.length } 대상` }
            inputs={ DICT_HEAD.map((head, index) => `${ head }: ${ (DICT_ROWS.find((row) => row[0] === 'Project') || [])[index] }`) }
            blocks={ PROJECT_BLOCKS }
            outputLabel="ProjectCreate 5단계 위자드"
            outputStory="Custom Component/2. Project & Wizard/ProjectCreateWizard"
          />
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={ { mt: 2 } }>
          나머지 { REST_ENTITIES.length } 대상도 같은 아홉 단계를 지난다. 블록에 마우스를 올리면 정책과 컴포넌트 전체 이름이 보인다.
        </Typography>
        <Stack direction="row" spacing={ 1 } sx={ { mt: 1 } } flexWrap="wrap" useFlexGap>
          { REST_ENTITIES.map((row) => (
            <Chip key={ row[0] } size="small" variant="outlined" label={ `${ row[0] } → ${ row[3] }` } />
          )) }
        </Stack>
        <Stack direction="row" spacing={ 2 } sx={ { mt: 2 } }>
          <Chip size="small" variant="outlined" label="외곽선: 모든 대상에 같은 단계" />
          <Chip size="small" color="info" label="채움: 대상마다 바뀌는 슬롯" />
        </Stack>
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

      <SectionTitle title="데이터 개수" description="스토리북이 쓰는 더미 데이터를 import 해서 센 값.">
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
        두 도식의 값은 docs/muse 원문과 supabase/migrations, src/store, src/lib 를 그대로 읽어 만들었다. 저장소 밖 자료는 쓰지 않았다.
      </Typography>
    </PageContainer>
  ),
};
