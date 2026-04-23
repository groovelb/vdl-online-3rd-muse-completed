import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import { AppShell } from '../layout/AppShell.jsx';
import { PageContainer } from '../layout/PageContainer.jsx';
import { InfiniteMasonry } from '../layout/InfiniteMasonry.jsx';
import { ImageCard } from '../card/ImageCard.jsx';
import { SearchBar } from '../input/SearchBar.jsx';
import { FileDropzone } from '../input/FileDropzone.jsx';
import { flattenTags } from '../../data/muse';
import { fileToDataUrl, resizeDataUrl } from '../../utils/museAi';
import { runAutoTag } from '../../utils/museAiTasks';
import { useReferencesSlice } from '../../store';

const makeId = () => `ref-u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

/**
 * ArchivePage 템플릿
 *
 * MUSE 아카이브 화면. `references` prop이 전달되면 외부 데이터를 표시하고,
 * `onUploadFile`가 기본 구현이 아니라면 그쪽에 위임. `useStoreMode=true`면
 * 내부에서 직접 store를 읽고 업로드 파일을 T1 자동 태깅 후 store에 추가.
 *
 * Props:
 * @param {array}   [references]  - 외부 주입 시 store 미사용 모드
 * @param {boolean} [useStoreMode] - store 직접 사용 여부 (앱 통합 시 true)
 * @param {function} [onUploadFile] - (file) => void, 외부 처리 시만
 * @param {function} [onLoadMore]
 * @param {boolean} [hasMore]
 * @param {boolean} [isLoading]
 * @param {function} [onNewProject]
 * @param {node}    [logo]
 * @param {object}  [sx]
 */
export function ArchivePage({
  references: externalReferences,
  useStoreMode = false,
  onUploadFile,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  onNewProject,
  logo,
  sx,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTags, setActiveTags] = useState([]);
  const [uploadState, setUploadState] = useState({ isUploading: false, error: null, lastId: null });

  // 항상 hook 호출 (rules of hooks). 값은 useStoreMode일 때만 소비.
  const storeSlice = useReferencesSlice();
  const references = useStoreMode ? storeSlice.references : (externalReferences || []);

  /** 업로드: 즉시 pending Reference를 store에 추가 → T1 호출 → tags 채워 updateReference */
  const handleUploadFile = async (file) => {
    if (!file) return;
    // 외부 업로드 핸들러가 있으면 우선
    if (onUploadFile && !useStoreMode) {
      onUploadFile(file);
      return;
    }
    if (!useStoreMode) return;

    const id = makeId();
    setUploadState({ isUploading: true, error: null, lastId: id });

    try {
      const dataUrl = await fileToDataUrl(file);
      const thumbnail = await resizeDataUrl(dataUrl, 512);

      // Pending 상태로 먼저 store에 추가 (썸네일 즉시 노출)
      storeSlice.addReference({
        id,
        source: 'file',
        thumbnailUrl: thumbnail,
        tags: { color: [], typography: [], layout: [], gradient: [], visualDirection: { genre: [], style: [], subject: [] } },
        dominantColors: [],
        createdAt: new Date().toISOString().slice(0, 10),
        title: file.name?.replace(/\.[^.]+$/, '') || 'Untitled',
        _pending: true,
      });

      // 백그라운드 T1 태깅
      try {
        const result = await runAutoTag({ imageUrl: thumbnail });
        storeSlice.updateReference(id, {
          tags: result.tags,
          dominantColors: result.dominantColors,
          title: result.title,
          _pending: false,
        });
      } catch (tagError) {
        // 태깅 실패 — pending 해제만, 수동 태그 가능
        storeSlice.updateReference(id, { _pending: false, _tagError: tagError?.message || String(tagError) });
      }
    } catch (e) {
      setUploadState({ isUploading: false, error: e?.message || String(e), lastId: id });
      return;
    }

    setUploadState({ isUploading: false, error: null, lastId: id });
  };

  const allTags = useMemo(() => {
    const set = new Set();
    references.forEach((r) => flattenTags(r).forEach((t) => set.add(t)));
    return [...set];
  }, [references]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return references.filter((r) => {
      const refTags = flattenTags(r);
      const matchesTerm = !term
        || (r.title && r.title.toLowerCase().includes(term))
        || refTags.some((t) => t.toLowerCase().includes(term));
      const matchesTags = !activeTags.length
        || activeTags.every((t) => refTags.includes(t));
      return matchesTerm && matchesTags;
    });
  }, [references, searchTerm, activeTags]);

  const toggleTag = (tag) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  return (
    <AppShell
      logo={ logo || <Typography variant="h6" sx={ { fontWeight: 700 } }>MUSE</Typography> }
      headerPersistent={
        <Button
          variant="contained"
          color="primary"
          startIcon={ <AddIcon /> }
          onClick={ onNewProject }
        >
          새 프로젝트
        </Button>
      }
      sx={ sx }
    >
      <PageContainer>
        {/* Hero */}
        <Box sx={ { py: { xs: 4, md: 8 } } }>
          <Typography variant="h2" sx={ { mb: 1 } }>Archive</Typography>
          <Typography variant="body1" color="text.secondary" sx={ { maxWidth: 640 } }>
            프로젝트와 무관하게 수시로 쌓는 레퍼런스. AI가 자동으로 태그를 달아둔다.
          </Typography>
        </Box>

        {/* Upload dropzone */}
        <Box sx={ { mb: 2 } }>
          <FileDropzone
            onFileSelect={ handleUploadFile }
            variant="compact"
            isUploading={ uploadState.isUploading }
          />
          { uploadState.error && (
            <Alert severity="error" sx={ { mt: 1 } }>{ uploadState.error }</Alert>
          ) }
          { useStoreMode && uploadState.lastId && !uploadState.isUploading && (
            <Box sx={ { display: 'flex', alignItems: 'center', gap: 1, mt: 1 } }>
              <CircularProgress size={ 12 } />
              <Typography variant="caption" color="text.secondary">
                T1 태깅 진행 중 (백그라운드)… 완료되면 태그가 자동으로 채워집니다
              </Typography>
            </Box>
          ) }
        </Box>

        {/* Sticky 필터 바 */}
        <Box
          sx={ {
            position: 'sticky',
            top: 64,
            zIndex: 10,
            bgcolor: 'background.default',
            py: 2,
            mb: 3,
          } }
        >
          <SearchBar
            value={ searchTerm }
            placeholder="제목 또는 태그 검색"
            onChange={ setSearchTerm }
            onClear={ () => setSearchTerm('') }
            isFullWidth
          />
          { allTags.length > 0 && (
            <Box sx={ { display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 2 } }>
              { allTags.map((tag) => (
                <Chip
                  key={ tag }
                  label={ tag }
                  size="small"
                  color={ activeTags.includes(tag) ? 'primary' : 'default' }
                  variant={ activeTags.includes(tag) ? 'filled' : 'outlined' }
                  onClick={ () => toggleTag(tag) }
                />
              )) }
              { activeTags.length > 0 && (
                <Button size="small" variant="text" onClick={ () => setActiveTags([]) }>
                  초기화
                </Button>
              ) }
            </Box>
          ) }
          <Typography
            variant="caption"
            color="text.secondary"
            sx={ { display: 'block', mt: 1.5 } }
          >
            { filtered.length } / { references.length } 개 표시됨
          </Typography>
        </Box>

        {/* Grid */}
        <InfiniteMasonry
          items={ filtered }
          hasMore={ hasMore && !searchTerm && !activeTags.length }
          isLoading={ isLoading }
          onLoadMore={ onLoadMore }
          columns={ { xs: 2, sm: 3, md: 4, lg: 5 } }
          spacing={ 2 }
          emptyContent={
            searchTerm || activeTags.length
              ? '조건에 맞는 레퍼런스가 없습니다.'
              : '아직 수집된 레퍼런스가 없습니다. 이미지를 드래그해서 추가해보세요.'
          }
          renderItem={ (item) => (
            <Box sx={ { position: 'relative' } }>
              <ImageCard
                src={ item.thumbnailUrl || item.src }
                title={ item.title }
                tags={ flattenTags(item).slice(0, 3) }
              />
              { item._pending && (
                <Box
                  sx={ {
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'rgba(252,252,255,0.9)',
                    borderRadius: 999,
                    px: 1,
                    py: 0.25,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    backdropFilter: 'blur(6px)',
                  } }
                >
                  <CircularProgress size={ 10 } thickness={ 5 } />
                  <Typography variant="caption" sx={ { fontSize: 10, color: 'text.secondary' } }>
                    태깅 중
                  </Typography>
                </Box>
              ) }
              { item._tagError && (
                <Box
                  sx={ {
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'error.main',
                    color: 'white',
                    borderRadius: 999,
                    px: 1,
                    py: 0.25,
                    fontSize: 10,
                  } }
                  title={ item._tagError }
                >
                  태깅 실패
                </Box>
              ) }
            </Box>
          ) }
        />

        <Box sx={ { height: 64 } } />
      </PageContainer>
    </AppShell>
  );
}
