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
import { assemblySteps, knowledgeSources } from '../../data/assemblySteps.js';
import { docIdByTitle, storyIdByTitle, storyLink } from './storyIndex.js';

export default {
  title: 'Overview/MUSE/09 Domain Knowledge & Research',
  parameters: {
    layout: 'padded',
  },
};

/**
 * 스토리 title 을 링크로. 아직 없는 title 은 글자만 남긴다
 *
 * Props:
 * @param {string} title - 스토리북 title 문자열 [Required]
 *
 * Example usage:
 * <StoryRef title="Overview/MUSE/02 UX Flow" />
 */
function StoryRef({ title }) {
  const href = storyLink(title);
  if (!href) {
    return (
      <Typography component="span" sx={ { fontSize: 12, color: 'text.disabled' } }>
        { title }
      </Typography>
    );
  }
  return (
    <Typography
      component="a"
      href={ href }
      target="_top"
      sx={ { fontSize: 12, color: 'info.main', textDecoration: 'underline', display: 'block' } }
    >
      { title }
    </Typography>
  );
}

const STEP_LABEL = Object.fromEntries(assemblySteps.map((s) => [s.id, `${s.no}. ${s.title}`]));

/** 도메인 지식과 조립 순서 */
export const Default = {
  render: () => (
    <>
      <DocumentTitle
        title="Domain Knowledge & Research"
        status="Available"
        note="레퍼런스 태깅과 토큰 추출 도메인을 다루려고 학습시킨 자료"
        brandName="Design System"
        systemName="MUSE"
        version="1.0"
      />
      <PageContainer>
        <Typography variant="h4" sx={ { fontWeight: 700, mb: 1 } }>
          Domain Knowledge &amp; Research
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={ { mb: 1 } }>
          <code>src/data/assemblySteps.js</code> · 조립 순서와 자료 목록의 단일 출처
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={ { mb: 4 } }>
          MUSE 는 디자인 레퍼런스를 분류하고 토큰으로 옮기는 일을 다룬다. 그 일을 하려면 도구가
          어휘와 판단 기준을 미리 알고 있어야 한다. 아래는 그 어휘와 기준을 어디서 가져와
          어디로 흘려보냈는지의 전부다. 같은 목록을 Hierarchy 스토리가 단계 라벨로 함께 쓴다.
        </Typography>

        <SectionTitle
          title="조립 순서"
          description={ `${assemblySteps.length}단계. 리서치에서 시작해 서버 연결로 끝난다` }
        />
        { assemblySteps.map((step) => (
          <Box
            key={ step.id }
            sx={ {
              mb: 3,
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: 'background.paper',
            } }
          >
            <Typography variant="subtitle1" sx={ { fontWeight: 700 } }>
              { step.no }. { step.title }
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={ { mb: 1.5 } }>
              { step.summary }
            </Typography>

            <Typography variant="caption" sx={ { color: 'text.disabled', display: 'block' } }>
              먹는 자료
            </Typography>
            <Box sx={ { mb: 1.5 } }>
              { step.sources.map((s) => (
                <Typography
                  key={ s }
                  sx={ { fontFamily: 'monospace', fontSize: 11, color: 'text.secondary' } }
                >
                  { s }
                </Typography>
              )) }
            </Box>

            <Typography variant="caption" sx={ { color: 'text.disabled', display: 'block' } }>
              나오는 화면
            </Typography>
            <Box>
              { step.storyTitles.map((t) => (
                <StoryRef key={ t } title={ t } />
              )) }
            </Box>
          </Box>
        )) }

        <SectionTitle
          title="학습시킨 자료"
          description={ `${knowledgeSources.length}건. 이름 · 내용 · 출처 · 흘러간 곳 · 보이는 곳` }
        />
        <TableContainer sx={ { mb: 4 } }>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={ { fontWeight: 600, width: 190 } }>이름</TableCell>
                <TableCell sx={ { fontWeight: 600, width: 130 } }>단계</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>내용</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>출처</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>흘러간 곳</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              { knowledgeSources.map((k) => (
                <TableRow key={ k.path }>
                  <TableCell>
                    <Typography sx={ { fontSize: 13, fontWeight: 600 } }>{ k.name }</Typography>
                    <Typography
                      sx={ { fontFamily: 'monospace', fontSize: 10, color: 'text.disabled' } }
                    >
                      { k.path }
                    </Typography>
                  </TableCell>
                  <TableCell sx={ { fontSize: 12, color: 'text.secondary' } }>
                    { STEP_LABEL[k.step] }
                  </TableCell>
                  <TableCell sx={ { fontSize: 12 } }>{ k.what }</TableCell>
                  <TableCell sx={ { fontSize: 12, color: 'text.secondary' } }>{ k.origin }</TableCell>
                  <TableCell sx={ { fontSize: 12, color: 'text.secondary' } }>{ k.flowedTo }</TableCell>
                </TableRow>
              )) }
            </TableBody>
          </Table>
        </TableContainer>

        <SectionTitle title="자료가 보이는 화면" description="각 자료를 눈으로 확인할 수 있는 스토리" />
        <TableContainer sx={ { mb: 4 } }>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={ { fontWeight: 600, width: 240 } }>이름</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>보이는 곳</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              { knowledgeSources.map((k) => (
                <TableRow key={ `${k.path}-seen` }>
                  <TableCell sx={ { fontSize: 13 } }>{ k.name }</TableCell>
                  <TableCell><StoryRef title={ k.seenAt } /></TableCell>
                </TableRow>
              )) }
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="body2" color="text.secondary">
          링크가 걸리지 않은 줄은 아직 그 title 의 스토리가 없다는 뜻이다. 지금 걸린 링크는
          { ' ' }{ Object.keys(storyIdByTitle).length + Object.keys(docIdByTitle).length }개 title 에서 나온다.
        </Typography>
      </PageContainer>
    </>
  ),
};
