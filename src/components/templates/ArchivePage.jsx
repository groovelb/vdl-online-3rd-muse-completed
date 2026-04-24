import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { isSimilarColor } from '../../utils/colorSimilarity';
import { PageContainer } from '../layout/PageContainer.jsx';
import { InfiniteMasonry } from '../layout/InfiniteMasonry.jsx';
import { ImageCard } from '../card/ImageCard.jsx';
import { FileDropzone } from '../input/FileDropzone.jsx';
import { flattenTags } from '../../data/muse';
import { FilterPanel } from './FilterPanel.jsx';
import { useReferenceArchive } from './useReferenceArchive';

/**
 * ArchivePage 템플릿
 *
 * MUSE 아카이브 화면. 업로드/필터링/상세 액션(삭제·재태깅)이 결합된 페이지 레벨 컴포넌트.
 *
 * 동작 흐름:
 * 1. 상단 히어로 아래 FileDropzone으로 이미지를 드래그 또는 선택해 업로드
 *    - `useStoreMode=true` 면 내부에서 Storage/DB 처리 + T1 자동 태깅
 *    - 아니면 `onUploadFile`로 호스트에 위임
 * 2. Sticky FilterPanel — 검색어, 대표 색상, 레이어별 태그로 다중 필터링
 * 3. InfiniteMasonry로 카드 렌더링. 호버 시 삭제 아이콘, 태깅 중·실패 상태 뱃지 표시
 * 4. 삭제 버튼 클릭 시 확인 Dialog 표시 → 승인하면 store에서 제거
 *
 * Props:
 * @param {array}    [references] - 외부 주입 시 store 미사용 모드 [Optional]
 * @param {boolean}  [useStoreMode] - store 직접 사용 여부 [Optional, 기본값: false]
 * @param {function} [onUploadFile] - (file) => void, store 미사용 시 업로드 위임 [Optional]
 * @param {function} [onLoadMore] - 무한 스크롤 추가 로드 [Optional]
 * @param {boolean}  [hasMore] - 추가 로드 가능 여부 [Optional, 기본값: false]
 * @param {boolean}  [isLoading] - 추가 로드 중 여부 [Optional, 기본값: false]
 * @param {function} [onNewProject] - 새 프로젝트 버튼 클릭 콜백 [Optional]
 * @param {object}   [sx] - PageContainer 추가 스타일 [Optional]
 *
 * Example usage:
 * <ArchivePage useStoreMode onNewProject={ () => {} } />
 */
export function ArchivePage({
  references: externalReferences,
  useStoreMode = false,
  onUploadFile,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  onNewProject,
  sx,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTags, setActiveTags] = useState([]);
  const [activeColors, setActiveColors] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteState, setDeleteState] = useState({ isDeleting: false, error: null });

  const {
    references,
    uploadState,
    pendingCount,
    handleUploadFile,
    handleUploadFiles,
    retryTagging,
    removeReference,
  } = useReferenceArchive({ useStoreMode, externalReferences, onUploadFile });

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return references.filter((r) => {
      const refTags = flattenTags(r);
      const matchesTerm = !term
        || (r.title && r.title.toLowerCase().includes(term))
        || refTags.some((t) => t.toLowerCase().includes(term));
      const matchesTags = !activeTags.length
        || activeTags.every((t) => refTags.includes(t));
      // 색상 필터 = 대표 색상환 기반 유사도 매칭 (대표색 1개라도 주변색 포함 → OR)
      const refColors = r.dominantColors || [];
      const matchesColors = !activeColors.length
        || activeColors.some((repHex) => refColors.some((hex) => isSimilarColor(repHex, hex)));
      return matchesTerm && matchesTags && matchesColors;
    });
  }, [references, searchTerm, activeTags, activeColors]);

  const toggleTag = (tag) =>
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  const toggleColor = (hex) => {
    const key = hex.toLowerCase();
    setActiveColors((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key],
    );
  };

  const resetAllFilters = () => {
    setActiveTags([]);
    setActiveColors([]);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteState({ isDeleting: true, error: null });
    try {
      await removeReference(deleteTarget.id);
      setDeleteTarget(null);
      setDeleteState({ isDeleting: false, error: null });
    } catch (e) {
      setDeleteState({ isDeleting: false, error: e?.message || String(e) });
    }
  };

  const hasActiveFilters = !!searchTerm || activeTags.length > 0 || activeColors.length > 0;

  return (
    <>
      <PageContainer sx={ sx }>
        {/* Hero */}
        <Box sx={ { py: { xs: 3, md: 5 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 } }>
          <Typography variant="h3" sx={ { fontWeight: 700, letterSpacing: '-0.02em' } }>Archive</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={ <AddIcon /> }
            onClick={ onNewProject }
          >
            새 프로젝트
          </Button>
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
          <FilterPanel
            references={ references }
            searchTerm={ searchTerm }
            onSearchTermChange={ setSearchTerm }
            activeTags={ activeTags }
            onToggleTag={ toggleTag }
            activeColors={ activeColors }
            onToggleColor={ toggleColor }
            onResetFilters={ resetAllFilters }
            filteredCount={ filtered.length }
            totalCount={ references.length }
            sx={ {
              position: 'sticky',
              top: 64,
              zIndex: 10,
              bgcolor: 'background.default',
              py: 2,
              mb: 3,
            } }
          />

          {/* Grid */}
          <InfiniteMasonry
            items={ filtered }
            hasMore={ hasMore && !hasActiveFilters }
            isLoading={ isLoading }
            onLoadMore={ onLoadMore }
            columns={ { xs: 2, sm: 3, md: 4, lg: 5 } }
            spacing={ 2 }
            emptyContent={
              hasActiveFilters
                ? '조건에 맞는 레퍼런스가 없습니다.'
                : '아직 수집된 레퍼런스가 없습니다. 이미지를 드래그해서 추가해보세요.'
            }
            renderItem={ (item) => (
              <ArchiveCard
                item={ item }
                useStoreMode={ useStoreMode }
                onRequestDelete={ () =>
                  setDeleteTarget({ id: item.id, title: item.title || '(제목 없음)' })
                }
                onRetryTagging={ () => retryTagging(item) }
              />
            ) }
          />

        <Box sx={ { height: 64 } } />
      </PageContainer>

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

/** 아카이브 그리드 내 단일 카드 — 호버 시 삭제, 태깅 상태 오버레이 포함 */
function ArchiveCard({ item, useStoreMode, onRequestDelete, onRetryTagging }) {
  return (
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
        dominantColors={ item.dominantColors || [] }
      />
      { useStoreMode && !item._pending && (
        <IconButton
          className="muse-delete-btn"
          size="small"
          aria-label="레퍼런스 삭제"
          onClick={ (e) => {
            e.stopPropagation();
            onRequestDelete();
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
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            bgcolor: 'error.main',
            color: 'white',
            borderRadius: 999,
            pl: 1,
            pr: 0.25,
            py: 0.25,
            fontSize: 10,
          } }
          title={ item._tagError }
        >
          <span>태깅 실패</span>
          <IconButton
            size="small"
            onClick={ (e) => {
              e.stopPropagation();
              onRetryTagging();
            } }
            aria-label="태깅 다시 시도"
            sx={ {
              p: 0.25,
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
            } }
          >
            <RefreshIcon sx={ { fontSize: 14 } } />
          </IconButton>
        </Box>
      ) }
    </Box>
  );
}
