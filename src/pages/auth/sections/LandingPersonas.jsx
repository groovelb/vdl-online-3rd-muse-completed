import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import BrushIcon from '@mui/icons-material/Brush';
import CodeIcon from '@mui/icons-material/Code';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { SectionShell } from './SectionShell.jsx';
import { PERSONAS } from '../landingCopy.js';

const ICON_BY_CODE = {
  P1: BusinessCenterIcon,
  P2: BrushIcon,
  P3: CodeIcon,
  P4: AutoFixHighIcon,
};

/**
 * LandingPersonas — 페르소나 4 명 카드
 */
export function LandingPersonas() {
  return (
    <SectionShell
      eyebrow={ PERSONAS.eyebrow }
      title={ PERSONAS.title }
      lede={ PERSONAS.lede }
    >
      <Box
        sx={ {
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          rowGap: { xs: 5, md: 0 },
          columnGap: { xs: 0, md: 4 },
          borderTop: '1px solid',
          borderColor: 'divider',
        } }
      >
        { PERSONAS.items.map(({ code, label, quote, mode }, i) => {
          const Icon = ICON_BY_CODE[code];
          return (
            <Box
              key={ code }
              sx={ {
                pt: { xs: 4, md: 5 },
                pl: { xs: 0, md: i === 0 ? 0 : 3 },
                borderTop: { xs: i > 0 ? '1px solid' : 'none', md: 'none' },
                borderLeft: { xs: 'none', md: i === 0 ? 'none' : '1px solid' },
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                minHeight: { md: 220 },
              } }
            >
              <Box sx={ { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } }>
                <Typography
                  sx={ {
                    fontFamily: 'monospace',
                    fontSize: '0.72rem',
                    color: 'text.disabled',
                    letterSpacing: '0.14em',
                  } }
                >
                  { code }
                </Typography>
                { Icon && <Icon sx={ { fontSize: 20, color: 'text.primary' } } /> }
              </Box>
              <Typography
                variant="subtitle1"
                sx={ { fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.35, wordBreak: 'keep-all' } }
              >
                { label }
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={ {
                  fontStyle: 'italic',
                  lineHeight: 1.75,
                  wordBreak: 'keep-all',
                } }
              >
                "{ quote }"
              </Typography>
              <Typography
                sx={ {
                  mt: 'auto',
                  pt: 2,
                  fontFamily: 'monospace',
                  fontSize: '0.68rem',
                  color: 'text.secondary',
                  letterSpacing: '0.06em',
                } }
              >
                { PERSONAS.modeLabel } / { mode }
              </Typography>
            </Box>
          );
        }) }
      </Box>
    </SectionShell>
  );
}
