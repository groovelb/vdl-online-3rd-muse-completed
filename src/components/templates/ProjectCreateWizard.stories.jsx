import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ProjectCreateWizard } from './ProjectCreateWizard';
import { references as allReferences } from '../../data/muse';

export default {
  title: 'Template/ProjectCreateWizard',
  component: ProjectCreateWizard,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

const toItem = (r) => ({
  id: r.id,
  src: r.thumbnailUrl,
  title: r.title,
  tags: r.tags,
});

const RECOMMENDED = allReferences.slice(0, 6).map(toItem);
const ARCHIVE = allReferences.map(toItem);

export const Default = {
  render: () => {
    const [result, setResult] = useState(null);
    return (
      <Box sx={ { p: 4, maxWidth: 1120, mx: 'auto', minHeight: '100vh' } }>
        <ProjectCreateWizard
          recommended={ RECOMMENDED }
          archive={ ARCHIVE }
          onComplete={ (payload) => setResult(payload) }
          onCancel={ () => setResult({ cancelled: true }) }
        />
        { result && (
          <Box
            sx={ {
              mt: 4,
              p: 2,
              bgcolor: 'background.paper',
              borderRadius: 2,
              fontFamily: 'monospace',
              fontSize: 12,
            } }
          >
            <Typography variant="caption" color="text.secondary">
              onComplete / onCancel payload
            </Typography>
            <pre style={ { margin: 0, whiteSpace: 'pre-wrap' } }>
              { JSON.stringify(result, null, 2) }
            </pre>
          </Box>
        ) }
      </Box>
    );
  },
};

export const ArchiveOnly = {
  render: () => (
    <Box sx={ { p: 4, maxWidth: 1120, mx: 'auto', minHeight: '100vh' } }>
      <ProjectCreateWizard archive={ ARCHIVE } />
    </Box>
  ),
};
