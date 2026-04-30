import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import EditNoteIcon from '@mui/icons-material/EditNote';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import ArticleIcon from '@mui/icons-material/Article';
import { SectionShell } from './SectionShell.jsx';
import { HOW_IT_WORKS } from '../landingCopy.js';

const ICON_BY_KEY = {
  upload: CloudUploadIcon,
  mode: EditNoteIcon,
  curate: DashboardCustomizeIcon,
  export: ArticleIcon,
};

/**
 * LandingHowItWorks — 4 step 흐름
 */
export function LandingHowItWorks() {
  return (
    <SectionShell
      eyebrow={ HOW_IT_WORKS.eyebrow }
      title={ HOW_IT_WORKS.title }
      lede={ HOW_IT_WORKS.lede }
    >
      <Box
        sx={ {
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          rowGap: { xs: 4, md: 0 },
          columnGap: { xs: 0, md: 4 },
          borderTop: '1px solid',
          borderColor: 'divider',
        } }
      >
        { HOW_IT_WORKS.steps.map(({ key, title, body }, i) => {
          const Icon = ICON_BY_KEY[key];
          return (
            <Box
              key={ key }
              sx={ {
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                pt: { xs: 3, md: 4 },
                pl: { xs: 0, md: i === 0 ? 0 : 3 },
                borderTop: { xs: i > 0 ? '1px solid' : 'none', md: 'none' },
                borderLeft: { xs: 'none', md: i === 0 ? 'none' : '1px solid' },
                borderColor: 'divider',
              } }
            >
              <Typography
                sx={ {
                  fontFamily: 'monospace',
                  fontSize: '0.72rem',
                  color: 'text.disabled',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                } }
              >
                { HOW_IT_WORKS.stepLabel } { String(i + 1).padStart(2, '0') }
              </Typography>
              { Icon && <Icon sx={ { fontSize: 22, color: 'text.primary' } } /> }
              <Typography
                variant="h6"
                sx={ {
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.35,
                  wordBreak: 'keep-all',
                } }
              >
                { title }
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={ { lineHeight: 1.75, wordBreak: 'keep-all' } }
              >
                { body }
              </Typography>
            </Box>
          );
        }) }
      </Box>
    </SectionShell>
  );
}
