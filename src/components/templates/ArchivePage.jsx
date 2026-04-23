import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import AddIcon from '@mui/icons-material/Add';
import { AppShell } from '../layout/AppShell.jsx';
import { PageContainer } from '../layout/PageContainer.jsx';
import { InfiniteMasonry } from '../layout/InfiniteMasonry.jsx';
import { ImageCard } from '../card/ImageCard.jsx';
import { SearchBar } from '../input/SearchBar.jsx';
import { FileDropzone } from '../input/FileDropzone.jsx';
import { flattenTags } from '../../data/muse';

/**
 * ArchivePage 템플릿
 *
 * MUSE 아카이브 화면. AppShell + 업로드 영역(FileDropzone) + 검색/태그 필터 + InfiniteMasonry 조립.
 * 외부에서 `references` 데이터와 동작 콜백만 주입하면 동작하는 페이지 템플릿.
 *
 * Props:
 * @param {array} references - 레퍼런스 배열 [{ id, src, title?, tags? }] [Required]
 * @param {function} onUploadFile - 파일 업로드 (file) => void [Optional]
 * @param {function} onUploadUrl - URL 붙여넣기 업로드 (url) => void [Optional]
 * @param {function} onLoadMore - 추가 로드 [Optional]
 * @param {boolean} hasMore - 추가 로드 가능 여부 [Optional, 기본값: false]
 * @param {boolean} isLoading - 로딩 중 [Optional, 기본값: false]
 * @param {function} onNewProject - "새 프로젝트" 버튼 클릭 [Optional]
 * @param {node} logo - AppShell 로고 영역 [Optional]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <ArchivePage
 *   references={ refs }
 *   onUploadFile={ handleUpload }
 *   onLoadMore={ loadMore }
 *   hasMore={ hasMore }
 *   isLoading={ isLoading }
 * />
 */
export function ArchivePage({
  references,
  onUploadFile,
  onUploadUrl,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  onNewProject,
  logo,
  sx,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTags, setActiveTags] = useState([]);

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
        {/* Hero — 페이지 타이틀 + 설명 */}
        <Box sx={ { py: { xs: 4, md: 8 } } }>
          <Typography variant="h2" sx={ { mb: 1 } }>Archive</Typography>
          <Typography variant="body1" color="text.secondary" sx={ { maxWidth: 640 } }>
            프로젝트와 무관하게 수시로 쌓는 레퍼런스. AI가 자동으로 태그를 달아둔다.
          </Typography>
        </Box>

        {/* Upload dropzone */}
        <Box sx={ { mb: 6 } }>
          <FileDropzone
            onFileSelect={ onUploadFile }
            variant="compact"
          />
          { onUploadUrl && (
            <Box sx={ { display: 'flex', alignItems: 'center', gap: 1, mt: 2 } }>
              <Typography variant="caption" color="text.secondary">
                또는 이미지 URL을 붙여넣기
              </Typography>
            </Box>
          ) }
        </Box>

        {/* Search + tag filter bar */}
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

        {/* Infinite grid */}
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
            <ImageCard
              src={ item.src }
              title={ item.title }
              tags={ flattenTags(item).slice(0, 3) }
            />
          ) }
        />

        <Box sx={ { height: 64 } } />
      </PageContainer>
    </AppShell>
  );
}
