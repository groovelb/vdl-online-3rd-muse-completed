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
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import CheckIcon from '@mui/icons-material/Check';
import { serializeTheme } from '../../utils/serializeTheme.js';

const REQUIRED_PATHS = [
  ['palette', 'primary', 'main'],
];

/** 경로가 존재하는지 체크 */
const hasPath = (obj, path) => {
  let cur = obj;
  for (const key of path) {
    if (cur == null || cur[key] === undefined) return false;
    cur = cur[key];
  }
  return true;
};

/**
 * ThemeExportDialog 컴포넌트
 *
 * MUSE 프로젝트 상세에서 편집된 토큰을 MUI `createTheme` 코드로 export한다.
 * - 상단 Alert: 필수 토큰(palette.primary.main) 누락 시 경고
 * - 복사 / 다운로드 액션
 * - Dialog는 radius 24 (MUSE 토큰) 자동 반영
 *
 * Props:
 * @param {boolean} open - 모달 열림 상태 [Required]
 * @param {function} onClose - 닫기 핸들러 [Required]
 * @param {object} themeObject - 직렬화할 theme 객체 [Required]
 * @param {string} fileName - 다운로드 파일명 [Optional, 기본값: 'theme.js']
 * @param {string} title - 다이얼로그 제목 [Optional, 기본값: 'MUI Theme 내보내기']
 *
 * Example usage:
 * <ThemeExportDialog
 *   open={ isOpen }
 *   onClose={ () => setOpen(false) }
 *   themeObject={ editedTheme }
 *   fileName="muse-theme.js"
 * />
 */
export function ThemeExportDialog({
  open,
  onClose,
  themeObject,
  fileName = 'theme.js',
  title = 'MUI Theme 내보내기',
}) {
  const [copied, setCopied] = useState(false);

  const source = useMemo(
    () => (themeObject ? serializeTheme(themeObject) : ''),
    [themeObject],
  );

  const missingPaths = useMemo(() => {
    if (!themeObject) return [];
    return REQUIRED_PATHS
      .filter((p) => !hasPath(themeObject, p))
      .map((p) => p.join('.'));
  }, [themeObject]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard 권한 없음 — 무음 실패
    }
  };

  const handleDownload = () => {
    const blob = new Blob([source], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog
      open={ open }
      onClose={ onClose }
      maxWidth="md"
      fullWidth
      aria-labelledby="theme-export-title"
    >
      <DialogTitle
        id="theme-export-title"
        sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 1 } }
      >
        { title }
        <IconButton onClick={ onClose } size="small" aria-label="닫기">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        { missingPaths.length > 0 && (
          <Alert severity="warning" sx={ { mb: 2 } }>
            필수 토큰이 누락되었습니다: { missingPaths.join(', ') }
          </Alert>
        ) }

        <Box sx={ { position: 'relative' } }>
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
              fontSize: 12.5,
              lineHeight: 1.6,
              color: 'text.primary',
              border: '1px solid',
              borderColor: 'divider',
            } }
          >
            { source }
          </Box>

          <Tooltip title={ copied ? '복사됨' : '복사' } arrow>
            <IconButton
              onClick={ handleCopy }
              size="small"
              sx={ {
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': { bgcolor: 'background.default' },
              } }
              aria-label="클립보드에 복사"
            >
              { copied
                ? <CheckIcon fontSize="small" sx={ { color: 'success.main' } } />
                : <ContentCopyIcon fontSize="small" /> }
            </IconButton>
          </Tooltip>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={ { display: 'block', mt: 2 } }>
          파일명: <Box component="span" sx={ { fontFamily: 'monospace' } }>{ fileName }</Box>
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={ onClose } color="inherit" variant="text">
          닫기
        </Button>
        <Button
          onClick={ handleDownload }
          variant="contained"
          color="primary"
          startIcon={ <DownloadIcon /> }
        >
          파일로 저장
        </Button>
      </DialogActions>
    </Dialog>
  );
}
