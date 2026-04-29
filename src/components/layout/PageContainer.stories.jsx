import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Placeholder from '../../common/ui/Placeholder';
import { PageContainer } from './PageContainer';
import { DocumentTitle, SectionTitle } from '../storybookDocumentation';

export default {
  title: 'Component/8. Layout/PageContainer',
  component: PageContainer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

/**
 * ## 기본 사용법
 * 
 * PageContainer는 페이지의 메인 콘텐츠를 감싸는 컨테이너입니다.
 * - MUI Container 기반으로, 중앙 정렬 및 반응형 패딩 제공
 * - maxWidth 옵션으로 최대 너비 설정 가능
 * - 기본값: xl (1536px)
 */
export const Default = {
  render: () => (
    <Box>
      <DocumentTitle
        title="PageContainer"
        status="Ready"
        note="페이지 콘텐츠를 중앙에 배치하고 좌우 패딩을 적용하는 컨테이너"
        brandName="Layout"
        systemName="Container"
        version="1.0"
      />
      
      <Box sx={ { py: 4 } }>
        <SectionTitle>기본 사용법</SectionTitle>
        <PageContainer>
          <Placeholder.Box label="PageContainer (maxWidth=&quot;xl&quot;)" height={ 120 } />
          <Box sx={ { mt: 1 } }>
            <Typography color="text.secondary" variant="body2">
              콘텐츠가 화면 중앙에 정렬되며, 최대 너비 1536px까지 확장됩니다.
              좌우에 반응형 패딩이 자동으로 적용됩니다.
            </Typography>
          </Box>
        </PageContainer>
      </Box>
    </Box>
  ),
};

/**
 * ## variant — fluid / focus
 *
 * 페이지 폭 모드. fluid 는 뷰포트 전체를 사용(탐색·그리드 페이지),
 * focus 는 좁은 maxWidth 로 중앙 집중(생성·입력·설정 페이지).
 */
export const Variants = {
  name: 'variant (fluid / focus)',
  render: () => (
    <Box sx={ { py: 4, bgcolor: 'grey.100' } }>
      <SectionTitle>variant 비교</SectionTitle>

      <Box sx={ { mb: 3 } }>
        <Typography variant="caption" sx={ { px: 2 } }>variant=&quot;fluid&quot; — 뷰포트 전체 폭 + clamp(24, 4vw, 64) padding</Typography>
        <PageContainer variant="fluid">
          <Placeholder.Box label="fluid — 레퍼런스 / 프로젝트 목록 / 상세 등 탐색 페이지" height={ 96 } />
        </PageContainer>
      </Box>

      <Box>
        <Typography variant="caption" sx={ { px: 2 } }>variant=&quot;focus&quot; — focusMaxWidth 720px (default), 중앙 정렬</Typography>
        <PageContainer variant="focus">
          <Placeholder.Box label="focus — 프로젝트 생성 / 설정 등 좁은 폼 페이지" height={ 96 } />
        </PageContainer>
      </Box>
    </Box>
  ),
};

/**
 * ## maxWidth 옵션 (variant 미지정 시 호환 모드)
 *
 * 다양한 maxWidth 값에 따른 컨테이너 너비 비교
 */
export const MaxWidthOptions = {
  name: 'maxWidth 옵션',
  render: () => (
    <Box sx={ { py: 4, bgcolor: 'grey.100' } }>
      <SectionTitle>maxWidth 옵션 비교</SectionTitle>
      
      <Box sx={ { mb: 2 } }>
        <Typography variant="caption" sx={ { px: 2 } }>maxWidth="sm" (600px)</Typography>
        <PageContainer maxWidth="sm">
          <Placeholder.Box label="sm — 작은 폼이나 로그인 페이지에 적합" height={ 64 } />
        </PageContainer>
      </Box>

      <Box sx={ { mb: 2 } }>
        <Typography variant="caption" sx={ { px: 2 } }>maxWidth="md" (900px)</Typography>
        <PageContainer maxWidth="md">
          <Placeholder.Box label="md — 글 읽기 편한 너비, 블로그나 문서 페이지에 적합" height={ 64 } />
        </PageContainer>
      </Box>

      <Box sx={ { mb: 2 } }>
        <Typography variant="caption" sx={ { px: 2 } }>maxWidth="lg" (1200px)</Typography>
        <PageContainer maxWidth="lg">
          <Placeholder.Box label="lg — 대시보드나 테이블이 있는 페이지에 적합" height={ 64 } />
        </PageContainer>
      </Box>

      <Box>
        <Typography variant="caption" sx={ { px: 2 } }>maxWidth="xl" (1536px) - 기본값</Typography>
        <PageContainer maxWidth="xl">
          <Placeholder.Box label="xl — 넓은 콘텐츠, 갤러리나 대형 그리드에 적합" height={ 64 } />
        </PageContainer>
      </Box>
    </Box>
  ),
};

/**
 * ## Props 문서
 */
export const Props = {
  name: 'Props',
  render: () => (
    <Box sx={ { py: 4 } }>
      <SectionTitle>Props</SectionTitle>
      <PageContainer>
        <Paper sx={ { p: 3 } }>
          <Box component="table" sx={ { width: '100%', borderCollapse: 'collapse', '& td, & th': { p: 1.5, borderBottom: '1px solid', borderColor: 'divider', textAlign: 'left' } } }>
            <thead>
              <tr>
                <th><Typography variant="subtitle2">Prop</Typography></th>
                <th><Typography variant="subtitle2">타입</Typography></th>
                <th><Typography variant="subtitle2">기본값</Typography></th>
                <th><Typography variant="subtitle2">설명</Typography></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><Typography variant="body2" sx={ { fontFamily: 'monospace' } }>children</Typography></td>
                <td><Typography variant="body2" color="text.secondary">node</Typography></td>
                <td><Typography variant="body2" color="text.secondary">-</Typography></td>
                <td><Typography variant="body2">컨테이너 내부 콘텐츠</Typography></td>
              </tr>
              <tr>
                <td><Typography variant="body2" sx={ { fontFamily: 'monospace' } }>variant</Typography></td>
                <td><Typography variant="body2" color="text.secondary">'fluid' | 'focus'</Typography></td>
                <td><Typography variant="body2" color="text.secondary">-</Typography></td>
                <td><Typography variant="body2">페이지 폭 모드. fluid=뷰포트 전체+clamp padding / focus=중앙 좁은 maxWidth</Typography></td>
              </tr>
              <tr>
                <td><Typography variant="body2" sx={ { fontFamily: 'monospace' } }>focusMaxWidth</Typography></td>
                <td><Typography variant="body2" color="text.secondary">number</Typography></td>
                <td><Typography variant="body2" color="text.secondary">720</Typography></td>
                <td><Typography variant="body2">focus variant 의 max-width(px)</Typography></td>
              </tr>
              <tr>
                <td><Typography variant="body2" sx={ { fontFamily: 'monospace' } }>maxWidth</Typography></td>
                <td><Typography variant="body2" color="text.secondary">xs | sm | md | lg | xl | false</Typography></td>
                <td><Typography variant="body2" color="text.secondary">'xl'</Typography></td>
                <td><Typography variant="body2">최대 너비 설정</Typography></td>
              </tr>
              <tr>
                <td><Typography variant="body2" sx={ { fontFamily: 'monospace' } }>disableGutters</Typography></td>
                <td><Typography variant="body2" color="text.secondary">boolean</Typography></td>
                <td><Typography variant="body2" color="text.secondary">false</Typography></td>
                <td><Typography variant="body2">좌우 패딩 비활성화</Typography></td>
              </tr>
              <tr>
                <td><Typography variant="body2" sx={ { fontFamily: 'monospace' } }>sx</Typography></td>
                <td><Typography variant="body2" color="text.secondary">object</Typography></td>
                <td><Typography variant="body2" color="text.secondary">-</Typography></td>
                <td><Typography variant="body2">추가 스타일</Typography></td>
              </tr>
            </tbody>
          </Box>
        </Paper>
      </PageContainer>
    </Box>
  ),
};

