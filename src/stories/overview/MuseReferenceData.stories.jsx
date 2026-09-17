import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import {
  DocumentTitle,
  PageContainer,
  SectionTitle,
} from '../../components/storybookDocumentation';
import {
  references,
  projects,
  analysisResultsByProjectId,
  defaultUserSettings,
  TOKEN_LAYERS,
  VISUAL_DIRECTION_CATEGORIES,
  getLayerTags,
  getVisualDirectionTags,
} from '../../data/muse';
import { LAYER_LABEL, ANALYSIS_LAYERS } from '../../data/muse/layers.js';
import { AI_TASKS } from '../../data/muse/aiTasks.js';
import tagPreset from '../../data/muse/tag/muse_tags_preset.json';
import exampleTokens from '../../data/exampleTokens.json';
import schemasSource from '../../data/muse/schemas.js?raw';

export default {
  title: 'Overview/MUSE/05 Reference Data',
  parameters: {
    layout: 'padded',
  },
};

/** 02 UX Flow 3.2절 이름 사전 그대로 */
const DICTIONARY = [
  { name: 'Reference', ko: '레퍼런스', table: 'reference_items', file: 'references.js' },
  { name: 'Project', ko: '프로젝트', table: 'projects', file: 'projects.js' },
  { name: 'ProjectReference', ko: '레퍼런스 활용', table: 'project_references', file: 'projects.js' },
  { name: 'AnalysisResult', ko: '분석 결과', table: 'analysis_results', file: 'analysisResults.js' },
  { name: 'UserSettings', ko: '사용자 설정', table: 'user_settings', file: 'userSettings.js' },
  { name: 'User', ko: '사용자', table: 'auth.users, profiles', file: '(서버)' },
];

/**
 * 단순 key-value 표
 *
 * Props:
 * @param {object} data - 표로 그릴 객체 [Required]
 * @param {string} keyLabel - 첫 열 머리글 [Optional, 기본값: 'key']
 * @param {string} valueLabel - 둘째 열 머리글 [Optional, 기본값: 'value']
 *
 * Example usage:
 * <KeyValueTable data={ defaultUserSettings } />
 */
function KeyValueTable({ data, keyLabel = 'key', valueLabel = 'value' }) {
  return (
    <TableContainer sx={ { mb: 4 } }>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={ { fontWeight: 600, width: '30%' } }>{ keyLabel }</TableCell>
            <TableCell sx={ { fontWeight: 600 } }>{ valueLabel }</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          { Object.entries(data).map(([k, v]) => (
            <TableRow key={ k }>
              <TableCell sx={ { fontFamily: 'monospace', fontSize: 13 } }>{ k }</TableCell>
              <TableCell sx={ { fontFamily: 'monospace', fontSize: 13 } }>{ String(v) }</TableCell>
            </TableRow>
          )) }
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/**
 * 색 스와치 줄
 *
 * Props:
 * @param {string[]} colors - HEX 배열 [Required]
 *
 * Example usage:
 * <Swatches colors={ ['#111111', '#EEEEEE'] } />
 */
function Swatches({ colors }) {
  return (
    <Box sx={ { display: 'flex', gap: 0.5 } }>
      { (colors || []).map((c) => (
        <Box
          key={ c }
          title={ c }
          sx={ {
            width: 16,
            height: 16,
            borderRadius: '50%',
            backgroundColor: c,
            border: '1px solid',
            borderColor: 'divider',
          } }
        />
      )) }
    </Box>
  );
}

/** 레퍼런스 한 건의 레이어 태그 수를 문자열로 만든다 */
const tagSummary = (ref) => {
  const t = ref.tags || {};
  const vd = t.visualDirection || {};
  const vdCount = VISUAL_DIRECTION_CATEGORIES
    .reduce((sum, c) => sum + (vd[c] || []).length, 0);
  return TOKEN_LAYERS
    .map((l) => `${LAYER_LABEL[l]} ${(t[l] || []).length}`)
    .concat(`${LAYER_LABEL.visualDirection} ${vdCount}`)
    .join(' · ');
};

/** 타입 정의 원문 경로. 표 설명에 그대로 보여 준다 */
const SCHEMA_FILE = 'src/data/muse/schemas.js';

/** schemas.js 원문에서 typedef 이름과 설명을 뽑는다 */
const SCHEMA_TYPES = [...schemasSource.matchAll(/@typedef\s*\{[^}]*\}\s*(\w+)([^\n]*)/g)]
  .map((m) => ({ name: m[1], note: m[2].replace(/^\s*-\s*/, '').trim() }));

/** 태그 프리셋의 레이어별 어휘 수 */
const PRESET_LAYERS = Object.entries(tagPreset.layers).map(([key, v]) => ({
  key,
  target: v.output_target,
  mapping: v.token_mapping,
  count: v.tags
    ? v.tags.length
    : Object.values(v.categories || {}).reduce((sum, c) => sum + (c.tags || c).length, 0),
}));

/** 예시 이미지 추출 결과. 큰 JSON 이라 상위 20행만 보여준다 */
const EXAMPLE_TOKEN_ROWS = Object.entries(exampleTokens).map(([file, v]) => ({
  file,
  title: v.title,
  colors: v.dominantColors || [],
  tags: (v.tags || []).join(', '),
}));
const EXAMPLE_TOKEN_HEAD = EXAMPLE_TOKEN_ROWS.slice(0, 20);

/** 프로젝트별 레퍼런스 활용(ProjectReference) 행을 편다 */
const curationRows = projects.flatMap((p) => (p.selectedRefs || []).map((s) => ({
  projectId: p.id,
  refId: s.id,
  useLayers: (s.useLayers || []).length
    ? s.useLayers.map((l) => LAYER_LABEL[l] || l).join(', ')
    : '자동 (전체)',
})));

/** MUSE 더미 데이터 표 */
export const Default = {
  render: () => (
    <>
      <DocumentTitle
        title="Reference Data"
        status="Available"
        note="src/data/muse 의 더미 데이터와 태그 어휘"
        brandName="Design System"
        systemName="MUSE"
        version="1.0"
      />
      <PageContainer>
        <Typography variant="h4" sx={ { fontWeight: 700, mb: 1 } }>
          Reference Data
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={ { mb: 4 } }>
          <code>src/data/muse/</code> · 라벨은 02 UX Flow 3.2절 이름 사전을 그대로 쓴다.
        </Typography>

        <SectionTitle title="이름 사전" description="데이터명 · 한국어 · 예상 테이블명 · 더미 데이터 파일" />
        <TableContainer sx={ { mb: 4 } }>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={ { fontWeight: 600, width: 180 } }>데이터명</TableCell>
                <TableCell sx={ { fontWeight: 600, width: 140 } }>한국어</TableCell>
                <TableCell sx={ { fontWeight: 600, width: 200 } }>예상 테이블명</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>더미 데이터</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              { DICTIONARY.map((d) => (
                <TableRow key={ d.name }>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 13 } }>{ d.name }</TableCell>
                  <TableCell sx={ { fontSize: 13 } }>{ d.ko }</TableCell>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>{ d.table }</TableCell>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>{ d.file }</TableCell>
                </TableRow>
              )) }
            </TableBody>
          </Table>
        </TableContainer>

        <SectionTitle
          title="Reference (레퍼런스)"
          description={ `${references.length}건 · { id, source, thumbnailUrl, tags, dominantColors, extracted }` }
        />
        <TableContainer sx={ { mb: 4 } }>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={ { fontWeight: 600, width: 90 } }>id</TableCell>
                <TableCell sx={ { fontWeight: 600, width: 70 } }>source</TableCell>
                <TableCell sx={ { fontWeight: 600, width: 110 } }>dominantColors</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>tags (레이어별 개수)</TableCell>
                <TableCell sx={ { fontWeight: 600, width: 90 } }>extracted</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              { references.map((r) => (
                <TableRow key={ r.id } sx={ { '&:hover': { backgroundColor: 'action.hover' } } }>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>{ r.id }</TableCell>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>{ r.source }</TableCell>
                  <TableCell><Swatches colors={ r.dominantColors } /></TableCell>
                  <TableCell sx={ { fontSize: 12 } }>{ tagSummary(r) }</TableCell>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>
                    { Object.keys(r.extracted || {}).length }축
                  </TableCell>
                </TableRow>
              )) }
            </TableBody>
          </Table>
        </TableContainer>

        <SectionTitle
          title="Project (프로젝트)"
          description={ `${projects.length}건 · { id, name, intent, mode, selectedRefs, referenceIds }` }
        />
        <TableContainer sx={ { mb: 4 } }>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={ { fontWeight: 600, width: 90 } }>id</TableCell>
                <TableCell sx={ { fontWeight: 600, width: 150 } }>name</TableCell>
                <TableCell sx={ { fontWeight: 600, width: 80 } }>mode</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>intent</TableCell>
                <TableCell sx={ { fontWeight: 600, width: 80 } }>refs</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              { projects.map((p) => (
                <TableRow key={ p.id } sx={ { '&:hover': { backgroundColor: 'action.hover' } } }>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>{ p.id }</TableCell>
                  <TableCell sx={ { fontSize: 13, fontWeight: 600 } }>{ p.name }</TableCell>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>{ p.mode }</TableCell>
                  <TableCell sx={ { fontSize: 12, color: 'text.secondary' } }>{ p.intent }</TableCell>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>
                    { (p.referenceIds || []).length }
                  </TableCell>
                </TableRow>
              )) }
            </TableBody>
          </Table>
        </TableContainer>

        <SectionTitle
          title="ProjectReference (레퍼런스 활용)"
          description={ `${curationRows.length}행 · projects[].selectedRefs 에서 편 값. 빈 배열은 자동(전체)` }
        />
        <TableContainer sx={ { mb: 4 } }>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={ { fontWeight: 600, width: 120 } }>projectId</TableCell>
                <TableCell sx={ { fontWeight: 600, width: 120 } }>referenceId</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>useLayers</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              { curationRows.map((c) => (
                <TableRow key={ `${c.projectId}-${c.refId}` }>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>{ c.projectId }</TableCell>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>{ c.refId }</TableCell>
                  <TableCell sx={ { fontSize: 12 } }>{ c.useLayers }</TableCell>
                </TableRow>
              )) }
            </TableBody>
          </Table>
        </TableContainer>

        <SectionTitle
          title="AnalysisResult (분석 결과)"
          description="프로젝트별 레이어 토큰 수. 무드 레이어는 Markdown 한 덩이라 글자 수로 센다"
        />
        <TableContainer sx={ { mb: 4 } }>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={ { fontWeight: 600, width: 120 } }>projectId</TableCell>
                <TableCell sx={ { fontWeight: 600, width: 90 } }>status</TableCell>
                { ANALYSIS_LAYERS.map((l) => (
                  <TableCell key={ l.id } sx={ { fontWeight: 600 } }>{ l.label }</TableCell>
                )) }
              </TableRow>
            </TableHead>
            <TableBody>
              { Object.values(analysisResultsByProjectId).map((a) => (
                <TableRow key={ a.id }>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>{ a.projectId }</TableCell>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>{ a.status }</TableCell>
                  { ANALYSIS_LAYERS.map((l) => {
                    const layer = (a.layers || {})[l.id];
                    const count = Array.isArray(layer)
                      ? `${layer.length}개`
                      : `${(layer?.markdown || '').length}자`;
                    return (
                      <TableCell key={ l.id } sx={ { fontFamily: 'monospace', fontSize: 12 } }>
                        { count }
                      </TableCell>
                    );
                  }) }
                </TableRow>
              )) }
            </TableBody>
          </Table>
        </TableContainer>

        <SectionTitle title="UserSettings (사용자 설정)" description="defaultUserSettings 기본값" />
        <KeyValueTable data={ defaultUserSettings } />

        <SectionTitle
          title="태그 어휘 프리셋"
          description="muse_tags_preset.json · 자동 태깅과 합성이 고르는 어휘는 이 목록 안에서만 나온다"
        />
        <TableContainer sx={ { mb: 4 } }>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={ { fontWeight: 600, width: 140 } }>레이어</TableCell>
                <TableCell sx={ { fontWeight: 600, width: 80 } }>개수</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>어휘</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              { TOKEN_LAYERS.map((l) => (
                <TableRow key={ l }>
                  <TableCell sx={ { fontSize: 13 } }>{ LAYER_LABEL[l] }</TableCell>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>
                    { getLayerTags(l).length }
                  </TableCell>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 11, color: 'text.secondary' } }>
                    { getLayerTags(l).join(', ') }
                  </TableCell>
                </TableRow>
              )) }
              { VISUAL_DIRECTION_CATEGORIES.map((c) => (
                <TableRow key={ c }>
                  <TableCell sx={ { fontSize: 13 } }>{ `${LAYER_LABEL.visualDirection} · ${c}` }</TableCell>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>
                    { getVisualDirectionTags(c).length }
                  </TableCell>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 11, color: 'text.secondary' } }>
                    { getVisualDirectionTags(c).join(', ') }
                  </TableCell>
                </TableRow>
              )) }
            </TableBody>
          </Table>
        </TableContainer>
        <SectionTitle
          title="태그 프리셋 구조"
          description={ `muse_tags_preset.json v${tagPreset.version} · 레이어마다 산출 대상과 토큰 매핑이 붙는다` }
        />
        <TableContainer sx={ { mb: 4 } }>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={ { fontWeight: 600, width: 160 } }>layer</TableCell>
                <TableCell sx={ { fontWeight: 600, width: 90 } }>어휘 수</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>output_target</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>token_mapping</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              { PRESET_LAYERS.map((l) => (
                <TableRow key={ l.key }>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>{ l.key }</TableCell>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>{ l.count }</TableCell>
                  <TableCell sx={ { fontSize: 12 } }>{ l.target }</TableCell>
                  <TableCell sx={ { fontSize: 12, color: 'text.secondary' } }>{ l.mapping }</TableCell>
                </TableRow>
              )) }
            </TableBody>
          </Table>
        </TableContainer>

        <SectionTitle
          title="AI 태스크 정의"
          description={ `aiTasks.js · ${AI_TASKS.length}개. 자동 태깅, 추천, 토큰 분석 두 갈래가 언제 어떤 모델로 도는지` }
        />
        <TableContainer sx={ { mb: 4 } }>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={ { fontWeight: 600, width: 90 } }>id</TableCell>
                <TableCell sx={ { fontWeight: 600, width: 170 } }>name</TableCell>
                <TableCell sx={ { fontWeight: 600, width: 150 } }>stage</TableCell>
                <TableCell sx={ { fontWeight: 600, width: 150 } }>model</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>purpose</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              { AI_TASKS.map((task) => (
                <TableRow key={ task.id }>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>{ task.id }</TableCell>
                  <TableCell sx={ { fontSize: 13, fontWeight: 600 } }>{ task.name }</TableCell>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 11 } }>{ task.stage }</TableCell>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 11 } }>{ task.model }</TableCell>
                  <TableCell sx={ { fontSize: 12, color: 'text.secondary' } }>{ task.purpose }</TableCell>
                </TableRow>
              )) }
            </TableBody>
          </Table>
        </TableContainer>

        <SectionTitle
          title="데이터 타입 정의"
          description={ `${SCHEMA_FILE} · ${SCHEMA_TYPES.length}개 typedef. 런타임 값이 없는 참조 파일이라 원문에서 이름만 읽어 온다` }
        />
        <TableContainer sx={ { mb: 4 } }>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={ { fontWeight: 600, width: 260 } }>typedef</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>설명</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              { SCHEMA_TYPES.map((s) => (
                <TableRow key={ s.name }>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>{ s.name }</TableCell>
                  <TableCell sx={ { fontSize: 12, color: 'text.secondary' } }>{ s.note || '(설명 없음)' }</TableCell>
                </TableRow>
              )) }
            </TableBody>
          </Table>
        </TableContainer>

        <SectionTitle
          title="예시 이미지 추출 결과"
          description={ `exampleTokens.json · 총 ${EXAMPLE_TOKEN_ROWS.length}건 중 상위 ${EXAMPLE_TOKEN_HEAD.length}건. 자동 태깅이 실제로 낸 값이다` }
        />
        <TableContainer sx={ { mb: 4 } }>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={ { fontWeight: 600, width: 230 } }>file</TableCell>
                <TableCell sx={ { fontWeight: 600, width: 200 } }>title</TableCell>
                <TableCell sx={ { fontWeight: 600, width: 110 } }>dominantColors</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>tags</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              { EXAMPLE_TOKEN_HEAD.map((r) => (
                <TableRow key={ r.file }>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 10 } }>{ r.file }</TableCell>
                  <TableCell sx={ { fontSize: 12 } }>{ r.title }</TableCell>
                  <TableCell><Swatches colors={ r.colors } /></TableCell>
                  <TableCell sx={ { fontSize: 11, color: 'text.secondary' } }>{ r.tags }</TableCell>
                </TableRow>
              )) }
            </TableBody>
          </Table>
        </TableContainer>
        <Typography variant="body2" color="text.secondary" sx={ { mb: 4 } }>
          총 { EXAMPLE_TOKEN_ROWS.length }건. 위 표는 상위 { EXAMPLE_TOKEN_HEAD.length }건만 보여준다.
        </Typography>
      </PageContainer>
    </>
  ),
};
