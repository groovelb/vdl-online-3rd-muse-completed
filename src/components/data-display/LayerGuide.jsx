import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/**
 * 각 layer (color/typography/layout/gradient) 별 정형 가이드 + 동적 결정 근거.
 *
 * - 정형 가이드: Material/Apple HIG/Polaris 등 모범 디자인 시스템에서 일반적으로
 *   다루는 Purpose / Do / Don't 를 layer 별로 hardcoded.
 * - 동적: handoff 모드는 layerDetails[layerKey] (한글 200-500자), 그 외는
 *   tokens 의 decisionRationale.whyChosen 을 합본.
 *
 * 모듈러 그리드 사용 X — 모든 섹션을 수직으로 쌓는다.
 *
 * Props:
 * @param {string} layerKey - 'color' | 'typography' | 'layout' | 'gradient' [Required]
 * @param {Array} tokens - 해당 layer 의 토큰 배열 [Required]
 * @param {string} layerDetail - handoff 모드의 한글 layerDetail (있으면) [Optional]
 *
 * Example:
 * <LayerGuide layerKey="color" tokens={ analysis.color } layerDetail={ analysis.layerDetails?.color } />
 */
export function LayerGuide({ layerKey, tokens = [], layerDetail }) {
  const guide = LAYER_GUIDES[layerKey];
  if (!guide) return null;

  const decisions = (tokens || [])
    .filter((t) => t?.decisionRationale?.whyChosen)
    .map((t) => ({
      label: t.label || t.id || t.variant || '(name 없음)',
      whyChosen: t.decisionRationale.whyChosen,
      appliedUserNotes: t.decisionRationale.appliedUserNotes,
      appliedReferenceNote: t.decisionRationale.appliedReferenceNote,
    }));

  return (
    <Box sx={ { display: 'flex', flexDirection: 'column', gap: 4 } }>
      {/* ===== 1. Purpose ===== */}
      <Section
        eyebrow="PURPOSE"
        title={ guide.titleKo }
      >
        <Typography variant="body2" color="text.primary" sx={ { lineHeight: 1.7 } }>
          { guide.purpose }
        </Typography>
      </Section>

      {/* ===== 2. Do (사용 원칙) ===== */}
      <Section eyebrow="DO" title="이렇게 사용한다">
        <Box component="ul" sx={ { m: 0, pl: 2.5, display: 'flex', flexDirection: 'column', gap: 0.75 } }>
          { guide.dos.map((d, i) => (
            <Box key={ i } component="li">
              <Typography variant="body2" sx={ { lineHeight: 1.6 } }>{ d }</Typography>
            </Box>
          )) }
        </Box>
      </Section>

      {/* ===== 3. Don't (피할 패턴) ===== */}
      <Section eyebrow="DON'T" title="이렇게 쓰지 않는다">
        <Box component="ul" sx={ { m: 0, pl: 2.5, display: 'flex', flexDirection: 'column', gap: 0.75 } }>
          { guide.donts.map((d, i) => (
            <Box key={ i } component="li">
              <Typography variant="body2" sx={ { lineHeight: 1.6, color: 'text.secondary' } }>{ d }</Typography>
            </Box>
          )) }
        </Box>
      </Section>

      {/* ===== 4. 이 프로젝트의 결정 (동적) ===== */}
      { (decisions.length > 0 || layerDetail) && (
        <Section eyebrow="THIS PROJECT" title="이 프로젝트의 결정">
          { layerDetail && (
            <Box
              sx={ {
                p: 2,
                mb: 2,
                bgcolor: 'grey.50',
                borderLeft: '3px solid',
                borderColor: 'primary.main',
                borderRadius: 0.5,
              } }
            >
              <Typography variant="body2" sx={ { lineHeight: 1.7, whiteSpace: 'pre-wrap' } }>
                { layerDetail }
              </Typography>
            </Box>
          ) }
          { decisions.length > 0 && (
            <Box sx={ { display: 'flex', flexDirection: 'column', gap: 1.5 } }>
              { decisions.map((d, i) => (
                <Box
                  key={ i }
                  sx={ {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                    p: 1.5,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1.5,
                  } }
                >
                  <Typography
                    variant="caption"
                    sx={ {
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      color: 'text.secondary',
                      letterSpacing: '0.05em',
                    } }
                  >
                    { d.label }
                  </Typography>
                  <Typography variant="body2" sx={ { lineHeight: 1.6 } }>
                    { d.whyChosen }
                  </Typography>
                  { d.appliedUserNotes && (
                    <Typography variant="caption" color="primary.main" sx={ { mt: 0.5, fontStyle: 'italic' } }>
                      ✋ 사용자 노트 적용: &ldquo;{ d.appliedUserNotes }&rdquo;
                    </Typography>
                  ) }
                  { d.appliedReferenceNote && (
                    <Typography variant="caption" color="text.secondary" sx={ { mt: 0.5, fontStyle: 'italic' } }>
                      📌 ref 노트: &ldquo;{ d.appliedReferenceNote }&rdquo;
                    </Typography>
                  ) }
                </Box>
              )) }
            </Box>
          ) }
        </Section>
      ) }
    </Box>
  );
}

function Section({ eyebrow, title, children }) {
  return (
    <Box sx={ { display: 'flex', flexDirection: 'column', gap: 1.25 } }>
      <Box sx={ { display: 'flex', flexDirection: 'column', gap: 0.25 } }>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={ { fontSize: '0.68rem', letterSpacing: '0.14em', lineHeight: 1.2 } }
        >
          { eyebrow }
        </Typography>
        <Typography variant="subtitle2" sx={ { fontWeight: 600 } }>
          { title }
        </Typography>
      </Box>
      { children }
    </Box>
  );
}

/* ============================================
 * Layer 정형 가이드 (Material / Apple HIG / Polaris 의 공통 best practice 기반)
 * ============================================ */

const LAYER_GUIDES = {
  color: {
    titleKo: '팔레트는 브랜드의 첫인상과 정보 위계의 기반',
    purpose:
      '컬러는 가장 즉각적인 정체성 신호다. 한 시스템에 너무 많은 색은 위계를 흐리고, 너무 적은 색은 메시지를 잃는다. ' +
      '브랜드의 핵심 1색(Primary), 본문·표면을 떠받치는 중성(Neutral), 상태·강조를 위한 보조(Secondary/Accent) — 이 세 축의 균형이 시스템의 명료도를 결정한다.',
    dos: [
      'Primary 는 화면당 하나의 강조점에만 — CTA, 핵심 강조 텍스트',
      'Neutral 은 본문·배경·보더의 기반. 여러 단계로 위계 구성',
      '본문 텍스트는 배경 대비 4.5:1 이상 (WCAG AA)',
      'Accent 는 상태(success/warning/error) 또는 보조 강조에만',
      '같은 역할(role)을 가진 토큰은 1개씩만 — primary, secondary 각 1',
    ],
    donts: [
      'Primary 를 본문 텍스트로 쓰지 말 것 (피로감)',
      '여러 hue 를 같은 위계로 섞지 말 것 (메시지 분산)',
      '리터럴 hex 를 컴포넌트에 박지 말 것 — 토큰 referencing',
      '낮은 채도 둘이 같은 역할(neutral) 이라면 contrast 단계 차이 두기',
    ],
  },

  typography: {
    titleKo: '타이포그래피는 정보 위계와 가독성의 기반',
    purpose:
      '폰트 패밀리·크기·굵기는 사용자가 한 화면을 어떻게 훑고 어디에 머무를지 결정한다. ' +
      '위계는 fontSize × fontWeight × lineHeight 의 차이로 만들고, 너무 많은 variant 는 시스템을 모호하게 만든다. ' +
      'Display → Heading → Body → Caption 4-5단계면 충분하다.',
    dos: [
      'Display(h1) 는 페이지당 1곳 (히어로/제목)',
      'Heading(h2/h3) 으로 섹션 구분 — 같은 화면에서 같은 변형 반복',
      'Body 는 line-height 1.5 이상 (가독성)',
      'Caption 은 메타·레이블에만',
      '폰트 패밀리는 1-2종 — 본문·디스플레이 분리 정도',
    ],
    donts: [
      'fontSize 차이 < 2px 는 위계 효과 0 — 명확히 차이 둘 것',
      'h1 인데 fontWeight 가 body 와 같으면 위계 안 보임',
      '폰트 패밀리 3종 이상 — 시스템 일관성 깨짐',
      'letterSpacing 으로 위계 만들지 말 것 (보조 수단일 뿐)',
    ],
  },

  layout: {
    titleKo: '레이아웃은 콘텐츠 구조의 리듬과 우선순위',
    purpose:
      '레이아웃은 무엇을 먼저 / 어떻게 묶어 보여줄지 결정한다. ' +
      '한 화면은 하나의 일관된 grid / container 위에서 펼쳐져야 하고, 섹션 간 spacing 은 관계의 가까움·멂을 표현한다. ' +
      '여백은 빈 공간이 아니라 의도다.',
    dos: [
      '한 화면당 grid 1개 — 일관된 column / gap 적용',
      'maxWidth 로 콘텐츠 폭 제한 (가독성, 모바일 보호)',
      '섹션 간 spacing 은 scale 의 lg 이상',
      '관계가 가까운 요소는 좁게, 먼 요소는 넓게 (Gestalt)',
      '반응형은 column 수 / gap 줄여 적용',
    ],
    donts: [
      '서로 다른 grid 를 한 화면에 혼용하지 말 것',
      '여백을 일관된 스케일 없이 임의 px 로 박지 말 것',
      '너무 많은 column (>12) — 정보 분산',
      'maxWidth 없이 콘텐츠를 풀폭으로 흘리지 말 것 (긴 줄 → 가독성 ↓)',
    ],
  },

  gradient: {
    titleKo: '그라디언트는 깊이·전환·강조의 보조 레이어',
    purpose:
      '그라디언트는 정적 단색이 표현하지 못하는 깊이·움직임·시각적 hook 을 만든다. ' +
      '하지만 과사용하면 브랜드가 흐려진다. 시스템에서 그라디언트는 "있어도 되고 없어도 되는" 보조 — 1-2개로 절제한다.',
    dos: [
      'Hero / 배경 / accent 영역에 1-2개만',
      '브랜드 hue 안에서 stop 결정 — 팔레트와 정합',
      '그라디언트 위 텍스트는 contrast 보장 (다크 오버레이 또는 high-weight font)',
      '미세한 gradient (subtle) 가 강한 gradient 보다 빈도 ↑',
    ],
    donts: [
      '본문 / 카드 / 컴포넌트 다수에 그라디언트 깔지 말 것',
      '가독성 저하되는 high-contrast 그라디언트 위에 본문 두지 말 것',
      '정해진 stops 외 임의 gradient 인라인 박지 말 것',
      '브랜드 hue 와 동떨어진 색 사용 금지',
    ],
  },
};
