import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useState } from 'react';
import {
  DocumentTitle,
  PageContainer,
  SectionTitle,
} from '../../components/storybookDocumentation';
import projectStructure from '../../data/projectStructure.js';
import { assemblySteps } from '../../data/assemblySteps.js';

export default {
  title: 'Custom Component/0. Hierarchy',
  parameters: {
    layout: 'padded',
  },
};

/**
 * 스타터킷과 파일 내용이 같은 컴포넌트(재활용).
 * 경로는 `src/` 아래 상대 경로이고 projectStructure 의 `file` 값과 같은 키다.
 */
const REUSE_FILES = [
  'components/container/CarouselContainer.jsx',
  'components/container/RatioContainer.jsx',
  'components/content-transition/HorizontalScrollContainer.jsx',
  'components/dynamic-color/GradientOverlay.jsx',
  'components/in-page-navigation/CategoryTab.jsx',
  'components/kinetic-typography/RandomRevealText.jsx',
  'components/kinetic-typography/ScrambleText.jsx',
  'components/kinetic-typography/ScrollRevealText.jsx',
  'components/layout/BentoGrid.jsx',
  'components/layout/FullPageContainer.jsx',
  'components/layout/LineGrid.jsx',
  'components/layout/PhiSplit.jsx',
  'components/layout/SplitScreen.jsx',
  'components/layout/StickyAsideCenterLayout.jsx',
  'components/layout/bentoPresets.js',
  'components/layout/useAppShell.js',
  'components/media/AspectMedia.jsx',
  'components/media/CarouselIndicator.jsx',
  'components/media/ImageCarousel.jsx',
  'components/media/ImageTransition.jsx',
  'components/motion/FadeTransition.jsx',
  'components/motion/MarqueeContainer.jsx',
  'components/motion/PerspectiveTransition.jsx',
  'components/navigation/NavMenu.jsx',
  'components/scroll/ScrollScaleContainer.jsx',
  'components/scroll/VideoScrubbing.jsx',
  'components/storybookDocumentation/DocumentTitle.jsx',
  'components/storybookDocumentation/EditorialDocument.jsx',
  'components/storybookDocumentation/PageContainer.jsx',
  'components/storybookDocumentation/SectionTitle.jsx',
  'components/storybookDocumentation/TreeNode.jsx',
  'components/storybookDocumentation/documentTheme.js',
  'components/typography/FitText.jsx',
  'components/typography/HighlightedTypography.jsx',
  'components/typography/QuotedContainer.jsx',
  'components/typography/StretchedHeadline.jsx',
  'components/typography/StyledParagraph.jsx',
  'components/typography/Title.jsx',
];

/** 스타터킷과 같은 경로에 있으나 내용이 다른 컴포넌트(수정) */
const MODIFIED_FILES = [
  'components/card/CardContainer.jsx',
  'components/card/CustomCard.jsx',
  'components/card/ImageCard.jsx',
  'components/card/MoodboardCard.jsx',
  'components/container/SectionContainer.jsx',
  'components/input/FileDropzone.jsx',
  'components/input/SearchBar.jsx',
  'components/input/TagInput.jsx',
  'components/layout/AppShell.jsx',
  'components/layout/PageContainer.jsx',
  'components/navigation/GNB.jsx',
  'components/navigation/SlidingHighlightMenu.jsx',
  'components/templates/FilterBar.jsx',
  'components/typography/InlineTypography.jsx',
];

const REUSE = new Set(REUSE_FILES);
const MODIFIED = new Set(MODIFIED_FILES);

/** 파일 경로로 분류를 판정한다. 목록에 없으면 이 저장소에만 있는 것이므로 신규 */
const classify = (file) => {
  if (!file) return 'new';
  if (REUSE.has(file)) return 'reuse';
  if (MODIFIED.has(file)) return 'modified';
  return 'new';
};

/** 분류마다 무엇이 들어가는지 한 줄 설명 */
const GROUP_NOTE = {
  Page: '라우트 하나에 대응하는 화면',
  Template: '화면을 조립하는 레이아웃과 흐름 셸',
  Section: '화면을 가르는 구획',
  'Custom Component': '이 프로젝트에서 새로 만들거나 고친 컴포넌트',
  Component: '스타터킷 그대로 쓰는 컴포넌트',
};

const BADGE = {
  reuse: { label: '스타터킷', color: 'text.disabled' },
  modified: { label: '수정', color: 'warning.dark' },
  new: { label: '신규', color: 'success.dark' },
};

/** 모든 스토리 파일의 원문을 읽어 title 만 뽑는다. 실행 없이 정규식으로만 본다 */
const storySources = import.meta.glob('../../**/*.stories.jsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const ALL_TITLES = Object.values(storySources)
  .map((src) => (src.match(/title:\s*'([^']*)'/) || [])[1])
  .filter(Boolean)
  .sort();

/** 분류 라벨은 title 의 첫 마디. 그 밖은 기타로 묶는다 */
const GROUP_ORDER = ['Page', 'Template', 'Section', 'Custom Component', 'Component'];
const GROUP_COUNTS = GROUP_ORDER.map((g) => ({
  group: g,
  count: ALL_TITLES.filter((t) => t.split('/')[0] === g).length,
}));
const OTHER_COUNT = ALL_TITLES.filter((t) => !GROUP_ORDER.includes(t.split('/')[0])).length;

/**
 * 트리 한 마디. 신규와 수정은 펼친 채로, 재활용은 접은 채로 시작한다.
 *
 * Props:
 * @param {object} node - projectStructure 의 노드 [Required]
 * @param {number} depth - 들여쓰기 깊이 [Optional, 기본값: 0]
 *
 * Example usage:
 * <HierarchyNode node={ projectStructure.root } />
 */
function HierarchyNode({ node, depth = 0 }) {
  const kind = classify(node.file);
  const children = node.children || [];
  const isReuse = kind === 'reuse';
  const hasChildren = children.length > 0 && !isReuse && !node.ref;
  const [isOpen, setIsOpen] = useState(!isReuse);
  const badge = BADGE[kind];

  return (
    <Box sx={ { ml: depth > 0 ? 2 : 0 } }>
      <Box
        onClick={ () => hasChildren && setIsOpen(!isOpen) }
        sx={ {
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          py: 0.5,
          px: 1,
          cursor: hasChildren ? 'pointer' : 'default',
          borderLeft: depth > 0 ? '1px solid' : 'none',
          borderColor: 'divider',
          '&:hover': hasChildren ? { backgroundColor: 'action.hover' } : {},
        } }
      >
        <Typography
          component="span"
          sx={ { width: 16, fontSize: 12, fontFamily: 'monospace', color: 'text.secondary' } }
        >
          { hasChildren ? (isOpen ? '▼' : '▶') : '' }
        </Typography>

        <Typography
          component="span"
          sx={ {
            fontFamily: 'monospace',
            fontSize: 13,
            fontWeight: kind === 'reuse' ? 400 : 600,
            color: kind === 'reuse' ? 'text.secondary' : 'text.primary',
          } }
        >
          { node.name }
        </Typography>

        <Typography component="span" sx={ { fontSize: 11, color: badge.color } }>
          { badge.label }
        </Typography>

        { node.storyId && (
          <Typography
            component="a"
            href={ `?path=/story/${node.storyId}` }
            target="_top"
            sx={ { fontSize: 11, color: 'info.main', textDecoration: 'underline' } }
          >
            스토리 열기
          </Typography>
        ) }

        { node.ref && (
          <Typography component="span" sx={ { fontSize: 11, color: 'text.disabled' } }>
            (위에서 펼침)
          </Typography>
        ) }

        { (node.hooks || []).map((h) => (
          <Typography key={ h.name } component="span" sx={ { fontSize: 11, color: 'text.disabled' } }>
            { h.name }
          </Typography>
        )) }
      </Box>

      { hasChildren && isOpen && children.map((child, i) => (
        <HierarchyNode key={ `${child.name}-${i}` } node={ child } depth={ depth + 1 } />
      )) }
    </Box>
  );
}

/** 화면부터 읽는 계층. 페이지 아래에 섹션, 섹션 아래에 컴포넌트가 온다 */
export const Default = {
  render: () => {
    const roots = projectStructure.root.children || [];
    const pages = roots.filter((n) => n.kind === 'page');
    const shared = roots.filter((n) => n.kind !== 'page');

    return (
      <>
        <DocumentTitle
          title="Hierarchy"
          status="Available"
          note="화면에서 컴포넌트로 내려가는 시각 위계"
          brandName="Design System"
          systemName="MUSE"
          version="1.0"
        />
        <PageContainer>
          <Typography variant="h4" sx={ { fontWeight: 700, mb: 1 } }>
            Hierarchy
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={ { mb: 1 } }>
            <code>src/data/projectStructure.js</code> · 재생성: <code>pnpm generate-structure</code>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={ { mb: 4 } }>
            신규와 수정은 펼친 채로 시작하고, 스타터킷 그대로 쓰는 것은 접은 채 회색으로 둔다.
            분류는 판단이 아니라 스타터킷과의 파일 대조 결과다.
          </Typography>

          <SectionTitle
            title="조립 순서"
            description={ `${assemblySteps.length}단계. 자세한 자료 목록은 Overview/MUSE/09 Domain Knowledge & Research` }
          />
          <Box sx={ { display: 'flex', flexWrap: 'wrap', gap: 1, mb: 6 } }>
            { assemblySteps.map((step) => (
              <Box
                key={ step.id }
                sx={ {
                  px: 1.5,
                  py: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                  minWidth: 150,
                  flex: '1 1 150px',
                } }
              >
                <Typography sx={ { fontSize: 12, fontWeight: 700 } }>
                  { step.no }. { step.title }
                </Typography>
                <Typography sx={ { fontSize: 11, color: 'text.secondary' } }>
                  { step.storyTitles.length }개 화면
                </Typography>
              </Box>
            )) }
          </Box>

          <SectionTitle title="분류별 스토리 수" description={ `스토리 title 의 첫 마디로 센다. 전체 ${ALL_TITLES.length}개` } />
          <TableContainer sx={ { mb: 6 } }>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600, width: 260 } }>분류</TableCell>
                  <TableCell sx={ { fontWeight: 600, width: 100 } }>스토리 수</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>무엇이 들어가나</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                { GROUP_COUNTS.map((g) => (
                  <TableRow key={ g.group }>
                    <TableCell sx={ { fontSize: 13, fontWeight: 600 } }>{ g.group }</TableCell>
                    <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>{ g.count }</TableCell>
                    <TableCell sx={ { fontSize: 12, color: 'text.secondary' } }>{ GROUP_NOTE[g.group] }</TableCell>
                  </TableRow>
                )) }
                <TableRow>
                  <TableCell sx={ { fontSize: 13, color: 'text.secondary' } }>그 밖</TableCell>
                  <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>{ OTHER_COUNT }</TableCell>
                  <TableCell sx={ { fontSize: 12, color: 'text.secondary' } }>
                    Overview, Style, Common 등 문서와 토큰 스토리
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <SectionTitle
            title="화면에서 컴포넌트로"
            description={ `화면 ${pages.length}개. 재활용 ${REUSE_FILES.length} · 수정 ${MODIFIED_FILES.length} · 나머지는 신규` }
          />
          <Box sx={ { p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 } }>
            { pages.map((page, i) => (
              <HierarchyNode key={ `${page.name}-${i}` } node={ page } />
            )) }
          </Box>

          <SectionTitle
            title="화면 밖에서 감싸는 것"
            description="라우트가 아니라 앱 전체를 감싸는 가지다. 상태와 세션이 여기서 내려온다"
          />
          <Box sx={ { p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 } }>
            { shared.map((node, i) => (
              <HierarchyNode key={ `${node.name}-${i}` } node={ node } />
            )) }
          </Box>
        </PageContainer>
      </>
    );
  },
};
