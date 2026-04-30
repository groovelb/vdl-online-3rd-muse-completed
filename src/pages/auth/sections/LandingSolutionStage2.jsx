import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { CategoryTab } from '../../../components/in-page-navigation/CategoryTab.jsx';
import { ColorSwatchList } from '../../../components/data-display/ColorSwatchList.jsx';
import { TypographyPreview } from '../../../components/data-display/TypographyPreview.jsx';
import { LayoutTokenPreview } from '../../../components/data-display/LayoutTokenPreview.jsx';
import { GradientPreview } from '../../../components/data-display/GradientPreview.jsx';
import { SectionShell } from './SectionShell.jsx';
import { SOLUTION_STAGE_2 } from '../landingCopy.js';
import landingAnalysis from '../../../data/landingStage2Analysis.json';
import { URL_BY_BASENAME, getExampleByBasename } from '../../../utils/exampleImageTokens.js';
import { ANALYSIS_LAYERS_WITH_DESIGN_MD as LAYERS } from '../../../data/muse/layers.js';

/* Stage 1 의 3 장 example 이미지를 ref-001/002/003 로 매핑 (T3 호출 시와 동일 순서) */
const STAGE1_BASENAMES = [
  '213923458a6349a228e888fc5ce9bde5.jpg',
  '9a731d7608517e4bcd7f9716d5187424.jpg',
  '9bcda910a13720921bda897f0cabca08.jpg',
];

/* TokenDecisionTracePanel 의 출처 썸네일 lookup 용 references 풀 */
const STAGE2_REFERENCES = STAGE1_BASENAMES.map((basename, i) => {
  const t = getExampleByBasename(basename);
  return {
    id: `ref-${ String(i + 1).padStart(3, '0') }`,
    title: t?.title || `ref-${ i + 1 }`,
    thumbnailUrl: URL_BY_BASENAME[basename],
  };
});

/* 실제 T3 (system mode) 호출 결과 — Stage 1 3 장 이미지 분석 */
const SAMPLE_ANALYSIS = landingAnalysis.tokens || {};

/* ============================================
 * Stage 2 — 좌 4 layer 분석 / 우 AI 브랜드 카드
 * ============================================ */
export function LandingSolutionStage2() {
  const [activeLayer, setActiveLayer] = useState('color');

  const renderLayer = () => {
    switch (activeLayer) {
      case 'color':
        return (
          <ColorSwatchList
            tokens={ SAMPLE_ANALYSIS.color || [] }
            references={ STAGE2_REFERENCES }
            onChange={ () => {} }
          />
        );
      case 'typography':
        return (
          <TypographyPreview
            tokens={ SAMPLE_ANALYSIS.typography || [] }
            references={ STAGE2_REFERENCES }
            onChange={ () => {} }
          />
        );
      case 'layout':
        return (
          <LayoutTokenPreview
            tokens={ SAMPLE_ANALYSIS.layout || [] }
            references={ STAGE2_REFERENCES }
            onChange={ () => {} }
          />
        );
      case 'gradient':
        return (
          <GradientPreview
            tokens={ SAMPLE_ANALYSIS.gradient || [] }
            references={ STAGE2_REFERENCES }
            onChange={ () => {} }
          />
        );
      case 'visualDirection': {
        const vd = landingAnalysis.visualDirection || { markdown: '', tags: {} };
        const sections = (vd.markdown || '')
          .split('\n')
          .filter((line) => /^##\s/.test(line))
          .map((line) => line.replace(/^##\s+/, '').trim());
        const tagItems = Object.entries(vd.tags || {})
          .filter(([, list]) => list?.length > 0)
          .map(([category, list]) => ({ category, list }));
        return (
          <ArtifactSummary
            role="디자인 의도를 사람의 언어로 정리한 한 페이지 가이드"
            description="레퍼런스에서 추출된 무드, 스타일, 주제와 함께 톤·구현 가이드라인·피해야 할 요소를 마크다운 한 장에 서술. 디자이너 / PM / AI 모두에게 단일 진실 원천."
            items={ [
              {
                label: 'TAGS',
                value: tagItems.length > 0
                  ? tagItems.map((t) => `${ t.category } (${ t.list.length })`).join(' · ')
                  : '(없음)',
              },
              {
                label: 'SECTIONS',
                value: sections.length > 0
                  ? sections.join(' · ')
                  : '(없음)',
              },
              {
                label: 'LENGTH',
                value: `${ (vd.markdown || '').length.toLocaleString() } chars`,
              },
            ] }
          />
        );
      }
      case 'designMd': {
        const t = landingAnalysis.tokens || {};
        const componentCount = t.components ? Object.keys(t.components).length : 0;
        const spacingCount = t.spacing ? Object.keys(t.spacing).length : 0;
        const roundedCount = t.rounded ? Object.keys(t.rounded).length : 0;
        return (
          <ArtifactSummary
            role="DTCG / MUI theme 호환 디자인 시스템 산출물"
            description="Claude / Gemini / ChatGPT 등 AI 도구에 그대로 입력해 의도까지 이해한 코드를 출력. 모든 토큰이 token reference 문법으로 묶여있어 한 곳을 바꾸면 전체가 따라간다."
            items={ [
              { label: 'COLOR', value: `${ t.color?.length || 0 } 토큰` },
              { label: 'TYPOGRAPHY', value: `${ t.typography?.length || 0 } 토큰` },
              { label: 'LAYOUT', value: `${ t.layout?.length || 0 } 토큰` },
              { label: 'GRADIENT', value: `${ t.gradient?.length || 0 } 토큰` },
              { label: 'SPACING', value: `${ spacingCount } scale` },
              { label: 'ROUNDED', value: `${ roundedCount } scale` },
              { label: 'COMPONENTS', value: `${ componentCount } 컴포넌트` },
            ] }
          />
        );
      }
      default:
        return null;
    }
  };

  return (
    <SectionShell
      title={ SOLUTION_STAGE_2.title }
      lede={ SOLUTION_STAGE_2.lede }
    >
      {/* 분석 영역 — radius 적용된 hairline border container 안에 탭 + 본문 */}
      <Box
        sx={ {
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '16px',
          overflow: 'hidden',
          bgcolor: 'background.paper',
        } }
      >
        <Box
          sx={ {
            borderBottom: '1px solid',
            borderColor: 'divider',
            px: { xs: 2, md: 3 },
            pt: 1,
          } }
        >
          <CategoryTab
            categories={ LAYERS }
            selected={ activeLayer }
            onChange={ setActiveLayer }
          />
        </Box>
        <Box sx={ { p: { xs: 2, md: 3 } } }>
          { renderLayer() }
        </Box>
      </Box>

      {/* 하단 — AI 아이콘 row, 가운데 정렬 + caption */}
      <Box
        sx={ {
          mt: { xs: 6, md: 10 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
        } }
      >
        <Box sx={ { display: 'flex', alignItems: 'center', gap: { xs: 4, md: 6 } } }>
          { SOLUTION_STAGE_2.brands.map((b) => (
            <BrandIcon key={ b.name } name={ b.name } color={ b.color } />
          )) }
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={ { lineHeight: 1.7, textAlign: 'center', maxWidth: 640, wordBreak: 'keep-all' } }
        >
          { SOLUTION_STAGE_2.caption }
        </Typography>
      </Box>
    </SectionShell>
  );
}

/* ============================================
 * ArtifactSummary — 산출물 (Visual Direction / DESIGN.md) 의 *역할 + 항목 요약* 카드
 *   - 풀 markdown / raw export 를 노출하지 않고 카운트 / 섹션 / 태그 만 요약 (스크롤 부담 X)
 * ============================================ */
function ArtifactSummary({ role, description, items }) {
  return (
    <Box sx={ { display: 'flex', flexDirection: 'column', gap: 3 } }>
      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={ { fontFamily: 'monospace', letterSpacing: '0.12em', textTransform: 'uppercase' } }
        >
          ROLE
        </Typography>
        <Typography
          variant="h6"
          sx={ { fontWeight: 600, mt: 0.5, letterSpacing: '-0.01em', wordBreak: 'keep-all' } }
        >
          { role }
        </Typography>
        { description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={ { mt: 1, lineHeight: 1.7, wordBreak: 'keep-all' } }
          >
            { description }
          </Typography>
        ) }
      </Box>

      <Box
        sx={ {
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          rowGap: 1.5,
          columnGap: 4,
        } }
      >
        { items.map((it) => (
          <Box
            key={ it.label }
            sx={ {
              display: 'flex',
              alignItems: 'baseline',
              gap: 2,
              py: 1,
              borderTop: '1px solid',
              borderColor: 'divider',
            } }
          >
            <Typography
              sx={ {
                fontFamily: 'monospace',
                fontSize: '0.7rem',
                letterSpacing: '0.12em',
                color: 'text.secondary',
                minWidth: 96,
                flexShrink: 0,
              } }
            >
              { it.label }
            </Typography>
            <Typography
              variant="body2"
              sx={ { color: 'text.primary', wordBreak: 'keep-all', lineHeight: 1.6 } }
            >
              { it.value }
            </Typography>
          </Box>
        )) }
      </Box>
    </Box>
  );
}

/* ============================================
 * BrandIcon — 하단 row 의 큰 아이콘 + 라벨 (가운데 정렬)
 * ============================================ */
function BrandIcon({ name, color }) {
  return (
    <Box
      sx={ {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
      } }
    >
      <BrandMark name={ name } color={ color } size={ 56 } />
      <Typography
        sx={ {
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'text.secondary',
          letterSpacing: '-0.01em',
        } }
      >
        { name }
      </Typography>
    </Box>
  );
}

/* ============================================
 * BrandMark — 실제 브랜드 로고 (simple-icons 의 공식 path 사용)
 *   Claude:   simple-icons "claude" 그대로
 *   Gemini:   simple-icons "googlegemini" 그대로
 *   ChatGPT:  OpenAI knot mark (공개 official logo)
 * ============================================ */
const BRAND_PATHS = {
  Claude:
    'm4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z',
  Gemini:
    'M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81',
  ChatGPT:
    'M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6813l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.5093-2.6067-1.4997Z',
};

function BrandMark({ name, color, size = 32 }) {
  const path = BRAND_PATHS[name];
  return (
    <Box
      sx={ {
        width: size,
        height: size,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      } }
    >
      <svg width={ size } height={ size } viewBox="0 0 24 24" aria-hidden role="img">
        { path && <path d={ path } fill={ color } /> }
      </svg>
    </Box>
  );
}
