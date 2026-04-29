import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import { ProjectCreateWizard } from '../components/templates/ProjectCreateWizard.jsx';
import { useProjectsSlice, useReferencesSlice, useAnalysesSlice } from '../store';
import { runRecommend, runAnalyzeTokens, runAnalyzeConcept } from '../utils/museAiTasks';

/** Reference → ReferencePicker item 변환 */
const toPickerItem = (r) => ({
  id: r.id,
  src: r.thumbnailUrl,
  storagePath: r.storagePath,
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
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ width: '100%' }}>
        <ProjectCreateWizard
            archive={archive}
            recommendedLoader={async ({ intent, mode }) => {
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
            }}
            onAnalyze={async (payload, updateLayers) => {
              // ref별 useLayers + note 를 ref 에 머지 → buildReferenceNotesBlock 가 selectedRefs[].note 읽음
              const refNotes = payload.form.referenceNotes || {};
              const enriched = payload.selectedIds.map((id) => {
                const ref = references.find((r) => r.id === id);
                if (!ref) return null;
                const useLayers = payload.selectedRefs?.find((sr) => sr.id === id)?.useLayers || [];
                const note = refNotes[id] || '';
                return { ...ref, useLayers, note };
              }).filter(Boolean);

              // mode 별 산출물 분기
              if (payload.form.mode === 'concept') {
                return runAnalyzeConcept({
                  intent: payload.form.intent,
                  selectedRefs: enriched,
                  onProgress: updateLayers,
                }); // { conceptPrompt }
              }
              return runAnalyzeTokens({
                intent: payload.form.intent,
                mode: payload.form.mode,
                selectedRefs: enriched,
                onProgress: updateLayers,
              }); // { tokens, visualDirection }
            }}
            onComplete={async ({ form, referenceIds, selectedRefs, analysis: analysisResult }) => {
              try {
                const createdProject = await addProject({
                  name: form.name,
                  intent: form.intent,
                  mode: form.mode,
                  referenceNotes: form.referenceNotes || {},
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
                    spacing: tokens.spacing || {},
                    rounded: tokens.rounded || {},
                    elevation: Array.isArray(tokens.elevation) ? tokens.elevation : [],
                    components: tokens.components || {},
                    visualDirection: vd,
                  };
                  if (analysisResult?._refValidation) {
                    layers._refValidation = analysisResult._refValidation;
                  }
                }

                await setAnalysis({ projectId, status: 'done', layers });
                navigate(`/projects/${projectId}`);
              } catch (e) {
                // eslint-disable-next-line no-console
                console.error('[프로젝트 생성 실패]', e);
                window.alert(`프로젝트 저장 중 에러: ${e?.message || e}`);
              }
            }}
            onCancel={() => navigate('/')}
          />
      </Box>
    </Box>
  );
}
