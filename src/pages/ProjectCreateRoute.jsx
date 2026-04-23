import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import { ProjectCreateWizard } from '../components/templates/ProjectCreateWizard.jsx';
import { AppShell } from '../components/layout/AppShell.jsx';
import { PageContainer } from '../components/layout/PageContainer.jsx';
import { useProjectsSlice, useReferencesSlice, useAnalysesSlice } from '../store';
import { runRecommend, runAnalyzeTokens } from '../utils/museAiTasks';
import { MuseNav } from './MuseNav.jsx';

/** Reference → ReferencePicker item 변환 */
const toPickerItem = (r) => ({
  id: r.id,
  src: r.thumbnailUrl,
  title: r.title,
  tags: r.tags,
});

const makeProjectId = () => `proj-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;

export function ProjectCreateRoute() {
  const navigate = useNavigate();
  const { references } = useReferencesSlice();
  const { addProject } = useProjectsSlice();
  const { setAnalysis } = useAnalysesSlice();

  const archive = useMemo(() => references.map(toPickerItem), [references]);

  return (
    <AppShell logo={ <MuseNav /> }>
      <PageContainer>
        <Box sx={ { py: { xs: 4, md: 6 } } }>
          <ProjectCreateWizard
            archive={ archive }
            recommendedLoader={ async ({ intent, type }) => {
              try {
                const result = await runRecommend({
                  intent,
                  type,
                  archive: references,
                  n: 6,
                });
                const ids = new Set(result.recommendedIds || []);
                return references.filter((r) => ids.has(r.id)).map(toPickerItem);
              } catch (e) {
                console.warn('[T2 실패]', e);
                return [];
              }
            } }
            onAnalyze={ async (payload, updateLayers) => {
              const selected = references.filter((r) => payload.selectedIds.includes(r.id));
              const result = await runAnalyzeTokens({
                intent: payload.form.intent,
                type: payload.form.type,
                selectedRefs: selected,
                onProgress: updateLayers,
              });
              return result;
            } }
            onComplete={ ({ form, referenceIds, analysis: analysisResult }) => {
              const id = makeProjectId();
              const createdAt = new Date().toISOString().slice(0, 10);
              const project = {
                id,
                name: form.name,
                intent: form.intent,
                type: form.type,
                referenceIds: referenceIds || [],
                createdAt,
              };
              addProject(project);

              // analysisResult: { tokens, visualDirection } — runAnalyzeTokens 반환값
              const tokens = analysisResult?.tokens || {};
              const vd = analysisResult?.visualDirection || {
                markdown: '',
                tags: { genre: [], style: [], subject: [] },
              };
              setAnalysis({
                id: `analysis-${id}`,
                projectId: id,
                status: 'done',
                updatedAt: createdAt,
                layers: {
                  color: tokens.color || [],
                  typography: tokens.typography || [],
                  layout: tokens.layout || [],
                  gradient: tokens.gradient || [],
                  visualDirection: vd,
                },
              });

              navigate(`/projects/${id}`);
            } }
            onCancel={ () => navigate('/') }
          />
        </Box>
      </PageContainer>
    </AppShell>
  );
}
