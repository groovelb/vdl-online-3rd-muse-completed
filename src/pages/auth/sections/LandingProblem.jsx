import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { SectionShell } from './SectionShell.jsx';
import { PROBLEM } from '../landingCopy.js';

/**
 * LandingProblem — 페인포인트 섹션
 *
 * T1~T4 super-theme 을 narrative 형태로 노출:
 *   - 영문 tag (앵커·검색)
 *   - headline 한 줄 (굵게 — 결론)
 *   - body (작은 본문 — 결론이 사용자 행동에 어떻게 떨어지는지)
 *
 * Example usage:
 * <LandingProblem />
 */
export function LandingProblem() {
  return (
    <SectionShell
      eyebrow={ PROBLEM.eyebrow }
      title={ PROBLEM.title }
      lede={ PROBLEM.lede }
    >
      <Box
        sx={ {
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          rowGap: { xs: 5, md: 8 },
          columnGap: { xs: 0, md: 8 },
          borderTop: '1px solid',
          borderColor: 'divider',
        } }
      >
        { PROBLEM.items.map((item, i) => {
          const isRightCol = i % 2 === 1;
          return (
            <Box
              key={ item.tag }
              sx={ {
                pt: { xs: 4, md: 6 },
                pb: { xs: 0, md: 0 },
                pl: { xs: 0, md: isRightCol ? 4 : 0 },
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                borderTop: { xs: i > 0 ? '1px solid' : 'none', md: 'none' },
                borderColor: 'divider',
              } }
            >
              <Box sx={ { display: 'flex', alignItems: 'baseline', gap: 2 } }>
                <Typography
                  sx={ {
                    fontFamily: 'monospace',
                    fontSize: '0.78rem',
                    color: 'text.disabled',
                    fontWeight: 500,
                    letterSpacing: '0.04em',
                  } }
                >
                  { String(i + 1).padStart(2, '0') }
                </Typography>
                <Typography
                  sx={ {
                    fontFamily: 'monospace',
                    fontSize: '0.7rem',
                    letterSpacing: '0.14em',
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                  } }
                >
                  { item.tag }
                </Typography>
              </Box>
              <Typography
                variant="h4"
                sx={ {
                  fontWeight: 600,
                  lineHeight: 1.3,
                  letterSpacing: '-0.018em',
                  color: 'text.primary',
                  wordBreak: 'keep-all',
                } }
              >
                { item.headline }
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={ { lineHeight: 1.75, wordBreak: 'keep-all' } }
              >
                { item.body }
              </Typography>
            </Box>
          );
        }) }
      </Box>
    </SectionShell>
  );
}
