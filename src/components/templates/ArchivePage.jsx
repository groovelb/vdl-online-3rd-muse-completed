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
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { REPRESENTATIVE_COLORS, isSimilarColor } from '../../utils/colorSimilarity';
import { AppShell } from '../layout/AppShell.jsx';
import { PageContainer } from '../layout/PageContainer.jsx';
import { InfiniteMasonry } from '../layout/InfiniteMasonry.jsx';
import { ImageCard } from '../card/ImageCard.jsx';
import { SearchBar } from '../input/SearchBar.jsx';
import { FileDropzone } from '../input/FileDropzone.jsx';
import { flattenTags } from '../../data/muse';
import { fileToDataUrl, resizeDataUrl, imageUrlToBase64DataUrl } from '../../utils/museAi';
import { runAutoTag } from '../../utils/museAiTasks';
import { useReferencesSlice } from '../../store';

// id 생성은 store.addReference 내부에서 처리 (crypto.randomUUID)

/** 필터 카테고리 Accordion — 접기/펼치기 */
function FilterAccordion({ label, count, defaultExpanded = false, children }) {
  return (
    <Accordion
      defaultExpanded={ defaultExpanded }
      disableGutters
      elevation={ 0 }
      sx={ {
        bgcolor: 'transparent',
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:before': { display: 'none' },
        '&:last-of-type': { borderBottom: 'none' },
      } }
    >
      <AccordionSummary
        expandIcon={ <ExpandMoreIcon fontSize="small" /> }
        sx={ { px: 0, minHeight: 40, '& .MuiAccordionSummary-content': { my: 1 } } }
      >
        <Typography
          variant="overline"
          sx={ { fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em', color: 'text.primary' } }
        >
          { label }
          { count > 0 && (
            <Box component="span" sx={ { ml: 1, color: 'primary.main', fontSize: '0.7rem' } }>
              { count }
            </Box>
          ) }
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={ { px: 0, pt: 0, pb: 2, display: 'flex', flexDirection: 'column', gap: 1.5 } }>
        { children }
      </AccordionDetails>
    </Accordion>
  );
}

/** 서브 행 (타이포 / 레이아웃 / 그라디언트 / 장르 / 스타일 / 주제 레벨) */
function FilterSubRow({ label, children }) {
  return (
    <Box sx={ { display: 'flex', alignItems: 'flex-start', gap: 1.5 } }>
      <Typography
        variant="caption"
        sx={ { minWidth: 64, pt: 0.75, color: 'text.secondary', fontSize: '0.72rem' } }
      >
        { label }
      </Typography>
      <Box sx={ { display: 'flex', flexWrap: 'wrap', gap: 0.5 } }>
        { children }
      </Box>
    </Box>
  );
}

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
  headerEnd,
  sx,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTags, setActiveTags] = useState([]);
  const [activeColors, setActiveColors] = useState([]); // hex 필터 (dominantColors 기반)
  const [uploadState, setUploadState] = useState({ isUploading: false, error: null, lastId: null });
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, title } | null
  const [deleteState, setDeleteState] = useState({ isDeleting: false, error: null });

  // 항상 hook 호출 (rules of hooks). 값은 useStoreMode일 때만 소비.
  const storeSlice = useReferencesSlice();
  const references = useStoreMode ? storeSlice.references : (externalReferences || []);

  /**
   * 단일 파일 처리: Storage 업로드 + DB insert → 백그라운드 T1 태깅 → updateReference
   * Storage/DB 실패 시 1회 재시도 (네트워크 일시 장애 방어)
   */
  const uploadOne = async (file) => {
    const dataUrl = await fileToDataUrl(file);
    const resized = await resizeDataUrl(dataUrl, 512);

    const addWithRetry = async () => {
      try {
        return await storeSlice.addReference({
          file,
          source: 'file',
          tags: { color: [], typography: [], layout: [], gradient: [], visualDirection: { genre: [], style: [], subject: [] } },
          dominantColors: [],
          extracted: {},
          title: file.name?.replace(/\.[^.]+$/, '') || 'Untitled',
          _pending: true,
        });
      } catch (e) {
        // 1회 재시도 (Storage/DB 네트워크 일시 장애)
        // eslint-disable-next-line no-console
        console.warn('[uploadOne] 1차 실패, 재시도', file.name, e);
        await new Promise((r) => setTimeout(r, 500));
        return await storeSlice.addReference({
          file,
          source: 'file',
          tags: { color: [], typography: [], layout: [], gradient: [], visualDirection: { genre: [], style: [], subject: [] } },
          dominantColors: [],
          extracted: {},
          title: file.name?.replace(/\.[^.]+$/, '') || 'Untitled',
          _pending: true,
        });
      }
    };

    const ref = await addWithRetry();

    // T1 태깅 실패는 reference 자체 삭제하지 않음 — _tagError 표시 후 수동 편집 가능
    try {
      const result = await runAutoTag({ imageUrl: resized });
      await storeSlice.updateReference(ref.id, {
        tags: result.tags,
        dominantColors: result.dominantColors,
        title: result.title,
        extracted: result.extracted || {},
        _pending: false,
      });
    } catch (tagError) {
      await storeSlice.updateReference(ref.id, { _pending: false, _tagError: tagError?.message || String(tagError) });
    }
    return ref;
  };

  /** concurrency 제한 배치 실행 — 병렬 폭주로 인한 rate limit/timeout 방어 */
  const runWithConcurrency = async (items, limit, fn) => {
    const results = new Array(items.length);
    let cursor = 0;
    const worker = async () => {
      while (cursor < items.length) {
        const i = cursor;
        cursor += 1;
        try {
          results[i] = { status: 'fulfilled', value: await fn(items[i]), item: items[i] };
        } catch (e) {
          results[i] = { status: 'rejected', reason: e, item: items[i] };
        }
      }
    };
    await Promise.all(Array(Math.min(limit, items.length)).fill(null).map(worker));
    return results;
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

  /**
   * 다중 파일: 동시 3개씩 배치 처리.
   *   - 무제한 병렬이면 Supabase Storage / Anthropic API rate limit 시 drop 발생
   *   - addReference 내부에도 1회 재시도 로직 있음
   *   - 최종 실패한 파일명 리스트를 사용자에게 표시
   */
  const handleUploadFiles = async (files) => {
    const list = Array.from(files || []);
    if (!list.length) return;
    if (!useStoreMode) {
      list.forEach((f) => onUploadFile?.(f));
      return;
    }
    setUploadState({ isUploading: true, error: null, lastId: null });

    const results = await runWithConcurrency(list, 3, (f) => uploadOne(f));
    const failed = results.filter((r) => r.status === 'rejected');
    const lastOk = [...results].reverse().find((r) => r.status === 'fulfilled');

    let errorMsg = null;
    if (failed.length) {
      const names = failed.map((r) => r.item?.name || '?').slice(0, 3).join(', ');
      const more = failed.length > 3 ? ` 외 ${failed.length - 3}장` : '';
      errorMsg = `${failed.length}장 업로드 실패: ${names}${more}`;
      // eslint-disable-next-line no-console
      console.warn('[handleUploadFiles] 실패 목록', failed.map((r) => ({ name: r.item?.name, reason: r.reason?.message })));
    }

    setUploadState({
      isUploading: false,
      error: errorMsg,
      lastId: lastOk?.value?.id || null,
    });
  };

  /**
   * 레퍼런스 메타데이터 구조 그대로 필터 섹션에 노출:
   *   typography / layout / gradient / genre / style / subject
   * 색상은 태그가 아닌 dominantColors(hex) 로 별도 처리.
   */
  const layeredTags = useMemo(() => {
    const buckets = {
      typography: new Set(),
      layout: new Set(),
      gradient: new Set(),
      genre: new Set(),
      style: new Set(),
      subject: new Set(),
    };
    references.forEach((r) => {
      const t = r.tags || {};
      (t.typography || []).forEach((x) => buckets.typography.add(x));
      (t.layout || []).forEach((x) => buckets.layout.add(x));
      (t.gradient || []).forEach((x) => buckets.gradient.add(x));
      const vd = t.visualDirection || {};
      (vd.genre || []).forEach((x) => buckets.genre.add(x));
      (vd.style || []).forEach((x) => buckets.style.add(x));
      (vd.subject || []).forEach((x) => buckets.subject.add(x));
    });
    return Object.fromEntries(Object.entries(buckets).map(([k, s]) => [k, [...s].sort()]));
  }, [references]);

  const hasAnyTag = useMemo(
    () => Object.values(layeredTags).some((arr) => arr.length > 0),
    [layeredTags],
  );

  /**
   * 대표 색상환 각각에 대해: 해당 색과 유사한 레퍼런스 수 집계.
   * 0 건이면 숨김, 나머지는 카운트 툴팁 노출.
   */
  const representativeCounts = useMemo(() => {
    return REPRESENTATIVE_COLORS
      .map((rep) => {
        const count = references.filter((r) =>
          (r.dominantColors || []).some((hex) => isSimilarColor(rep.hex, hex)),
        ).length;
        return { ...rep, count };
      })
      .filter((rep) => rep.count > 0);
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
      // 색상 필터 = 대표 색상환 기반 유사도 매칭 (대표색 1개라도 주변색 포함 → OR)
      const refColors = r.dominantColors || [];
      const matchesColors = !activeColors.length
        || activeColors.some((repHex) => refColors.some((hex) => isSimilarColor(repHex, hex)));
      return matchesTerm && matchesTags && matchesColors;
    });
  }, [references, searchTerm, activeTags, activeColors]);

  const toggleTag = (tag) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const toggleColor = (hex) => {
    const key = hex.toLowerCase();
    setActiveColors((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key],
    );
  };

  const totalActiveFilters = activeTags.length + activeColors.length;
  const resetAllFilters = () => {
    setActiveTags([]);
    setActiveColors([]);
  };

  /**
   * _tagError 상태 카드에서 "다시 시도" — T1 호출 재수행.
   * 성공: tags/extracted 채워지고 _tagError 초기화
   * 실패: 새 에러로 갱신 (런타임 재시도 3회 포함)
   */
  const retryTagging = async (ref) => {
    try {
      await storeSlice.updateReference(ref.id, { _pending: true, _tagError: null });
      const dataUrl = await imageUrlToBase64DataUrl(ref.thumbnailUrl);
      const resized = await resizeDataUrl(dataUrl, 512);
      const result = await runAutoTag({ imageUrl: resized });
      await storeSlice.updateReference(ref.id, {
        tags: result.tags,
        dominantColors: result.dominantColors,
        title: result.title,
        extracted: result.extracted || {},
        _pending: false,
        _tagError: null,
      });
    } catch (e) {
      await storeSlice.updateReference(ref.id, {
        _pending: false,
        _tagError: e?.message || String(e),
      });
    }
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
        <Box sx={ { display: 'flex', alignItems: 'center', gap: 1.5 } }>
          <Button
            variant="contained"
            color="primary"
            startIcon={ <AddIcon /> }
            onClick={ onNewProject }
          >
            새 프로젝트
          </Button>
          { headerEnd }
        </Box>
      }
      sx={ sx }
    >
      <PageContainer>
        {/* Hero */}
        <Box sx={ { py: { xs: 3, md: 5 } } }>
          <Typography variant="h3" sx={ { fontWeight: 700, letterSpacing: '-0.02em' } }>Archive</Typography>
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
          { (hasAnyTag || representativeCounts.length > 0) && (
            <Box sx={ { mt: 2 } }>
              { /* 색상 — 대표 색상환 기반, 선택 시 주변색 유사도 매칭 */ }
              { representativeCounts.length > 0 && (
                <FilterAccordion label="색상" count={ activeColors.length }>
                  <Box sx={ { display: 'flex', flexWrap: 'wrap', gap: 1 } }>
                    { representativeCounts.map(({ hex, label, count }) => {
                      const isActive = activeColors.includes(hex);
                      return (
                        <Box
                          key={ hex }
                          onClick={ () => toggleColor(hex) }
                          title={ `${label} · ${count}장` }
                          sx={ {
                            position: 'relative',
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            bgcolor: hex,
                            cursor: 'pointer',
                            outline: '2px solid',
                            outlineOffset: 2,
                            outlineColor: isActive ? 'primary.main' : 'transparent',
                            border: '1px solid',
                            borderColor: 'divider',
                            transition: 'outline-color 150ms',
                          } }
                        >
                          { isActive && (
                            <Box
                              sx={ {
                                position: 'absolute',
                                top: -6,
                                right: -6,
                                minWidth: 18,
                                height: 18,
                                px: 0.5,
                                borderRadius: '9px',
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                fontSize: '0.65rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              } }
                            >
                              { count }
                            </Box>
                          ) }
                        </Box>
                      );
                    }) }
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    대표 색 선택 시 유사 계열 레퍼런스가 함께 필터링됩니다
                  </Typography>
                </FilterAccordion>
              ) }

              { /* 디자인 레이어 */ }
              { ['typography', 'layout', 'gradient'].some((k) => layeredTags[k]?.length > 0) && (
                <FilterAccordion
                  label="디자인 레이어"
                  count={ activeTags.filter((t) =>
                    ['typography', 'layout', 'gradient'].some((k) => layeredTags[k]?.includes(t))
                  ).length }
                >
                  { [
                    { key: 'typography', label: '타이포' },
                    { key: 'layout', label: '레이아웃' },
                    { key: 'gradient', label: '그라디언트' },
                  ].filter(({ key }) => layeredTags[key]?.length > 0).map(({ key, label }) => (
                    <FilterSubRow key={ key } label={ label }>
                      { layeredTags[key].map((tag) => (
                        <Chip
                          key={ tag }
                          label={ tag }
                          size="small"
                          color={ activeTags.includes(tag) ? 'primary' : 'default' }
                          variant={ activeTags.includes(tag) ? 'filled' : 'outlined' }
                          onClick={ () => toggleTag(tag) }
                          sx={ { height: 26, fontSize: '0.72rem' } }
                        />
                      )) }
                    </FilterSubRow>
                  )) }
                </FilterAccordion>
              ) }

              { /* 비주얼 디렉션 */ }
              { ['genre', 'style', 'subject'].some((k) => layeredTags[k]?.length > 0) && (
                <FilterAccordion
                  label="비주얼 디렉션"
                  count={ activeTags.filter((t) =>
                    ['genre', 'style', 'subject'].some((k) => layeredTags[k]?.includes(t))
                  ).length }
                >
                  { [
                    { key: 'genre', label: '장르' },
                    { key: 'style', label: '스타일' },
                    { key: 'subject', label: '주제' },
                  ].filter(({ key }) => layeredTags[key]?.length > 0).map(({ key, label }) => (
                    <FilterSubRow key={ key } label={ label }>
                      { layeredTags[key].map((tag) => (
                        <Chip
                          key={ tag }
                          label={ tag }
                          size="small"
                          color={ activeTags.includes(tag) ? 'primary' : 'default' }
                          variant={ activeTags.includes(tag) ? 'filled' : 'outlined' }
                          onClick={ () => toggleTag(tag) }
                          sx={ { height: 26, fontSize: '0.72rem' } }
                        />
                      )) }
                    </FilterSubRow>
                  )) }
                </FilterAccordion>
              ) }

              { totalActiveFilters > 0 && (
                <Button
                  size="small"
                  variant="text"
                  onClick={ resetAllFilters }
                  sx={ { mt: 2 } }
                >
                  필터 초기화 ({ totalActiveFilters })
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
          hasMore={ hasMore && !searchTerm && !activeTags.length && !activeColors.length }
          isLoading={ isLoading }
          onLoadMore={ onLoadMore }
          columns={ { xs: 2, sm: 3, md: 4, lg: 5 } }
          spacing={ 2 }
          emptyContent={
            searchTerm || activeTags.length || activeColors.length
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
                dominantColors={ item.dominantColors || [] }
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
                      retryTagging(item);
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
