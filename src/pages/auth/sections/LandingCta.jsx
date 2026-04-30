import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { CTA } from '../landingCopy.js';

/**
 * LandingCta — 가입 진입 CTA
 *
 * Props:
 * @param {function} onStart - 시작 클릭 (signup 모드로 다이얼로그 오픈) [Required]
 * @param {function} onSignIn - 로그인 클릭 (signin 모드로 다이얼로그 오픈) [Required]
 *
 * Example usage:
 * <LandingCta onStart={ () => setMode('signup') } onSignIn={ () => setMode('signin') } />
 */
export function LandingCta({ onStart, onSignIn }) {
  return (
    <Box
      component="section"
      sx={ {
        width: '100%',
        py: { xs: 14, md: 22 },
        px: { xs: 3, md: 6 },
        borderTop: '1px solid',
        borderColor: 'divider',
      } }
    >
      <Box sx={ { width: '100%', maxWidth: 1080, mx: 'auto' } }>
        <Typography
          variant="h2"
          sx={ {
            fontWeight: 700,
            letterSpacing: '-0.025em',
            lineHeight: 1.1,
            wordBreak: 'keep-all',
          } }
        >
          { CTA.title }
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={ { mt: 3, lineHeight: 1.75, wordBreak: 'keep-all' } }
        >
          { CTA.lede }
        </Typography>

        <Box sx={ { display: 'flex', gap: 2, mt: 6, flexWrap: 'wrap', alignItems: 'center' } }>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={ onStart }
            endIcon={ <ArrowForwardIcon /> }
            sx={ {
              py: 1.75,
              px: 4,
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: 0,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': { boxShadow: 'none' },
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
              borderRadius: 0,
              textTransform: 'none',
              color: 'text.secondary',
              borderBottom: '1px solid',
              borderColor: 'divider',
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
