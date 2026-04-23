import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FolderZipIcon from '@mui/icons-material/FolderZip';
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
import { ThemeExportDialog } from '../overlay-feedback/ThemeExportDialog.jsx';

const LAYERS = [
  { id: 'color', label: '컬러' },
  { id: 'typography', label: '타이포' },
  { id: 'layout', label: '레이아웃' },
  { id: 'gradient', label: '그라디언트' },
  { id: 'visualDirection', label: '비주얼 디렉션' },
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
  references = [],
  onUpdateToken,
  onBack,
  logo,
  headerEnd,
  sx,
}) {
  const [activeLayer, setActiveLayer] = useState('color');
  const [isExportOpen, setExportOpen] = useState(false);

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
    <AppShell
      logo={ logo || <Typography variant="h6" sx={ { fontWeight: 700 } }>MUSE</Typography> }
      headerPersistent={
        <Box sx={ { display: 'flex', alignItems: 'center', gap: 1.5 } }>
          <Button
            variant="contained"
            color="primary"
            startIcon={ <FolderZipIcon /> }
            onClick={ () => setExportOpen(true) }
          >
            Export
          </Button>
          { headerEnd }
        </Box>
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
        project={ project }
        analysis={ analysis }
        references={ references }
      />
    </AppShell>
  );
}
