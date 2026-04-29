import { useEffect, useReducer, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { ReferencePicker } from './ReferencePicker.jsx';
import { AnalysisProgress } from '../overlay-feedback/AnalysisProgress.jsx';
import { ModeSelectCard } from '../card/ModeSelectCard.jsx';
import { IntentGuideField } from '../input/IntentGuideField.jsx';
import { RefImage } from '../media/RefImage.jsx';
import { runSuggestRefNote } from '../../utils/museAiTasks';
import Chip from '@mui/material/Chip';

const STEPS = ['모드', '제목+의도', '레퍼런스', '활용 노트', '분석'];

const LAYER_LABEL = {
  color: '🎨 색',
  typography: '📝 타이포',
  layout: '📐 레이아웃',
  gradient: '🌈 그라디언트',
  visualDirection: '🎭 무드',
};

const MUSE_LAYERS = [
  { key: 'color', label: '컬러' },
  { key: 'typography', label: '타이포그래피' },
  { key: 'layout', label: '레이아웃' },
  { key: 'gradient', label: '그라디언트' },
  { key: 'visualDirection', label: '비주얼 디렉션' },
];

const MODE_DEFS = [
  {
    mode: 'concept',
    title: '컨셉 디자인',
    subtitle: '레퍼런스로 디자인 컨셉을 빠르게 만들고 싶을 때',
    description: '레퍼런스 번들을 클로드 디자인에 그대로 입력하세요. 무드·컬러·타이포가 합성된 단일 프롬프트로 컨셉 시안을 빠르게 받아볼 수 있습니다.',
  },
  {
    mode: 'system',
    title: '디자인 시스템',
    subtitle: '개발 환경에서 계속 관리할 디자인 시스템 토큰 구성',
    description: '레퍼런스에서 추출한 색·타이포·레이아웃 토큰을 DTCG / MUI theme 형식으로 export 합니다. 새 프로젝트 저장소에 그대로 커밋해 시스템의 출발점으로 쓰세요.',
  },
  {
    mode: 'handoff',
    title: '디자인 토큰 추출',
    subtitle: '이미 작업 중인 디자인 시스템에 적용할 토큰 추출',
    description: '이미 운영 중인 시스템에 추가할 토큰만 골라 patch 형태로 추출합니다. 기존 naming·role 규칙과 충돌 없이 부분 반영하기 좋습니다.',
  },
];

const initialState = {
  step: 0,
  form: { name: '', intent: '', mode: 'concept', referenceNotes: {} },
  selectedIds: [],
  selectedRefs: [], // TP4: [{ id, useLayers }]
  tagFilter: [],
  analysisLayers: MUSE_LAYERS.map((l) => ({ ...l, status: 'pending' })),
  analysisState: 'idle',
};

function reducer(state, action) {
  switch (action.type) {
    case 'NEXT':
      return { ...state, step: Math.min(state.step + 1, STEPS.length - 1) };
    case 'BACK':
      return { ...state, step: Math.max(state.step - 1, 0) };
    case 'GOTO':
      return { ...state, step: action.payload };
    case 'UPDATE_FORM':
      return { ...state, form: { ...state.form, ...action.payload } };
    case 'SET_MODE':
      return { ...state, form: { ...state.form, mode: action.payload } };
    case 'SET_INTENT':
      return { ...state, form: { ...state.form, intent: action.payload } };
    case 'SET_REFERENCE_NOTE': {
      const { id, text } = action.payload;
      const next = { ...state.form.referenceNotes };
      if (text && text.trim().length > 0) next[id] = text;
      else delete next[id];
      return { ...state, form: { ...state.form, referenceNotes: next } };
    }
    case 'SET_SELECTED':
      return { ...state, selectedIds: action.payload };
    case 'SET_SELECTED_REFS':
      return { ...state, selectedRefs: action.payload };
    case 'SET_USE_LAYERS': {
      const { id, layers } = action.payload;
      const existing = state.selectedRefs.find((r) => r.id === id);
      const next = existing
        ? state.selectedRefs.map((r) => (r.id === id ? { ...r, useLayers: layers } : r))
        : [...state.selectedRefs, { id, useLayers: layers }];
      return { ...state, selectedRefs: next };
    }
    case 'SET_TAG_FILTER':
      return { ...state, tagFilter: action.payload };
    case 'ANALYSIS_START':
      return {
        ...state,
        analysisState: 'running',
        analysisLayers: MUSE_LAYERS.map((l, i) => ({
          ...l,
          status: i === 0 ? 'running' : 'pending',
        })),
      };
    case 'ANALYSIS_UPDATE':
      return { ...state, analysisLayers: action.payload };
    case 'ANALYSIS_DONE':
      return {
        ...state,
        analysisState: 'done',
        analysisLayers: state.analysisLayers.map((l) => ({ ...l, status: 'done' })),
      };
    case 'ANALYSIS_ERROR':
      return { ...state, analysisState: 'error' };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

/**
 * ProjectCreateWizard 컴포넌트 (TP2~TP5 통합)
 *
 * MUSE 프로젝트 생성 5-스텝 위자드.
 * Step 0: 모드 선택 (TP2) → Step 1: 기본 정보 + 의도 시드 (TP3)
 * → Step 2: 레퍼런스 선택 + 레이어 chip (TP4)
 * → Step 3: 분석 직전 확인 박스 (TP5)
 * → Step 4: 분석 진행
 *
 * Props:
 * @param {array} archive - 아카이브 레퍼런스 [Required]
 * @param {array} recommended - 추천 레퍼런스 (선택) [Optional]
 * @param {function} recommendedLoader - ({ intent, type, mode }) => Promise<recommended[]>
 * @param {function} onAnalyze - (payload, onProgress) => Promise<{tokens, visualDirection}>
 * @param {function} onComplete - 완료 시 콜백
 * @param {function} onCancel - 취소
 * @param {object} sx
 *
 * Example usage:
 * <ProjectCreateWizard archive={ refs } onAnalyze={ analyze } onComplete={ done } />
 */
export function ProjectCreateWizard({
  archive,
  recommended = [],
  recommendedLoader,
  onAnalyze,
  onComplete,
  onCancel,
  sx,
}) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // T2 자동 호출 (Step 2 진입 시)
  const [loadedRecommended, setLoadedRecommended] = useState(null);
  const [isLoadingRecommended, setIsLoadingRecommended] = useState(false);
  const [referenceLayerMap, setReferenceLayerMap] = useState({}); // T2 referenceLayer 결과 캐시
  const [suggestingRefIds, setSuggestingRefIds] = useState({}); // { [refId]: true } — Step 3 노트 자동 생성 중

  const handleSuggestNote = async (ref, useLayers) => {
    if (!ref?.id || suggestingRefIds[ref.id]) return;
    setSuggestingRefIds((prev) => ({ ...prev, [ref.id]: true }));
    try {
      const note = await runSuggestRefNote({
        intent: state.form.intent,
        mode: state.form.mode,
        ref,
        useLayers,
      });
      if (note) {
        dispatch({ type: 'SET_REFERENCE_NOTE', payload: { id: ref.id, text: note } });
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[suggest-ref-note] 실패', e?.message || e);
    } finally {
      setSuggestingRefIds((prev) => {
        const next = { ...prev };
        delete next[ref.id];
        return next;
      });
    }
  };

  useEffect(() => {
    if (state.step === 2 && recommendedLoader && !loadedRecommended && !isLoadingRecommended) {
      setIsLoadingRecommended(true);
      Promise.resolve(recommendedLoader({ ...state.form }))
        .then((result) => {
          // result 가 array 면 list, 객체면 { recommended, referenceLayer } 형태 가정
          if (Array.isArray(result)) {
            setLoadedRecommended(result);
          } else if (result && Array.isArray(result.recommended)) {
            setLoadedRecommended(result.recommended);
            if (Array.isArray(result.referenceLayer)) {
              const map = {};
              result.referenceLayer.forEach((rl) => { map[rl.id] = rl.layers; });
              setReferenceLayerMap(map);
            }
          } else {
            setLoadedRecommended([]);
          }
        })
        .catch(() => setLoadedRecommended([]))
        .finally(() => setIsLoadingRecommended(false));
    }
  }, [state.step, recommendedLoader, loadedRecommended, isLoadingRecommended, state.form]);

  const effectiveRecommended = loadedRecommended || recommended || [];

  const isStep0Valid = !!state.form.mode;
  const isStep1Valid = state.form.name.trim().length > 0 && state.form.intent.trim().length > 0;
  const isStep2Valid = state.selectedIds.length > 0;
  // Step 3 = ref별 활용 노트. 모두 선택 (0자 OK) — 부분 차용 의도가 없으면 비워둬도 진행.
  const isStep3Valid = true;

  const handleStartAnalysis = async () => {
    dispatch({ type: 'GOTO', payload: 4 });
    dispatch({ type: 'ANALYSIS_START' });

    // selectedRefs를 selectedIds 기준으로 정렬, useLayers 누락 항목은 자동(빈 배열)
    const enrichedSelectedRefs = state.selectedIds.map((id) => {
      const existing = state.selectedRefs.find((r) => r.id === id);
      return existing || { id, useLayers: [] };
    });

    const payload = {
      form: state.form,                  // referenceNotes 포함
      selectedIds: state.selectedIds,
      selectedRefs: enrichedSelectedRefs,
      mode: state.form.mode,
      referenceNotes: state.form.referenceNotes,
    };

    let analysisResult = null;
    try {
      if (onAnalyze) {
        analysisResult = await onAnalyze(payload, (layers) =>
          dispatch({ type: 'ANALYSIS_UPDATE', payload: layers }),
        );
      } else {
        await new Promise((resolve) => {
          let i = 0;
          const tick = () => {
            if (i >= MUSE_LAYERS.length) return resolve();
            dispatch({
              type: 'ANALYSIS_UPDATE',
              payload: MUSE_LAYERS.map((l, idx) => ({
                ...l,
                status: idx < i ? 'done' : idx === i ? 'running' : 'pending',
              })),
            });
            i += 1;
            return setTimeout(tick, 900);
          };
          tick();
        });
      }
      dispatch({ type: 'ANALYSIS_DONE' });
      onComplete?.({
        form: state.form,
        referenceIds: state.selectedIds,
        selectedRefs: enrichedSelectedRefs,
        analysis: analysisResult,
      });
    } catch {
      dispatch({ type: 'ANALYSIS_ERROR' });
    }
  };

  const renderStep = () => {
    // Step 0 — 모드 선택 (TP2)
    if (state.step === 0) {
      return (
        <Box sx={ { display: 'flex', flexDirection: 'column', gap: 5, maxWidth: 1200, mx: 'auto', width: '100%' } }>
          <Box
            sx={ {
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: { xs: 2, md: 4 },
            } }
          >
            { MODE_DEFS.map((m) => (
              <ModeSelectCard
                key={ m.mode }
                { ...m }
                isSelected={ state.form.mode === m.mode }
                onSelect={ (mode) => dispatch({ type: 'SET_MODE', payload: mode }) }
              />
            )) }
          </Box>
        </Box>
      );
    }

    // Step 1 — 기본 정보 + TP3 의도 시드
    if (state.step === 1) {
      return (
        <Box sx={ { display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 720, mx: 'auto', width: '100%' } }>
          <TextField
            value={ state.form.name }
            onChange={ (e) => dispatch({ type: 'UPDATE_FORM', payload: { name: e.target.value } }) }
            placeholder="프로젝트 이름 (예: Editorial Portfolio)"
            label="프로젝트 이름"
            fullWidth
          />
          <IntentGuideField
            value={ state.form.intent }
            onChange={ (next) => dispatch({ type: 'SET_INTENT', payload: next }) }
            label="한 줄 의도"
            placeholder="예: 차분한 다크 무드의 핀테크 대시보드, 데이터 가독성 우선"
          />
        </Box>
      );
    }

    // Step 2 — 레퍼런스 + TP4 레이어 chip
    if (state.step === 2) {
      return (
        <Box>
          { isLoadingRecommended && (
            <Box sx={ { display: 'flex', alignItems: 'center', gap: 1, mb: 2 } }>
              <CircularProgress size={ 14 } />
              <Typography variant="caption" color="text.secondary">
                의도 + 모드({ state.form.mode })에 맞는 레퍼런스를 추천하는 중…
              </Typography>
            </Box>
          ) }
          <ReferencePicker
            recommended={ effectiveRecommended }
            archive={ archive }
            selectedIds={ state.selectedIds }
            onChange={ (ids) => dispatch({ type: 'SET_SELECTED', payload: ids }) }
            tagFilter={ state.tagFilter }
            onTagFilterChange={ (tags) => dispatch({ type: 'SET_TAG_FILTER', payload: tags }) }
            referenceLayerMap={ referenceLayerMap }
            selectedRefs={ state.selectedRefs }
            onUseLayersChange={ (id, layers) =>
              dispatch({ type: 'SET_USE_LAYERS', payload: { id, layers } })
            }
            mode={ state.form.mode }
          />
        </Box>
      );
    }

    // Step 3 — 레퍼런스별 활용 노트 (각 ref 의 어느 부분을 차용할지)
    if (state.step === 3) {
      const selectedFullRefs = state.selectedIds
        .map((id) => archive.find((a) => a.id === id))
        .filter(Boolean)
        .map((a) => ({
          id: a.id,
          thumbnailUrl: a.src || a.thumbnailUrl,
          storagePath: a.storagePath,
          title: a.title,
          tags: a.tags,
          dominantColors: a.dominantColors,
          extracted: a.extracted,
        }));
      const useLayersByRef = Object.fromEntries(
        state.selectedRefs.map((sr) => [sr.id, sr.useLayers || []]),
      );
      const notes = state.form.referenceNotes || {};
      return (
        <Box sx={ { maxWidth: 880, mx: 'auto', width: '100%' } }>
          <Typography variant="h5" sx={ { fontWeight: 700, mb: 1.5 } }>
            레퍼런스별 활용 노트
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={ { mb: 5 } }>
            각 레퍼런스의 어느 부분을 차용할지 자유롭게 적어주세요. 비워둬도 진행 가능합니다.
            노트는 분석 시 우선 반영되고, 산출물의 paste block 에 ref별 매칭 단서로 들어갑니다.
          </Typography>
          <Box sx={ { display: 'flex', flexDirection: 'column', gap: 3 } }>
            { selectedFullRefs.map((ref) => {
              const layers = useLayersByRef[ref.id] || [];
              const note = notes[ref.id] || '';
              return (
                <Box
                  key={ ref.id }
                  sx={ {
                    display: 'flex',
                    gap: 2,
                    alignItems: 'flex-start',
                    p: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                  } }
                >
                  <Box
                    sx={ {
                      width: 88,
                      height: 88,
                      flexShrink: 0,
                      borderRadius: 1.5,
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'divider',
                    } }
                  >
                    { ref.thumbnailUrl && (
                      <RefImage
                        src={ ref.thumbnailUrl }
                        storagePath={ ref.storagePath }
                        alt={ ref.title || ref.id }
                      />
                    ) }
                  </Box>
                  <Box sx={ { flex: 1, minWidth: 0 } }>
                    <Box sx={ { display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 } }>
                      <Typography variant="body2" sx={ { fontWeight: 600 } }>
                        { ref.title || ref.id }
                      </Typography>
                      <Typography variant="caption" sx={ { fontFamily: 'monospace', color: 'text.secondary' } }>
                        { ref.id }
                      </Typography>
                    </Box>
                    { layers.length > 0 ? (
                      <Box sx={ { display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 } }>
                        { layers.map((l) => (
                          <Chip
                            key={ l }
                            label={ LAYER_LABEL[l] || l }
                            size="small"
                            variant="outlined"
                            sx={ { height: 20, fontSize: '0.65rem' } }
                          />
                        )) }
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary" sx={ { display: 'block', mb: 1 } }>
                        차용 layer: 자동 (전체)
                      </Typography>
                    ) }
                    <Box sx={ { position: 'relative' } }>
                      <TextField
                        fullWidth
                        size="small"
                        multiline
                        minRows={ 2 }
                        maxRows={ 3 }
                        placeholder={ '예: hero 영역 색감만 차용 / 우측 사이드바 구조 모방' }
                        value={ note }
                        onChange={ (e) =>
                          dispatch({ type: 'SET_REFERENCE_NOTE', payload: { id: ref.id, text: e.target.value } })
                        }
                        inputProps={ { maxLength: 100, style: { paddingRight: 32 } } }
                        helperText={ `${note.length} / 100` }
                      />
                      <Tooltip title={ suggestingRefIds[ref.id] ? '생성 중…' : 'AI 로 활용 노트 자동 생성' } placement="top">
                        <span style={ { position: 'absolute', top: 4, right: 4 } }>
                          <IconButton
                            size="small"
                            aria-label="AI 노트 자동 생성"
                            disabled={ !!suggestingRefIds[ref.id] }
                            onClick={ () => handleSuggestNote(ref, layers) }
                            sx={ {
                              color: 'primary.main',
                              '@keyframes refNoteAiPulse': {
                                '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                                '50%': { opacity: 0.55, transform: 'scale(0.92)' },
                              },
                              '& .MuiSvgIcon-root': {
                                animation: suggestingRefIds[ref.id]
                                  ? 'refNoteAiPulse 900ms ease-in-out infinite'
                                  : 'none',
                                filter: suggestingRefIds[ref.id]
                                  ? 'drop-shadow(0 0 6px rgba(99,102,241,0.6))'
                                  : 'none',
                              },
                              '&:hover .MuiSvgIcon-root': {
                                filter: 'drop-shadow(0 0 4px rgba(99,102,241,0.5))',
                              },
                            } }
                          >
                            { suggestingRefIds[ref.id]
                              ? <CircularProgress size={ 16 } thickness={ 5 } />
                              : <AutoAwesomeIcon fontSize="small" /> }
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
              );
            }) }
            { selectedFullRefs.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={ { textAlign: 'center', py: 4 } }>
                Step 2 에서 레퍼런스를 먼저 선택해주세요.
              </Typography>
            ) }
          </Box>
        </Box>
      );
    }

    // Step 4 — 분석
    return (
      <Box sx={ { display: 'flex', justifyContent: 'center' } }>
        <AnalysisProgress
          title={ `"${state.form.name}" 분석 중` }
          intent={ state.form.intent }
          layers={ state.analysisLayers }
          onCancel={ state.analysisState === 'running' ? onCancel : undefined }
          onRetry={ state.analysisState === 'error' ? handleStartAnalysis : undefined }
        />
      </Box>
    );
  };

  const BOTTOM_BAR_HEIGHT = 88;
  const APP_BAR_HEIGHT = 64;

  return (
    <Box sx={ { width: '100%', ...sx } }>
      <Box
        sx={ {
          width: '100%',
          height: `calc(100vh - ${APP_BAR_HEIGHT}px)`,
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          pb: `${BOTTOM_BAR_HEIGHT}px`,
        } }
      >
        <Box
          sx={ {
            flexShrink: 0,
            px: { xs: 3, md: 6, lg: 10 },
            pt: { xs: 3, md: 5 },
            pb: { xs: 2, md: 3 },
          } }
        >
          <Stepper activeStep={ state.step } sx={ { maxWidth: 960, mx: 'auto', width: '100%' } }>
            { STEPS.map((label) => (
              <Step key={ label }>
                <StepLabel>{ label }</StepLabel>
              </Step>
            )) }
          </Stepper>
        </Box>

        <Box
          sx={ {
            flex: 1,
            minHeight: 0,
            width: '100%',
            overflowY: 'auto',
            px: { xs: 3, md: 6, lg: 10 },
            py: { xs: 3, md: 5 },
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
          } }
        >
          <Box
            sx={ {
              width: '100%',
              // Step 2(레퍼런스 선택)는 상단 정렬, 나머지는 viewport 중앙 정렬
              my: state.step === 2 ? 0 : 'auto',
            } }
          >
            { renderStep() }
          </Box>
        </Box>
      </Box>

      {/* Fixed bottom navigation */}
      <Box
        sx={ {
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: (theme) => theme.zIndex.appBar,
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'blur(8px)',
          height: BOTTOM_BAR_HEIGHT,
          display: 'flex',
          alignItems: 'center',
          px: { xs: 3, md: 6, lg: 10 },
        } }
      >
        <Box
          sx={ {
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          } }
        >
          <Button
            variant="text"
            color="inherit"
            size="large"
            onClick={ state.step > 0 ? () => dispatch({ type: 'BACK' }) : onCancel }
            disabled={ state.analysisState === 'running' }
          >
            { state.step > 0 ? '이전' : '취소' }
          </Button>

          { state.step === 0 && (
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={ () => dispatch({ type: 'NEXT' }) }
              disabled={ !isStep0Valid }
            >
              다음
            </Button>
          ) }

          { state.step === 1 && (
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={ () => dispatch({ type: 'NEXT' }) }
              disabled={ !isStep1Valid }
            >
              다음
            </Button>
          ) }

          { state.step === 2 && (
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={ () => dispatch({ type: 'NEXT' }) }
              disabled={ !isStep2Valid }
            >
              다음 · { state.selectedIds.length }장
            </Button>
          ) }

          { state.step === 3 && (
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={ handleStartAnalysis }
              disabled={ !isStep3Valid }
            >
              분석 시작 →
            </Button>
          ) }

          { state.step === 4 && state.analysisState === 'done' && (
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={ () => onComplete?.({
                form: state.form,
                referenceIds: state.selectedIds,
                selectedRefs: state.selectedRefs,
                analysis: null,
              }) }
            >
              프로젝트 열기
            </Button>
          ) }
        </Box>
      </Box>
    </Box>
  );
}
