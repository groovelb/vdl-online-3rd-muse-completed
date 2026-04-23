import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import { projects, getAnalysisResult } from '../../data/muse';
import {
  DocumentTitle,
  PageContainer,
  SectionTitle,
} from '../../components/storybookDocumentation';

export default {
  title: 'MUSE/Data/AnalysisResults',
  parameters: { layout: 'padded' },
};

const EMPHASIS_LABEL = { 0: 'Low', 1: 'Mid', 2: 'High' };

export const Docs = {
  render: () => (
    <>
      <DocumentTitle
        title="AnalysisResults Dataset"
        status="Available"
        note="Per-project token analysis results"
        brandName="MUSE"
        systemName="Data"
        version="1.0"
      />
      <PageContainer>
        <Typography variant="h4" sx={ { fontWeight: 700, mb: 1 } }>
          AnalysisResults Dataset
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={ { mb: 4 } }>
          프로젝트별 5-레이어 토큰 분석 결과 더미. `getAnalysisResult(projectId)`로 조회.
        </Typography>

        <SectionTitle title="스키마" />
        <TableContainer sx={ { mb: 4 } }>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={ { fontWeight: 600 } }>Field</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>Type</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow><TableCell sx={ { fontFamily: 'monospace' } }>id</TableCell><TableCell>string</TableCell><TableCell>analysis-{ '{projectId}' }</TableCell></TableRow>
              <TableRow><TableCell sx={ { fontFamily: 'monospace' } }>projectId</TableCell><TableCell>string</TableCell><TableCell>Project.id 참조</TableCell></TableRow>
              <TableRow><TableCell sx={ { fontFamily: 'monospace' } }>status</TableCell><TableCell>pending | running | done | error</TableCell><TableCell>분석 상태</TableCell></TableRow>
              <TableRow><TableCell sx={ { fontFamily: 'monospace' } }>layers.color</TableCell><TableCell>ColorToken[]</TableCell><TableCell>컬러 토큰 목록</TableCell></TableRow>
              <TableRow><TableCell sx={ { fontFamily: 'monospace' } }>layers.typography</TableCell><TableCell>TypographyToken[]</TableCell><TableCell>타이포 토큰 목록</TableCell></TableRow>
              <TableRow><TableCell sx={ { fontFamily: 'monospace' } }>layers.layout</TableCell><TableCell>LayoutToken[]</TableCell><TableCell>레이아웃 토큰 (grid/spacing/container)</TableCell></TableRow>
              <TableRow><TableCell sx={ { fontFamily: 'monospace' } }>layers.gradient</TableCell><TableCell>GradientToken[]</TableCell><TableCell>그라디언트 토큰</TableCell></TableRow>
              <TableRow><TableCell sx={ { fontFamily: 'monospace' } }>layers.visualDirection</TableCell><TableCell>{ '{ markdown: string, tags: {genre[],style[],subject[]} }' }</TableCell><TableCell>T3 산출물 중 MD 서술 문서 + 집계 태그</TableCell></TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <SectionTitle title="프로젝트별 분석 결과 요약" />
        { projects.map((project) => {
          const analysis = getAnalysisResult(project.id);
          if (!analysis) return null;

          const vd = analysis.layers.visualDirection || { markdown: '', tags: {} };
          const counts = {
            color: analysis.layers.color.length,
            typography: analysis.layers.typography.length,
            layout: analysis.layers.layout.length,
            gradient: analysis.layers.gradient.length,
            visualDirection: vd.markdown ? 1 : 0,
          };

          return (
            <Box key={ project.id } sx={ { mb: 5 } }>
              <Box sx={ { display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 1 } }>
                <Typography variant="h6" sx={ { fontWeight: 600 } }>{ project.name }</Typography>
                <Typography variant="caption" sx={ { fontFamily: 'monospace', color: 'text.secondary' } }>
                  { project.id }
                </Typography>
                <Chip size="small" label={ project.type } variant="outlined" />
                <Chip size="small" label={ analysis.status } color="success" />
              </Box>

              {/* Layer counts */}
              <Box sx={ { display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' } }>
                { Object.entries(counts).map(([k, v]) => (
                  <Chip key={ k } size="small" label={ `${k}: ${v}` } />
                )) }
              </Box>

              {/* Colors row */}
              <Box sx={ { display: 'flex', gap: 1, mb: 1.5, alignItems: 'center', flexWrap: 'wrap' } }>
                <Typography variant="caption" color="text.secondary" sx={ { minWidth: 80 } }>컬러</Typography>
                { analysis.layers.color.map((c) => (
                  <Box
                    key={ c.id }
                    sx={ {
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                      px: 1,
                      py: 0.5,
                      borderRadius: 999,
                      border: '1px solid',
                      borderColor: 'divider',
                      opacity: c.isEnabled ? 1 : 0.35,
                    } }
                  >
                    <Box sx={ { width: 14, height: 14, borderRadius: '50%', bgcolor: c.hex } } />
                    <Typography variant="caption" sx={ { fontFamily: 'monospace' } }>{ c.hex }</Typography>
                    <Typography variant="caption" color="text.secondary" sx={ { fontSize: 10 } }>
                      { EMPHASIS_LABEL[c.emphasis] }
                    </Typography>
                  </Box>
                )) }
              </Box>

              {/* Gradients row */}
              { analysis.layers.gradient.length > 0 && (
                <Box sx={ { display: 'flex', gap: 1, mb: 1.5, alignItems: 'center', flexWrap: 'wrap' } }>
                  <Typography variant="caption" color="text.secondary" sx={ { minWidth: 80 } }>그라디언트</Typography>
                  { analysis.layers.gradient.map((g) => (
                    <Box
                      key={ g.id }
                      title={ g.label }
                      sx={ {
                        width: 48,
                        height: 28,
                        borderRadius: 1.5,
                        background: g.gradient,
                        border: '1px solid',
                        borderColor: 'divider',
                        opacity: g.isEnabled ? 1 : 0.35,
                      } }
                    />
                  )) }
                </Box>
              ) }

              {/* Visual Direction row — MD 프리뷰 + 태그 집계 */}
              { vd.markdown && (
                <Box sx={ { display: 'flex', gap: 1, alignItems: 'flex-start', mt: 1 } }>
                  <Typography variant="caption" color="text.secondary" sx={ { minWidth: 80, pt: 0.5 } }>비주얼 디렉션</Typography>
                  <Box sx={ { flex: 1 } }>
                    { vd.tags && (
                      <Box sx={ { display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 } }>
                        { Object.entries(vd.tags).flatMap(([cat, list]) =>
                          (list || []).map((t) => (
                            <Chip key={ `${cat}-${t}` } size="small" label={ `${cat}:${t}` } variant="outlined" sx={ { fontSize: 10, height: 20 } } />
                          )),
                        ) }
                      </Box>
                    ) }
                    <Box
                      component="pre"
                      sx={ {
                        m: 0,
                        p: 1.5,
                        bgcolor: 'grey.50',
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        fontSize: 11,
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        maxHeight: 180,
                        overflow: 'auto',
                        fontFamily: 'inherit',
                      } }
                    >
                      { vd.markdown.slice(0, 400) }{ vd.markdown.length > 400 ? '…' : '' }
                    </Box>
                  </Box>
                </Box>
              ) }
            </Box>
          );
        }) }
      </PageContainer>
    </>
  ),
};
