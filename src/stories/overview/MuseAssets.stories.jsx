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
import assetInventory from '../../data/assetInventory.js';
import { TOKENS_BY_SRC } from '../../utils/exampleImageTokens.js';
import { references } from '../../data/muse';

export default {
  title: 'Overview/MUSE/07 Assets',
  parameters: {
    layout: 'padded',
  },
};

/** src/assets 아래 모든 파일을 번들해 importKey 로 찾을 수 있게 한다 */
const bundled = import.meta.glob(
  '../../assets/**/*.{png,jpg,jpeg,webp,gif,svg,avif,mp4,webm,mp3,wav,woff,woff2}',
  { eager: true, query: '?url', import: 'default' },
);

/** 인벤토리 항목을 실제 주소로 바꾼다. public 은 url, src/assets 는 번들 결과 */
const srcOf = (item) => (item.url ? item.url : bundled[item.importKey] || null);

/**
 * 폴더 이름으로 쓰임새를 적는다.
 * 판정은 `grep -rl 'assets/<폴더>' src --include=*.jsx --include=*.js` 한 번의 결과다.
 */
const FOLDER_NOTE = {
  'src/assets/example': {
    usedAt: 'utils/exampleImageTokens.js · card/ReferenceCard.stories.jsx',
    inUse: true,
    note: '랜딩 배경과 산출물 미리보기가 쓰는 예시 레퍼런스',
  },
  'src/assets/video': {
    usedAt: 'scroll/VideoScrubbing.stories.jsx',
    inUse: false,
    note: '스크롤 스크러빙 스토리에서만 쓴다',
  },
  'src/assets/(root)': {
    usedAt: '없음',
    inUse: false,
    note: '스타터킷에서 따라온 기본 로고',
  },
  'public/(root)': {
    usedAt: '없음',
    inUse: false,
    note: '빌드 도구 기본 로고',
  },
};

/** 폴더 키. 인벤토리 summary 와 같은 규칙으로 만든다 */
const folderKey = (item) => `${item.root}/${item.folder || '(root)'}`;

/** 바이트를 읽기 쉬운 단위로 */
const readableSize = (bytes) => {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${bytes}B`;
};

/** 폴더별로 항목을 묶는다. summary 의 키 순서를 따른다 */
const FOLDERS = Object.keys(assetInventory.summary).map((key) => ({
  key,
  summary: assetInventory.summary[key],
  items: assetInventory.items.filter((it) => folderKey(it) === key),
  meta: FOLDER_NOTE[key] || { usedAt: '미확인', inUse: false, note: '' },
}));

const KIND_ORDER = ['image', 'video', 'audio', 'font', 'model', 'other'];

/** 더미 레퍼런스는 인벤토리 밖(src/data/muse/dummyImage)이라 따로 센다 */
const DUMMY_COUNT = references.length;

/**
 * 고정 비율 상자에 이미지를 담고 아래에 파일명을 단다
 *
 * Props:
 * @param {string} label - 캡션 [Required]
 * @param {string} src - 이미지 주소 [Required]
 * @param {string} caption - 두 번째 줄 캡션 [Optional]
 *
 * Example usage:
 * <ImageCell label="ref-001" src={ url } caption="84KB" />
 */
function ImageCell({ label, src, caption }) {
  return (
    <Stack spacing={ 0.5 }>
      <Box
        sx={ {
          width: '100%',
          aspectRatio: '4 / 3',
          backgroundColor: 'grey.100',
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        } }
      >
        { src && (
          <Box
            component="img"
            src={ src }
            alt={ label }
            loading="lazy"
            sx={ { width: '100%', height: '100%', objectFit: 'contain', display: 'block' } }
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
      { caption && (
        <Typography variant="caption" sx={ { fontSize: 10, color: 'text.disabled' } }>
          { caption }
        </Typography>
      ) }
    </Stack>
  );
}

/**
 * 폴더 하나를 종류별로 그린다
 *
 * Props:
 * @param {object} folder - FOLDERS 의 한 항목 [Required]
 *
 * Example usage:
 * <FolderSection folder={ FOLDERS[0] } />
 */
function FolderSection({ folder }) {
  const byKind = (kind) => folder.items.filter((it) => it.kind === kind);
  const images = byKind('image');
  const videos = byKind('video');
  const audios = byKind('audio');
  const rest = folder.items.filter((it) => !['image', 'video', 'audio'].includes(it.kind));

  return (
    <Box sx={ { mb: 6 } }>
      <SectionTitle
        title={ folder.key }
        description={ `${folder.summary.files}개 · ${readableSize(folder.summary.bytes)} · ${folder.meta.inUse ? '사용 중' : '미사용'} · ${folder.meta.note}` }
      />
      <Typography variant="body2" color="text.secondary" sx={ { mb: 2, fontFamily: 'monospace', fontSize: 11 } }>
        참조: { folder.meta.usedAt }
        { KIND_ORDER.filter((k) => folder.summary[k] > 0).map((k) => ` · ${k} ${folder.summary[k]}`).join('') }
      </Typography>

      { images.length > 0 && (
        <Grid container spacing={ 2 } sx={ { mb: 3 } }>
          { images.map((it) => {
            const src = srcOf(it);
            const meta = TOKENS_BY_SRC[src] || {};
            return (
              <Grid key={ it.path } size={ { xs: 6, sm: 4, md: 3, lg: 2 } }>
                <ImageCell
                  label={ it.name }
                  src={ src }
                  caption={ `${readableSize(it.bytes)}${meta.title ? ` · ${meta.title}` : ''}` }
                />
              </Grid>
            );
          }) }
        </Grid>
      ) }

      { videos.length > 0 && (
        <Grid container spacing={ 2 } sx={ { mb: 3 } }>
          { videos.map((it) => (
            <Grid key={ it.path } size={ { xs: 12, sm: 6, md: 4 } }>
              <Stack spacing={ 0.5 }>
                <Box
                  component="video"
                  src={ srcOf(it) }
                  controls
                  preload="metadata"
                  sx={ { width: '100%', display: 'block', backgroundColor: 'grey.100' } }
                />
                <Typography variant="caption" sx={ { fontFamily: 'monospace', fontSize: 10, color: 'text.secondary' } }>
                  { it.name } · { readableSize(it.bytes) }
                </Typography>
              </Stack>
            </Grid>
          )) }
        </Grid>
      ) }

      { audios.length > 0 && (
        <Stack spacing={ 1 } sx={ { mb: 3 } }>
          { audios.map((it) => (
            <Stack key={ it.path } spacing={ 0.5 }>
              <Box component="audio" src={ srcOf(it) } controls preload="none" sx={ { width: '100%' } } />
              <Typography variant="caption" sx={ { fontFamily: 'monospace', fontSize: 10, color: 'text.secondary' } }>
                { it.name } · { readableSize(it.bytes) }
              </Typography>
            </Stack>
          )) }
        </Stack>
      ) }

      { rest.length > 0 && (
        <TableContainer sx={ { mb: 3 } }>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={ { fontWeight: 600, width: 300 } }>name</TableCell>
                <TableCell sx={ { fontWeight: 600, width: 100 } }>kind</TableCell>
                <TableCell sx={ { fontWeight: 600, width: 100 } }>size</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>path</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              { rest.map((it) => (
                <TableRow key={ it.path }>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 11 } }>{ it.name }</TableCell>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 11 } }>{ it.kind }</TableCell>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 11 } }>{ readableSize(it.bytes) }</TableCell>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 11, color: 'text.secondary' } }>{ it.path }</TableCell>
                </TableRow>
              )) }
            </TableBody>
          </Table>
        </TableContainer>
      ) }
    </Box>
  );
}

/** 인벤토리의 모든 에셋을 폴더별로 그린다 */
export const Default = {
  render: () => (
    <>
      <DocumentTitle
        title="Assets"
        status="Available"
        note="src/assets 와 public 의 모든 파일"
        brandName="Design System"
        systemName="MUSE"
        version="1.0"
      />
      <PageContainer>
        <Typography variant="h4" sx={ { fontWeight: 700, mb: 1 } }>
          Assets
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={ { mb: 1 } }>
          <code>src/data/assetInventory.js</code> · 재생성: <code>pnpm generate-assets</code>
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={ { mb: 4 } }>
          MUSE 가 쓰는 이미지는 브랜드 사진이 아니라 도구가 분석하는 소재다. 인벤토리의 모든 항목을 폴더별로
          빠짐없이 그린다. 이미지는 고정 비율 상자에 원본을 맞춰 넣고, 영상과 소리는 재생기로 건다.
        </Typography>

        <SectionTitle
          title="폴더 요약"
          description={ `${assetInventory.items.length}개 · ${readableSize(assetInventory.items.reduce((s, i) => s + i.bytes, 0))}` }
        />
        <TableContainer sx={ { mb: 6 } }>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={ { fontWeight: 600, width: 200 } }>폴더</TableCell>
                <TableCell sx={ { fontWeight: 600, width: 80 } }>파일</TableCell>
                <TableCell sx={ { fontWeight: 600, width: 90 } }>용량</TableCell>
                <TableCell sx={ { fontWeight: 600, width: 90 } }>사용</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>참조하는 파일</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              { FOLDERS.map((f) => (
                <TableRow key={ f.key }>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>{ f.key }</TableCell>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>{ f.summary.files }</TableCell>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>{ readableSize(f.summary.bytes) }</TableCell>
                  <TableCell sx={ { fontSize: 12 } }>{ f.meta.inUse ? '사용 중' : '미사용' }</TableCell>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 11, color: 'text.secondary' } }>
                    { f.meta.usedAt }
                  </TableCell>
                </TableRow>
              )) }
              <TableRow>
                <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>src/data/muse/dummyImage</TableCell>
                <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>{ DUMMY_COUNT }</TableCell>
                <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>2.7MB</TableCell>
                <TableCell sx={ { fontSize: 12 } }>사용 중</TableCell>
                <TableCell sx={ { fontFamily: 'monospace', fontSize: 11, color: 'text.secondary' } }>
                  data/muse/references.js · 썸네일은 05 Reference Data 에서 본다
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        { FOLDERS.map((f) => (
          <FolderSection key={ f.key } folder={ f } />
        )) }
      </PageContainer>
    </>
  ),
};
