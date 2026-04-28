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
import { ThemeExportDialog } from '../overlay-feedback/ThemeExportDialog.jsx';
import { ReferenceNotesDialog } from '../overlay-feedback/ReferenceNotesDialog.jsx';
import EditNoteIcon from '@mui/icons-material/EditNote';
import {
  buildDtcgTokens,
  buildTailwindConfig,
  buildMuiTheme,
  buildCssVariables,
  buildCursorRules,
} from '../../utils/handoffConverters';

const LAYERS = [
  { id: 'color', label: '컬러' },
  { id: 'typography', label: '타이포' },
  { id: 'layout', label: '레이아웃' },
  { id: 'gradient', label: '그라디언트' },
  { id: 'visualDirection', label: '비주얼 디렉션' },
];

const HANDOFF_FRAMEWORKS = [
  { id: 'dtcg', label: 'DTCG JSON' },
  { id: 'tailwind', label: 'Tailwind' },
  { id: 'mui', label: 'MUI v7' },
  { id: 'css', label: 'CSS vars' },
  { id: 'cursorrules', label: '.cursorrules' },
];

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
  onUpdateReferenceNotes,
  sx,
}) {
  const [activeLayer, setActiveLayer] = useState('color');
  const [isExportOpen, setExportOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copyState, setCopyState] = useState('idle'); // 'idle' | 'copied'
  const [isNotesOpen, setNotesOpen] = useState(false);

  const referenceNotes = project?.referenceNotes || {};
  const useLayersByRef = Object.fromEntries(
    (project?.selectedRefs || []).map((sr) => [sr.id, sr.useLayers || []]),
  );

  const isConceptMode = project?.mode === 'concept';
  const isHandoffMode = project?.mode === 'handoff';
  const conceptPrompt = analysis?.conceptPrompt || '';
  const layerDetails = analysis?.layerDetails || null;
  const [activeFramework, setActiveFramework] = useState('dtcg');

  const handoffTokens = isHandoffMode ? {
    color: analysis?.color || [],
    typography: analysis?.typography || [],
    layout: analysis?.layout || [],
    gradient: analysis?.gradient || [],
  } : null;

  const renderHandoffFrameworkPreview = () => {
    if (!handoffTokens) return null;
    switch (activeFramework) {
      case 'dtcg':
        return JSON.stringify(buildDtcgTokens(handoffTokens), null, 2);
      case 'tailwind':
        return buildTailwindConfig(handoffTokens);
      case 'mui':
        return buildMuiTheme(handoffTokens);
      case 'css':
        return buildCssVariables(handoffTokens);
      case 'cursorrules':
        return buildCursorRules({ project, tokens: handoffTokens, layerDetails });
      default:
        return '';
    }
  };

  const handleCopyFramework = async () => {
    try {
      await navigator.clipboard.writeText(renderHandoffFrameworkPreview());
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 1500);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[copy] 클립보드 실패', e);
    }
  };

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

  const renderPreview = () => {
    // 우측 프리뷰 — 활성 토큰 요약 카드
    const activeColors = (analysis.color || []).filter((t) => t.isEnabled);
    const activeTypo = (analysis.typography || []).filter((t) => t.isEnabled).slice(0, 2);

    return (
      <Box sx={ { p: 4, bgcolor: 'background.paper', minHeight: '100%' } }>
        <Typography variant="caption" color="text.secondary" sx={ { textTransform: 'uppercase', letterSpacing: '0.08em' } }>
          Preview
        </Typography>

        {/* Typography preview */}
        { activeTypo.length > 0 && (
          <Box sx={ { mt: 2, mb: 4 } }>
            { activeTypo.map((t) => (
              <Typography
                key={ t.id }
                sx={ {
                  fontFamily: t.fontFamily,
                  fontWeight: t.fontWeight,
                  fontSize: t.fontSize,
                  lineHeight: t.lineHeight,
                  letterSpacing: t.letterSpacing,
                  mb: 1,
                } }
              >
                { t.sampleText || project?.name || 'MUSE' }
              </Typography>
            )) }
          </Box>
        ) }

        {/* Color chips */}
        { activeColors.length > 0 && (
          <Box sx={ { mt: 3 } }>
            <Typography variant="caption" color="text.secondary" sx={ { display: 'block', mb: 1 } }>
              Active Colors
            </Typography>
            <Box sx={ { display: 'flex', flexWrap: 'wrap', gap: 1 } }>
              { activeColors.map((c) => (
                <Box
                  key={ c.id }
                  sx={ {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 999,
                    border: '1px solid',
                    borderColor: 'divider',
                  } }
                >
                  <Box sx={ { width: 14, height: 14, borderRadius: '50%', bgcolor: c.hex } } />
                  <Typography variant="caption" sx={ { fontFamily: 'monospace' } }>
                    { c.hex }
                  </Typography>
                </Box>
              )) }
            </Box>
          </Box>
        ) }
      </Box>
    );
  };

  return (
    <PageContainer sx={ sx }>
      {/* Project header */}
      <Box sx={ { display: 'flex', alignItems: 'center', gap: 1, py: 3 } }>
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

        {/* 사용된 레퍼런스 — 합성 소스 이미지 + 활용 노트 편집 진입점 */}
        { usedReferences.length > 0 && (
          <Box sx={ { mb: 3 } }>
            <Box sx={ { display: 'flex', alignItems: 'center', gap: 1, mb: 1 } }>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={ { textTransform: 'uppercase', letterSpacing: '0.08em' } }
              >
                사용된 레퍼런스 ({ usedReferences.length })
              </Typography>
              { onUpdateReferenceNotes && (
                <Button
                  size="small"
                  variant="text"
                  startIcon={ <EditNoteIcon /> }
                  onClick={ () => setNotesOpen(true) }
                  sx={ { fontSize: '0.7rem', minWidth: 0, py: 0, color: 'text.secondary' } }
                >
                  활용 노트 편집
                  { Object.keys(referenceNotes).length > 0 && (
                    <Box component="span" sx={ { ml: 0.5, color: 'primary.main', fontWeight: 600 } }>
                      ({ Object.keys(referenceNotes).length })
                    </Box>
                  ) }
                </Button>
              ) }
            </Box>
            <Box
              sx={ {
                display: 'flex',
                gap: 1,
                overflowX: 'auto',
                pb: 1,
              } }
            >
              { usedReferences.map((ref) => {
                const hasNote = !!referenceNotes[ref.id];
                return (
                  <Box
                    key={ ref.id }
                    title={ hasNote ? `${ref.title || ref.id} — ${referenceNotes[ref.id]}` : (ref.title || ref.id) }
                    sx={ {
                      position: 'relative',
                      flexShrink: 0,
                      width: 88,
                      height: 88,
                      borderRadius: 1.5,
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: hasNote ? 'primary.main' : 'divider',
                      bgcolor: 'background.paper',
                    } }
                  >
                    <Box
                      component="img"
                      src={ ref.thumbnailUrl || ref.src }
                      alt={ ref.title || ref.id }
                      sx={ {
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      } }
                    />
                    { hasNote && (
                      <Box
                        sx={ {
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          boxShadow: '0 0 0 2px white',
                        } }
                      />
                    ) }
                  </Box>
                );
              }) }
            </Box>

            {/* 활용 노트 list — 노트 입력된 ref 만 인라인 표시 */}
            { Object.keys(referenceNotes).length > 0 && (
              <Box sx={ { mt: 2, display: 'flex', flexDirection: 'column', gap: 1 } }>
                { usedReferences
                  .filter((ref) => referenceNotes[ref.id])
                  .map((ref, i) => {
                    const attachIdx = (project?.referenceIds || []).indexOf(ref.id) + 1;
                    return (
                      <Box
                        key={ ref.id }
                        sx={ {
                          display: 'flex',
                          gap: 1.5,
                          alignItems: 'flex-start',
                          p: 1,
                          pl: 1.25,
                          borderLeft: '3px solid',
                          borderColor: 'primary.main',
                          bgcolor: 'background.paper',
                          borderRadius: 1,
                        } }
                      >
                        <Box
                          sx={ {
                            width: 32,
                            height: 32,
                            flexShrink: 0,
                            borderRadius: 0.75,
                            overflow: 'hidden',
                            border: '1px solid',
                            borderColor: 'divider',
                          } }
                        >
                          <Box
                            component="img"
                            src={ ref.thumbnailUrl || ref.src }
                            alt={ ref.id }
                            sx={ { width: '100%', height: '100%', objectFit: 'cover', display: 'block' } }
                          />
                        </Box>
                        <Box sx={ { flex: 1, minWidth: 0 } }>
                          <Box sx={ { display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.25 } }>
                            <Typography variant="caption" sx={ { fontFamily: 'monospace', color: 'text.secondary', fontSize: '0.7rem' } }>
                              첨부 { attachIdx > 0 ? attachIdx : i + 1 }번
                            </Typography>
                            <Typography variant="caption" sx={ { fontFamily: 'monospace', color: 'text.secondary', fontSize: '0.7rem' } }>
                              { ref.id }
                            </Typography>
                            { ref.title && (
                              <Typography variant="caption" sx={ { color: 'text.secondary', fontSize: '0.7rem' } }>
                                · { ref.title }
                              </Typography>
                            ) }
                          </Box>
                          <Typography variant="body2" sx={ { lineHeight: 1.5 } }>
                            { referenceNotes[ref.id] }
                          </Typography>
                        </Box>
                      </Box>
                    );
                  }) }
              </Box>
            ) }
          </Box>
        ) }

        { isHandoffMode ? (
          /* Handoff 모드: 5 layer 한글 상세 + 프레임워크 config 미리보기 */
          <Box sx={ { mt: 2 } }>
            {/* Layer tabs (system 모드와 동일 토큰 편집 + 한글 상세) */}
            <CategoryTab
              categories={ LAYERS }
              selected={ activeLayer }
              onChange={ setActiveLayer }
            />
            <SplitScreen
              ratio="60:40"
              gap={ 3 }
              stackAt="md"
              left={
                <Box sx={ { py: 2 } }>
                  { renderEditor() }
                  { (() => {
                    const raw = layerDetails?.[activeLayer];
                    const text = typeof raw === 'string' ? raw : (raw == null ? '' : JSON.stringify(raw, null, 2));
                    return text ? true : false;
                  })() && (
                    <Box sx={ { mt: 3, p: 3, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' } }>
                      <Typography variant="overline" color="text.secondary" sx={ { display: 'block', mb: 1 } }>
                        Handoff 상세 — { LAYERS.find((l) => l.id === activeLayer)?.label }
                      </Typography>
                      <Box sx={ { whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.7 } }>
                        { typeof layerDetails[activeLayer] === 'string' ? layerDetails[activeLayer] : JSON.stringify(layerDetails[activeLayer], null, 2) }
                      </Box>
                    </Box>
                  ) }
                </Box>
              }
              right={
                <Box sx={ { p: 3, bgcolor: 'background.paper', minHeight: '100%' } }>
                  <Box sx={ { display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 } }>
                    <Typography variant="caption" color="text.secondary" sx={ { textTransform: 'uppercase', letterSpacing: '0.08em' } }>
                      프레임워크 전환 가이드
                    </Typography>
                    <Button size="small" variant="outlined" startIcon={ <ContentCopyIcon /> } onClick={ handleCopyFramework }>
                      { copyState === 'copied' ? '복사됨 ✓' : '복사' }
                    </Button>
                  </Box>
                  <Box sx={ { display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.5 } }>
                    { HANDOFF_FRAMEWORKS.map((f) => (
                      <Button
                        key={ f.id }
                        size="small"
                        variant={ activeFramework === f.id ? 'contained' : 'outlined' }
                        onClick={ () => setActiveFramework(f.id) }
                        sx={ { fontSize: '0.7rem', minWidth: 0, px: 1 } }
                      >
                        { f.label }
                      </Button>
                    )) }
                  </Box>
                  <Box
                    component="pre"
                    sx={ {
                      m: 0,
                      p: 2,
                      bgcolor: 'grey.100',
                      borderRadius: 1.5,
                      fontSize: 11,
                      lineHeight: 1.6,
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      maxHeight: 600,
                      overflow: 'auto',
                    } }
                  >
                    { renderHandoffFrameworkPreview() }
                  </Box>
                </Box>
              }
            />
          </Box>
        ) : isConceptMode ? (
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
          <>
            {/* Layer tabs */}
            <CategoryTab
              categories={ LAYERS }
              selected={ activeLayer }
              onChange={ setActiveLayer }
            />

            {/* Split: editor / preview */}
            <SplitScreen
              ratio="60:40"
              gap={ 3 }
              stackAt="md"
              left={
                <Box sx={ { py: 2 } }>
                  { renderEditor() }
                </Box>
              }
              right={ renderPreview() }
            />
          </>
        ) }

      <Box sx={ { height: 64 } } />

      <ThemeExportDialog
        open={ isExportOpen }
        onClose={ () => setExportOpen(false) }
        project={ project }
        analysis={ analysis }
        references={ references }
      />

      <ReferenceNotesDialog
        open={ isNotesOpen }
        onClose={ () => setNotesOpen(false) }
        usedReferences={ usedReferences }
        initialNotes={ referenceNotes }
        useLayersByRef={ useLayersByRef }
        onSave={ async (next) => onUpdateReferenceNotes?.(next) }
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
