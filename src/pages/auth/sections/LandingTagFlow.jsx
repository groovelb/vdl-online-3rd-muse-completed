import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MarqueeContainer from '../../../components/motion/MarqueeContainer.jsx';
import tagPreset from '../../../data/muse/tag/muse_tags_preset.json';

/**
 * LandingTagFlow
 *
 * Stage 1 ("정확한 분류 체계로 레퍼런스를 관리하세요") 다음에 등장하는 풀블리드 섹션.
 * MUSE 가 실제로 분류 / 합성에 쓰는 디자인 키워드 태그를 3 줄의 MarqueeContainer 로
 * 교차 방향 (왼쪽 / 오른쪽 / 왼쪽) 으로 흐르게 한다. 사이즈는 production chip 보다
 * 훨씬 크게 — 랜딩 임팩트용.
 */

/* tag preset → 4 layer (color / typography / layout / gradient) 의 모든 tag 이름 평탄화 */
function collectTags() {
  const layers = ['color', 'typography', 'layout', 'gradient'];
  const out = [];
  layers.forEach((layer) => {
    const def = tagPreset.layers?.[layer];
    if (!Array.isArray(def?.tags)) return;
    def.tags.forEach((t) => {
      if (typeof t?.tag === 'string') out.push(t.tag);
    });
  });
  return out;
}

const ALL_TAGS = collectTags();

/* 3 줄로 분배 (round-robin) */
const ROWS = [[], [], []];
ALL_TAGS.forEach((tag, i) => {
  ROWS[i % 3].push(tag);
});

/* 줄별 마퀴 설정: 교차 방향 + 서로 다른 속도 */
const ROW_CONFIG = [
  { direction: 'left',  speed: 60 },
  { direction: 'right', speed: 75 },
  { direction: 'left',  speed: 90 },
];

function BigTagPill({ children }) {
  return (
    <Box
      sx={ {
        display: 'inline-flex',
        alignItems: 'center',
        px: { xs: 2.5, md: 4 },
        py: { xs: 1, md: 1.5 },
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '999px',
        whiteSpace: 'nowrap',
      } }
    >
      <Typography
        component="span"
        sx={ {
          fontSize: 'clamp(28px, 4vw, 56px)',
          fontWeight: 500,
          letterSpacing: '-0.01em',
          lineHeight: 1,
          color: 'text.primary',
        } }
      >
        { children }
      </Typography>
    </Box>
  );
}

export function LandingTagFlow() {
  return (
    <Box
      component="section"
      sx={ {
        width: '100%',
        py: { xs: 8, md: 14 },
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 2, md: 3 },
        overflow: 'hidden',
      } }
    >
      { ROWS.map((tags, i) => {
        const cfg = ROW_CONFIG[i];
        return (
          <MarqueeContainer
            key={ i }
            direction={ cfg.direction }
            speed={ cfg.speed }
            isPauseOnHover={ false }
            gap={ 2 }
          >
            { tags.map((tag) => (
              <BigTagPill key={ tag }>{ tag }</BigTagPill>
            )) }
          </MarqueeContainer>
        );
      }) }
    </Box>
  );
}
