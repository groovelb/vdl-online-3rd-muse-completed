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
  COMMON,
  LANDING_GNB,
  HERO,
  PROBLEM,
  SOLUTION_STAGE_1,
  SOLUTION_STAGE_2,
  HOW_IT_WORKS,
  PERSONAS,
  CTA,
  AUTH_DIALOG,
} from '../../pages/auth/landingCopy.js';
import {
  LAYER_LABEL,
  ANALYSIS_LAYERS_WITH_DESIGN_MD,
  LAYER_CHIP_DEFS_BASE,
  LAYER_CHIP_DEF_COMPONENTS,
  TOKEN_LAYER_CATEGORIES,
} from '../../data/muse/layers.js';

export default {
  title: 'Overview/MUSE/06 Content Data',
  parameters: {
    layout: 'padded',
  },
};

/** 값이 원시형이면 문자열로, 배열·객체면 요약 문자열로 바꾼다 */
const toText = (v) => {
  if (Array.isArray(v)) return `${v.length}개 항목`;
  if (v && typeof v === 'object') return Object.keys(v).join(', ');
  return String(v);
};

/**
 * 카피 블록 하나를 key-value 표로 그린다
 *
 * Props:
 * @param {object} data - 카피 블록 객체 [Required]
 *
 * Example usage:
 * <CopyTable data={ HERO } />
 */
function CopyTable({ data }) {
  return (
    <TableContainer sx={ { mb: 4 } }>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={ { fontWeight: 600, width: '25%' } }>key</TableCell>
            <TableCell sx={ { fontWeight: 600 } }>value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          { Object.entries(data).map(([k, v]) => (
            <TableRow key={ k }>
              <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>{ k }</TableCell>
              <TableCell sx={ { fontSize: 13 } }>{ toText(v) }</TableCell>
            </TableRow>
          )) }
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/**
 * 객체 배열을 표로 그린다
 *
 * Props:
 * @param {object[]} rows - 표로 그릴 행 [Required]
 * @param {string[]} columns - 표시할 키 목록 [Required]
 *
 * Example usage:
 * <ArrayTable rows={ HOW_IT_WORKS.steps } columns={ ['key', 'title', 'body'] } />
 */
function ArrayTable({ rows, columns }) {
  return (
    <TableContainer sx={ { mb: 4 } }>
      <Table size="small">
        <TableHead>
          <TableRow>
            { columns.map((c) => (
              <TableCell key={ c } sx={ { fontWeight: 600 } }>{ c }</TableCell>
            )) }
          </TableRow>
        </TableHead>
        <TableBody>
          { rows.map((r, i) => (
            <TableRow key={ r.key || r.code || i }>
              { columns.map((c) => (
                <TableCell key={ c } sx={ { fontSize: 13 } }>{ toText(r[c]) }</TableCell>
              )) }
            </TableRow>
          )) }
        </TableBody>
      </Table>
    </TableContainer>
  );
}

const LANDING_BLOCKS = [
  { name: 'COMMON', note: '브랜드명과 접근성 라벨', data: COMMON },
  { name: 'LANDING_GNB', note: '상단 버튼 두 개', data: LANDING_GNB },
  { name: 'HERO', note: '첫 화면 선언과 진입', data: HERO },
  { name: 'PROBLEM', note: '히어로가 흡수한 문제 제기 한 줄', data: PROBLEM },
  { name: 'SOLUTION_STAGE_1', note: '입력 갈래: 같은 격자로 분류', data: SOLUTION_STAGE_1 },
  { name: 'SOLUTION_STAGE_2', note: '출력 갈래: 산출물 미리보기', data: SOLUTION_STAGE_2 },
  { name: 'CTA', note: '마지막 가입 진입', data: CTA },
];

/** 랜딩과 위자드 카피, 레이어 라벨 단일 출처 */
export const Default = {
  render: () => (
    <>
      <DocumentTitle
        title="Content Data"
        status="Available"
        note="랜딩 카피와 레이어 라벨의 단일 출처"
        brandName="Design System"
        systemName="MUSE"
        version="1.0"
      />
      <PageContainer>
        <Typography variant="h4" sx={ { fontWeight: 700, mb: 1 } }>
          Content Data
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={ { mb: 1 } }>
          <code>src/pages/auth/landingCopy.js</code> · <code>src/data/muse/layers.js</code>
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={ { mb: 4 } }>
          화면에 보이는 문구는 컴포넌트가 아니라 이 두 파일에서만 온다. 배열과 객체 값은 요약해서 표시하고,
          긴 목록은 아래 별도 표로 편다.
        </Typography>

        { LANDING_BLOCKS.map((b) => (
          <Box key={ b.name }>
            <SectionTitle title={ b.name } description={ b.note } />
            <CopyTable data={ b.data } />
          </Box>
        )) }

        <SectionTitle
          title="HOW_IT_WORKS.steps"
          description={ `${HOW_IT_WORKS.steps.length}단계 · ${HOW_IT_WORKS.title}` }
        />
        <ArrayTable rows={ HOW_IT_WORKS.steps } columns={ ['key', 'title', 'body'] } />

        <SectionTitle
          title="PERSONAS.items"
          description={ `${PERSONAS.items.length}명 · ${PERSONAS.title}` }
        />
        <ArrayTable rows={ PERSONAS.items } columns={ ['code', 'label', 'quote', 'mode'] } />

        <SectionTitle title="AUTH_DIALOG" description="가입·로그인 모달 문구" />
        <CopyTable data={ AUTH_DIALOG } />

        <SectionTitle
          title="LAYER_LABEL"
          description="레이어 키의 짧은 한국어 라벨. chip 과 좁은 자리에서 쓴다"
        />
        <CopyTable data={ LAYER_LABEL } />

        <SectionTitle
          title="레이어 탭과 chip 라벨"
          description="같은 키를 자리마다 다른 길이의 라벨로 쓴다"
        />
        <TableContainer sx={ { mb: 4 } }>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={ { fontWeight: 600, width: 160 } }>key</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>탭 라벨</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>chip 라벨</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>편집 패널 라벨</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              { ANALYSIS_LAYERS_WITH_DESIGN_MD.map((l) => {
                const chips = [...LAYER_CHIP_DEFS_BASE, LAYER_CHIP_DEF_COMPONENTS];
                const chip = chips.find((c) => c.key === l.id);
                const cat = TOKEN_LAYER_CATEGORIES.find((c) => c.key === l.id);
                return (
                  <TableRow key={ l.id }>
                    <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>{ l.id }</TableCell>
                    <TableCell sx={ { fontSize: 13 } }>{ l.label }</TableCell>
                    <TableCell sx={ { fontSize: 13 } }>{ chip ? chip.label : '없음' }</TableCell>
                    <TableCell sx={ { fontSize: 13 } }>{ cat ? cat.label : '없음' }</TableCell>
                  </TableRow>
                );
              }) }
            </TableBody>
          </Table>
        </TableContainer>
      </PageContainer>
    </>
  ),
};
