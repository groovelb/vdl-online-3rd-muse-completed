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
  TASK_AUTO_TAG,
  TASK_RECOMMEND,
  TASK_ANALYZE_TOKENS,
  TOKEN_LAYERS,
  VISUAL_DIRECTION_CATEGORIES,
  getLayerTags,
  getVisualDirectionTags,
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

/* ============================================
 * 새 구조: 인풋 → 프롬프트 → 아웃풋 요약 + UX + 데이터 모델
 * ============================================ */

/** 1) 최상단 — Input → Prompt → Output 3-step 요약 (한눈에 본다) */
/** 항목 / 설명 / 데이터 예시 3-열 — 각 컬럼 안에서 빠르게 스캔 */
const FieldRows = ({ rows }) => (
  <Box sx={ { display: 'flex', flexDirection: 'column' } }>
    { /* 헤더 */ }
    <Box
      sx={ {
        display: 'grid',
        gridTemplateColumns: '110px 1fr',
        gap: 1,
        px: 0.5,
        pb: 0.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
      } }
    >
      <Typography variant="caption" sx={ { fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em' } }>
        항목
      </Typography>
      <Typography variant="caption" sx={ { fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em' } }>
        설명
      </Typography>
    </Box>
    { rows.map((r) => (
      <Box
        key={ r.name }
        sx={ {
          py: 1,
          borderBottom: '1px dashed',
          borderColor: 'divider',
          '&:last-of-type': { borderBottom: 'none' },
        } }
      >
        <Box sx={ { display: 'grid', gridTemplateColumns: '110px 1fr', gap: 1, alignItems: 'baseline' } }>
          <Typography sx={ { fontFamily: 'monospace', fontSize: 13, fontWeight: 600 } }>
            { r.name }
          </Typography>
          <Typography variant="body2" sx={ { fontSize: 13 } }>
            { r.desc }
          </Typography>
        </Box>
        { r.example && (
          <Box sx={ { mt: 0.75, pl: '110px' } }>
            <Typography
              sx={ {
                fontFamily: 'monospace',
                fontSize: 11,
                color: 'text.secondary',
                bgcolor: 'grey.100',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                display: 'inline-block',
                maxWidth: '100%',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              } }
            >
              { r.example }
            </Typography>
          </Box>
        ) }
      </Box>
    )) }
  </Box>
);

const IOPipelineSummary = ({ task, io }) => (
  <Box sx={ { mb: 5 } }>
    <SectionTitle title="① 데이터 형식 요약" description="Input → Prompt → Output 한눈에" />
    <Box
      sx={ {
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
        gap: 2,
      } }
    >
      { [
        { label: 'INPUT', hint: `kind: ${task.input.kind}`, description: task.input.description, rows: io?.input },
        { label: 'PROMPT', hint: `model: ${task.model}`, description: `system prompt + tool schema 로 구조화 출력 강제`, prompt: true },
        { label: 'OUTPUT', hint: `tokens out ~${task.estCost.tokensOut}`, description: task.output.description, rows: io?.output },
      ].map((col) => (
        <Box
          key={ col.label }
          sx={ {
            p: 2,
            borderRadius: 2,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          } }
        >
          <Typography
            sx={ {
              fontFamily: 'monospace',
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: '0.08em',
              pb: 1,
              borderBottom: '1px solid',
              borderColor: 'divider',
            } }
          >
            { col.label }
          </Typography>
          <Typography variant="caption" sx={ { color: 'text.secondary', fontFamily: 'monospace' } }>
            { col.hint }
          </Typography>
          <Typography variant="body2">{ col.description }</Typography>
          { col.prompt
            ? <CodeBlock>{ task.systemPrompt }</CodeBlock>
            : col.rows && col.rows.length > 0
              ? <FieldRows rows={ col.rows } />
              : <CodeBlock>{ col.label === 'INPUT' ? task.input.shape : task.output.shape }</CodeBlock> }
        </Box>
      )) }
    </Box>
  </Box>
);

/** 1.5) Input 출처별 분류 — 사용자 액션 / DB / 시스템 / 모델 파라미터 / 받지 않음 */
const INPUT_CATEGORY_META = {
  user: { label: '사용자 액션', color: 'primary' },
  db: { label: 'DB 데이터', color: 'success' },
  system: { label: '시스템 리소스', color: 'default' },
  model: { label: '모델 파라미터', color: 'secondary' },
  callback: { label: '콜백', color: 'info' },
  none: { label: '받지 않음', color: 'error' },
};

const InputBreakdown = ({ inputs }) => {
  const grouped = inputs.reduce((acc, row) => {
    (acc[row.category] = acc[row.category] || []).push(row);
    return acc;
  }, {});
  const orderedKeys = ['user', 'db', 'system', 'model', 'callback', 'none'].filter((k) => grouped[k]);

  return (
    <Box sx={ { mb: 5 } }>
      <SectionTitle title="Input 출처별 분류" description="이 태스크가 한 번 호출될 때 무엇이 어디서 들어오는지" />
      <TableContainer
        sx={ {
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        } }
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={ { fontWeight: 600, width: 140 } }>분류</TableCell>
              <TableCell sx={ { fontWeight: 600, width: 220 } }>항목</TableCell>
              <TableCell sx={ { fontWeight: 600, width: 220 } }>출처</TableCell>
              <TableCell sx={ { fontWeight: 600 } }>비고</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            { orderedKeys.flatMap((catKey) => {
              const meta = INPUT_CATEGORY_META[catKey];
              return grouped[catKey].map((row, i) => (
                <TableRow key={ `${catKey}-${i}` } hover>
                  <TableCell>
                    { i === 0 ? (
                      <Chip
                        size="small"
                        label={ meta.label }
                        color={ meta.color }
                        variant={ catKey === 'none' ? 'outlined' : 'filled' }
                      />
                    ) : null }
                  </TableCell>
                  <TableCell sx={ { fontFamily: row.mono === false ? 'inherit' : 'monospace', fontSize: 13 } }>
                    { row.item }
                  </TableCell>
                  <TableCell sx={ { fontSize: 13, color: 'text.secondary' } }>{ row.source }</TableCell>
                  <TableCell sx={ { fontSize: 13, color: 'text.secondary' } }>{ row.note || '—' }</TableCell>
                </TableRow>
              ));
            }) }
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

/** 2) 중단 — UX 설명 (사용자 관점 쉬운 요약) */
const UXExplanation = ({ task, uxFlow }) => (
  <Box sx={ { mb: 5 } }>
    <SectionTitle title="② UX 흐름" description="사용자 입장에서 언제·어떻게 호출되는지" />
    <Box
      sx={ {
        p: 3,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      } }
    >
      <Typography variant="body1" sx={ { mb: 2, fontWeight: 500 } }>
        { uxFlow.summary }
      </Typography>
      <Box component="ol" sx={ { m: 0, pl: 3, display: 'flex', flexDirection: 'column', gap: 1 } }>
        { uxFlow.steps.map((step, i) => (
          <Box component="li" key={ i }>
            <Typography variant="body2">{ step }</Typography>
          </Box>
        )) }
      </Box>
      { uxFlow.note && (
        <Box sx={ { mt: 2, p: 1.5, bgcolor: 'grey.100', borderRadius: 1.5 } }>
          <Typography variant="caption" sx={ { color: 'text.secondary' } }>
            <strong>핵심:</strong> { uxFlow.note }
          </Typography>
        </Box>
      ) }
    </Box>
    <Box sx={ { mt: 2 } }>
      <Typography variant="caption" sx={ { color: 'text.secondary', fontFamily: 'monospace' } }>
        Trigger stage: { task.stage } · Estimated cost: in { task.estCost.tokensIn } → out { task.estCost.tokensOut } tokens · { task.estCost.note }
      </Typography>
    </Box>
  </Box>
);

/** 3) 하단 — 관련 데이터 모델 (이 태스크가 읽고/쓰는 스키마) */
const RelatedDataModel = ({ dataModel }) => (
  <Box sx={ { mb: 5 } }>
    <SectionTitle title="③ 관련 데이터 모델" description="이 태스크가 읽거나 쓰는 스키마 / 어휘" />
    <Box sx={ { display: 'flex', flexDirection: 'column', gap: 3 } }>
      { dataModel.fields && (
        <Box>
          <Typography variant="caption" sx={ { display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, color: 'text.secondary' } }>
            영향받는 스키마 필드
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>Path</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>Type</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>R/W</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>Note</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                { dataModel.fields.map((f, i) => (
                  <TableRow key={ i } hover>
                    <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>{ f.path }</TableCell>
                    <TableCell sx={ { fontFamily: 'monospace', fontSize: 12, color: 'text.secondary' } }>{ f.type }</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={ f.access }
                        color={ f.access === 'write' ? 'primary' : f.access === 'read' ? 'default' : 'secondary' }
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell sx={ { fontSize: 13, color: 'text.secondary' } }>{ f.note }</TableCell>
                  </TableRow>
                )) }
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ) }

      { dataModel.vocabulary && (
        <Box>
          <Typography variant="caption" sx={ { display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, color: 'text.secondary' } }>
            { dataModel.vocabularyLabel || '관련 어휘' }
          </Typography>
          <Box sx={ { display: 'flex', flexDirection: 'column', gap: 1.5 } }>
            { dataModel.vocabulary.map((v) => (
              <Box key={ v.label }>
                <Typography variant="caption" sx={ { display: 'block', mb: 0.5, fontFamily: 'monospace', color: 'text.secondary' } }>
                  { v.label }
                </Typography>
                <Box sx={ { display: 'flex', gap: 0.5, flexWrap: 'wrap' } }>
                  { v.tags.map((t) => (
                    <Chip key={ t } label={ t } size="small" variant="outlined" />
                  )) }
                </Box>
              </Box>
            )) }
          </Box>
        </Box>
      ) }

      { dataModel.persistence && (
        <Box sx={ { p: 2, bgcolor: 'grey.100', borderRadius: 1.5 } }>
          <Typography variant="caption" sx={ { display: 'block', mb: 0.5, fontWeight: 600 } }>
            저장 위치
          </Typography>
          <Typography variant="body2">{ dataModel.persistence }</Typography>
        </Box>
      ) }
    </Box>
  </Box>
);

/** 새 구조 — IO 요약 → Input 분류 → UX → 데이터 모델 순으로 쌓아 보여줌 */
const StructuredTaskDetail = ({ task, uxFlow, dataModel, inputs, io }) => (
  <Box>
    <Box sx={ { display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 1 } }>
      <Chip
        size="small"
        label={ task.id.toUpperCase() }
        color="primary"
        variant="filled"
        sx={ { fontFamily: 'monospace' } }
      />
      <Typography variant="h4" sx={ { fontWeight: 700 } }>{ task.name }</Typography>
    </Box>
    <Typography variant="body1" color="text.secondary" sx={ { mb: 4 } }>
      { task.purpose }
    </Typography>

    <IOPipelineSummary task={ task } io={ io } />
    { inputs && (
      <>
        <Divider sx={ { my: 4 } } />
        <InputBreakdown inputs={ inputs } />
      </>
    ) }
    <Divider sx={ { my: 4 } } />
    <UXExplanation task={ task } uxFlow={ uxFlow } />
    <Divider sx={ { my: 4 } } />
    <RelatedDataModel dataModel={ dataModel } />
  </Box>
);

/* ============================================
 * 태스크별 UX·데이터모델 카피 (스토리북 전용 큐레이션)
 * ============================================ */

const T1_UX = {
  summary: '아카이브에 이미지를 추가하면 한 번의 호출로 태그 + 대표 색상 + 디자인 토큰까지 전부 추출된다 (확장 schema).',
  steps: [
    '사용자가 ArchivePage에서 이미지를 드래그/파일/URL로 업로드 → store 가 placeholder reference 를 먼저 만들고 카드에 "태깅 중…" 뱃지 표시.',
    '백그라운드에서 `runAutoTag` (Haiku 4.5 vision) 1회 호출 — 5 레이어 태그 + dominantColors + title + extracted (palette/typography/layout/gradient) 를 확장 tool schema 로 한 번에 받음.',
    '결과를 `updateReference` 로 머지 — 태그 chip · dominantColors swatch · 디테일 모달 메타가 모두 채워짐.',
    '재시도: `runAutoTag` 내부 자동 3회 (network/429/5xx/tool_use 누락) + store 레벨 `addReference` 자체도 1회 재시도. 두 단계 모두 실패 시 `_tagError` 로 카드에 "태깅 실패 + 다시 시도" UI 표시 (수동 무한).',
  ],
  note: '예전엔 T1(태깅) + T3(토큰 추출)이 두 번 호출이었으나 세션 023에서 통합 — 업로드 시점에 T1 한 번으로 끝. 카드의 dominantColors swatch도 T1 산출물이다.',
};

const T1_DATA = {
  fields: [
    { path: 'references[].tags.color[]', type: 'string[]', access: 'write', note: '`color` 레이어 enum (Muted/Vivid/Pastel…)' },
    { path: 'references[].tags.typography[]', type: 'string[]', access: 'write', note: '`typography` 레이어 enum (Serif/Mono…)' },
    { path: 'references[].tags.layout[]', type: 'string[]', access: 'write', note: 'Bento, Grid, Editorial 등' },
    { path: 'references[].tags.gradient[]', type: 'string[]', access: 'write', note: 'Mesh, Linear 등 (없으면 빈 배열)' },
    { path: 'references[].tags.visualDirection.{genre|style|subject}[]', type: 'string[]', access: 'write', note: 'Y2K, Brutalist 등' },
    { path: 'references[].dominantColors[]', type: 'hex string[]', access: 'write', note: '대표 색상 3~5개 — 카드 swatch · 색상 필터 매칭 소스' },
    { path: 'references[].title', type: 'string', access: 'write', note: '디자인 톤 서술 (예: "Editorial Layout")' },
    { path: 'references[].extracted.{palette|typography|layout|gradient}', type: 'object[]', access: 'write', note: 'T3 합성 단계의 입력. 업로드 시점에 같이 추출 — 프로젝트 만들 때 vision 재호출 안 함' },
    { path: 'references[]._pending / _tagError', type: 'flag', access: 'write', note: '태깅 중/실패 상태 — 카드 오버레이 표시용' },
  ],
  vocabularyLabel: '태그 어휘 (preset enum, preset 외 금지)',
  vocabulary: [
    ...TOKEN_LAYERS.map((l) => ({ label: l, tags: getLayerTags(l) })),
    ...VISUAL_DIRECTION_CATEGORIES.map((c) => ({ label: `visualDirection · ${c}`, tags: getVisualDirectionTags(c) })),
  ],
  persistence: 'Supabase `references` 테이블 — `tags` (jsonb) + `dominant_colors` (text[]) + `extracted` (jsonb) + `title` (text).',
};

const T2_UX = {
  summary: '프로젝트 의도 텍스트를 주면, 아카이브에서 어울릴 만한 레퍼런스 Top-N을 추천해 준다 (text-only).',
  steps: [
    '프로젝트 생성 위자드 Step 1에서 사용자가 form 입력 — `intent`(자유 텍스트, "Y2K 풍 다크 포스터" 등) + `type`(landing/poster 등).',
    'Step 2 진입 시 `recommendedLoader` 가 `runRecommend({intent, type, archive: references, n: 6})` 호출 — Haiku 4.5 text-only, 이미지 재호출 없음.',
    '아카이브를 `{id, title, tags, dominantColors}` 만 남긴 압축 JSON 으로 system 에 직렬화해 전달 → tool 로 `recommendedIds` (5~10개) + `reasons` (id 별 40자 이내 사유) 반환.',
    '받은 `recommendedIds` 로 references 를 필터해 ReferencePicker 에 노출. 사용자가 카드를 add/remove → 최종 셋 확정 후 Step 3.',
  ],
  note: '이미지 안 봄 → 비용 가장 저렴. T1 이 붙여둔 태그/색상 품질이 곧 T2 추천 품질이다. 결과는 DB 미저장 — 위자드 state 만.',
};

const T2_DATA = {
  fields: [
    { path: 'input.intent', type: 'string', access: 'read', note: '사용자가 입력한 자연어 의도' },
    { path: 'input.type', type: 'string', access: 'read', note: '프로젝트 카테고리 (landing/poster/app 등)' },
    { path: 'input.archive[]', type: '{id, title, tags, dominantColors}[]', access: 'read', note: '아카이브 전체의 메타만 압축 (이미지 URL 없음)' },
    { path: 'output.recommendedIds[]', type: 'string[]', access: 'write', note: '추천된 reference id (5~10개, 랭크 순)' },
    { path: 'output.reasons[]', type: '{id, reason}[]', access: 'write', note: 'id 별 40자 이내 추천 사유 (UI 칩 라벨)' },
  ],
  persistence: 'DB 미저장. 위자드 클라이언트 state(`projectDraft`)만 보관. 사용자가 확정한 `referenceIds[]` 만 `projects.reference_ids` 로 영속화.',
};

const T3_UX = {
  summary: '선택된 레퍼런스들의 미리 추출된 토큰을 의도와 합쳐 프로젝트용 4-레이어 토큰 + visualDirection 마크다운을 합성한다 (text-only · 이미지 없음).',
  steps: [
    '위자드 Step 3 "분석 시작" 클릭 → `onAnalyze` 가 `runAnalyzeTokens({intent, type, selectedRefs, onProgress})` 호출.',
    '선택된 레퍼런스들에서 `{id, title, tags, dominantColors, extracted}` 만 뽑아 JSON 으로 직렬화해 user message 로 전달 — 이미지 재호출 없음.',
    'Haiku 4.5 가 두 개 tool 을 호출: `submit_tokens` (color/typography/layout/gradient 4 레이어 합성) + `submit_visual_direction` (genre/style/subject 태그 + Markdown 본문).',
    '`onProgress` 콜백으로 5 레이어 상태(running → done) 를 AnalysisProgress 컴포넌트에 실시간 반영.',
    '완료 시 `setAnalysis` 로 store/DB 에 저장 → 프로젝트 상세 페이지에서 ThemeExportDialog (MUI theme) + ZIP (JSON 토큰 + VD MD + 레퍼런스 이미지) export 가능.',
  ],
  note: '비용 절감 (세션 023) — 이전엔 Sonnet + 이미지 N장으로 호출($~0.048) → 현재 Haiku + text-only ($~0.008, ~6배 절감). T1 이 업로드 시점에 이미 `extracted` 를 만들어둔 덕분.',
};

const T3_DATA = {
  fields: [
    { path: 'input.intent / type', type: 'string', access: 'read', note: '위자드 Step 1 form 값' },
    { path: 'input.selectedRefs[].extracted', type: 'object', access: 'read', note: 'T1 이 업로드 시 미리 추출해둔 토큰 (palette/typography/layout/gradient)' },
    { path: 'input.selectedRefs[].tags / dominantColors', type: 'object / hex[]', access: 'read', note: 'T1 산출물 — 합성 컨텍스트' },
    { path: 'output.tokens.color[]', type: '{id, label, hex, role, group, ...}[]', access: 'write', note: 'role==="primary" 정확히 1개' },
    { path: 'output.tokens.typography[]', type: '{hierarchy, fontFamily, ...}[]', access: 'write', note: 'h1>h2>body1 위계 강제' },
    { path: 'output.tokens.layout[]', type: 'object[]', access: 'write', note: 'grid 컬럼·간격 합성값' },
    { path: 'output.tokens.gradient[]', type: 'object[]', access: 'write', note: 'gradient stops (있을 때만)' },
    { path: 'output.visualDirection.markdown', type: 'string', access: 'write', note: '필수 섹션 1~6 포함 템플릿' },
    { path: 'output.visualDirection.tags.{genre|style|subject}[]', type: 'string[]', access: 'write', note: '집계 태그' },
    { path: 'projects[].tokens', type: 'jsonb', access: 'write', note: '합성 결과 영속화 — Export 의 JSON 부분' },
  ],
  persistence: 'Supabase `projects.tokens` (jsonb) + analysis 레코드. ZIP export 에 `tokens.json` + `visual-direction.md` + 레퍼런스 이미지 번들로 포함.',
};

const T1_INPUTS = [
  { category: 'user', item: '이미지 파일 / URL', source: 'ArchivePage 드래그·드롭 또는 URL', note: '1장씩 호출' },
  { category: 'user', item: 'base64 dataURL (1024px 리사이즈)', source: 'imageUrlToBase64DataUrl + resizeDataUrl', note: 'vision 입력' },
  { category: 'system', item: 'TASK_AUTO_TAG.systemPrompt', source: 'data/muse/aiTasks.js', note: 'prompt cache 히트 대상' },
  { category: 'system', item: 'TASK_AUTO_TAG.toolSchema', source: 'data/muse/aiTasks.js', note: '5-레이어 enum + extracted 통합' },
  { category: 'system', item: 'preset 어휘 (TOKEN_LAYERS + VISUAL_DIRECTION_CATEGORIES)', source: 'muse_tags_preset.json', note: 'tool schema enum 으로 강제' },
  { category: 'model', item: 'model: claude-haiku-4-5', source: 'hardcoded', note: 'vision 가능' },
  { category: 'model', item: 'max_tokens: 512, tool_choice: forced', source: 'runAutoTag', note: '구조화 출력 강제' },
  { category: 'none', item: 'intent / type / 다른 레퍼런스 / 프로젝트 컨텍스트', source: '—', note: '이미지 한 장만 본다 (descriptive)' },
];

const T2_INPUTS = [
  { category: 'user', item: 'intent (자유 텍스트)', source: 'Wizard Step 1 form', note: '예: "Y2K 풍 다크 포스터"' },
  { category: 'user', item: 'type (카테고리)', source: 'Wizard Step 1 form', note: 'landing / poster / app 등' },
  { category: 'user', item: 'n (추천 개수)', source: '호출부 hardcoded', note: '기본 6' },
  { category: 'db', item: 'archive[] 전체', source: 'store references', note: '아카이브의 모든 레퍼런스' },
  { category: 'db', item: '{id, title, tags, dominantColors} 만 압축', source: 'compactArchive 변환', note: '이미지 URL 없음 (text-only)' },
  { category: 'system', item: 'TASK_RECOMMEND.systemPrompt', source: 'data/muse/aiTasks.js', note: '—' },
  { category: 'system', item: 'TASK_RECOMMEND.userMessageTemplate', source: 'data/muse/aiTasks.js', note: '{{intent}}/{{type}}/{{n}}/{{archiveCount}}/{{archiveJson}} 치환' },
  { category: 'system', item: 'TASK_RECOMMEND.toolSchema', source: 'data/muse/aiTasks.js', note: 'submit_recommendations' },
  { category: 'model', item: 'model: claude-haiku-4-5, max_tokens: 1024, text-only', source: 'hardcoded', note: '—' },
  { category: 'none', item: '이미지 / extracted 토큰 / 사용자 이전 프로젝트 이력', source: '—', note: '태그+색상 메타만으로 추천' },
];

const T3_INPUTS = [
  { category: 'user', item: 'intent', source: 'Wizard Step 1 form', note: 'T2 와 동일값 재사용' },
  { category: 'user', item: 'type', source: 'Wizard Step 1 form', note: 'T2 와 동일값 재사용' },
  { category: 'user', item: 'selectedRefs[]', source: 'T2 추천 + 사용자 add/remove', note: '최대 4장 권장' },
  { category: 'user', item: '"분석 시작" 버튼 클릭', source: 'Wizard Step 3', note: '명시적 트리거' },
  { category: 'db', item: 'selectedRefs[].tags', source: 'T1 산출 (references 테이블)', note: '레이어 태그' },
  { category: 'db', item: 'selectedRefs[].dominantColors', source: 'T1 산출', note: '대표 색 hex' },
  { category: 'db', item: 'selectedRefs[].extracted', source: 'T1 산출', note: '★ 합성의 핵심 입력 (palette/typo/layout/gradient)' },
  { category: 'db', item: 'selectedRefs[].id, title', source: 'references 메타', note: '추적용' },
  { category: 'system', item: 'TASK_ANALYZE_TOKENS.systemPrompt', source: 'data/muse/aiTasks.js', note: '—' },
  { category: 'system', item: 'TASK_ANALYZE_TOKENS.userMessageTemplate', source: 'data/muse/aiTasks.js', note: '{{intent}}/{{type}}/{{count}}/{{ids}} 치환' },
  { category: 'system', item: '두 개 toolSchema', source: 'submit_tokens + submit_visual_direction', note: '둘 다 호출 강제' },
  { category: 'model', item: 'model: claude-haiku-4-5, text-only', source: 'hardcoded', note: '이미지 없음 → Haiku 충분' },
  { category: 'callback', item: 'onProgress(layers)', source: 'ProjectCreateRoute 주입', note: 'AnalysisProgress UI 갱신용' },
  { category: 'none', item: '원본 이미지 / 아카이브 전체 (선택된 N장만)', source: '—', note: 'T1 의 미리 추출된 토큰만으로 합성' },
];

const T1_IO = {
  input: [
    { name: '분석할 이미지', desc: '1024px로 리사이즈된 dataURL', example: '"data:image/jpeg;base64,/9j/4AAQ…"' },
    { name: 'mediaType', desc: '이미지 MIME 타입', example: '"image/jpeg" | "image/png"' },
  ],
  output: [
    { name: 'tags', desc: '5 레이어 태그 그룹 (preset enum 강제)', example: '{ color: ["Muted"], typography: ["Serif"], layout: ["Bento"], gradient: [], visualDirection: { genre, style, subject } }' },
    { name: 'dominantColors', desc: '대표 색 hex 배열 (3~5개)', example: '["#14132B", "#4F46E5", "#FCFCFF"]' },
    { name: 'title', desc: '디자인 톤을 묘사하는 짧은 제목', example: '"Editorial Layout"' },
    { name: 'extracted', desc: 'T3 합성용 사전 추출 토큰 4종 (palette/typo/layout/gradient)', example: '{ palette: [...], typography: [...], layout: [...], gradient: [...] }' },
  ],
};

const T2_IO = {
  input: [
    { name: 'intent', desc: '사용자가 입력한 자연어 의도', example: '"Y2K 풍 다크 포스터"' },
    { name: 'type', desc: '프로젝트 카테고리', example: "'landing' | 'dashboard' | 'mobile' | 'brand'" },
    { name: 'archive', desc: '아카이브 압축 메타 (이미지 URL 없음)', example: '[{ id, title, tags, dominantColors }]' },
    { name: 'n?', desc: '추천 개수 (기본 6)', example: '6' },
  ],
  output: [
    { name: 'recommendedIds', desc: '추천된 reference id (5~10개, 랭크 순)', example: '["ref-002", "ref-005", "ref-013"]' },
    { name: 'reasons', desc: 'id별 40자 이내 추천 사유', example: '[{ id: "ref-002", reason: "Magazine+Swiss 매칭" }]' },
  ],
};

const T3_IO = {
  input: [
    { name: 'intent', desc: '사용자 의도 (T2와 동일값)', example: '"차분한 다크 무드"' },
    { name: 'type', desc: '프로젝트 카테고리', example: "'dashboard'" },
    { name: 'selectedRefs', desc: '선택된 레퍼런스 (≤4)의 메타데이터만 — 이미지는 보내지 않고 T1이 추출해둔 텍스트 토큰만 전달', example: '[{ id, title, tags, dominantColors, extracted }]  // thumbnailUrl 없음' },
  ],
  output: [
    { name: 'tokens.color', desc: 'role 부여된 색 토큰 (primary 정확히 1개)', example: '[{ id, hex, role: "primary", group: "Brand" }]' },
    { name: 'tokens.typography', desc: 'h1>h2>body 위계 강제', example: '[{ hierarchy: "h1", fontFamily, fontWeight }]' },
    { name: 'tokens.layout', desc: 'grid 합성값', example: '[{ kind: "grid", columns: 12, gap: 16 }]' },
    { name: 'tokens.gradient', desc: '그라디언트 stops (있을 때만)', example: '[{ gradient, stops }]' },
    { name: 'visualDirection.markdown', desc: '디자인 디렉션 본문 (필수 섹션 1~6)', example: '"# Visual Direction\\n## 1. Mood…"' },
    { name: 'visualDirection.tags', desc: '집계 태그 3종', example: '{ genre: [...], style: [...], subject: [...] }' },
  ],
};

const TASK_COPY = {
  t1: { ux: T1_UX, data: T1_DATA, inputs: T1_INPUTS, io: T1_IO },
  t2: { ux: T2_UX, data: T2_DATA, inputs: T2_INPUTS, io: T2_IO },
  t3: { ux: T3_UX, data: T3_DATA, inputs: T3_INPUTS, io: T3_IO },
};

/* ============================================
 * 기존 단일 태스크 상세 — Overview 합본에서 유지
 * ============================================ */

/** 단일 태스크 상세 뷰 — Overview 합본 페이지 전용 (full schema dump) */
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

        <SectionTitle title="레이어별 태그 어휘 (Preset)" description="T1 자동 태깅에서 각 레이어 enum으로 강제됨. preset 외 단어 금지" />
        <Box sx={ { display: 'flex', flexDirection: 'column', gap: 2, mb: 4 } }>
          { TOKEN_LAYERS.map((layer) => (
            <Box key={ layer }>
              <Typography variant="caption" color="text.secondary" sx={ { display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'monospace' } }>
                { layer }
              </Typography>
              <Box sx={ { display: 'flex', gap: 0.5, flexWrap: 'wrap' } }>
                { getLayerTags(layer).map((t) => (
                  <Chip key={ t } label={ t } size="small" variant="outlined" />
                )) }
              </Box>
            </Box>
          )) }
          { VISUAL_DIRECTION_CATEGORIES.map((cat) => (
            <Box key={ cat }>
              <Typography variant="caption" color="text.secondary" sx={ { display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'monospace' } }>
                visualDirection · { cat }
              </Typography>
              <Box sx={ { display: 'flex', gap: 0.5, flexWrap: 'wrap' } }>
                { getVisualDirectionTags(cat).map((t) => (
                  <Chip key={ t } label={ t } size="small" color="secondary" variant="outlined" />
                )) }
              </Box>
            </Box>
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
      <StructuredTaskDetail
        task={ TASK_AUTO_TAG }
        uxFlow={ TASK_COPY.t1.ux }
        dataModel={ TASK_COPY.t1.data }
        inputs={ TASK_COPY.t1.inputs }
        io={ TASK_COPY.t1.io }
      />
    </PageContainer>
  ),
};

export const T2Recommend = {
  name: 'T2 · Recommend',
  render: () => (
    <PageContainer>
      <StructuredTaskDetail
        task={ TASK_RECOMMEND }
        uxFlow={ TASK_COPY.t2.ux }
        dataModel={ TASK_COPY.t2.data }
        inputs={ TASK_COPY.t2.inputs }
        io={ TASK_COPY.t2.io }
      />
    </PageContainer>
  ),
};

export const T3AnalyzeTokens = {
  name: 'T3 · Analyze Tokens',
  render: () => (
    <PageContainer>
      <StructuredTaskDetail
        task={ TASK_ANALYZE_TOKENS }
        uxFlow={ TASK_COPY.t3.ux }
        dataModel={ TASK_COPY.t3.data }
        inputs={ TASK_COPY.t3.inputs }
        io={ TASK_COPY.t3.io }
      />
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
