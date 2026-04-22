import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import { AppShell } from '../layout/AppShell.jsx';
import { PageContainer } from '../layout/PageContainer.jsx';
import { SplitScreen } from '../layout/SplitScreen.jsx';
import { CategoryTab } from '../in-page-navigation/CategoryTab.jsx';
import { ColorSwatchList } from '../data-display/ColorSwatchList.jsx';
import { TypographyPreview } from '../data-display/TypographyPreview.jsx';
import { LayoutTokenPreview } from '../data-display/LayoutTokenPreview.jsx';
import { GradientPreview } from '../data-display/GradientPreview.jsx';
import { KeyVisualBoard } from '../data-display/KeyVisualBoard.jsx';
import { ThemeExportDialog } from '../overlay-feedback/ThemeExportDialog.jsx';

const LAYERS = [
  { id: 'color', label: '컬러' },
  { id: 'typography', label: '타이포' },
  { id: 'layout', label: '레이아웃' },
  { id: 'gradient', label: '그라디언트' },
  { id: 'keyVisual', label: '키비주얼' },
];

/**
 * 토큰 상태를 `createTheme` 입력용 오브젝트로 조립.
 * 활성(enabled) 토큰만 포함하며, emphasis는 MUI theme에 직접 매핑되지 않으므로 무시.
 */
function buildThemeObject(analysis) {
  const enabledColors = (analysis.color || []).filter((t) => t.isEnabled);
  const enabledTypo = (analysis.typography || []).filter((t) => t.isEnabled);

  const primary = enabledColors.find((t) => t.role === 'primary' || t.emphasis === 2) || enabledColors[0];
  const secondary = enabledColors.find((t) => t.role === 'secondary') || enabledColors[1];
  const accent = enabledColors.find((t) => t.role === 'accent');

  const palette = {};
  if (primary) palette.primary = { main: primary.hex };
  if (secondary) palette.secondary = { main: secondary.hex };
  if (accent) palette.info = { main: accent.hex };

  const typography = {};
  enabledTypo.forEach((t) => {
    const key = t.variant || t.id;
    typography[key] = {
      fontFamily: t.fontFamily,
      fontWeight: t.fontWeight,
      fontSize: t.fontSize,
      lineHeight: t.lineHeight,
      letterSpacing: t.letterSpacing,
    };
  });

  return {
    palette: Object.keys(palette).length ? palette : undefined,
    typography: Object.keys(typography).length ? typography : undefined,
  };
}

/**
 * ProjectDetailPage 템플릿
 *
 * MUSE 프로젝트 상세 화면. 좌측: 레이어 탭 + 토큰 편집 리스트 / 우측: 토큰 요약 프리뷰.
 * 상단에 Export 버튼을 통해 MUI theme 코드로 내보내기 가능.
 *
 * Props:
 * @param {object} project - { id, name, intent, type } [Required]
 * @param {object} analysis - 레이어별 토큰 {color, typography, layout, gradient, keyVisual} [Required]
 * @param {function} onUpdateToken - (layerKey, tokenId, patch) => void [Required]
 * @param {function} onBack - 뒤로가기 [Optional]
 * @param {node} logo - AppShell 로고 [Optional]
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
  onUpdateToken,
  onBack,
  logo,
  sx,
}) {
  const [activeLayer, setActiveLayer] = useState('color');
  const [isExportOpen, setExportOpen] = useState(false);

  const themeObject = useMemo(() => buildThemeObject(analysis), [analysis]);

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
          />
        );
      case 'typography':
        return (
          <TypographyPreview
            tokens={ analysis.typography || [] }
            onChange={ handleChange('typography') }
          />
        );
      case 'layout':
        return (
          <LayoutTokenPreview
            tokens={ analysis.layout || [] }
            onChange={ handleChange('layout') }
          />
        );
      case 'gradient':
        return (
          <GradientPreview
            tokens={ analysis.gradient || [] }
            onChange={ handleChange('gradient') }
          />
        );
      case 'keyVisual':
        return (
          <KeyVisualBoard
            items={ analysis.keyVisual || [] }
            onChange={ handleChange('keyVisual') }
            onRemove={ (id) => onUpdateToken?.('keyVisual', id, { _removed: true }) }
          />
        );
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
    <AppShell
      logo={ logo || <Typography variant="h6" sx={ { fontWeight: 700 } }>MUSE</Typography> }
      headerPersistent={
        <Button
          variant="contained"
          color="primary"
          startIcon={ <FileDownloadIcon /> }
          onClick={ () => setExportOpen(true) }
        >
          Export
        </Button>
      }
      sx={ sx }
    >
      <PageContainer>
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
        </Box>

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

        <Box sx={ { height: 64 } } />
      </PageContainer>

      <ThemeExportDialog
        open={ isExportOpen }
        onClose={ () => setExportOpen(false) }
        themeObject={ themeObject }
        fileName={ `${project?.name?.toLowerCase().replace(/\s+/g, '-') || 'muse'}-theme.js` }
      />
    </AppShell>
  );
}
