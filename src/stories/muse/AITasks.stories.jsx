import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import {
  AI_TASKS,
  AI_WORKFLOW_DIAGRAM,
  TAG_VOCABULARY,
  TASK_AUTO_TAG,
  TASK_RECOMMEND,
  TASK_ANALYZE_TOKENS,
} from '../../data/muse';
import {
  DocumentTitle,
  PageContainer,
  SectionTitle,
} from '../../components/storybookDocumentation';

export default {
  title: 'MUSE/AI Tasks',
  parameters: { layout: 'padded' },
};

/* ============================================
 * 공통 렌더 헬퍼
 * ============================================ */

const CodeBlock = ({ children, tone = 'light' }) => (
  <Box
    component="pre"
    sx={ {
      m: 0,
      p: 2,
      bgcolor: tone === 'dark' ? 'grey.900' : 'grey.100',
      color: tone === 'dark' ? 'grey.100' : 'text.primary',
      borderRadius: 2,
      fontSize: 12,
      lineHeight: 1.6,
      fontFamily: 'monospace',
      overflow: 'auto',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    } }
  >
    { typeof children === 'string' ? children : JSON.stringify(children, null, 2) }
  </Box>
);

const MetaRow = ({ label, value, mono = false }) => (
  <Box sx={ { display: 'flex', gap: 2, py: 0.75, borderBottom: '1px solid', borderColor: 'divider' } }>
    <Typography variant="caption" sx={ { minWidth: 120, color: 'text.secondary', fontWeight: 500 } }>
      { label }
    </Typography>
    <Typography
      variant="body2"
      sx={ { flex: 1, fontFamily: mono ? 'monospace' : 'inherit', fontSize: mono ? 12 : 14 } }
    >
      { value }
    </Typography>
  </Box>
);

/** 단일 태스크 상세 뷰 — Overview 및 개별 스토리가 공유 */
const TaskDetail = ({ task }) => (
  <Box sx={ { mb: 8 } }>
    <Box sx={ { display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 1 } }>
      <Chip
        size="small"
        label={ task.id.toUpperCase() }
        color="primary"
        variant="filled"
        sx={ { fontFamily: 'monospace' } }
      />
      <Typography variant="h5" sx={ { fontWeight: 700 } }>{ task.name }</Typography>
    </Box>
    <Typography variant="body1" color="text.secondary" sx={ { mb: 3 } }>
      { task.purpose }
    </Typography>

    {/* 메타 */}
    <Box sx={ { mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' } }>
      <MetaRow label="stage" value={ task.stage } mono />
      <MetaRow label="model" value={ task.model } mono />
      <MetaRow label="input kind" value={ task.input.kind } mono />
      <MetaRow label="est. tokens" value={ `in ${task.estCost.tokensIn} · out ${task.estCost.tokensOut}` } mono />
      <MetaRow label="cost note" value={ task.estCost.note } />
    </Box>

    {/* Input / Output Schema */}
    <SectionTitle title="Input / Output Schema" description="API 호출 시 주고받는 구조" />
    <Box sx={ { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 } }>
      <Box>
        <Typography variant="caption" color="text.secondary" sx={ { display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: '0.08em' } }>
          Input
        </Typography>
        <Typography variant="body2" sx={ { mb: 1 } }>{ task.input.description }</Typography>
        <CodeBlock>{ task.input.shape }</CodeBlock>
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary" sx={ { display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: '0.08em' } }>
          Output
        </Typography>
        <Typography variant="body2" sx={ { mb: 1 } }>{ task.output.description }</Typography>
        <CodeBlock>{ task.output.shape }</CodeBlock>
      </Box>
    </Box>

    {/* System Prompt */}
    <SectionTitle title="System Prompt" description="Anthropic messages.create의 system 필드" />
    <CodeBlock tone="dark">{ task.systemPrompt }</CodeBlock>

    {/* User message template */}
    <Box sx={ { mt: 3, mb: 3 } }>
      <SectionTitle title="User Message Template" description="변수는 {{...}} 로 표기" />
      <CodeBlock>{ task.userMessageTemplate }</CodeBlock>
    </Box>

    {/* Tool Schema */}
    <SectionTitle title="Tool Schema" description="Tool use로 구조화 출력 강제" />
    <CodeBlock>{ task.toolSchema }</CodeBlock>

    {/* Quality criteria */}
    <Box sx={ { mt: 3, mb: 3 } }>
      <SectionTitle title="Quality Criteria" description="출력 품질 평가 축" />
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={ { fontWeight: 600 } }>ID</TableCell>
              <TableCell sx={ { fontWeight: 600 } }>Label</TableCell>
              <TableCell sx={ { fontWeight: 600 } }>Type</TableCell>
              <TableCell sx={ { fontWeight: 600 } }>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            { task.qualityCriteria.map((c) => (
              <TableRow key={ c.id } hover>
                <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>{ c.id }</TableCell>
                <TableCell sx={ { fontWeight: 500 } }>{ c.label }</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={ c.type }
                    color={ c.type === 'auto' ? 'success' : 'default' }
                    variant="outlined"
                  />
                </TableCell>
                <TableCell sx={ { color: 'text.secondary', fontSize: 13 } }>{ c.description }</TableCell>
              </TableRow>
            )) }
          </TableBody>
        </Table>
      </TableContainer>
    </Box>

    {/* Golden example */}
    <SectionTitle title="Golden Example" description="기대 출력 샘플" />
    <Typography variant="body2" color="text.secondary" sx={ { mb: 1 } }>
      <strong>Input:</strong> { task.goldenExample.inputDescription }
    </Typography>
    <CodeBlock>{ task.goldenExample.expectedOutput }</CodeBlock>

    {/* Workflow */}
    <Box sx={ { mt: 3 } }>
      <SectionTitle title="Workflow" description="태스크 실행 단계" />
      <Box component="ol" sx={ { m: 0, pl: 3 } }>
        { task.workflow.map((step, i) => (
          <Box component="li" key={ i } sx={ { mb: 0.5 } }>
            <Typography variant="body2">{ step }</Typography>
          </Box>
        )) }
      </Box>
    </Box>
  </Box>
);

/* ============================================
 * Story: Overview — 3 태스크 한눈에
 * ============================================ */

export const Overview = {
  render: () => (
    <>
      <DocumentTitle
        title="AI Tasks Overview"
        status="Draft"
        note="System prompts & workflows for Claude API integration"
        brandName="MUSE"
        systemName="AI Tasks"
        version="0.1"
      />
      <PageContainer>
        <Typography variant="h4" sx={ { fontWeight: 700, mb: 1 } }>
          AI Tasks
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={ { mb: 4 } }>
          MUSE가 Claude API에 위임하는 3개 태스크의 시스템 프롬프트와 워크플로우.
          실제 호출 코드는 별도 레이어(`scripts/muse-ai/*`)에서 이 데이터를 import해 사용한다.
        </Typography>

        <SectionTitle title="Task Map" description="아카이빙 → 추천 → 분석의 3단계" />
        <TableContainer sx={ { mb: 4 } }>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={ { fontWeight: 600 } }>ID</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>Task</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>Stage</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>Model</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>Input</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>Cost</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              { AI_TASKS.map((t) => (
                <TableRow key={ t.id } hover>
                  <TableCell sx={ { fontFamily: 'monospace', fontWeight: 600 } }>{ t.id.toUpperCase() }</TableCell>
                  <TableCell>{ t.name }</TableCell>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 12, color: 'text.secondary' } }>{ t.stage }</TableCell>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>{ t.model }</TableCell>
                  <TableCell>{ t.input.kind }</TableCell>
                  <TableCell sx={ { fontSize: 12, color: 'text.secondary' } }>
                    { t.estCost.tokensIn } → { t.estCost.tokensOut }
                  </TableCell>
                </TableRow>
              )) }
            </TableBody>
          </Table>
        </TableContainer>

        <SectionTitle title="공유 어휘 (Tag Vocabulary)" description="T1 자동 태깅에서 이 외 단어 사용 금지" />
        <Box sx={ { display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 4 } }>
          { TAG_VOCABULARY.map((t) => (
            <Chip key={ t } label={ t } size="small" variant="outlined" />
          )) }
        </Box>

        <Divider sx={ { my: 4 } } />

        {/* 3 태스크 상세 */}
        { AI_TASKS.map((t) => <TaskDetail key={ t.id } task={ t } />) }
      </PageContainer>
    </>
  ),
};

/* ============================================
 * Story: T1 · T2 · T3 개별 상세
 * ============================================ */

export const T1AutoTag = {
  name: 'T1 · Auto Tag',
  render: () => (
    <PageContainer>
      <TaskDetail task={ TASK_AUTO_TAG } />
    </PageContainer>
  ),
};

export const T2Recommend = {
  name: 'T2 · Recommend',
  render: () => (
    <PageContainer>
      <TaskDetail task={ TASK_RECOMMEND } />
    </PageContainer>
  ),
};

export const T3AnalyzeTokens = {
  name: 'T3 · Analyze Tokens',
  render: () => (
    <PageContainer>
      <TaskDetail task={ TASK_ANALYZE_TOKENS } />
    </PageContainer>
  ),
};

/* ============================================
 * Story: Workflow — 전체 플로우 + 비용/모델 요약
 * ============================================ */

export const Workflow = {
  render: () => (
    <>
      <DocumentTitle
        title="AI Workflow"
        status="Draft"
        note="End-to-end AI pipeline for MUSE"
        brandName="MUSE"
        systemName="AI Tasks"
        version="0.1"
      />
      <PageContainer>
        <Typography variant="h4" sx={ { fontWeight: 700, mb: 1 } }>
          AI Workflow
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={ { mb: 4 } }>
          유저 입력부터 Export까지의 전체 AI 파이프라인
        </Typography>

        <SectionTitle title="Flow Diagram" description="Mermaid 소스" />
        <CodeBlock>{ AI_WORKFLOW_DIAGRAM }</CodeBlock>

        <Box sx={ { mt: 3 } }>
          <SectionTitle title="Stage 별 진입점" />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>Stage</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>Task</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>Trigger</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>archive.upload</TableCell>
                  <TableCell>T1 자동 태깅</TableCell>
                  <TableCell>아카이브에서 드래그앤드롭/URL 입력 완료 시</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>project.create.step2</TableCell>
                  <TableCell>T2 레퍼런스 추천</TableCell>
                  <TableCell>위자드 Step 1 완료 후 Step 2 진입 시</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>project.create.step3</TableCell>
                  <TableCell>T3 토큰 분석</TableCell>
                  <TableCell>Step 2에서 "분석 시작" 클릭 시</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box sx={ { mt: 4 } }>
          <SectionTitle title="공통 운영 원칙" />
          <Box component="ul" sx={ { m: 0, pl: 3 } }>
            <Box component="li" sx={ { mb: 1 } }>
              <Typography variant="body2">
                <strong>Tool use 강제</strong> — 3개 태스크 모두 프롬프트로만 JSON을 유도하지 않고 tool use 스키마로 구조화 출력.
              </Typography>
            </Box>
            <Box component="li" sx={ { mb: 1 } }>
              <Typography variant="body2">
                <strong>Prompt caching</strong> — 시스템 프롬프트는 캐시 히트 대상. T1의 경우 배치 27장 태깅 시 큰 비용 절감.
              </Typography>
            </Box>
            <Box component="li" sx={ { mb: 1 } }>
              <Typography variant="body2">
                <strong>자동 검증 후 1회 재시도</strong> — schema/vocab/hex 검증 실패 시 자동으로 한 번 더 호출. 두 번 실패하면 폴백.
              </Typography>
            </Box>
            <Box component="li" sx={ { mb: 1 } }>
              <Typography variant="body2">
                <strong>API 키는 로컬 env</strong> — 브라우저에서 직접 호출 금지. Node CLI 또는 Vite dev proxy 경유.
              </Typography>
            </Box>
            <Box component="li" sx={ { mb: 1 } }>
              <Typography variant="body2">
                <strong>비용 가드</strong> — T3는 이미지 N장 기반 Sonnet 호출로 가장 비쌈. 초기엔 N ≤ 4 제한.
              </Typography>
            </Box>
          </Box>
        </Box>
      </PageContainer>
    </>
  ),
};
