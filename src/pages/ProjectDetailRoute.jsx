import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { ProjectDetailPage } from '../components/templates/ProjectDetailPage.jsx';
import { AppShell } from '../components/layout/AppShell.jsx';
import { PageContainer } from '../components/layout/PageContainer.jsx';
import { useAnalysesSlice, useProjectsSlice, useReferencesSlice } from '../store';
import { MuseNav } from './MuseNav.jsx';
import { UserMenu } from './UserMenu.jsx';

export function ProjectDetailRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects } = useProjectsSlice();
  const { getAnalysis, updateLayer } = useAnalysesSlice();
  const { references } = useReferencesSlice();

  const project = projects.find((p) => p.id === id);
  const analysis = getAnalysis(id);

  if (!project) {
    return (
      <AppShell logo={ <MuseNav /> } headerPersistent={ <UserMenu /> }>
        <PageContainer>
          <Box sx={ { py: 10, textAlign: 'center' } }>
            <Typography variant="h5" sx={ { fontWeight: 600, mb: 2 } }>프로젝트를 찾을 수 없습니다</Typography>
            <Typography variant="body2" color="text.secondary" sx={ { mb: 3 } }>
              id: { id }
            </Typography>
            <Button variant="contained" onClick={ () => navigate('/projects') }>
              프로젝트 목록으로
            </Button>
          </Box>
        </PageContainer>
      </AppShell>
    );
  }

  return (
    <ProjectDetailPage
      logo={ <MuseNav /> }
      headerEnd={ <UserMenu /> }
      project={ project }
      analysis={ analysis?.layers || { color: [], typography: [], layout: [], gradient: [], visualDirection: { markdown: '', tags: {} } } }
      references={ references }
      onUpdateToken={ (layerKey, tokenId, patch) => updateLayer(project.id, layerKey, tokenId, patch) }
      onBack={ () => navigate('/projects') }
    />
  );
}
