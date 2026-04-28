import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import { ProjectCreateWizard } from '../components/templates/ProjectCreateWizard.jsx';
import { PageContainer } from '../components/layout/PageContainer.jsx';
import { useProjectsSlice, useReferencesSlice, useAnalysesSlice } from '../store';
import { runRecommend, runAnalyzeTokens, runAnalyzeConcept, runAnalyzeHandoff } from '../utils/museAiTasks';

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
            recommendedLoader={ async ({ intent, mode }) => {
              try {
                const result = await runRecommend({
                  intent,
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

              // mode 별 산출물 분기
              if (payload.form.mode === 'concept') {
                return runAnalyzeConcept({
                  intent: payload.form.intent,
                  userNotes: payload.form.userNotes,
                  selectedRefs: enriched,
                  onProgress: updateLayers,
                }); // { conceptPrompt }
              }
              if (payload.form.mode === 'handoff') {
                return runAnalyzeHandoff({
                  intent: payload.form.intent,
                  userNotes: payload.form.userNotes,
                  selectedRefs: enriched,
                  onProgress: updateLayers,
                }); // { tokens, visualDirection, layerDetails }
              }
              return runAnalyzeTokens({
                intent: payload.form.intent,
                mode: payload.form.mode,
                userNotes: payload.form.userNotes,
                selectedRefs: enriched,
                onProgress: updateLayers,
              }); // { tokens, visualDirection }
            } }
            onComplete={ async ({ form, referenceIds, selectedRefs, analysis: analysisResult }) => {
              try {
                const createdProject = await addProject({
                  name: form.name,
                  intent: form.intent,
                  mode: form.mode,
                  userNotes: form.userNotes,
                  selectedRefs: selectedRefs || [],
                  referenceIds: referenceIds || [],
                });
                const projectId = createdProject.id;

                // mode 별 layers 형태 분기
                let layers;
                if (form.mode === 'concept') {
                  layers = {
                    color: [], typography: [], layout: [], gradient: [],
                    visualDirection: { markdown: '', tags: { genre: [], style: [], subject: [] } },
                    conceptPrompt: analysisResult?.conceptPrompt || '',
                  };
                } else {
                  const tokens = analysisResult?.tokens || {};
                  const vd = analysisResult?.visualDirection || {
                    markdown: '',
                    tags: { genre: [], style: [], subject: [] },
                  };
                  layers = {
                    color: tokens.color || [],
                    typography: tokens.typography || [],
                    layout: tokens.layout || [],
                    gradient: tokens.gradient || [],
                    visualDirection: vd,
                  };
                  // handoff: 5 layer 한글 상세 추가 저장 (jsonb 자유 형식)
                  if (form.mode === 'handoff' && analysisResult?.layerDetails) {
                    layers.layerDetails = analysisResult.layerDetails;
                  }
                }

                await setAnalysis({ projectId, status: 'done', layers });
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
