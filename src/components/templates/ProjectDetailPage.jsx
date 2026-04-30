import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import IconButton from '@mui/material/IconButton';
import { PageContainer } from '../layout/PageContainer.jsx';
import { SplitScreen } from '../layout/SplitScreen.jsx';
import { CategoryTab } from '../in-page-navigation/CategoryTab.jsx';
import { ColorSwatchList } from '../data-display/ColorSwatchList.jsx';
import { TypographyPreview } from '../data-display/TypographyPreview.jsx';
import { LayoutTokenPreview } from '../data-display/LayoutTokenPreview.jsx';
import { GradientPreview } from '../data-display/GradientPreview.jsx';
import { DesignMdPreview } from '../data-display/DesignMdPreview.jsx';
import { ThemeExportDialog } from '../overlay-feedback/ThemeExportDialog.jsx';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { RefImage } from '../media/RefImage.jsx';
import { ANALYSIS_LAYERS_WITH_DESIGN_MD as LAYERS } from '../../data/muse/layers.js';

/**
 * ProjectDetailPage 템플릿
 *
 * MUSE 프로젝트 상세 화면. 좌측: 레이어 탭 + 토큰 편집 / 우측: 토큰 요약 프리뷰.
 * 상단 "Export"는 범용 JSON + ZIP 번들 다이얼로그를 연다.
 *
 * Props:
 * @param {object} project - { id, name, intent, type, referenceIds } [Required]
 * @param {object} analysis - 레이어별 토큰 {color, typography, layout, gradient, visualDirection} [Required]
 * @param {array}  [references] - 전체 store references — ZIP 이미지 번들링용 [Optional]
 * @param {function} onUpdateToken - (layerKey, tokenId, patch) => void [Required]
 * @param {function} onBack - 뒤로가기 [Optional]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <ProjectDetailPage
 *   project={ { id: 'p1', name: 'Editorial', intent: '...', type: 'landing' } }
 *   analysis={ { color: [...], typography: [...], ... } }
 *   onUpdateToken={ (layer, id, patch) => updateStore(layer, id, patch) }
 * />
 */
export function ProjectDetailPage({
  project,
  analysis,
  references = [],
  onUpdateToken,
  onBack,
  onDelete,
  sx,
}) {
  const [activeLayer, setActiveLayer] = useState('color');
  const [isExportOpen, setExportOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copyState, setCopyState] = useState('idle'); // 'idle' | 'copied'

  const referenceNotes = project?.referenceNotes || {};

  const isConceptMode = project?.mode === 'concept';
  const conceptPrompt = analysis?.conceptPrompt || '';

  const handleCopyConceptPrompt = async () => {
    if (!conceptPrompt) return;
    try {
      await navigator.clipboard.writeText(conceptPrompt);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 1500);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[copy] 클립보드 실패', e);
    }
  };

  const handleDownloadConceptBundle = async () => {
    if (!conceptPrompt) return;
    try {
      const { exportConceptPrompt } = await import('../../utils/museExport');
      await exportConceptPrompt({ project, analysis, references });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[ProjectDetailPage] concept bundle 다운로드 실패', e);
      window.alert(`다운로드 실패: ${e?.message || e}`);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete();
      setDeleteOpen(false);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[ProjectDetailPage] 삭제 실패', e);
      window.alert(`삭제 실패: ${e?.message || e}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const usedReferences = (project?.referenceIds || [])
    .map((id) => references.find((r) => r.id === id))
    .filter(Boolean);

  const handleChange = (layerKey) => (id, patch) => {
    onUpdateToken?.(layerKey, id, patch);
  };

  const renderEditor = () => {
    switch (activeLayer) {
      case 'color':
        return (
          <ColorSwatchList
            tokens={ analysis.color || [] }
            onChange={ handleChange('color') }
            references={ references }
          />
        );
      case 'typography':
        return (
          <TypographyPreview
            tokens={ analysis.typography || [] }
            onChange={ handleChange('typography') }
            references={ references }
          />
        );
      case 'layout':
        return (
          <LayoutTokenPreview
            tokens={ analysis.layout || [] }
            onChange={ handleChange('layout') }
            references={ references }
          />
        );
      case 'gradient':
        return (
          <GradientPreview
            tokens={ analysis.gradient || [] }
            onChange={ handleChange('gradient') }
            references={ references }
          />
        );
      case 'designMd':
        return (
          <Box sx={ { bgcolor: 'background.paper', borderRadius: 3, p: { xs: 2, md: 4 }, border: '1px solid', borderColor: 'divider' } }>
            <DesignMdPreview project={ project } layers={ analysis } variant="raw" />
          </Box>
        );
      case 'visualDirection': {
        const vd = analysis.visualDirection || { markdown: '', tags: { genre: [], style: [], subject: [] } };
        return (
          <Box sx={ { bgcolor: 'background.paper', borderRadius: 3, p: 4 } }>
            {/* 태그 칩 */}
            { vd.tags && (
              <Box sx={ { display: 'flex', flexDirection: 'column', gap: 1, mb: 3 } }>
                { Object.entries(vd.tags).map(([category, list]) => (
                  list?.length > 0 && (
                    <Box key={ category } sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
                      <Typography variant="caption" color="text.secondary" sx={ { minWidth: 64, textTransform: 'uppercase', letterSpacing: '0.08em' } }>
                        { category }
                      </Typography>
                      <Box sx={ { display: 'flex', gap: 0.75, flexWrap: 'wrap' } }>
                        { list.map((t) => (
                          <Box key={ t } sx={ { px: 1, py: 0.25, borderRadius: 999, border: '1px solid', borderColor: 'divider', fontSize: 12 } }>{ t }</Box>
                        )) }
                      </Box>
                    </Box>
                  )
                )) }
              </Box>
            ) }
            {/* Markdown 본문 — 단순 pre 렌더 (추후 react-markdown 도입 가능) */}
            <Box
              component="pre"
              sx={ {
                m: 0,
                p: 2.5,
                bgcolor: 'grey.50',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                fontSize: 13,
                lineHeight: 1.7,
                fontFamily: 'inherit',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxHeight: '60vh',
                overflow: 'auto',
              } }
            >
              { vd.markdown || '# Visual Direction\n\n(아직 생성되지 않았습니다)' }
            </Box>
          </Box>
        );
      }
      default:
        return null;
    }
  };

  const renderNotesPanel = () => {
    if (Object.keys(referenceNotes).length === 0) {
      return (
        <Box sx={ { py: 4 } }>
          <Typography variant="caption" color="text.disabled" sx={ { fontStyle: 'italic' } }>
            (활용 노트 없음)
          </Typography>
        </Box>
      );
    }
    const notedRefs = usedReferences.filter((ref) => referenceNotes[ref.id]);
    return (
      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={ { textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', mb: 1 } }
        >
          활용 노트 ({ notedRefs.length })
        </Typography>
        <Table size="small" sx={ { '& td': { borderColor: 'divider' } } }>
          <TableBody>
            { notedRefs.map((ref, i, arr) => (
              <TableRow key={ ref.id }>
                <TableCell
                  sx={ {
                    width: 96,
                    verticalAlign: 'top',
                    py: 1.5,
                    pl: 0,
                    pr: 2,
                    borderBottom: i < arr.length - 1 ? '1px solid' : 0,
                  } }
                >
                  <Box
                    sx={ {
                      width: 80,
                      height: 80,
                      borderRadius: 1.5,
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                    } }
                  >
                    <RefImage
                      src={ ref.thumbnailUrl || ref.src }
                      storagePath={ ref.storagePath }
                      alt={ ref.title || '' }
                    />
                  </Box>
                </TableCell>
                <TableCell
                  sx={ {
                    py: 1.5,
                    pl: 0,
                    pr: 0,
                    borderBottom: i < arr.length - 1 ? '1px solid' : 0,
                  } }
                >
                  { ref.title && (
                    <Typography
                      variant="caption"
                      sx={ {
                        display: 'block',
                        color: 'text.secondary',
                        fontSize: '0.72rem',
                        mb: 0.5,
                        letterSpacing: '0.02em',
                      } }
                    >
                      { ref.title }
                    </Typography>
                  ) }
                  <Typography variant="body2" sx={ { lineHeight: 1.6 } }>
                    { referenceNotes[ref.id] }
                  </Typography>
                </TableCell>
              </TableRow>
            )) }
          </TableBody>
        </Table>
      </Box>
    );
  };

  return (
    <PageContainer variant="fluid" sx={ sx }>
      {/* Project header */}
      <Box sx={ { display: 'flex', alignItems: 'center', gap: 1, py: { xs: 3, md: 6 } } }>
        { onBack && (
          <IconButton onClick={ onBack } aria-label="뒤로">
            <ArrowBackIcon />
          </IconButton>
        ) }
        <Box sx={ { flex: 1 } }>
          <Typography variant="h3" sx={ { mb: 0.5 } }>
            { project?.name || 'Untitled Project' }
          </Typography>
          { project?.intent && (
            <Typography variant="body2" color="text.secondary">
              { project.intent }
            </Typography>
          ) }
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={ <FolderZipIcon /> }
          onClick={ () => setExportOpen(true) }
        >
          Export
        </Button>
        { onDelete && (
          <IconButton
            onClick={ () => setDeleteOpen(true) }
            aria-label="프로젝트 삭제"
            sx={ { color: 'text.secondary', '&:hover': { color: 'error.main' } } }
          >
            <DeleteOutlineIcon />
          </IconButton>
        ) }
      </Box>

        { isConceptMode ? (
          /* Concept 모드: 단일 prompt 뷰 (탭/스플릿 없음) */
          <Box sx={ { mt: 2 } }>
            <Box sx={ { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 1 } }>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={ { textTransform: 'uppercase', letterSpacing: '0.08em' } }>
                  Concept Prompt
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={ { mt: 0.5 } }>
                  Claude Desktop · Gemini · ChatGPT 웹채팅에 그대로 붙여넣어 즉시 시각화
                </Typography>
              </Box>
              <Box sx={ { display: 'flex', gap: 1 } }>
                <Button
                  variant="contained"
                  startIcon={ <ContentCopyIcon /> }
                  onClick={ handleCopyConceptPrompt }
                  disabled={ !conceptPrompt }
                >
                  { copyState === 'copied' ? '복사됨 ✓' : '프롬프트 복사' }
                </Button>
                <Button
                  variant="outlined"
                  startIcon={ <DownloadIcon /> }
                  onClick={ handleDownloadConceptBundle }
                  disabled={ !conceptPrompt }
                >
                  ZIP 다운로드 (이미지 포함)
                </Button>
              </Box>
            </Box>
            <Box
              sx={ {
                p: 4,
                bgcolor: 'background.paper',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                fontSize: 16,
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap',
                wordBreak: 'keep-all',
                minHeight: 240,
                fontFamily: 'inherit',
              } }
            >
              { conceptPrompt || '(프롬프트가 아직 생성되지 않았습니다)' }
            </Box>
            <Typography variant="caption" color="text.secondary" sx={ { display: 'block', mt: 1, textAlign: 'right' } }>
              { conceptPrompt.length } / 800 자
            </Typography>
          </Box>
        ) : (
          <SplitScreen
            ratio="25:75"
            gap={ 4 }
            stackAt="md"
            left={
              <Box
                sx={ {
                  position: { md: 'sticky' },
                  top: { md: 24 },
                  alignSelf: 'flex-start',
                  maxHeight: { md: 'calc(100vh - 48px)' },
                  overflowY: { md: 'auto' },
                  pr: { md: 1 },
                } }
              >
                { renderNotesPanel() }
              </Box>
            }
            right={
              <Box sx={ { display: 'flex', flexDirection: 'column', gap: 6 } }>
                {/* 분석 결과 */}
                <Box>
                  <CategoryTab
                    categories={ LAYERS }
                    selected={ activeLayer }
                    onChange={ setActiveLayer }
                  />
                  <Box sx={ { py: 2 } }>
                    { renderEditor() }
                  </Box>
                </Box>

                {/* 디자인 가이드 — showcase */}
                { analysis && (
                  <Box
                    sx={ {
                      p: { xs: 2, md: 4 },
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 3,
                    } }
                  >
                    <DesignMdPreview project={ project } layers={ analysis } variant="showcase" />
                  </Box>
                ) }
              </Box>
            }
          />
        ) }

      <Box sx={ { height: 64 } } />

      <ThemeExportDialog
        open={ isExportOpen }
        onClose={ () => setExportOpen(false) }
        project={ project }
        analysis={ analysis }
        references={ references }
      />

<Dialog
        open={ isDeleteOpen }
        onClose={ () => !isDeleting && setDeleteOpen(false) }
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>프로젝트 삭제</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>{ project?.name || '이 프로젝트' }</strong> 를 삭제하시겠습니까?
            <br />
            분석 결과와 큐레이션이 함께 삭제되며 되돌릴 수 없습니다.
            <br />
            (업로드한 레퍼런스 자체는 아카이브에 남습니다.)
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={ () => setDeleteOpen(false) } disabled={ isDeleting }>
            취소
          </Button>
          <Button onClick={ handleDeleteConfirm } color="error" variant="contained" disabled={ isDeleting }>
            { isDeleting ? '삭제 중…' : '삭제' }
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
