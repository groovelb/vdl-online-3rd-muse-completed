import { useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { ImageCard } from './ImageCard';
import Placeholder, { placeholderSvg } from '../../common/ui/Placeholder';

export default {
  title: 'Component/3. Card/ImageCard',
  component: ImageCard,
  tags: ['autodocs'],
  argTypes: {
    src: { control: 'text', description: '이미지 URL' },
    title: { control: 'text', description: '제목' },
    tags: { control: 'object', description: '태그 배열' },
    hideActions: { control: 'boolean', description: '기본 액션 버튼 숨김' },
    isSelectable: { control: 'boolean', description: '선택 체크박스 표시' },
    isSelected: { control: 'boolean', description: '선택 상태' },
    onLike: { action: 'liked' },
    onToggleSelect: { action: 'toggled' },
    onClick: { action: 'clicked' },
  },
};

/** 기본 — 제목 + 태그 + 기본 액션 */
export const Default = {
  args: {
    src: placeholderSvg(600, 400),
    title: 'Neon City Vibes',
    tags: ['Neon', 'City', 'Night'],
  },
};

/** 태그만 — 제목 없이 태그 배지만 노출 */
export const TagsOnly = {
  args: {
    src: placeholderSvg(600, 400),
    tags: ['Minimal', 'Blue', 'Editorial'],
  },
};

/** 선택 가능 — 아카이브/레퍼런스 선택 UI용 */
export const Selectable = {
  render: () => {
    const [selected, setSelected] = useState(false);
    return (
      <Box sx={ { maxWidth: 320 } }>
        <ImageCard
          src={ placeholderSvg(600, 400) }
          title="Editorial Layout"
          tags={ ['Editorial', 'Swiss'] }
          isSelectable
          isSelected={ selected }
          onToggleSelect={ setSelected }
        />
      </Box>
    );
  },
};

/** 다중 선택 예시 — ReferencePicker 패턴 프리뷰 */
export const MultiSelectGrid = {
  render: () => {
    const [picked, setPicked] = useState(new Set());
    const items = Array.from({ length: 6 }, (_, i) => ({
      id: `ref-${i}`,
      title: [`Abstract`, `Portrait`, `Spatial`, `Gradient`, `Illustration`, `Poster`][i % 6],
      tags: [['Muted'], ['Warm'], ['Deep'], ['Soft'], ['Bold'], ['Editorial']][i % 6],
    }));

    const toggle = (id, next) => {
      setPicked((prev) => {
        const s = new Set(prev);
        if (next) s.add(id);
        else s.delete(id);
        return s;
      });
    };

    return (
      <Box sx={ { maxWidth: 960 } }>
        <Grid container spacing={ 2 }>
          { items.map((it, i) => (
            <Grid key={ it.id } size={ { xs: 12, sm: 6, md: 4 } }>
              <ImageCard
                src={ placeholderSvg(600, 400) }
                title={ it.title }
                tags={ it.tags }
                isSelectable
                isSelected={ picked.has(it.id) }
                onToggleSelect={ (next) => toggle(it.id, next) }
              />
            </Grid>
          )) }
        </Grid>
      </Box>
    );
  },
};

/** 실사 이미지 예시 — Placeholder.Media 사용 */
export const WithMediaPlaceholder = {
  render: () => (
    <Box sx={ { maxWidth: 960 } }>
      <Grid container spacing={ 2 }>
        { [0, 1, 2].map((i) => (
          <Grid key={ i } size={ { xs: 12, sm: 6, md: 4 } }>
            <ImageCard
              src={ Placeholder.svg(600, 400) }
              title={ `Sample ${i + 1}` }
              tags={ ['Demo'] }
            />
          </Grid>
        )) }
      </Grid>
    </Box>
  ),
};
