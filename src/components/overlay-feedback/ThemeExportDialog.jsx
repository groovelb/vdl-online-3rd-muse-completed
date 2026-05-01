import { useMemo, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import CheckIcon from '@mui/icons-material/Check';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import DataObjectIcon from '@mui/icons-material/DataObject';
import {
  buildUniversalJson,
  exportProjectAsZip,
  exportSystemBundle,
  downloadUniversalJson,
} from '../../utils/museExport.js';
import { buildDesignMd } from '../../utils/tokenConverters.js';

/**
 * ThemeExportDialog — Universal JSON 프리뷰 + ZIP 번들 / 단독 JSON 다운로드
 *
 * 이전 MUI createTheme 코드 출력에서 **범용 토큰 JSON**으로 전환.
 * ZIP 다운로드 시 muse.json + visual-direction.md + README.md + references/*.jpg 포함.
 *
 * Props:
 * @param {boolean} open
 * @param {function} onClose
 * @param {object}   project      - Project 엔티티 (id/name/intent/type/referenceIds)
 * @param {object}   analysis     - AnalysisLayers (color/typography/layout/gradient/visualDirection)
 * @param {array}    references   - 전체 store references (사용되는 것만 ZIP에 포함)
 * @param {string}   [title]      - 기본값 'Project Export'
 */
export function ThemeExportDialog({
  open,
  onClose,
  project,
  analysis,
  references,
  title = 'Project Export',
}) {
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipResult, setZipResult] = useState(null);
  const [error, setError] = useState(null);

  const universal = useMemo(
    () => (project && analysis && references ? buildUniversalJson({ project, analysis, references }) : null),
    [project, analysis, references],
  );

  const jsonText = useMemo(
    () => (universal ? JSON.stringify(universal, null, 2) : ''),
    [universal],
  );

  const missingPrimary = useMemo(() => {
    if (!universal) return true;
    const colorTokens = universal.color?.tokens || [];
    return !colorTokens.some((t) => t.role === 'primary');
  }, [universal]);

  const refCount = universal?.references?.length ?? 0;

  const handleCopyJson = async () => {
    if (!jsonText) return;
    try {
      await navigator.clipboard.writeText(jsonText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard 권한 없음 — 무음 실패
    }
  };

  // mode 별 default exporter — concept 은 ThemeExportDialog 진입하지 않음 (별도 핸들러)
  const mode = project?.mode || 'system';
  const primaryExporter = mode === 'system' ? exportSystemBundle : exportProjectAsZip;
  const primaryLabel = mode === 'system' ? 'DESIGN.md ZIP 다운로드' : 'ZIP 번들 다운로드';

  const handleDownloadZip = async () => {
    setError(null);
    setIsZipping(true);
    setZipResult(null);
    try {
      const result = await primaryExporter({ project, analysis, references });
      setZipResult(result);
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadJson = () => {
    try {
      downloadUniversalJson({ project, analysis, references });
    } catch (e) {
      setError(e?.message || String(e));
    }
  };

  const handleDownloadDesignMd = () => {
    try {
      const md = buildDesignMd({ project, layers: analysis });
      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(project?.name || 'design').toLowerCase().replace(/\s+/g, '-')}.DESIGN.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e?.message || String(e));
    }
  };

  if (!project || !analysis || !references) {
    return null;
  }

  return (
    <Dialog
      open={ open }
      onClose={ onClose }
      maxWidth="md"
      fullWidth
      aria-labelledby="export-dialog-title"
    >
      <DialogTitle
        id="export-dialog-title"
        sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 1 } }
      >
        { title }
        <IconButton onClick={ onClose } size="small" aria-label="닫기">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* 요약 */}
        <Box sx={ { mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 } }>
          <Chip size="small" label={ `mode: ${mode}` } color="primary" variant="outlined" />
          <Chip size="small" label={ `color ${universal.color?.tokens?.length || 0}` } />
          <Chip size="small" label={ `typography ${universal.typography?.tokens?.length || 0}` } />
          <Chip size="small" label={ `layout ${universal.layout?.tokens?.length || 0}` } />
          <Chip size="small" label={ `gradient ${universal.gradient?.tokens?.length || 0}` } />
          <Chip size="small" label={ `spacing ${Object.keys(universal.spacing?.scale || {}).length}` } />
          <Chip size="small" label={ `rounded ${Object.keys(universal.rounded?.scale || {}).length}` } />
          <Chip size="small" label={ `elevation ${universal.elevation?.tokens?.length || 0}` } />
          <Chip size="small" label={ `components ${Object.keys(universal.components?.specs || {}).length}` } />
          <Chip
            size="small"
            color={ universal.visualDirection?.markdown ? 'default' : 'warning' }
            label={ `VD ${universal.visualDirection?.markdown ? 'OK' : '없음'}` }
          />
          <Chip size="small" icon={ <FolderZipIcon sx={ { fontSize: 14 } } /> } label={ `references ${refCount}` } />
        </Box>

        { missingPrimary && (
          <Alert severity="warning" sx={ { mb: 2 } }>
            활성화된 primary 컬러가 없습니다. 내보내기 전 프로젝트 상세에서 `role: primary` 토큰 하나는 활성화를 권장합니다.
          </Alert>
        ) }

        { error && <Alert severity="error" sx={ { mb: 2 } }>{ error }</Alert> }
        { zipResult && (
          <Alert severity="success" sx={ { mb: 2 } }>
            ZIP 다운로드 완료 — { zipResult.filename } ({ (zipResult.size / 1024).toFixed(1) } KB)
          </Alert>
        ) }

        <Box sx={ { position: 'relative' } }>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={ { display: 'block', mb: 1, fontFamily: 'monospace' } }
          >
            muse.json (preview)
          </Typography>

          <Box
            component="pre"
            sx={ {
              m: 0,
              p: 2.5,
              bgcolor: 'grey.50',
              borderRadius: 2,
              maxHeight: 480,
              overflow: 'auto',
              fontFamily: 'monospace',
              fontSize: 12,
              lineHeight: 1.6,
              color: 'text.primary',
              border: '1px solid',
              borderColor: 'divider',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            } }
          >
            { jsonText }
          </Box>

          <Tooltip title={ copied ? '복사됨' : 'JSON 복사' } arrow>
            <IconButton
              onClick={ handleCopyJson }
              size="small"
              sx={ {
                position: 'absolute',
                top: 28,
                right: 8,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': { bgcolor: 'background.default' },
              } }
              aria-label="JSON 클립보드 복사"
            >
              { copied
                ? <CheckIcon fontSize="small" sx={ { color: 'success.main' } } />
                : <ContentCopyIcon fontSize="small" /> }
            </IconButton>
          </Tooltip>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={ { display: 'block', mt: 2 } }>
          범용 JSON — MUI/Tailwind/Chakra 어디서든 `hex` · CSS 값을 그대로 사용 가능. 이미지 파일은 ZIP 번들에 포함됨.
        </Typography>
      </DialogContent>

      <DialogActions sx={ { justifyContent: 'space-between', px: 3, py: 2, flexWrap: 'wrap', gap: 1 } }>
        <Box sx={ { display: 'flex', gap: 1, flexWrap: 'wrap' } }>
          <Button
            variant="text"
            color="inherit"
            startIcon={ <DataObjectIcon /> }
            onClick={ handleDownloadJson }
            disabled={ isZipping }
          >
            muse.json만
          </Button>
          <Button
            variant="text"
            color="inherit"
            onClick={ handleDownloadDesignMd }
            disabled={ isZipping }
          >
            DESIGN.md만
          </Button>
        </Box>

        <Box sx={ { display: 'flex', gap: 1 } }>
          <Button onClick={ onClose } color="inherit" variant="text">닫기</Button>
          <Button
            onClick={ handleDownloadZip }
            variant="contained"
            color="primary"
            startIcon={ isZipping ? <CircularProgress size={ 16 } color="inherit" /> : <FolderZipIcon /> }
            disabled={ isZipping }
          >
            { isZipping ? '패키징 중…' : primaryLabel }
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
