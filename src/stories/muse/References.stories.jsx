import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import { references, referencesById, flattenTags } from '../../data/muse';
import {
  DocumentTitle,
  PageContainer,
  SectionTitle,
} from '../../components/storybookDocumentation';

export default {
  title: 'MUSE/Data/References',
  parameters: { layout: 'padded' },
};

/** Docs — 전체 목록 + 스키마 설명 */
export const Docs = {
  render: () => (
    <>
      <DocumentTitle
        title="References Dataset"
        status="Available"
        note="Shared dummy references used by all MUSE stories"
        brandName="MUSE"
        systemName="Data"
        version="1.0"
      />
      <PageContainer>
        <Typography variant="h4" sx={ { fontWeight: 700, mb: 1 } }>
          References Dataset
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={ { mb: 4 } }>
          모든 MUSE 스토리와 페이지 템플릿이 공유하는 더미 레퍼런스 { references.length }건.
          실제 이미지는 <code>src/data/muse/dummyImage/</code>에 있으며, 모든 스토리가 이 데이터셋에서 파생된다.
        </Typography>

        <SectionTitle title="스키마" description="docs/muse/02-ux-flow.md의 Reference 모델" />
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
              <TableRow><TableCell sx={ { fontFamily: 'monospace' } }>id</TableCell><TableCell>string</TableCell><TableCell>고유 식별자 (ref-001 ~ ref-028)</TableCell></TableRow>
              <TableRow><TableCell sx={ { fontFamily: 'monospace' } }>source</TableCell><TableCell>'file' | 'url'</TableCell><TableCell>입력 소스 유형</TableCell></TableRow>
              <TableRow><TableCell sx={ { fontFamily: 'monospace' } }>thumbnailUrl</TableCell><TableCell>string</TableCell><TableCell>번들된 이미지 URL (Vite import)</TableCell></TableRow>
              <TableRow><TableCell sx={ { fontFamily: 'monospace' } }>tags</TableCell><TableCell>ReferenceLayeredTags</TableCell><TableCell>{ '{ color[], typography[], layout[], gradient[], visualDirection: {genre[],style[],subject[]} }' }</TableCell></TableRow>
              <TableRow><TableCell sx={ { fontFamily: 'monospace' } }>dominantColors</TableCell><TableCell>string[]</TableCell><TableCell>대표 색 HEX 2개</TableCell></TableRow>
              <TableRow><TableCell sx={ { fontFamily: 'monospace' } }>createdAt</TableCell><TableCell>string (YYYY-MM-DD)</TableCell><TableCell>생성일</TableCell></TableRow>
              <TableRow><TableCell sx={ { fontFamily: 'monospace' } }>title</TableCell><TableCell>string</TableCell><TableCell>제목</TableCell></TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <SectionTitle title="Exports" description="src/data/muse/references.js에서 export하는 항목" />
        <Box component="pre" sx={ { bgcolor: 'grey.100', p: 2, borderRadius: 2, fontSize: 12, overflow: 'auto', mb: 4 } }>
{ `// 전체 배열
import { references } from 'src/data/muse';

// id로 빠르게 찾기
import { referencesById } from 'src/data/muse';
referencesById['ref-001']; // { id, thumbnailUrl, ... }

// 프로젝트 썸네일용 — id 배열 → URL 배열
import { getReferenceThumbnails } from 'src/data/muse';
getReferenceThumbnails(['ref-001','ref-002','ref-003'], 4);` }
        </Box>

        <SectionTitle title={ `전체 목록 (${references.length}건)` } />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={ { fontWeight: 600, width: 100 } }>Preview</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>ID</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>Title</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>Tags</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>Source</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              { references.map((ref) => (
                <TableRow key={ ref.id } hover>
                  <TableCell>
                    <Box
                      component="img"
                      src={ ref.thumbnailUrl }
                      alt={ ref.title }
                      sx={ {
                        width: 80,
                        height: 54,
                        objectFit: 'cover',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                      } }
                    />
                  </TableCell>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>{ ref.id }</TableCell>
                  <TableCell>{ ref.title }</TableCell>
                  <TableCell>
                    <Box sx={ { display: 'flex', gap: 0.5, flexWrap: 'wrap' } }>
                      { flattenTags(ref).map((t) => <Chip key={ t } size="small" label={ t } />) }
                    </Box>
                  </TableCell>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>{ ref.source }</TableCell>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>{ ref.createdAt }</TableCell>
                </TableRow>
              )) }
            </TableBody>
          </Table>
        </TableContainer>
      </PageContainer>
    </>
  ),
};

/** Grid — 썸네일 그리드 시각화 */
export const Grid = {
  render: () => (
    <PageContainer>
      <Typography variant="h4" sx={ { fontWeight: 700, mb: 1 } }>
        References · Grid View
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={ { mb: 4 } }>
        { references.length }건의 더미 이미지 썸네일
      </Typography>

      <Box
        sx={ {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 2,
        } }
      >
        { references.map((ref) => (
          <Box key={ ref.id }>
            <Box
              component="img"
              src={ ref.thumbnailUrl }
              alt={ ref.title }
              sx={ {
                width: '100%',
                aspectRatio: '3 / 2',
                objectFit: 'cover',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                display: 'block',
              } }
            />
            <Box sx={ { mt: 1 } }>
              <Typography variant="caption" sx={ { fontFamily: 'monospace', display: 'block', color: 'text.secondary' } }>
                { ref.id }
              </Typography>
              <Typography variant="body2" sx={ { fontWeight: 500 } }>
                { ref.title }
              </Typography>
              <Box sx={ { display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' } }>
                { flattenTags(ref).slice(0, 3).map((t) => (
                  <Chip key={ t } size="small" label={ t } sx={ { height: 18, fontSize: 10 } } />
                )) }
              </Box>
            </Box>
          </Box>
        )) }
      </Box>
    </PageContainer>
  ),
};

/** ById — 개별 조회 예시 */
export const ById = {
  render: () => {
    const samples = ['ref-001', 'ref-010', 'ref-018', 'ref-028'];
    return (
      <PageContainer>
        <Typography variant="h4" sx={ { fontWeight: 700, mb: 1 } }>
          referencesById lookup
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={ { mb: 4 } }>
          id로 직접 조회하는 예시
        </Typography>

        { samples.map((id) => {
          const ref = referencesById[id];
          if (!ref) return null;
          return (
            <Box key={ id } sx={ { display: 'flex', gap: 3, mb: 3, alignItems: 'center' } }>
              <Box
                component="img"
                src={ ref.thumbnailUrl }
                alt={ ref.title }
                sx={ {
                  width: 160,
                  height: 108,
                  objectFit: 'cover',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                } }
              />
              <Box
                component="pre"
                sx={ {
                  flex: 1,
                  m: 0,
                  p: 2,
                  bgcolor: 'grey.100',
                  borderRadius: 2,
                  fontSize: 12,
                  fontFamily: 'monospace',
                  overflow: 'auto',
                } }
              >
                { JSON.stringify(ref, null, 2) }
              </Box>
            </Box>
          );
        }) }
      </PageContainer>
    );
  },
};
