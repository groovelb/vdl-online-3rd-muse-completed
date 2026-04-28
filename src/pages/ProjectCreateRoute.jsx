import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import { ProjectCreateWizard } from '../components/templates/ProjectCreateWizard.jsx';
import { PageContainer } from '../components/layout/PageContainer.jsx';
import { useProjectsSlice, useReferencesSlice, useAnalysesSlice } from '../store';
import { runRecommend, runAnalyzeTokens } from '../utils/museAiTasks';

/** Reference → ReferencePicker item 변환 */
const toPickerItem = (r) => ({
  id: r.id,
  src: r.thumbnailUrl,
  title: r.title,
  tags: r.tags,
  dominantColors: r.dominantColors,
});

// project/analysis id 는 store 가 crypto.randomUUID() 로 생성 (DB 컬럼이 uuid 타입)

export function ProjectCreateRoute() {
  const navigate = useNavigate();
  const { references } = useReferencesSlice();
  const { addProject } = useProjectsSlice();
  const { setAnalysis } = useAnalysesSlice();

  const archive = useMemo(() => references.map(toPickerItem), [references]);

  return (
    <PageContainer>
      <Box
        sx={ {
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          py: { xs: 6, md: 10 },
        } }
      >
        <Box sx={ { width: '100%', maxWidth: 860, mx: 'auto' } }>
          <ProjectCreateWizard
            archive={ archive }
            recommendedLoader={ async ({ intent, type, mode }) => {
              try {
                const result = await runRecommend({
                  intent,
                  type,
                  mode,
                  archive: references,
                  n: 6,
                });
                const ids = new Set(result.recommendedIds || []);
                const recItems = references.filter((r) => ids.has(r.id)).map(toPickerItem);
                return { recommended: recItems, referenceLayer: result.referenceLayer || [] };
              } catch (e) {
                console.warn('[T2 실패]', e);
                return [];
              }
            } }
            onAnalyze={ async (payload, updateLayers) => {
              // TP4: payload.selectedRefs 의 useLayers 를 ref 에 머지
              const enriched = payload.selectedIds.map((id) => {
                const ref = references.find((r) => r.id === id);
                if (!ref) return null;
                const useLayers = payload.selectedRefs?.find((sr) => sr.id === id)?.useLayers || [];
                return { ...ref, useLayers };
              }).filter(Boolean);
              const result = await runAnalyzeTokens({
                intent: payload.form.intent,
                type: payload.form.type,
                mode: payload.form.mode,
                selectedRefs: enriched,
                onProgress: updateLayers,
              });
              return result;
            } }
            onComplete={ async ({ form, referenceIds, selectedRefs, analysis: analysisResult }) => {
              // id 는 store 가 UUID 로 생성. 여기서 만들면 Postgres uuid 컬럼 insert 실패
              try {
                const createdProject = await addProject({
                  name: form.name,
                  intent: form.intent,
                  type: form.type,
                  mode: form.mode,
                  selectedRefs: selectedRefs || [],
                  referenceIds: referenceIds || [],
                });
                const projectId = createdProject.id;

                const tokens = analysisResult?.tokens || {};
                const vd = analysisResult?.visualDirection || {
                  markdown: '',
                  tags: { genre: [], style: [], subject: [] },
                };
                await setAnalysis({
                  projectId,
                  status: 'done',
                  layers: {
                    color: tokens.color || [],
                    typography: tokens.typography || [],
                    layout: tokens.layout || [],
                    gradient: tokens.gradient || [],
                    visualDirection: vd,
                  },
                });

                navigate(`/projects/${projectId}`);
              } catch (e) {
                // eslint-disable-next-line no-console
                console.error('[프로젝트 생성 실패]', e);
                window.alert(`프로젝트 저장 중 에러: ${e?.message || e}`);
              }
            } }
            onCancel={ () => navigate('/') }
          />
        </Box>
      </Box>
    </PageContainer>
  );
}
