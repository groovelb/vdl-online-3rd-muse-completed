import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/**
 * SectionShell — 랜딩 섹션 공통 셸
 *
 * Props:
 * @param {string} eyebrow - 작은 캡션 (uppercase) [Optional]
 * @param {string} title - h3 타이틀 [Required]
 * @param {string} lede - 한 줄 설명 [Optional]
 * @param {node} children - 섹션 본문 [Required]
 * @param {object} sx [Optional]
 *
 * Example usage:
 * <SectionShell eyebrow="01" title="페인" lede="...">
 *   <Box>...</Box>
 * </SectionShell>
 */
export function SectionShell({ eyebrow, title, lede, children, sx }) {
  return (
    <Box
      component="section"
      sx={ {
        width: '100%',
        py: { xs: 10, md: 18 },
        px: { xs: 3, md: 6 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        ...sx,
      } }
    >
      <Box sx={ { width: '100%', maxWidth: 1080, mx: 'auto' } }>
        <Box sx={ { display: 'flex', flexDirection: 'column', gap: 2, mb: { xs: 6, md: 10 } } }>
          { eyebrow && (
            <Typography
              variant="overline"
              color="text.secondary"
              sx={ {
                fontSize: '0.7rem',
                letterSpacing: '0.22em',
                lineHeight: 1,
                fontWeight: 500,
                fontFamily: 'monospace',
              } }
            >
              { eyebrow }
            </Typography>
          ) }
          <Typography variant="h3" sx={ { wordBreak: 'keep-all' } }>
            { title }
          </Typography>
          { lede && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={ { lineHeight: 1.75, mt: 1, wordBreak: 'keep-all' } }
            >
              { lede }
            </Typography>
          ) }
        </Box>
        { children }
      </Box>
    </Box>
  );
}
