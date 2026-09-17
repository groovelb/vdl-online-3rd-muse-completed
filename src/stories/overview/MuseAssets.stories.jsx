import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
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
import { ALL_IMAGES, TOKENS_BY_SRC } from '../../utils/exampleImageTokens.js';
import { references } from '../../data/muse';
import motionVideo from '../../assets/video/9-motion.mp4?url';

export default {
  title: 'Overview/MUSE/07 Assets',
  parameters: {
    layout: 'padded',
  },
};

/**
 * 에셋 폴더별 쓰임새.
 * 사용 위치는 `grep -rl 'assets/<폴더>' src --include=*.jsx --include=*.js` 결과의 파일명이다.
 */
const FOLDERS = [
  {
    path: 'src/assets/example',
    count: `${ALL_IMAGES.length}장`,
    usedAt: 'utils/exampleImageTokens.js · card/ReferenceCard.stories.jsx',
    note: '랜딩 배경과 산출물 미리보기가 쓰는 예시 레퍼런스',
  },
  {
    path: 'src/data/muse/dummyImage',
    count: `${references.length}장`,
    usedAt: 'data/muse/references.js · data/muse/projects.js · stories/muse/References.stories.jsx',
    note: '첫 화면 시드와 스토리가 쓰는 더미 레퍼런스',
  },
  {
    path: 'src/assets/video',
    count: '1개 (9-motion.mp4)',
    usedAt: 'scroll/VideoScrubbing.stories.jsx',
    note: '스크롤 스크러빙 예시. 화면에는 쓰이지 않는다',
  },
  {
    path: 'src/assets/reference',
    count: '0개 (빈 폴더)',
    usedAt: '없음',
    note: '참조하는 코드가 없다',
  },
];

/**
 * 라벨과 미디어를 세로로 쌓은 단일 셀. 원본 비율을 유지한다
 *
 * Props:
 * @param {string} label - 아래에 붙는 캡션 [Required]
 * @param {string} src - 이미지 또는 영상 주소 [Required]
 * @param {boolean} isVideo - 영상 여부 [Optional, 기본값: false]
 *
 * Example usage:
 * <AssetCell label="9-motion.mp4" src={ motionVideo } isVideo />
 */
function AssetCell({ label, src, isVideo = false }) {
  return (
    <Stack spacing={ 0.75 }>
      <Box
        sx={ {
          width: '100%',
          backgroundColor: 'grey.100',
          overflow: 'hidden',
          position: 'relative',
          lineHeight: 0,
        } }
      >
        { isVideo ? (
          <Box
            component="video"
            src={ src }
            muted
            loop
            playsInline
            controls
            sx={ { width: '100%', height: 'auto', display: 'block' } }
          />
        ) : (
          <Box
            component="img"
            src={ src }
            alt={ label }
            loading="lazy"
            sx={ { width: '100%', height: 'auto', display: 'block' } }
          />
        ) }
      </Box>
      <Typography
        variant="caption"
        sx={ {
          fontFamily: 'monospace',
          fontSize: 10,
          color: 'text.secondary',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        } }
      >
        { label }
      </Typography>
    </Stack>
  );
}

/** 에셋 폴더와 실제 파일 미리보기 */
export const Default = {
  render: () => (
    <>
      <DocumentTitle
        title="Assets"
        status="Available"
        note="예시 레퍼런스, 더미 레퍼런스, 스크러빙 영상"
        brandName="Design System"
        systemName="MUSE"
        version="1.0"
      />
      <PageContainer>
        <Typography variant="h4" sx={ { fontWeight: 700, mb: 1 } }>
          Assets
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={ { mb: 4 } }>
          MUSE 가 쓰는 이미지는 브랜드 사진이 아니라 도구가 분석하는 소재다. 모든 이미지는 원본 비율 그대로
          표시한다. 사용 여부는 폴더 이름을 코드 전체에서 찾아 판정했다.
        </Typography>

        <SectionTitle title="폴더별 쓰임새" description="경로 · 개수 · 참조하는 파일" />
        <TableContainer sx={ { mb: 6 } }>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={ { fontWeight: 600, width: 220 } }>경로</TableCell>
                <TableCell sx={ { fontWeight: 600, width: 120 } }>개수</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>참조하는 파일</TableCell>
                <TableCell sx={ { fontWeight: 600, width: 220 } }>비고</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              { FOLDERS.map((f) => (
                <TableRow key={ f.path }>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>{ f.path }</TableCell>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>{ f.count }</TableCell>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 11, color: 'text.secondary' } }>
                    { f.usedAt }
                  </TableCell>
                  <TableCell sx={ { fontSize: 12 } }>{ f.note }</TableCell>
                </TableRow>
              )) }
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="h5" sx={ { fontWeight: 700, mt: 2, mb: 2 } }>
          In Use
        </Typography>

        <SectionTitle
          title="Example References"
          description={ `${ALL_IMAGES.length}장 · src/assets/example · 랜딩 배경과 산출물 미리보기. 제목과 대표색은 추출 결과에서 온다` }
        />
        <Grid container spacing={ 3 } sx={ { mb: 6 } }>
          { ALL_IMAGES.map((src) => {
            const meta = TOKENS_BY_SRC[src] || {};
            return (
              <Grid key={ src } size={ { xs: 6, sm: 4, md: 3 } }>
                <AssetCell label={ meta.title || 'untitled' } src={ src } />
                <Box sx={ { display: 'flex', gap: 0.5, mt: 0.5 } }>
                  { (meta.colors || []).map((c) => (
                    <Box
                      key={ c }
                      title={ c }
                      sx={ {
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        backgroundColor: c,
                        border: '1px solid',
                        borderColor: 'divider',
                      } }
                    />
                  )) }
                </Box>
              </Grid>
            );
          }) }
        </Grid>

        <SectionTitle
          title="Dummy References"
          description={ `${references.length}장 · src/data/muse/dummyImage · 첫 화면 시드. 파일명을 그대로 두고 바꿔치기하면 코드 수정이 없다` }
        />
        <Grid container spacing={ 2 } sx={ { mb: 6 } }>
          { references.map((r) => (
            <Grid key={ r.id } size={ { xs: 4, sm: 3, md: 2 } }>
              <AssetCell label={ r.id } src={ r.thumbnailUrl } />
            </Grid>
          )) }
        </Grid>

        <Typography variant="h5" sx={ { fontWeight: 700, mt: 4, mb: 2, color: 'text.secondary' } }>
          Unused (파일만 존재)
        </Typography>

        <SectionTitle
          title="Scrubbing Video"
          description="1개 · src/assets/video/9-motion.mp4 · 스크롤 스크러빙 스토리에서만 쓴다. 번들 대신 주소로 불러온다"
        />
        <Grid container spacing={ 3 } sx={ { mb: 4 } }>
          <Grid size={ { xs: 12, sm: 6, md: 4 } }>
            <AssetCell label="9-motion.mp4" src={ motionVideo } isVideo />
          </Grid>
        </Grid>
      </PageContainer>
    </>
  ),
};
