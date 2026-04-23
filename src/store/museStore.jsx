/**
 * MUSE Store — Context + useReducer + localStorage persist
 *
 * 프론트엔드 전용 상태 레이어. DB 연동 전 단계에서 런타임 상태를
 * 단일 Provider로 관리하고 localStorage에 자동 persist.
 *
 * 사용 슬라이스:
 *   - references: 아카이브 레퍼런스 (T1 태깅 결과 반영)
 *   - projects:   프로젝트 목록
 *   - analyses:   프로젝트별 AnalysisResult (T3 결과)
 *   - settings:   UserSettings
 *
 * 초기 하이드레이션:
 *   1. localStorage에 저장된 스냅샷 있으면 로드 + 버전 체크
 *   2. 없거나 버전 불일치면 src/data/muse/*.js 더미로 초기화
 *
 * 버전 변경 시 STORAGE_VERSION을 bump해 구버전 캐시 무효화.
 */

import { createContext, useContext, useEffect, useReducer } from 'react';
import {
  references as initialReferences,
  projects as initialProjects,
  analysisResultsByProjectId as initialAnalyses,
  defaultUserSettings,
} from '../data/muse';

const STORAGE_KEY = 'muse_store_v4';

const MuseContext = createContext(null);

/* ============================================
 * Initial state
 *
 * seed='empty'    : dev/프로덕션 기본 — 실제 유저처럼 빈 상태에서 시작
 * seed='fixtures' : Storybook 등 쇼케이스 — 27 레퍼런스 + 4 프로젝트 + 4 분석
 * ============================================ */

const buildInitialState = (seed = 'empty') => {
  if (seed === 'fixtures') {
    return {
      references: initialReferences,
      projects: initialProjects,
      analyses: initialAnalyses,
      settings: { ...defaultUserSettings },
    };
  }
  return {
    references: [],
    projects: [],
    analyses: {},
    settings: { ...defaultUserSettings },
  };
};

/* ============================================
 * Persist
 * ============================================ */

const loadFromStorage = () => {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== STORAGE_KEY) return null;
    return parsed.state;
  } catch {
    return null;
  }
};

const saveToStorage = (state) => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: STORAGE_KEY, state }),
    );
  } catch {
    // 용량 초과 등은 조용히 무시 (더미 이미지 thumbnailUrl이 Vite bundle URL이라 용량 큼)
  }
};

/* ============================================
 * Reducer
 * ============================================ */

function reducer(state, action) {
  switch (action.type) {
    /* references */
    case 'ADD_REFERENCE':
      return { ...state, references: [action.payload, ...state.references] };

    case 'UPDATE_REFERENCE': {
      const { id, patch } = action.payload;
      return {
        ...state,
        references: state.references.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      };
    }

    case 'REMOVE_REFERENCE':
      return { ...state, references: state.references.filter((r) => r.id !== action.payload) };

    /* projects */
    case 'ADD_PROJECT':
      return { ...state, projects: [action.payload, ...state.projects] };

    case 'UPDATE_PROJECT': {
      const { id, patch } = action.payload;
      return {
        ...state,
        projects: state.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      };
    }

    case 'REMOVE_PROJECT': {
      const id = action.payload;
      const { [id]: _removed, ...remainingAnalyses } = state.analyses;
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== id),
        analyses: remainingAnalyses,
      };
    }

    /* analyses */
    case 'SET_ANALYSIS':
      return {
        ...state,
        analyses: { ...state.analyses, [action.payload.projectId]: action.payload },
      };

    case 'UPDATE_ANALYSIS_LAYER': {
      const { projectId, layerKey, tokenId, patch } = action.payload;
      const current = state.analyses[projectId];
      if (!current) return state;

      const layer = current.layers[layerKey];
      let nextLayer;
      if (Array.isArray(layer)) {
        nextLayer = layer
          .map((t) => (t.id === tokenId ? { ...t, ...patch } : t))
          .filter((t) => !t._removed);
      } else {
        // visualDirection 같은 객체 레이어는 patch 통째로 병합
        nextLayer = { ...layer, ...patch };
      }
      return {
        ...state,
        analyses: {
          ...state.analyses,
          [projectId]: {
            ...current,
            layers: { ...current.layers, [layerKey]: nextLayer },
          },
        },
      };
    }

    /* settings */
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };

    /* reset */
    case 'RESET_STORE':
      return buildInitialState(action.payload || 'empty');

    default:
      return state;
  }
}

/* ============================================
 * Provider
 * ============================================ */

/**
 * @param {object} props
 * @param {node}    props.children
 * @param {'empty'|'fixtures'} [props.seed='empty'] - 초기 상태. 기본값 empty는 실제 유저 환경.
 *                                                     Storybook 등 쇼케이스에선 'fixtures' 지정.
 */
export function MuseStoreProvider({ children, seed = 'empty' }) {
  const [state, dispatch] = useReducer(
    reducer,
    null,
    () => loadFromStorage() || buildInitialState(seed),
  );

  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  return (
    <MuseContext.Provider value={ { state, dispatch } }>
      { children }
    </MuseContext.Provider>
  );
}

/* ============================================
 * Hooks
 * ============================================ */

const useMuseContext = () => {
  const ctx = useContext(MuseContext);
  if (!ctx) throw new Error('useMuseStore must be used inside <MuseStoreProvider>');
  return ctx;
};

export function useReferencesSlice() {
  const { state, dispatch } = useMuseContext();
  return {
    references: state.references,
    addReference: (ref) => dispatch({ type: 'ADD_REFERENCE', payload: ref }),
    updateReference: (id, patch) => dispatch({ type: 'UPDATE_REFERENCE', payload: { id, patch } }),
    removeReference: (id) => dispatch({ type: 'REMOVE_REFERENCE', payload: id }),
  };
}

export function useProjectsSlice() {
  const { state, dispatch } = useMuseContext();
  return {
    projects: state.projects,
    addProject: (project) => dispatch({ type: 'ADD_PROJECT', payload: project }),
    updateProject: (id, patch) => dispatch({ type: 'UPDATE_PROJECT', payload: { id, patch } }),
    removeProject: (id) => dispatch({ type: 'REMOVE_PROJECT', payload: id }),
  };
}

export function useAnalysesSlice() {
  const { state, dispatch } = useMuseContext();
  return {
    analyses: state.analyses,
    getAnalysis: (projectId) => state.analyses[projectId],
    setAnalysis: (analysis) => dispatch({ type: 'SET_ANALYSIS', payload: analysis }),
    updateLayer: (projectId, layerKey, tokenId, patch) =>
      dispatch({ type: 'UPDATE_ANALYSIS_LAYER', payload: { projectId, layerKey, tokenId, patch } }),
  };
}

export function useSettingsSlice() {
  const { state, dispatch } = useMuseContext();
  return {
    settings: state.settings,
    updateSettings: (patch) => dispatch({ type: 'UPDATE_SETTINGS', payload: patch }),
  };
}

export function useMuseStore() {
  return useMuseContext();
}

export function resetMuseStore() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}
