import { useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { isSimilarColor } from '../../utils/colorSimilarity';
import { PageContainer } from '../layout/PageContainer.jsx';
import { InfiniteMasonry } from '../layout/InfiniteMasonry.jsx';
import { ReferenceCard } from '../card/ReferenceCard.jsx';
import { FileDropzone } from '../input/FileDropzone.jsx';
import { ReferenceDetailDialog } from '../overlay-feedback/ReferenceDetailDialog.jsx';
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
  const [detailTarget, setDetailTarget] = useState(null);
  const [isAddRefOpen, setIsAddRefOpen] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const heroRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return undefined;
    const obs = new IntersectionObserver(
      ([entry]) => setIsHeroVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

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
    setActiveColors((prev) =>
      prev.includes(hex) ? prev.filter((c) => c !== hex) : [...prev, hex],
    );
  };

  const resetAllFilters = () => {
    setActiveTags([]);
    setActiveColors([]);
  };

  const resetColors = () => setActiveColors([]);

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
      <PageContainer variant="fluid" sx={sx}>
        {/* Hero */}
        <Box ref={heroRef} sx={{ py: { xs: 4, md: 8 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Typography variant="h2" sx={{ fontWeight: 600, letterSpacing: '-0.02em' }}>Archive</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setIsAddRefOpen(true)}
          >
            레퍼런스 추가
          </Button>
        </Box>

        {uploadState.error && (
          <Alert severity="error" sx={{ mb: 2 }}>{uploadState.error}</Alert>
        )}
        {useStoreMode && pendingCount > 0 && (
          <Alert
            severity="info"
            icon={<CircularProgress size={16} thickness={5} />}
            sx={{ mb: 2 }}
          >
            {pendingCount}장 자동 태깅 중… 완료되면 카드에 태그가 자동으로 채워집니다
          </Alert>
        )}

        {/* 좌측 sticky 필터 사이드바 + 우측 fluid 그리드 */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 2, md: 4 },
            alignItems: 'flex-start',
          }}
        >
          <Box
            sx={{
              width: { xs: '100%', md: 240 },
              flexShrink: 0,
              position: { md: 'sticky' },
              top: { md: 88 },
              alignSelf: { md: 'flex-start' },
            }}
          >
            <FilterPanel
              references={references}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              activeTags={activeTags}
              onToggleTag={toggleTag}
              activeColors={activeColors}
              onToggleColor={toggleColor}
              onResetColors={resetColors}
              onResetFilters={resetAllFilters}
              filteredCount={filtered.length}
              totalCount={references.length}
            />
          </Box>

          <Box sx={{ flex: 1, width: '100%', minWidth: 0 }}>
            <InfiniteMasonry
              items={filtered}
              hasMore={hasMore && !hasActiveFilters}
              isLoading={isLoading}
              onLoadMore={onLoadMore}
              columns={{ xs: 2, sm: 3, md: 3, lg: 4, xl: 5 }}
              spacing={4}
              emptyContent={
                hasActiveFilters
                  ? '조건에 맞는 레퍼런스가 없습니다.'
                  : '아직 수집된 레퍼런스가 없습니다. 이미지를 드래그해서 추가해보세요.'
              }
              renderItem={(item) => (
                <ArchiveCard
                  item={item}
                  useStoreMode={useStoreMode}
                  onOpenDetail={() => setDetailTarget(item)}
                  onRequestDelete={() =>
                    setDeleteTarget({ id: item.id, title: item.title || '(제목 없음)' })
                  }
                  onRetryTagging={() => retryTagging(item)}
                />
              )}
            />
          </Box>
        </Box>

        <Box sx={{ height: 64 }} />
      </PageContainer>

      <Fab
        color="primary"
        variant="extended"
        aria-label="레퍼런스 추가"
        onClick={() => setIsAddRefOpen(true)}
        sx={{
          position: 'fixed',
          bottom: { xs: 24, md: 32 },
          right: { xs: 24, md: 32 },
          zIndex: (theme) => theme.zIndex.fab,
          opacity: isHeroVisible ? 0 : 1,
          transform: isHeroVisible ? 'translateY(8px)' : 'translateY(0)',
          pointerEvents: isHeroVisible ? 'none' : 'auto',
          transition: 'opacity 200ms ease, transform 200ms ease',
        }}
      >
        <AddIcon sx={{ mr: 1 }} />
        레퍼런스 추가
      </Fab>

      <Dialog
        open={!!deleteTarget}
        onClose={() => !deleteState.isDeleting && setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>레퍼런스 삭제</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            <strong>{deleteTarget?.title}</strong> 을(를) 삭제할까요?
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            이 작업은 되돌릴 수 없습니다. 원본 이미지 파일도 함께 삭제되며, 프로젝트에 연결된 경우 자동으로 해제됩니다.
          </Typography>
          {deleteState.error && (
            <Alert severity="error" sx={{ mt: 2 }}>{deleteState.error}</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleteState.isDeleting}>
            취소
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteState.isDeleting}
          >
            {deleteState.isDeleting ? '삭제 중...' : '삭제'}
          </Button>
        </DialogActions>
      </Dialog>

      <ReferenceDetailDialog
        reference={detailTarget}
        onClose={() => setDetailTarget(null)}
        activeTags={activeTags}
        activeColors={activeColors}
      />

      <Dialog
        open={isAddRefOpen}
        onClose={() => setIsAddRefOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>레퍼런스 추가</DialogTitle>
        <DialogContent>
          <FileDropzone
            multiple
            onFileSelect={(file) => {
              setIsAddRefOpen(false);
              handleUploadFile(file);
            }}
            onFilesSelect={(files) => {
              setIsAddRefOpen(false);
              handleUploadFiles(files);
            }}
            variant="default"
            isUploading={false}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            hidden
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              e.target.value = '';
              if (!files.length) return;
              setIsAddRefOpen(false);
              if (files.length > 1) handleUploadFiles(files);
              else handleUploadFile(files[0]);
            }}
          />
          {uploadState.error && (
            <Alert severity="error" sx={{ mt: 2 }}>{uploadState.error}</Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            startIcon={<UploadFileIcon />}
            onClick={() => fileInputRef.current?.click()}
          >
            파일 업로드
          </Button>
          <Button onClick={() => setIsAddRefOpen(false)}>
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

/** 아카이브 그리드 내 단일 카드 — 호버 시 삭제, 태깅 상태 오버레이 포함 */
function ArchiveCard({ item, useStoreMode, onOpenDetail, onRequestDelete, onRetryTagging }) {
  return (
    <Box
      sx={{
        position: 'relative',
        '&:hover .muse-delete-btn': { opacity: 1 },
      }}
    >
      <ReferenceCard
        src={item.thumbnailUrl || item.src}
        title={item.title}
        tags={flattenTags(item).slice(0, 3)}
        dominantColors={item.dominantColors || []}
        state={item._pending ? 1 : 2}
        analyzingVariant="chip"
        errorMessage={item._tagError}
        onRetry={onRetryTagging}
        onClick={onOpenDetail}
      />
      {useStoreMode && !item._pending && (
        <IconButton
          className="muse-delete-btn"
          size="small"
          aria-label="레퍼런스 삭제"
          onClick={(e) => {
            e.stopPropagation();
            onRequestDelete();
          }}
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            bgcolor: 'rgba(20,19,43,0.85)',
            color: 'common.white',
            opacity: 0,
            transition: 'opacity 150ms',
            backdropFilter: 'blur(6px)',
            '&:hover': { bgcolor: 'error.main' },
          }}
        >
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
}
