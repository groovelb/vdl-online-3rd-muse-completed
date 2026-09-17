import Typography from '@mui/material/Typography';
import { SectionShell } from './SectionShell.jsx';

export default {
  title: 'Section/SectionShell',
  component: SectionShell,
  parameters: { layout: 'fullscreen' },
};

/** 랜딩 섹션 공통 셸. 눈썹, 제목, 설명 한 벌을 같은 리듬으로 놓는다 */
export const Default = {
  args: {
    eyebrow: '01 · INPUT LAYER',
    title: '정확한 분류 체계로 레퍼런스를 관리하세요',
    lede: '업로드 한 장이 들어오면 같은 격자로 자동 분류됩니다.',
    children: <Typography variant="body2">섹션 본문이 여기에 들어간다.</Typography>,
  },
};
