import { useReducer } from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import { ReferencePicker } from './ReferencePicker.jsx';
import { AnalysisProgress } from '../overlay-feedback/AnalysisProgress.jsx';

const STEPS = ['기본 정보', '레퍼런스 선택', '분석'];

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

const initialState = {
  step: 0,
  form: { name: '', intent: '', type: 'landing' },
  selectedIds: [],
  tagFilter: [],
  analysisLayers: MUSE_LAYERS.map((l) => ({ ...l, status: 'pending' })),
  analysisState: 'idle', // idle | running | done | error
};

function reducer(state, action) {
  switch (action.type) {
    case 'NEXT':
      return { ...state, step: Math.min(state.step + 1, STEPS.length - 1) };
    case 'BACK':
      return { ...state, step: Math.max(state.step - 1, 0) };
    case 'UPDATE_FORM':
      return { ...state, form: { ...state.form, ...action.payload } };
    case 'SET_SELECTED':
      return { ...state, selectedIds: action.payload };
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
 * ProjectCreateWizard 컴포넌트
 *
 * MUSE 프로젝트 생성 3-스텝 위자드.
 * Step 1: 이름/의도/유형 입력 → Step 2: 레퍼런스 선택 → Step 3: 분석 진행.
 * 내부 상태는 useReducer로 관리하며, 외부에 `onAnalyze` 경계면만 노출한다.
 *
 * Props:
 * @param {array} archive - 아카이브 레퍼런스 [{ id, src, title?, tags? }] [Required]
 * @param {array} recommended - 추천 레퍼런스 (선택) [Optional]
 * @param {function} onAnalyze - (payload) => Promise<void> — 실제 분석 호출 경계 [Optional]
 * @param {function} onComplete - 분석 완료 시 (project) => void [Optional]
 * @param {function} onCancel - 전체 위자드 취소 [Optional]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <ProjectCreateWizard
 *   archive={ references }
 *   recommended={ recs }
 *   onAnalyze={ async (payload) => { await api.analyze(payload); } }
 *   onComplete={ (project) => navigate(`/projects/${project.id}`) }
 * />
 */
export function ProjectCreateWizard({
  archive,
  recommended = [],
  onAnalyze,
  onComplete,
  onCancel,
  sx,
}) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const isStep1Valid = state.form.name.trim().length > 0 && state.form.intent.trim().length > 0;
  const isStep2Valid = state.selectedIds.length > 0;

  const handleStartAnalysis = async () => {
    dispatch({ type: 'NEXT' });
    dispatch({ type: 'ANALYSIS_START' });

    const payload = {
      form: state.form,
      selectedIds: state.selectedIds,
    };

    try {
      if (onAnalyze) {
        await onAnalyze(payload, (layers) =>
          dispatch({ type: 'ANALYSIS_UPDATE', payload: layers }),
        );
      } else {
        // Demo fallback — 0.9s 간격으로 순차 완료
        await new Promise((resolve) => {
          let i = 0;
          const tick = () => {
            if (i >= MUSE_LAYERS.length) return resolve();
            dispatch({
              type: 'ANALYSIS_UPDATE',
              payload: MUSE_LAYERS.map((l, idx) => ({
                ...l,
                status:
                  idx < i ? 'done' : idx === i ? 'running' : 'pending',
              })),
            });
            i += 1;
            return setTimeout(tick, 900);
          };
          tick();
        });
      }
      dispatch({ type: 'ANALYSIS_DONE' });
      onComplete?.({ ...state.form, referenceIds: state.selectedIds });
    } catch {
      dispatch({ type: 'ANALYSIS_ERROR' });
    }
  };

  const renderStep = () => {
    if (state.step === 0) {
      return (
        <Box sx={ { display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 560 } }>
          <TextField
            label="프로젝트 이름"
            value={ state.form.name }
            onChange={ (e) => dispatch({ type: 'UPDATE_FORM', payload: { name: e.target.value } }) }
            placeholder="예: Editorial Portfolio"
            fullWidth
          />
          <TextField
            label="한 문장 의도"
            value={ state.form.intent }
            onChange={ (e) => dispatch({ type: 'UPDATE_FORM', payload: { intent: e.target.value } }) }
            placeholder="예: 미니멀한 흑백 대비, 라지 타이포 중심의 매거진 톤"
            fullWidth
            multiline
            rows={ 2 }
          />
          <FormControl fullWidth>
            <InputLabel id="project-type-label">프로젝트 유형</InputLabel>
            <Select
              labelId="project-type-label"
              label="프로젝트 유형"
              value={ state.form.type }
              onChange={ (e) => dispatch({ type: 'UPDATE_FORM', payload: { type: e.target.value } }) }
            >
              { PROJECT_TYPES.map((t) => (
                <MenuItem key={ t.value } value={ t.value }>{ t.label }</MenuItem>
              )) }
            </Select>
          </FormControl>
        </Box>
      );
    }

    if (state.step === 1) {
      return (
        <ReferencePicker
          recommended={ recommended }
          archive={ archive }
          selectedIds={ state.selectedIds }
          onChange={ (ids) => dispatch({ type: 'SET_SELECTED', payload: ids }) }
          tagFilter={ state.tagFilter }
          onTagFilterChange={ (tags) => dispatch({ type: 'SET_TAG_FILTER', payload: tags }) }
        />
      );
    }

    // step 2 — 분석
    return (
      <Box sx={ { display: 'flex', justifyContent: 'center' } }>
        <AnalysisProgress
          title={ `"${state.form.name}" 분석 중` }
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

      { state.step === 0 && (
        <Typography variant="body2" color="text.secondary" sx={ { mb: 3 } }>
          프로젝트의 기본 정보를 입력해주세요
        </Typography>
      ) }

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
            disabled={ !isStep1Valid }
          >
            다음
          </Button>
        ) }

        { state.step === 1 && (
          <Button
            variant="contained"
            color="primary"
            onClick={ handleStartAnalysis }
            disabled={ !isStep2Valid }
          >
            분석 시작 · { state.selectedIds.length }장
          </Button>
        ) }

        { state.step === 2 && state.analysisState === 'done' && (
          <Button
            variant="contained"
            color="primary"
            onClick={ () => onComplete?.({ ...state.form, referenceIds: state.selectedIds }) }
          >
            프로젝트 열기
          </Button>
        ) }
      </Box>
    </Box>
  );
}
