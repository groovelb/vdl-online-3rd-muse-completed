import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ReferenceLayerChipRow } from '../../../components/card/ReferenceLayerChipRow.jsx';
import { ModeSelectCard } from '../../../components/card/ModeSelectCard.jsx';
import { ColorSwatchList } from '../../../components/data-display/ColorSwatchList.jsx';
import { SectionShell } from './SectionShell.jsx';
import { SOLUTION } from '../landingCopy.js';

/**
 * LandingSolution — 핵심 차별점 3 가지를 실제 MUSE product UI 로 보여준다.
 *
 * 모든 미니 데모는 production 컴포넌트(ReferenceLayerChipRow / ModeSelectCard /
 * ColorSwatchList — TokenDecisionTracePanel 펼침 포함) 를 그대로 임포트해서 사용.
 * 별도 mock UI 를 그리지 않음.
 */
export function LandingSolution() {
  return (
    <SectionShell
      eyebrow={ SOLUTION.eyebrow }
      title={ SOLUTION.title }
      lede={ SOLUTION.lede }
    >
      <Box
        sx={ {
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          rowGap: { xs: 6, md: 0 },
          columnGap: { xs: 0, md: 5 },
          borderTop: '1px solid',
          borderColor: 'divider',
          alignItems: 'start',
        } }
      >
        { SOLUTION.items.map(({ key, title, body }, i) => (
          <Box
            key={ key }
            sx={ {
              pt: { xs: 4, md: 5 },
              pl: { xs: 0, md: i === 0 ? 0 : 4 },
              borderTop: { xs: i > 0 ? '1px solid' : 'none', md: 'none' },
              borderLeft: { xs: 'none', md: i === 0 ? 'none' : '1px solid' },
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            } }
          >
            <DemoByKey demoKey={ key } />
            <Box sx={ { display: 'flex', flexDirection: 'column', gap: 1.5 } }>
              <Typography
                variant="h5"
                sx={ {
                  fontWeight: 600,
                  letterSpacing: '-0.012em',
                  lineHeight: 1.3,
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
          </Box>
        )) }
      </Box>
    </SectionShell>
  );
}

/* ============================================
 * DemoByKey — solution 항목 별 production 컴포넌트
 * ============================================ */

function DemoByKey({ demoKey }) {
  if (demoKey === 'intent') return <IntentDemo />;
  if (demoKey === 'trace') return <TraceDemo />;
  if (demoKey === 'mode') return <ModeDemo />;
  return null;
}

/* ============================================
 * Intent — 실제 ReferenceLayerChipRow + 활용 노트 인용
 * ============================================ */

function IntentDemo() {
  return (
    <Box sx={ { display: 'flex', flexDirection: 'column', gap: 1.5 } }>
      <ReferenceLayerChipRow
        mode="system"
        autoLayers={ ['color', 'typography'] }
        value={ ['color', 'typography'] }
        locked
      />
      <Box
        sx={ {
          p: 1.75,
          border: '1px solid',
          borderColor: 'divider',
          fontSize: '0.82rem',
          color: 'text.secondary',
          fontStyle: 'italic',
          lineHeight: 1.7,
          bgcolor: 'background.paper',
        } }
      >
        “ref-002 의 색감을 primary 로 잡고, 타이포는 가볍게.”
      </Box>
    </Box>
  );
}

/* ============================================
 * Trace — 실제 ColorSwatchList (decisionRationale 포함된 토큰 1 개)
 *   → 카드 클릭 시 실제 production TokenDecisionTracePanel 펼침
 * ============================================ */

const TRACE_TOKENS = [
  {
    id: 'primary',
    label: 'Primary',
    hex: '#14132B',
    role: 'primary',
    isEnabled: true,
    decisionRationale: {
      whichReferences: [],
      whichLayers: ['color'],
      whyChosen: '"차분한 다크" 의도 매칭. 짙은 톤 우선.',
      appliedUserNotes: 'ref-002 의 색감을 primary 로 잡아주세요.',
      alternativesConsidered: [
        { value: '#4F46E5', reason: '채도가 너무 높음' },
        { value: '#0F172A', reason: '브랜드 톤과 거리감' },
      ],
    },
  },
];

function TraceDemo() {
  return (
    <Box sx={ { border: '1px solid', borderColor: 'divider', borderRadius: 1 } }>
      <ColorSwatchList tokens={ TRACE_TOKENS } onChange={ () => {} } />
    </Box>
  );
}

/* ============================================
 * Mode — 실제 ModeSelectCard 2 종 (concept / system)
 * ============================================ */

function ModeDemo() {
  return (
    <Box sx={ { display: 'flex', flexDirection: 'column', gap: 1 } }>
      <ModeSelectCard
        mode="concept"
        title="🎨 컨셉 잡기"
        subtitle="Claude Desktop · Gemini · ChatGPT"
        description="800 자 prompt 한 장."
        isSelected={ false }
        onSelect={ () => {} }
      />
      <ModeSelectCard
        mode="system"
        title="🏗️ 디자인 시스템"
        subtitle="Cursor · Claude Code · Lovable"
        description="DESIGN.md + DTCG + decision-trace ZIP."
        isSelected
        onSelect={ () => {} }
      />
    </Box>
  );
}
