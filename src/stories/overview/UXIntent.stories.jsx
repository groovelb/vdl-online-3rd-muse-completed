import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import { PageContainer } from '../../components/layout/PageContainer.jsx';
import {
  DocumentTitle,
  SectionTitle,
} from '../../components/storybookDocumentation';

export default {
  title: 'Overview / UX Intent Map',
  parameters: { layout: 'padded' },
};

const SUPER_THEMES = [
  {
    key: 'T1',
    title: '왜 그랬는지 모름',
    quote: '"DESIGN.md는 \'버튼은 테라코타 색\'이라고 기록하지만, 왜 테라코타를 골랐는지는 담지 않는다. 결과는 있지만 이유가 빠져 있는 구조."',
    source: '김은수, IBM Research UX 엔지니어 (ZDNet Korea, 2026-04-26)',
  },
  {
    key: 'T2',
    title: '단일 입력의 단조로움',
    quote: '"Everything looks… the same."',
    source: 'Bitovi (Levi Myers, Google Stitch Review)',
  },
  {
    key: 'T3',
    title: '통제권 상실',
    quote: '"Two prompts for a 12-slide presentation and you are out."',
    source: 'Pasquale Pillitteri / PCWorld (via 다수 KR 매체)',
  },
  {
    key: 'T4',
    title: 'AI는 craft를 대체 못함',
    quote: '"디자이너의 미래는 AI가 더 뛰어난 결과물을 만들 수 있도록 원칙과 시스템을 설계하는 것"',
    source: '토스 디자인팀',
  },
];

const TOUCH_POINTS = [
  {
    id: 'TP1 (폐기)', title: '~~레퍼런스 업로드 chip~~', where: '~~ArchivePage~~',
    before: '드롭 → 자동 태깅',
    after: '폐기 (2026-04-28) — T1은 이미지가 정보 원천. 사용자 chip이 태깅 정확도를 향상시키지 않음. TP4와 다운스트림 중복.',
    pain: '—',
    promptVar: '—',
  },
  {
    id: 'TP2', title: '프로젝트 모드 선택', where: 'Wizard Step 0',
    before: '바로 form',
    after: '🎨 컨셉 / 🏗️ 시스템 / 🎯 코드직행 카드 3개 — 모든 후속 분기 기준',
    pain: 'T2, T3',
    promptVar: 'projectMode',
  },
  {
    id: 'TP3', title: '제목 + 한 줄 의도', where: 'Wizard Step 1',
    before: '빈 textarea',
    after: 'IntentGuideField (placeholder + helperText 가이드만, maxLength 120)',
    pain: 'T2 키워드 매칭',
    promptVar: 'intent (T2/T3 입력)',
  },
  {
    id: 'TP4', title: '카드 layer chip', where: 'ReferencePicker Step 2',
    before: '추천 카드 add/remove',
    after: '카드별 🎨색 📝타이포 📐레이아웃 chip — T2 자동 / 사용자 수동',
    pain: 'T3 합성',
    promptVar: 'selectedRefs[].useLayers',
  },
  {
    id: 'Step 3 (NEW)', title: '활용 노트 (필수)', where: 'Wizard Step 3 — RefinementNotesField',
    before: '(없음 — TP5 확인 박스만 있었음)',
    after: '레퍼런스 본 후 활용 지점 명시. 모드별 minLength 차등 (concept=0 / system=30 / handoff=50). T3 합성 HIGHEST PRIORITY 입력',
    pain: 'T3 정확도, craft 보존',
    promptVar: 'userNotes (L4 우선)',
  },
  {
    id: 'TP5 (폐기)', title: '~~분석 직전 확인 박스~~', where: '~~Wizard Step 3 AnalysisConfirmBox~~',
    before: '별도 step',
    after: 'Step 3 하단 [분석 시작 →] 버튼이 곧 confirm 으로 흡수. 별도 step 불필요.',
    pain: '—',
    promptVar: '—',
  },
  {
    id: 'TP6', title: '토큰 카드 출처 펼침', where: 'ProjectDetailPage 4개 토큰 preview',
    before: '값만 표시',
    after: '❓ 클릭 → 출처 + 의도 매칭 + ✋ 사용자 노트 인용 + 탈락 후보. 4 layer (color/typo/layout/gradient) 모두 적용',
    pain: 'T1 결정 추적',
    promptVar: 'decisionRationale + appliedUserNotes',
  },
];

const PERSONAS = [
  { p: 'P1', label: '비디자이너 PM/창업자', need: '디자이너 없이 프로토타입', entry: 'TP2 🎨 컨셉 잡기' },
  { p: 'P2', label: '시니어 디자이너', need: 'craft 보존하며 가속', entry: 'TP4 layer chip으로 큐레이션' },
  { p: 'P3', label: '디자인 시스템 엔지니어', need: '토큰 코드로 30% 손실 회피', entry: 'TP2 🎯 코드직행 + DTCG export' },
  { p: 'P4', label: 'AI 코딩 헤비유저', need: 'DESIGN.md를 AI가 무시함', entry: 'TP6 결정 추적 + cursorrules' },
];

const METRICS = [
  { metric: '의도 입력 평균 길이', before: '<20자', after: '>40자' },
  { metric: 'Step 2 layer 수동 변경률', before: '0%', after: '>30%' },
  { metric: '토큰 카드 hover/click률', before: '미측정', after: '>60%' },
  { metric: 'T3 결과 export 비율', before: '미측정', after: '↑ 10pp' },
  { metric: '30일 재방문률', before: '미측정', after: '↑' },
];

export const UXIntentMap = {
  name: 'UX Intent Map',
  render: () => (
    <>
      <DocumentTitle
        title="UX Intent Map — 사용자 의도가 UX 자체에 박힌다"
        status="Draft"
        note="TP1~TP6 + 시스템 프롬프트 변수 통합 narrative"
        brandName="MUSE"
        systemName="UX Intervention"
        version="0.1"
      />
      <PageContainer>
        <Typography variant="body1" color="text.secondary" sx={ { mb: 3 } }>
          큰 화면 신규 X. 기존 6개 입력 지점에 "왜?" 질문을 끼워 넣어 사용자 의도를 UX 자체에 박는다.
          답변은 T1/T2/T3 system prompt 변수로 흘러가 결과 디테일을 끌어올린다.
        </Typography>

        <SectionTitle title="검증된 4 super-theme" description="docs/research/02-painpoints-qualitative-analysis.md" />
        <Box sx={ { display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 4 } }>
          { SUPER_THEMES.map((t) => (
            <Box
              key={ t.key }
              sx={ {
                p: 3,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              } }
            >
              <Box sx={ { display: 'flex', alignItems: 'baseline', gap: 1 } }>
                <Chip label={ t.key } size="small" color="primary" />
                <Typography variant="h6" sx={ { fontWeight: 600 } }>{ t.title }</Typography>
              </Box>
              <Typography variant="body2" sx={ { fontStyle: 'italic', color: 'text.primary' } }>
                { t.quote }
              </Typography>
              <Typography variant="caption" sx={ { color: 'text.secondary' } }>
                — { t.source }
              </Typography>
            </Box>
          )) }
        </Box>

        <Divider sx={ { my: 4 } } />

        <SectionTitle title="6개 터치포인트 (TP1~TP6)" description="UX 흐름 안에 사용자 의도를 끼워 넣는 자리" />
        <Box sx={ { display: 'flex', flexDirection: 'column', gap: 2, mb: 4 } }>
          { TOUCH_POINTS.map((tp) => (
            <Box
              key={ tp.id }
              sx={ {
                p: 2.5,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '90px 1fr 1fr 200px' },
                gap: 2,
                alignItems: 'flex-start',
              } }
            >
              <Box>
                <Chip label={ tp.id } size="small" color="primary" variant="filled" sx={ { fontFamily: 'monospace' } } />
                <Typography variant="caption" sx={ { display: 'block', mt: 0.5, color: 'text.secondary' } }>
                  { tp.where }
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={ { fontWeight: 600, mb: 0.5 } }>{ tp.title }</Typography>
                <Box sx={ { display: 'flex', flexDirection: 'column', gap: 0.5 } }>
                  <Typography variant="caption" sx={ { color: 'text.secondary' } }>
                    <strong>Before</strong>: { tp.before }
                  </Typography>
                  <Typography variant="caption" sx={ { color: 'text.primary' } }>
                    <strong>After</strong>: { tp.after }
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" sx={ { color: 'text.secondary' } }>직격 페인</Typography>
                <Typography variant="body2">{ tp.pain }</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={ { color: 'text.secondary' } }>system prompt 변수</Typography>
                <Typography variant="caption" sx={ { fontFamily: 'monospace', display: 'block', fontSize: 11 } }>
                  { tp.promptVar }
                </Typography>
              </Box>
            </Box>
          )) }
        </Box>

        <Divider sx={ { my: 4 } } />

        <SectionTitle title="페르소나 진입 경로" description="P1~P4 각자 다른 TP에서 진가를 느낀다" />
        <Box sx={ { display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 4 } }>
          { PERSONAS.map((p) => (
            <Box
              key={ p.p }
              sx={ {
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                bgcolor: 'background.paper',
              } }
            >
              <Chip label={ p.p } size="small" sx={ { mb: 1, fontFamily: 'monospace' } } />
              <Typography variant="body2" sx={ { fontWeight: 600 } }>{ p.label }</Typography>
              <Typography variant="caption" sx={ { display: 'block', mt: 0.5, color: 'text.secondary' } }>
                니즈: { p.need }
              </Typography>
              <Typography variant="caption" sx={ { display: 'block', mt: 1, color: 'primary.main', fontWeight: 600 } }>
                ↳ { p.entry }
              </Typography>
            </Box>
          )) }
        </Box>

        <Divider sx={ { my: 4 } } />

        <SectionTitle title="검증 가능 지표" description="3주 후 측정" />
        <Box sx={ { mb: 4 } }>
          { METRICS.map((m, i) => (
            <Box
              key={ i }
              sx={ {
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr',
                gap: 2,
                py: 1,
                borderBottom: i === METRICS.length - 1 ? 'none' : '1px solid',
                borderColor: 'divider',
              } }
            >
              <Typography variant="body2">{ m.metric }</Typography>
              <Typography variant="caption" sx={ { color: 'text.secondary' } }>
                Before: { m.before }
              </Typography>
              <Typography variant="caption" sx={ { color: 'primary.main', fontWeight: 600 } }>
                After: { m.after }
              </Typography>
            </Box>
          )) }
        </Box>

        <Box
          sx={ {
            p: 3,
            bgcolor: 'primary.50',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'primary.main',
          } }
        >
          <Typography variant="h6" sx={ { fontWeight: 700, mb: 1 } }>
            한 줄 메시지
          </Typography>
          <Typography variant="body1">
            <strong>"AI가 만든 디자인, 왜 그렇게 만들었는지 알려줘요."</strong>
          </Typography>
          <Typography variant="caption" sx={ { color: 'text.secondary', display: 'block', mt: 1 } }>
            — 사진 5장 던지면, 디자인 시스템이 나옵니다. 근거까지.
          </Typography>
        </Box>
      </PageContainer>
    </>
  ),
};
