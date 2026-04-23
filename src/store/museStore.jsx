/**
 * MUSE Store — Context + useReducer + Supabase 영속화
 *
 * seed='supabase' (기본): 로그인 사용자의 DB 데이터 하이드레이션. 모든 CRUD 는 Supabase 경유 후 로컬 dispatch
 * seed='fixtures':         Storybook 쇼케이스. 정적 27 레퍼런스 + 4 프로젝트 + 4 분석. 모든 CRUD 는 로컬 dispatch only
 *
 * 슬라이스 훅 시그니처는 localStorage 시절과 동일하게 유지. 내부 구현만 교체.
 */

import { createContext, useContext, useEffect, useReducer } from 'react';
import {
  references as fixtureReferences,
  projects as fixtureProjects,
  analysisResultsByProjectId as fixtureAnalyses,
  defaultUserSettings,
} from '../data/muse';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/auth';
import {
  mapReferenceFromDb, mapReferenceToDb,
  mapProjectFromDb, mapProjectToDb,
  mapAnalysisFromDb, mapAnalysisToDb,
  mapSettingsFromDb, mapSettingsToDb,
  uploadReferenceImage, deleteReferenceImage, getSignedUrl,
} from '../lib/museDb';

const MuseContext = createContext(null);

const EMPTY_STATE = {
  references: [],
  projects: [],
  analyses: {},
  settings: { ...defaultUserSettings },
  loading: false,
  hydrated: false,
};

const FIXTURES_STATE = {
  references: fixtureReferences,
  projects: fixtureProjects,
  analyses: fixtureAnalyses,
  settings: { ...defaultUserSettings },
  loading: false,
  hydrated: true,
};

/* ============================================
 * Reducer
 * ============================================ */

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE_START':
      return { ...state, loading: true };

    case 'HYDRATE':
      return { ...state, ...action.payload, loading: false, hydrated: true };

    case 'RESET':
      return { ...EMPTY_STATE };

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

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };

    default:
      return state;
  }
}

const genId = () => (typeof crypto !== 'undefined' && crypto.randomUUID
  ? crypto.randomUUID()
  : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

/* ============================================
 * Provider
 * ============================================ */

/**
 * @param {object} props
 * @param {'supabase'|'fixtures'} [props.seed='supabase']
 */
export function MuseStoreProvider({ children, seed = 'supabase' }) {
  const isFixtures = seed === 'fixtures';
  const [state, dispatch] = useReducer(reducer, isFixtures ? FIXTURES_STATE : EMPTY_STATE);
  const auth = useAuth();
  const user = auth.user;
  const authLoading = auth.loading;
  const isAuthenticated = auth.isAuthenticated;

  useEffect(() => {
    if (isFixtures) return;
    if (authLoading) return;
    if (!isAuthenticated || !user) {
      dispatch({ type: 'RESET' });
      return;
    }

    let canceled = false;
    (async () => {
      dispatch({ type: 'HYDRATE_START' });

      // eslint-disable-next-line no-console
      console.log('[museStore] hydrate start. user.id =', user.id);

      const [refsRes, projsRes, analsRes, setsRes] = await Promise.all([
        supabase.from('reference_items').select('*').order('created_at', { ascending: false }),
        supabase
          .from('projects')
          .select('*, project_references(reference_id)')
          .order('created_at', { ascending: false }),
        supabase.from('analysis_results').select('*'),
        supabase.from('user_settings').select('*').eq('user_id', user.id).maybeSingle(),
      ]);

      if (canceled) return;

      // eslint-disable-next-line no-console
      console.log('[museStore] hydrate result', {
        refs: { count: refsRes.data?.length, error: refsRes.error },
        projects: { count: projsRes.data?.length, error: projsRes.error },
        analyses: { count: analsRes.data?.length, error: analsRes.error },
        settings: { has: !!setsRes.data, error: setsRes.error },
      });

      const references = await Promise.all((refsRes.data || []).map(mapReferenceFromDb));
      const projects = (projsRes.data || []).map(mapProjectFromDb);
      const analyses = Object.fromEntries(
        (analsRes.data || []).map((row) => {
          const a = mapAnalysisFromDb(row);
          return [a.projectId, a];
        })
      );
      const settings = mapSettingsFromDb(setsRes.data);

      dispatch({
        type: 'HYDRATE',
        payload: { references, projects, analyses, settings },
      });
    })();

    return () => { canceled = true; };
  }, [isFixtures, authLoading, isAuthenticated, user?.id]);

  return (
    <MuseContext.Provider value={ { state, dispatch, seed, user } }>
      { children }
    </MuseContext.Provider>
  );
}

/* ============================================
 * Hooks
 * ============================================ */

function useCtx() {
  const ctx = useContext(MuseContext);
  if (!ctx) throw new Error('useMuseStore must be used inside <MuseStoreProvider>');
  return ctx;
}

export function useReferencesSlice() {
  const { state, dispatch, seed, user } = useCtx();
  const remote = seed !== 'fixtures';

  const addReference = async (payload = {}) => {
    const { file, ...fields } = payload;
    const id = fields.id || genId();
    // fields 먼저 스프레드 → UI 플래그(_pending 등)도 살아있게. 이어서 정규화된 값으로 override
    const reference = {
      ...fields,
      id,
      source: fields.source || (file ? 'file' : 'url'),
      storagePath: fields.storagePath || null,
      thumbnailUrl: fields.thumbnailUrl || null,
      title: fields.title || '',
      tags: fields.tags || {},
      dominantColors: fields.dominantColors || [],
      extracted: fields.extracted || {},
      createdAt: fields.createdAt || new Date().toISOString(),
    };

    if (remote && user) {
      if (file) {
        reference.storagePath = await uploadReferenceImage(file, user.id, id);
        reference.thumbnailUrl = await getSignedUrl(reference.storagePath);
      }
      const { error } = await supabase.from('reference_items').insert(mapReferenceToDb(reference, user.id));
      if (error) throw error;
    }

    dispatch({ type: 'ADD_REFERENCE', payload: reference });
    return reference;
  };

  const updateReference = async (id, patch) => {
    if (remote && user) {
      const dbPatch = {};
      if ('title' in patch) dbPatch.title = patch.title;
      if ('tags' in patch) dbPatch.tags = patch.tags;
      if ('dominantColors' in patch) dbPatch.dominant_colors = patch.dominantColors;
      if ('extracted' in patch) dbPatch.extracted = patch.extracted;
      if (Object.keys(dbPatch).length > 0) {
        const { error } = await supabase.from('reference_items').update(dbPatch).eq('id', id);
        if (error) throw error;
      }
    }
    dispatch({ type: 'UPDATE_REFERENCE', payload: { id, patch } });
  };

  const removeReference = async (id) => {
    if (remote && user) {
      const target = state.references.find((r) => r.id === id);
      if (target?.storagePath) await deleteReferenceImage(target.storagePath);
      const { error } = await supabase.from('reference_items').delete().eq('id', id);
      if (error) throw error;
    }
    dispatch({ type: 'REMOVE_REFERENCE', payload: id });
  };

  return {
    references: state.references,
    loading: state.loading,
    hydrated: state.hydrated,
    addReference,
    updateReference,
    removeReference,
  };
}

export function useProjectsSlice() {
  const { state, dispatch, seed, user } = useCtx();
  const remote = seed !== 'fixtures';

  const addProject = async (project) => {
    const id = project.id || genId();
    const full = {
      id,
      name: project.name,
      intent: project.intent || '',
      type: project.type,
      referenceIds: project.referenceIds || [],
      createdAt: project.createdAt || new Date().toISOString(),
    };

    if (remote && user) {
      const { error } = await supabase.from('projects').insert(mapProjectToDb(full, user.id));
      if (error) throw error;
      if (full.referenceIds.length > 0) {
        const { error: e2 } = await supabase
          .from('project_references')
          .insert(full.referenceIds.map((rid) => ({ project_id: id, reference_id: rid })));
        if (e2) throw e2;
      }
    }
    dispatch({ type: 'ADD_PROJECT', payload: full });
    return full;
  };

  const updateProject = async (id, patch) => {
    if (remote && user) {
      const dbPatch = {};
      if ('name' in patch) dbPatch.name = patch.name;
      if ('intent' in patch) dbPatch.intent = patch.intent;
      if ('type' in patch) dbPatch.type = patch.type;
      if (Object.keys(dbPatch).length > 0) {
        const { error } = await supabase.from('projects').update(dbPatch).eq('id', id);
        if (error) throw error;
      }
      if ('referenceIds' in patch) {
        await supabase.from('project_references').delete().eq('project_id', id);
        if (patch.referenceIds.length > 0) {
          const { error: e3 } = await supabase
            .from('project_references')
            .insert(patch.referenceIds.map((rid) => ({ project_id: id, reference_id: rid })));
          if (e3) throw e3;
        }
      }
    }
    dispatch({ type: 'UPDATE_PROJECT', payload: { id, patch } });
  };

  const removeProject = async (id) => {
    if (remote && user) {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
    }
    dispatch({ type: 'REMOVE_PROJECT', payload: id });
  };

  return {
    projects: state.projects,
    loading: state.loading,
    hydrated: state.hydrated,
    addProject,
    updateProject,
    removeProject,
  };
}

export function useAnalysesSlice() {
  const { state, dispatch, seed, user } = useCtx();
  const remote = seed !== 'fixtures';

  const setAnalysis = async (analysis) => {
    const full = {
      id: analysis.id || genId(),
      projectId: analysis.projectId,
      layers: analysis.layers || {},
      status: analysis.status || 'done',
      updatedAt: new Date().toISOString(),
    };
    if (remote && user) {
      const { error } = await supabase
        .from('analysis_results')
        .upsert(mapAnalysisToDb(full), { onConflict: 'project_id' });
      if (error) throw error;
    }
    dispatch({ type: 'SET_ANALYSIS', payload: full });
    return full;
  };

  const updateLayer = async (projectId, layerKey, tokenId, patch) => {
    const current = state.analyses[projectId];
    if (!current) return;

    const layer = current.layers[layerKey];
    let nextLayer;
    if (Array.isArray(layer)) {
      nextLayer = layer
        .map((t) => (t.id === tokenId ? { ...t, ...patch } : t))
        .filter((t) => !t._removed);
    } else {
      nextLayer = { ...layer, ...patch };
    }
    const nextLayers = { ...current.layers, [layerKey]: nextLayer };

    dispatch({ type: 'UPDATE_ANALYSIS_LAYER', payload: { projectId, layerKey, tokenId, patch } });

    if (remote && user) {
      const { error } = await supabase
        .from('analysis_results')
        .update({ layers: nextLayers })
        .eq('project_id', projectId);
      if (error) throw error;
    }
  };

  return {
    analyses: state.analyses,
    loading: state.loading,
    hydrated: state.hydrated,
    getAnalysis: (projectId) => state.analyses[projectId],
    setAnalysis,
    updateLayer,
  };
}

export function useSettingsSlice() {
  const { state, dispatch, seed, user } = useCtx();
  const remote = seed !== 'fixtures';

  const updateSettings = async (patch) => {
    if (remote && user) {
      const dbPatch = mapSettingsToDb(patch);
      if (Object.keys(dbPatch).length > 0) {
        const { error } = await supabase
          .from('user_settings')
          .update(dbPatch)
          .eq('user_id', user.id);
        if (error) throw error;
      }
    }
    dispatch({ type: 'UPDATE_SETTINGS', payload: patch });
  };

  return {
    settings: state.settings,
    updateSettings,
  };
}

export function useMuseStore() {
  return useCtx();
}
