import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
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

// id 생성은 store.addReference 내부에서 처리 (crypto.randomUUID)

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
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, title } | null
  const [deleteState, setDeleteState] = useState({ isDeleting: false, error: null });

  // 항상 hook 호출 (rules of hooks). 값은 useStoreMode일 때만 소비.
  const storeSlice = useReferencesSlice();
  const references = useStoreMode ? storeSlice.references : (externalReferences || []);

  /** 단일 파일 처리: Storage 업로드 + DB insert → 백그라운드 T1 태깅 → updateReference */
  const uploadOne = async (file) => {
    const dataUrl = await fileToDataUrl(file);
    const resized = await resizeDataUrl(dataUrl, 512);

    const ref = await storeSlice.addReference({
      file,
      source: 'file',
      tags: { color: [], typography: [], layout: [], gradient: [], visualDirection: { genre: [], style: [], subject: [] } },
      dominantColors: [],
      title: file.name?.replace(/\.[^.]+$/, '') || 'Untitled',
      _pending: true,
    });

    // 백그라운드 T1 태깅 (실패해도 업로드 자체는 성공 취급)
    try {
      const result = await runAutoTag({ imageUrl: resized });
      await storeSlice.updateReference(ref.id, {
        tags: result.tags,
        dominantColors: result.dominantColors,
        title: result.title,
        _pending: false,
      });
    } catch (tagError) {
      await storeSlice.updateReference(ref.id, { _pending: false, _tagError: tagError?.message || String(tagError) });
    }
    return ref;
  };

  /** 단일 파일 (FileDropzone multiple=false 경로 — 외부 주입 모드용) */
  const handleUploadFile = async (file) => {
    if (!file) return;
    if (onUploadFile && !useStoreMode) { onUploadFile(file); return; }
    if (!useStoreMode) return;
    setUploadState({ isUploading: true, error: null, lastId: null });
    try {
      const ref = await uploadOne(file);
      setUploadState({ isUploading: false, error: null, lastId: ref.id });
    } catch (e) {
      setUploadState({ isUploading: false, error: e?.message || String(e), lastId: null });
    }
  };

  /** 다중 파일: Storage 업로드는 병렬, 각 파일의 T1 태깅도 병렬 진행 */
  const handleUploadFiles = async (files) => {
    const list = Array.from(files || []);
    if (!list.length) return;
    if (!useStoreMode) {
      // 외부 주입 모드: 파일별로 onUploadFile 콜백만 호출
      list.forEach((f) => onUploadFile?.(f));
      return;
    }
    setUploadState({ isUploading: true, error: null, lastId: null });

    const results = await Promise.allSettled(list.map((f) => uploadOne(f)));
    const failed = results.filter((r) => r.status === 'rejected');
    const lastOk = [...results].reverse().find((r) => r.status === 'fulfilled');
    setUploadState({
      isUploading: false,
      error: failed.length ? `${list.length}장 중 ${failed.length}장 업로드 실패` : null,
      lastId: lastOk?.value?.id || null,
    });
  };

  const allTags = useMemo(() => {
    const set = new Set();
    references.forEach((r) => flattenTags(r).forEach((t) => set.add(t)));
    return [...set];
  }, [references]);

  const pendingCount = useMemo(
    () => references.filter((r) => r._pending).length,
    [references],
  );

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

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteState({ isDeleting: true, error: null });
    try {
      await storeSlice.removeReference(deleteTarget.id);
      setDeleteTarget(null);
      setDeleteState({ isDeleting: false, error: null });
    } catch (e) {
      setDeleteState({ isDeleting: false, error: e?.message || String(e) });
    }
  };

  return (
    <>
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
            multiple
            onFileSelect={ handleUploadFile }
            onFilesSelect={ handleUploadFiles }
            variant="compact"
            isUploading={ uploadState.isUploading }
          />
          { uploadState.error && (
            <Alert severity="error" sx={ { mt: 1 } }>{ uploadState.error }</Alert>
          ) }
          { useStoreMode && pendingCount > 0 && (
            <Alert
              severity="info"
              icon={ <CircularProgress size={ 16 } thickness={ 5 } /> }
              sx={ { mt: 1 } }
            >
              { pendingCount }장 자동 태깅 중… 완료되면 카드에 태그가 자동으로 채워집니다
            </Alert>
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
            <Box
              sx={ {
                position: 'relative',
                '&:hover .muse-delete-btn': { opacity: 1 },
              } }
            >
              <ImageCard
                src={ item.thumbnailUrl || item.src }
                title={ item.title }
                tags={ flattenTags(item).slice(0, 3) }
              />
              { useStoreMode && !item._pending && (
                <IconButton
                  className="muse-delete-btn"
                  size="small"
                  aria-label="레퍼런스 삭제"
                  onClick={ (e) => {
                    e.stopPropagation();
                    setDeleteTarget({ id: item.id, title: item.title || '(제목 없음)' });
                  } }
                  sx={ {
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    bgcolor: 'rgba(20,19,43,0.85)',
                    color: 'common.white',
                    opacity: 0,
                    transition: 'opacity 150ms',
                    backdropFilter: 'blur(6px)',
                    '&:hover': { bgcolor: 'error.main' },
                  } }
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              ) }
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

    <Dialog
      open={ !!deleteTarget }
      onClose={ () => !deleteState.isDeleting && setDeleteTarget(null) }
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>레퍼런스 삭제</DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          <strong>{ deleteTarget?.title }</strong> 을(를) 삭제할까요?
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={ { mt: 1, display: 'block' } }>
          이 작업은 되돌릴 수 없습니다. 원본 이미지 파일도 함께 삭제되며, 프로젝트에 연결된 경우 자동으로 해제됩니다.
        </Typography>
        { deleteState.error && (
          <Alert severity="error" sx={ { mt: 2 } }>{ deleteState.error }</Alert>
        ) }
      </DialogContent>
      <DialogActions>
        <Button onClick={ () => setDeleteTarget(null) } disabled={ deleteState.isDeleting }>
          취소
        </Button>
        <Button
          onClick={ handleConfirmDelete }
          color="error"
          variant="contained"
          disabled={ deleteState.isDeleting }
        >
          { deleteState.isDeleting ? '삭제 중...' : '삭제' }
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
}
