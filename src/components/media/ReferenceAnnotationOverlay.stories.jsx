import Box from '@mui/material/Box';
import { ReferenceAnnotationOverlay } from './ReferenceAnnotationOverlay.jsx';
import { references, flattenTags } from '../../data/muse';

const ref = references[0];
const tokens = {
  title: ref.title || ref.id,
  tags: flattenTags(ref.tags).slice(0, 4),
  colors: ref.dominantColors,
};

export default {
  title: 'Custom Component/1. Reference & Tagging/ReferenceAnnotationOverlay',
  component: ReferenceAnnotationOverlay,
  parameters: { layout: 'centered' },
  decorators: [
    (StoryFn) => {
      const Story = StoryFn;
      return (
        <Box sx={ { position: 'relative', width: 240, height: 240, bgcolor: 'grey.200' } }>
          <Story />
        </Box>
      );
    },
  ],
};

/** 썸네일 위에 얹히는 추출 토큰 주석 */
export const Active = {
  args: { tokens, isActive: true, size: 240 },
};

/** 아직 활성화 전 */
export const Inactive = {
  args: { tokens, isActive: false, size: 240 },
};
