import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import {
  DocumentTitle,
  PageContainer,
  SectionTitle,
  TreeNode,
} from '../../components/storybookDocumentation';

export default {
  title: 'Overview/Page Composition',
  parameters: {
    layout: 'padded',
  },
};

/**
 * 라우팅 레벨의 공통 레이아웃 — AppShell 은 여기 한 번만.
 * Protected 라우트(Archive / ProjectList / ProjectCreate / ProjectDetail / Settings) 전부가 공유.
 * 페이지 템플릿은 이 쉘을 포함하지 않는다.
 */
const routeLayout = {
  BrowserRouter: {
    'Route /auth': {
      AuthPage: {
        Tabs: {
          'SignIn Form': {
            TextField_email: '',
            TextField_password: '',
            Button_submit: 'supabase.auth.signInWithPassword',
          },
          'SignUp Form': {
            TextField_email: '',
            TextField_password: '',
            Button_submit: 'supabase.auth.signUp (이메일 인증 링크)',
          },
        },
      },
    },
    'Protected Route (AuthGuard > AppShellLayout > Outlet)': {
      AuthGuard: 'useAuth().session 확인, 비로그인 시 /auth 리다이렉트',
      AppShellLayout: {
        역할: 'AppShell 에 MuseNav / UserMenu 를 주입하고 자식 라우트의 페이지를 Outlet 으로 렌더',
        AppShell: {
          역할: 'GNB(=헤더) 를 내장한 최상위 쉘. 헤더는 페이지 전환 시에도 언마운트되지 않음',
          'logo slot ← <MuseNav />': {
            좌_로고: 'MUSE 로고 + /archive 링크',
            '좌_nav links': 'Archive / Projects / Settings (NavLink isActive 스타일)',
          },
          'headerPersistent slot ← <UserMenu />': {
            Avatar: 'user.email 이니셜',
            'Menu (dropdown)': {
              email_row: '현재 로그인 이메일',
              signOut_button: 'supabase.auth.signOut',
            },
          },
          'main (children) ← <Outlet />': '자식 라우트의 페이지가 여기 렌더됨',
        },
      },
    },
  },
  body_background: {
    ambient_3layer: 'multi-radial + linear (index.css)',
  },
};

/**
 * 각 페이지(템플릿)가 포함하는 컴포넌트 트리.
 * AppShell / GNB 는 여기에 없다 — 라우트 레이아웃이 책임짐.
 * 페이지 템플릿은 PageContainer 이하의 "본문" 만 소유한다.
 */
const pageStructure = {
  'ArchivePage (레퍼런스 아카이브)': {
    역할: '업로드 → 자동 태깅(T1) → 필터 → 무한 그리드',
    PageContainer: {
      'Hero (제목 + 새 프로젝트 버튼)': {
        Typography_Archive: 'h3 제목',
        Button_새프로젝트: 'onNewProject → navigate("/projects/new")',
      },
      'Upload 영역': {
        FileDropzone: '다중 파일 드롭 (concurrency 3)',
        Alert_오류: '업로드 실패 배너',
        Alert_태깅중: 'pendingCount 표시',
      },
      FilterPanel: {
        '색상 SuperSection': 'hex swatch 26px (HSL 유사도 OR)',
        '디자인 레이어 SuperSection': 'Typography / Layout / Gradient 칩',
        'Visual Direction SuperSection': 'Genre / Style / Subject 칩',
      },
      InfiniteMasonry: {
        ArchiveCard: {
          ImageCard: 'dominantColors 14px 스와치',
          pending_skeleton: '_pending 플래그 시',
          retry_button: '_tagError 시 🔄 (자동 삭제 금지)',
          delete_button: '✕',
        },
      },
    },
    Dialog_삭제확인: '(PageContainer 바깥, portal)',
  },

  'ProjectListPage (프로젝트 목록)': {
    역할: '생성된 프로젝트 카드 그리드',
    PageContainer: {
      'Hero (제목 + 새 프로젝트 버튼)': '',
      'Grid (MUI)': {
        MoodboardCard: {
          썸네일: 'project.referenceIds[0] 에서 파생',
          title: 'project.name',
          type_chip_오버레이: 'Brand / Editorial / Space / Web',
          '호출측 어댑터': 'MoodboardCard API 확장 대신 ProjectListPage 에서 필드 매핑',
        },
      },
    },
  },

  'ProjectCreateWizard (프로젝트 생성)': {
    역할: '3-step Wizard. useReducer 기반 상태. T2/T3 외부 주입. AppShell 바깥에서도 동작 가능',
    Stepper: {
      'Step 1 — 의도 입력': {
        TextField_name: '',
        TextField_intent: '"미니멀 럭셔리" 같은 자유 문장',
        Select_type: 'Brand / Editorial / Space / Web',
      },
      'Step 2 — 레퍼런스 선택': {
        ReferencePicker: {
          ImageCard_grid: '선택 가능한 그리드',
          recommended_highlight: 'T2 추천 ID 강조 (recommendedLoader prop)',
        },
      },
      'Step 3 — 분석 실행': {
        AnalysisProgress: 'T3 호출 진행 표시 (analyze prop, text-only compose)',
      },
    },
  },

  'ProjectDetailPage (토큰 편집)': {
    역할: 'SplitScreen 60:40. 좌 편집 / 우 실시간 프리뷰',
    PageContainer: {
      'Project header (뒤로가기 + 제목 + Export 버튼)': '',
      CategoryTab: 'color / typography / layout / gradient / visualDirection',
      SplitScreen: {
        '좌 60% — 편집 영역': {
          TokenListItem: {
            slot_preview: '레이어별 프리뷰 컴포넌트 주입',
            toggle_on_off: '',
            emphasis_0_1_2: '강조도 3단',
          },
          'preview 슬롯 (레이어별)': {
            ColorSwatchList: 'color 레이어',
            TypographyPreview: 'typography 레이어',
            LayoutTokenPreview: 'layout 레이어',
            GradientPreview: 'gradient 레이어',
            VisualDirection_Markdown: 'visualDirection 레이어 (MD 렌더)',
          },
        },
        '우 40% — 실시간 프리뷰': {
          buildThemeObject: '활성 토큰만 MUI theme 환원',
          sample_UI: '환원된 테마가 실제 컴포넌트에 적용된 샘플',
        },
      },
      ThemeExportDialog: {
        Radio_형식: 'JSON (범용) / ZIP (번들)',
        'ZIP 번들 구성': 'README.md + muse.json + visualDirection.md + references/',
        '규칙': 'MUI 식별자 제거, hex/CSS value 만 (프레임워크 비종속)',
      },
    },
  },

  'SettingsPage (설정)': {
    역할: '4 섹션 폼. Save 버튼은 onSave prop 있을 때만 렌더',
    PageContainer: {
      'Hero (제목)': '',
      'Section — AI 모델': { Select: 'claude-haiku-4-5-20251001 등' },
      'Section — 자동 태깅': { Switch: 'isAutoTagEnabled' },
      'Section — 스토리지': { RadioGroup: 'local / cloud' },
      'Section — 테마': { RadioGroup: 'light / dark' },
      Button_저장: 'onSave prop 있을 때만',
    },
  },
};

export const Default = {
  render: () => (
    <>
      <DocumentTitle
        title="Page Composition"
        status="Available"
        note="라우팅 레이아웃과 페이지 템플릿의 컴포넌트 포함 관계 트리"
        brandName="MUSE"
        systemName="Starter Kit"
        version="1.0"
      />
      <PageContainer>
        <Typography variant="h4" sx={ { fontWeight: 700, mb: 1 } }>
          Page Composition
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={ { mb: 3 } }>
          라우트 레이아웃(AppShell 포함) 과 페이지 템플릿(본문만) 의 역할 분리를 트리로 시각화합니다.
        </Typography>

        <SectionTitle title="① 라우트 레이아웃 — AppShell 은 여기 한 번만" />
        <Typography variant="caption" color="text.secondary" sx={ { display: 'block', mb: 1 } }>
          AppShell 은 GNB(헤더) 를 내장한 최상위 쉘이다. 페이지 전환 시 언마운트되지 않도록,
          <code> App.jsx </code> 의 중첩 라우트에서 <code>AppShellLayout</code> 을 공통 레이아웃 엘리먼트로 사용한다.
        </Typography>
        <Box sx={ { p: 2, mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 1 } }>
          <Box sx={ { fontFamily: 'monospace' } }>
            { Object.entries(routeLayout).map(([key, value]) => (
              <TreeNode
                key={ key }
                keyName={ key }
                value={ value }
                depth={ 0 }
                defaultOpen
              />
            )) }
          </Box>
        </Box>

        <SectionTitle title="② 페이지별 본문 구성 — 각 페이지는 PageContainer 이하만 소유" />
        <Typography variant="caption" color="text.secondary" sx={ { display: 'block', mb: 1 } }>
          페이지 템플릿은 stateless. 헤더(GNB)·공통 배경은 책임지지 않는다. 클릭해서 펼치면 포함된 컴포넌트 트리가 표시됩니다.
        </Typography>
        <Box sx={ { p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 } }>
          <Box sx={ { fontFamily: 'monospace' } }>
            { Object.entries(pageStructure).map(([key, value]) => (
              <TreeNode
                key={ key }
                keyName={ key }
                value={ value }
                depth={ 0 }
                defaultOpen
              />
            )) }
          </Box>
        </Box>

        <Divider sx={ { my: 3 } } />

        <Typography variant="body2" color="text.secondary" sx={ { mb: 1 } }>
          <strong>원칙</strong>
        </Typography>
        <Box component="ul" sx={ { pl: 3, mb: 2, '& li': { fontSize: 14, color: 'text.secondary', mb: 0.5 } } }>
          <li><strong>AppShell 은 라우트 레이아웃</strong> — 페이지 컴포넌트가 AppShell 을 포함하면 헤더가 페이지마다 언마운트/리마운트 되고, 로고·nav 정의가 페이지 수만큼 중복된다.</li>
          <li>페이지 템플릿은 <strong>stateless</strong> — props in / callbacks out. 상태는 <code>*Route.jsx</code> 컨테이너에서 주입.</li>
          <li>공통 컴포넌트(MoodboardCard 등) API 확장 대신 <strong>호출측 어댑터</strong>로 필드 매핑.</li>
          <li>AI 호출(T2/T3)은 콜백 prop 으로 경계에 둬서 Storybook mock 과 프로덕션 양립.</li>
          <li>Wizard 는 <strong>useReducer + 경계 콜백</strong> (<code>recommendedLoader</code>, <code>analyze</code>).</li>
        </Box>

        <Typography variant="body2" color="text.secondary">
          실구현: 라우트 구조는 <code>src/App.jsx</code>, 공통 레이아웃은 <code>src/pages/AppShellLayout.jsx</code>,
          페이지 본문은 <code>src/components/templates/*.jsx</code>.
        </Typography>
      </PageContainer>
    </>
  ),
};
