import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { TokenListItem } from './TokenListItem';

export default {
  title: 'Component/5. Data Display/TokenListItem',
  component: TokenListItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
## TokenListItem

MUSE 프로젝트 상세의 레이어별 토큰 편집 UI에서 **공통으로 쓰이는 행 컴포넌트**.

- 좌측 48x48 **Preview 슬롯**에 컬러 스와치, 타이포 샘플, 그라디언트 등 임의 노드 주입
- \`isEnabled=false\`면 preview/label/value가 40% 투명도로 dimmed, 조작은 그대로 가능
- **emphasis 토글은 항상 활성** — 비활성 토큰도 강조값은 편집 가능 (나중에 다시 켰을 때 보존)
- Switch는 MUI default pill 스타일

### 구성
\`\`\`
[preview 48x48] [label + value] [Low | Mid | High] [on/off]
\`\`\`

### 용도 (MUSE Phase 3 레이어별 프리뷰)
- ColorSwatchList — preview: 컬러 스와치
- TypographyPreview — preview: 샘플 문자
- LayoutTokenPreview — preview: 그리드/스페이싱 다이어그램
- GradientPreview — preview: 그라디언트 박스
        `,
      },
    },
  },
  argTypes: {
    preview: { control: false, description: '좌측 48x48 프리뷰 슬롯 (ReactNode)' },
    label: { control: 'text', description: '토큰 이름/역할' },
    value: { control: 'text', description: '토큰 값 (HEX/px/폰트명 등)' },
    isEnabled: { control: 'boolean', description: '토큰 활성화 상태' },
    emphasis: {
      control: { type: 'select' },
      options: [0, 1, 2],
      description: '강조도 (Low/Mid/High)',
    },
    onToggleEnabled: { action: 'toggleEnabled' },
    onChangeEmphasis: { action: 'changeEmphasis' },
  },
};

/** 컬러 스와치 preview */
const ColorSwatch = ({ color }) => (
  <Box
    sx={ {
      width: 48,
      height: 48,
      borderRadius: 1.5,
      backgroundColor: color,
      border: '1px solid',
      borderColor: 'divider',
    } }
  />
);

/** 타이포 샘플 preview */
const TypoSample = ({ family, weight }) => (
  <Typography
    sx={ {
      fontFamily: family,
      fontWeight: weight,
      fontSize: 28,
      lineHeight: 1,
    } }
  >
    Aa
  </Typography>
);

/** 그라디언트 preview */
const GradientSwatch = ({ gradient }) => (
  <Box
    sx={ {
      width: 48,
      height: 48,
      borderRadius: 1.5,
      background: gradient,
    } }
  />
);

/** 기본 — 컬러 토큰 예시 */
export const Default = {
  render: (args) => {
    const [isEnabled, setEnabled] = useState(args.isEnabled ?? true);
    const [emphasis, setEmphasis] = useState(args.emphasis ?? 1);
    return (
      <Box sx={ { maxWidth: 640 } }>
        <TokenListItem
          preview={ <ColorSwatch color="#14132B" /> }
          label="Primary Ink"
          value="#14132B"
          { ...args }
          isEnabled={ isEnabled }
          emphasis={ emphasis }
          onToggleEnabled={ (v) => { setEnabled(v); args.onToggleEnabled?.(v); } }
          onChangeEmphasis={ (v) => { setEmphasis(v); args.onChangeEmphasis?.(v); } }
        />
      </Box>
    );
  },
  args: {
    label: 'Primary Ink',
    value: '#14132B',
    isEnabled: true,
    emphasis: 1,
  },
};

/** 비활성 상태 */
export const Disabled = {
  render: () => (
    <Box sx={ { maxWidth: 640 } }>
      <TokenListItem
        preview={ <ColorSwatch color="#7A798E" /> }
        label="Muted Grey"
        value="#7A798E"
        isEnabled={ false }
        emphasis={ 0 }
      />
    </Box>
  ),
};

/** 컬러 레이어 목록 — 실제 사용 패턴 프리뷰 */
export const ColorLayer = {
  render: () => {
    const [tokens, setTokens] = useState([
      { id: 'ink', label: 'Primary Ink', value: '#14132B', color: '#14132B', isEnabled: true, emphasis: 2 },
      { id: 'accent', label: 'Accent Violet', value: '#4F46E5', color: '#4F46E5', isEnabled: true, emphasis: 1 },
      { id: 'bg', label: 'Background Tint', value: '#FCFCFF', color: '#FCFCFF', isEnabled: true, emphasis: 0 },
      { id: 'muted', label: 'Muted Grey', value: '#7A798E', color: '#7A798E', isEnabled: false, emphasis: 0 },
    ]);

    const update = (id, patch) =>
      setTokens((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));

    return (
      <Box sx={ { maxWidth: 640, bgcolor: 'background.paper', borderRadius: 3, py: 1 } }>
        { tokens.map((t, i) => (
          <Box key={ t.id }>
            <TokenListItem
              preview={ <ColorSwatch color={ t.color } /> }
              label={ t.label }
              value={ t.value }
              isEnabled={ t.isEnabled }
              emphasis={ t.emphasis }
              onToggleEnabled={ (next) => update(t.id, { isEnabled: next }) }
              onChangeEmphasis={ (next) => update(t.id, { emphasis: next }) }
            />
            { i < tokens.length - 1 && <Divider sx={ { mx: 2 } } /> }
          </Box>
        )) }
      </Box>
    );
  },
};

/** 타이포 레이어 목록 */
export const TypographyLayer = {
  render: () => {
    const [tokens, setTokens] = useState([
      { id: 'h1', label: 'Display Heading', value: 'Outfit 700 · clamp(48, 6vw, 96)', family: 'Outfit', weight: 700, isEnabled: true, emphasis: 2 },
      { id: 'h2', label: 'Section Heading', value: 'Outfit 600 · clamp(32, 4vw, 56)', family: 'Outfit', weight: 600, isEnabled: true, emphasis: 1 },
      { id: 'body', label: 'Body', value: 'Pretendard 400 · 16/1.7', family: 'Pretendard Variable', weight: 400, isEnabled: true, emphasis: 1 },
    ]);

    const update = (id, patch) =>
      setTokens((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));

    return (
      <Box sx={ { maxWidth: 720, bgcolor: 'background.paper', borderRadius: 3, py: 1 } }>
        { tokens.map((t, i) => (
          <Box key={ t.id }>
            <TokenListItem
              preview={ <TypoSample family={ t.family } weight={ t.weight } /> }
              label={ t.label }
              value={ t.value }
              isEnabled={ t.isEnabled }
              emphasis={ t.emphasis }
              onToggleEnabled={ (next) => update(t.id, { isEnabled: next }) }
              onChangeEmphasis={ (next) => update(t.id, { emphasis: next }) }
            />
            { i < tokens.length - 1 && <Divider sx={ { mx: 2 } } /> }
          </Box>
        )) }
      </Box>
    );
  },
};

/** 그라디언트 레이어 목록 */
export const GradientLayer = {
  render: () => {
    const [tokens, setTokens] = useState([
      { id: 'g1', label: 'Sunrise', value: 'linear-gradient(135deg, #FEE2F5, #FEF9C3)', gradient: 'linear-gradient(135deg, #FEE2F5, #FEF9C3)', isEnabled: true, emphasis: 1 },
      { id: 'g2', label: 'Indigo Dusk', value: 'linear-gradient(180deg, #1E1B4B, #4F46E5)', gradient: 'linear-gradient(180deg, #1E1B4B, #4F46E5)', isEnabled: true, emphasis: 2 },
      { id: 'g3', label: 'Muted Sand', value: 'linear-gradient(90deg, #E8E7F0, #D6D5E0)', gradient: 'linear-gradient(90deg, #E8E7F0, #D6D5E0)', isEnabled: false, emphasis: 0 },
    ]);

    const update = (id, patch) =>
      setTokens((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));

    return (
      <Box sx={ { maxWidth: 720, bgcolor: 'background.paper', borderRadius: 3, py: 1 } }>
        { tokens.map((t, i) => (
          <Box key={ t.id }>
            <TokenListItem
              preview={ <GradientSwatch gradient={ t.gradient } /> }
              label={ t.label }
              value={ t.value }
              isEnabled={ t.isEnabled }
              emphasis={ t.emphasis }
              onToggleEnabled={ (next) => update(t.id, { isEnabled: next }) }
              onChangeEmphasis={ (next) => update(t.id, { emphasis: next }) }
            />
            { i < tokens.length - 1 && <Divider sx={ { mx: 2 } } /> }
          </Box>
        )) }
      </Box>
    );
  },
};
