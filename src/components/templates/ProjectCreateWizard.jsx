import { useEffect, useReducer, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import { ReferencePicker } from './ReferencePicker.jsx';
import { AnalysisProgress } from '../overlay-feedback/AnalysisProgress.jsx';
import { ModeSelectCard } from '../card/ModeSelectCard.jsx';
import { IntentSeedField } from '../input/IntentSeedField.jsx';
import { AnalysisConfirmBox } from '../overlay-feedback/AnalysisConfirmBox.jsx';

const STEPS = ['모드', '기본 정보', '레퍼런스', '확인', '분석'];

const PROJECT_TYPES = [
  { value: 'landing', label: '랜딩 페이지' },
  { value: 'dashboard', label: '대시보드' },
  { value: 'mobile', label: '모바일' },
  { value: 'brand', label: '브랜드' },
];

const MUSE_LAYERS = [
  { key: 'color', label: '컬러' },
  { key: 'typography', label: '타이포그래피' },
  { key: 'layout', label: '레이아웃' },
  { key: 'gradient', label: '그라디언트' },
  { key: 'visualDirection', label: '비주얼 디렉션' },
];

const MODE_DEFS = [
  { mode: 'concept', title: '🎨 컨셉 잡기', subtitle: '감을 잡고 싶다', description: '빠른 다양성 우선 — T2 다양한 무드, T3 distinctive bias' },
  { mode: 'system', title: '🏗️ 디자인 시스템 만들기', subtitle: '정확한 토큰 필요', description: '일관성·근거 우선 — role 엄격, contrast 검증' },
  { mode: 'handoff', title: '🎯 코드 직행', subtitle: 'MUI/Tailwind로 바로', description: '완전성·표준 우선 — naming MUI/DTCG 호환' },
];

const COST_BY_MODE = { concept: '~$0.008', system: '~$0.012', handoff: '~$0.014' };

const initialState = {
  step: 0,
  form: { name: '', intent: '', type: 'landing', mode: 'system' },
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

  const handleStartAnalysis = async () => {
    dispatch({ type: 'GOTO', payload: 4 });
    dispatch({ type: 'ANALYSIS_START' });

    // selectedRefs를 selectedIds 기준으로 정렬, useLayers 누락 항목은 자동(빈 배열)
    const enrichedSelectedRefs = state.selectedIds.map((id) => {
      const existing = state.selectedRefs.find((r) => r.id === id);
      return existing || { id, useLayers: [] };
    });

    const payload = {
      form: state.form,
      selectedIds: state.selectedIds,
      selectedRefs: enrichedSelectedRefs,
      mode: state.form.mode,
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
        <Box sx={ { display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 920, mx: 'auto', width: '100%' } }>
          <Typography variant="body1" color="text.secondary">
            무엇을 만드시나요? 모드 선택이 추천 정렬 + 합성 톤 + Export 기본을 결정합니다.
          </Typography>
          <Box
            sx={ {
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 2,
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
        <Box sx={ { display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 620, mx: 'auto', width: '100%' } }>
          <TextField
            value={ state.form.name }
            onChange={ (e) => dispatch({ type: 'UPDATE_FORM', payload: { name: e.target.value } }) }
            placeholder="프로젝트 이름 (예: Editorial Portfolio)"
            label="프로젝트 이름"
            fullWidth
          />
          <IntentSeedField
            value={ state.form.intent }
            onChange={ (next) => dispatch({ type: 'SET_INTENT', payload: next }) }
            label="한 줄 의도"
            placeholder="예: 미니멀한 흑백 대비, 라지 타이포 중심의 매거진 톤"
          />
          <FormControl fullWidth>
            <Select
              displayEmpty
              value={ state.form.type }
              onChange={ (e) => dispatch({ type: 'UPDATE_FORM', payload: { type: e.target.value } }) }
              renderValue={ (v) => {
                if (!v) return <Box component="span" sx={ { color: 'text.secondary' } }>프로젝트 유형 선택</Box>;
                const t = PROJECT_TYPES.find((x) => x.value === v);
                return t ? t.label : v;
              } }
            >
              { PROJECT_TYPES.map((t) => (
                <MenuItem key={ t.value } value={ t.value }>{ t.label }</MenuItem>
              )) }
            </Select>
          </FormControl>
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
          />
        </Box>
      );
    }

    // Step 3 — TP5 분석 직전 확인
    if (state.step === 3) {
      const enriched = state.selectedIds.map((id) => {
        const existing = state.selectedRefs.find((r) => r.id === id);
        return existing || { id, useLayers: [] };
      });
      return (
        <Box sx={ { maxWidth: 720, mx: 'auto', width: '100%' } }>
          <AnalysisConfirmBox
            mode={ state.form.mode }
            intent={ state.form.intent }
            selectedRefs={ enriched }
            estimatedCost={ COST_BY_MODE[state.form.mode] }
            onConfirm={ handleStartAnalysis }
            onEdit={ () => dispatch({ type: 'GOTO', payload: 1 }) }
          />
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

  return (
    <Box sx={ { width: '100%', ...sx } }>
      <Stepper activeStep={ state.step } sx={ { mb: 4 } }>
        { STEPS.map((label) => (
          <Step key={ label }>
            <StepLabel>{ label }</StepLabel>
          </Step>
        )) }
      </Stepper>

      { renderStep() }

      {/* Actions */}
      <Box
        sx={ {
          display: 'flex',
          justifyContent: 'space-between',
          gap: 1,
          mt: 4,
          pt: 3,
          borderTop: '1px solid',
          borderColor: 'divider',
        } }
      >
        <Button
          variant="text"
          color="inherit"
          onClick={ state.step > 0 ? () => dispatch({ type: 'BACK' }) : onCancel }
          disabled={ state.analysisState === 'running' }
        >
          { state.step > 0 ? '이전' : '취소' }
        </Button>

        { state.step === 0 && (
          <Button
            variant="contained"
            color="primary"
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
            onClick={ () => dispatch({ type: 'NEXT' }) }
            disabled={ !isStep2Valid }
          >
            확인 화면으로 · { state.selectedIds.length }장
          </Button>
        ) }

        { state.step === 4 && state.analysisState === 'done' && (
          <Button
            variant="contained"
            color="primary"
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
  );
}
