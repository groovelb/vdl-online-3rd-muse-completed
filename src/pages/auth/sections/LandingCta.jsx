import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { alpha, useTheme } from '@mui/material/styles';
import { ScatterGallery } from '../../../components/media/ScatterGallery.jsx';
import { ALL_IMAGES, TOKENS_BY_SRC } from '../../../utils/exampleImageTokens.js';
import { CTA } from '../landingCopy.js';

/**
 * LandingCta — 마지막 가입 진입 CTA
 *
 * 배경에 hero 와 동일한 ScatterGallery (scatter 모드, 정지 분포 + cursor parallax) 재활용.
 * 콘텐츠는 z-index 위로 띄워 가운데 정렬 + 양옆에 텍스트 가려지는 영역만 살짝 페이드 처리.
 *
 * Props:
 * @param {function} onStart - 시작 클릭 (signup 모드로 다이얼로그 오픈) [Required]
 * @param {function} onSignIn - 로그인 클릭 (signin 모드로 다이얼로그 오픈) [Required]
 */
export function LandingCta({ onStart, onSignIn }) {
  const theme = useTheme();
  return (
    <Box
      component="section"
      sx={ {
        position: 'relative',
        width: '100%',
        minHeight: { xs: '70vh', md: '80vh' },
        py: { xs: 14, md: 22 },
        px: { xs: 3, md: 6 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      } }
    >
      {/* 배경 — Hero 동일한 ScatterGallery (scatter 모드, 정지 분포) */}
      <Box sx={ { position: 'absolute', inset: 0, zIndex: 0 } }>
        <ScatterGallery
          images={ ALL_IMAGES }
          seed={ 21 }
          gridCols={ 6 }
          gridRows={ 4 }
          thumbnailMin={ 56 }
          thumbnailMax={ 112 }
          cursorRadius={ 240 }
          maxShift={ 14 }
          centerKeepout={ 280 }
          tokensBySrc={ TOKENS_BY_SRC }
          sx={ { position: 'absolute', inset: 0 } }
        />
      </Box>

      {/* 가독성용 중앙 부드러운 페이드 (radial) */}
      <Box
        sx={ {
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background: `radial-gradient(ellipse at center, ${ alpha(theme.palette.background.default, 0.92) } 0%, ${ alpha(theme.palette.background.default, 0.7) } 45%, transparent 80%)`,
          pointerEvents: 'none',
        } }
      />

      {/* CTA 컨텐츠 — 가운데 */}
      <Box
        sx={ {
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: 880,
          mx: 'auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
        } }
      >
        <Typography
          variant="h2"
          sx={ {
            fontWeight: 700,
            letterSpacing: '-0.025em',
            lineHeight: 1.15,
            wordBreak: 'keep-all',
          } }
        >
          { CTA.title }
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={ { lineHeight: 1.75, wordBreak: 'keep-all', maxWidth: 640 } }
        >
          { CTA.lede }
        </Typography>

        <Box sx={ { display: 'flex', gap: 2, mt: 4, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' } }>
          <Button
            variant="contained"
            color="primary"
            size="large"
            disableElevation
            onClick={ onStart }
            endIcon={ <ArrowForwardIcon /> }
            sx={ {
              py: 1.75,
              px: 4,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
            } }
          >
            { CTA.primary }
          </Button>
          <Button
            variant="text"
            color="inherit"
            size="large"
            onClick={ onSignIn }
            sx={ {
              py: 1.75,
              px: 1,
              fontSize: '1rem',
              fontWeight: 500,
              textTransform: 'none',
              color: 'text.secondary',
              '&:hover': { backgroundColor: 'transparent', color: 'text.primary' },
            } }
          >
            { CTA.secondary }
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
